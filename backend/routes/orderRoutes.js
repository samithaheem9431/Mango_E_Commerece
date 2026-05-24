const express = require("express");
const { body, param } = require("express-validator");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const { protect, adminOnly } = require("../middleware/auth");
const { logAudit } = require("../utils/audit");
const { validate } = require("../middleware/validate");
const { sendOrderConfirmed, sendOrderCancelled, sendOrderDelivered } = require("../utils/emailService");

const DELIVERY_FEE = 450;
const router = express.Router();

router.post("/checkout", async (req, res) => {
  const { shippingAddress, cartItems, riderNotes, customerName, customerEmail } = req.body;
  if (!shippingAddress?.address || !shippingAddress?.city || !shippingAddress?.phone) {
    return res.status(400).json({ message: "Complete shipping details are required" });
  }
  if (!customerName || !customerEmail) {
    return res.status(400).json({ message: "Name and email are required" });
  }

  if (!cartItems || cartItems.length === 0) {
    return res.status(400).json({ message: "Cart is empty" });
  }

  const orderItems = [];
  let totalAmount = 0;

  for (const item of cartItems) {
    const productId = item.product?._id || item.product;
    const boxSize = item.boxSize;
    if (!boxSize) return res.status(400).json({ message: "Box size is required for each item" });

    const product = await Product.findById(productId);
    if (!product) return res.status(400).json({ message: "Product not found" });

    const variant = product.variants.find((v) => v.boxSize === boxSize);
    if (!variant) return res.status(400).json({ message: `Box size ${boxSize} not available for ${product.name}` });
    if (variant.stock < item.quantity) return res.status(400).json({ message: `Insufficient stock for ${product.name} (${boxSize})` });

    orderItems.push({
      product: product._id,
      name: product.name,
      price: variant.price,
      quantity: item.quantity,
      boxSize,
      image: product.image
    });
    totalAmount += variant.price * item.quantity;
  }

  const order = await Order.create({
    user: null,
    customerName,
    customerEmail,
    items: orderItems,
    totalAmount,
    shippingAddress,
    riderNotes
  });

  for (const item of orderItems) {
    await Product.updateOne(
      { _id: item.product, "variants.boxSize": item.boxSize },
      { $inc: { "variants.$.stock": -item.quantity } }
    );
  }

  res.status(201).json(order);
});

// Public order tracking — returns limited fields only
router.get("/track/:id", async (req, res) => {
  const { id } = req.params;
  if (!id.match(/^[a-f\d]{24}$/i)) {
    return res.status(400).json({ message: "Invalid Order ID format" });
  }
  const order = await Order.findById(id).select(
    "status items totalAmount shippingAddress riderNotes customerName createdAt updatedAt"
  );
  if (!order) return res.status(404).json({ message: "Order not found. Please check your Order ID." });
  res.json(order);
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
  if (!order) return res.status(404).json({ message: "Order not found" });

  await logAudit({
    actor: req.user._id,
    action: "update_order_status",
    targetType: "order",
    targetId: order._id,
    details: { previousStatus, newStatus: status }
  });

  // Send status-specific email if customer email is on record
  if (order.customerEmail) {
    const emailPayload = {
      customerName: order.customerName || "Customer",
      customerEmail: order.customerEmail,
      orderId: order._id,
      items: order.items,
      subtotal: order.totalAmount,
      deliveryFee: DELIVERY_FEE,
      grandTotal: order.totalAmount + DELIVERY_FEE,
      shippingAddress: order.shippingAddress
    };

    if (status === "Confirmed") {
      sendOrderConfirmed(emailPayload).catch((err) => console.error("[Email] Confirmed:", err.message));
    } else if (status === "Cancelled") {
      sendOrderCancelled(emailPayload).catch((err) => console.error("[Email] Cancelled:", err.message));
    } else if (status === "Delivered") {
      sendOrderDelivered(emailPayload).catch((err) => console.error("[Email] Delivered:", err.message));
    }
  }

  res.json(order);
});

module.exports = router;
