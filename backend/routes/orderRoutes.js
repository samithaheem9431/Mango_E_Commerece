const express = require("express");
const { body, param } = require("express-validator");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const { protect, adminOnly } = require("../middleware/auth");
const { logAudit } = require("../utils/audit");
const { validate } = require("../middleware/validate");

const router = express.Router();

router.post("/checkout", async (req, res) => {
  const { shippingAddress, cartItems, riderNotes } = req.body;
  if (!shippingAddress?.address || !shippingAddress?.city || !shippingAddress?.phone) {
    return res.status(400).json({ message: "Complete shipping details are required" });
  }

  if (!cartItems || cartItems.length === 0) {
    return res.status(400).json({ message: "Cart is empty" });
  }

  const orderItems = [];
  let totalAmount = 0;

  for (const item of cartItems) {
    const product = await Product.findById(item.product);
    if (!product || product.stock < item.quantity) {
      return res.status(400).json({ message: `Insufficient stock for ${product?.name || "item"}` });
    }
    orderItems.push({
      product: product._id,
      name: product.name,
      price: product.price,
      quantity: item.quantity,
      image: product.image
    });
    totalAmount += product.price * item.quantity;
  }

  const order = await Order.create({
    user: null, // Guest order
    items: orderItems,
    totalAmount,
    shippingAddress,
    riderNotes
  });

  for (const item of orderItems) {
    await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
  }

  res.status(201).json(order);
});

router.get("/my-orders", protect, async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(orders);
});

router.get("/", protect, adminOnly, async (_, res) => {
  const orders = await Order.find()
    .populate("user", "name email")
    .sort({ createdAt: -1 });
  res.json(orders);
});

router.put(
  "/:id/status",
  protect,
  adminOnly,
  [
    param("id").isMongoId().withMessage("Invalid order id"),
    body("status").isIn(["Pending", "Confirmed", "Delivered", "Cancelled"]).withMessage("Invalid order status"),
    validate
  ],
  async (req, res) => {
  const { status } = req.body;
  const existing = await Order.findById(req.params.id);
  const previousStatus = existing?.status;
  const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (order) {
    await logAudit({
      actor: req.user._id,
      action: "update_order_status",
      targetType: "order",
      targetId: order._id,
      details: { previousStatus, newStatus: status }
    });
  }
  res.json(order);
});

module.exports = router;
