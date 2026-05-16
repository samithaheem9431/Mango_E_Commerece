const express = require("express");
const { body } = require("express-validator");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const { protect } = require("../middleware/auth");
const { validate } = require("../middleware/validate");

const router = express.Router();

router.get("/", protect, async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
  if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });
  res.json(cart);
});

router.post(
  "/add",
  protect,
  [
    body("productId").isMongoId().withMessage("Invalid product id"),
    body("quantity").isInt({ min: 0, max: 10 }).withMessage("Quantity must be between 0 and 10"),
    validate
  ],
  async (req, res) => {
  const { productId, quantity } = req.body;
  const qty = Math.max(0, Math.min(10, Number(quantity)));

  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ message: "Product not found" });
  if (qty > product.stock) return res.status(400).json({ message: "Quantity exceeds available stock" });

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });

  const index = cart.items.findIndex((item) => item.product.toString() === productId);
  if (index >= 0) {
    if (qty === 0) {
      cart.items.splice(index, 1);
    } else {
      cart.items[index].quantity = qty;
    }
  } else if (qty > 0) {
    cart.items.push({ product: productId, quantity: qty });
  }

  await cart.save();
  cart = await cart.populate("items.product");
  res.json(cart);
});

router.delete("/:productId", protect, async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return res.json({ message: "Cart is empty" });
  cart.items = cart.items.filter((item) => item.product.toString() !== req.params.productId);
  await cart.save();
  res.json(cart);
});

router.delete("/", protect, async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return res.json({ message: "Cart is empty" });
  cart.items = [];
  await cart.save();
  res.json({ message: "Cart cleared" });
});

module.exports = router;
