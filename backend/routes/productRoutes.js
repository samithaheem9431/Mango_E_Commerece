const express = require("express");
const multer = require("multer");
const Product = require("../models/Product");
const { protect, adminOnly } = require("../middleware/auth");
const { logAudit } = require("../utils/audit");

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image uploads are allowed"));
    }
    cb(null, true);
  }
});

const toDataUri = (file) => `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;

router.get("/", async (req, res) => {
  const { search = "", category = "" } = req.query;
  const query = {};
  if (search) query.name = { $regex: search, $options: "i" };
  if (category) query.category = category;
  const products = await Product.find(query).sort({ createdAt: -1 });
  res.json(products);
});

router.get("/featured", async (_, res) => {
  const products = await Product.find().sort({ createdAt: -1 }).limit(6);
  res.json(products);
});

router.post("/", protect, adminOnly, upload.single("image"), async (req, res) => {
  const payload = {
    ...req.body,
    price: Number(req.body.price),
    stock: Number(req.body.stock),
    image: req.file ? toDataUri(req.file) : ""
  };
  const product = await Product.create(payload);
  await logAudit({
    actor: req.user._id,
    action: "create_product",
    targetType: "product",
    targetId: product._id,
    details: { name: product.name, stock: product.stock, price: product.price }
  });
  res.status(201).json(product);
});

router.put("/:id", protect, adminOnly, upload.single("image"), async (req, res) => {
  const update = {
    ...req.body,
    price: Number(req.body.price),
    stock: Number(req.body.stock)
  };
  if (req.file) update.image = toDataUri(req.file);
  const product = await Product.findByIdAndUpdate(req.params.id, update, { new: true });
  if (product) {
    await logAudit({
      actor: req.user._id,
      action: "update_product",
      targetType: "product",
      targetId: product._id,
      details: { name: product.name, stock: product.stock, price: product.price }
    });
  }
  res.json(product);
});

router.delete("/:id", protect, adminOnly, async (req, res) => {
  const product = await Product.findById(req.params.id);
  await Product.findByIdAndDelete(req.params.id);
  if (product) {
    await logAudit({
      actor: req.user._id,
      action: "delete_product",
      targetType: "product",
      targetId: product._id,
      details: { name: product.name }
    });
  }
  res.json({ message: "Product deleted" });
});

module.exports = router;
