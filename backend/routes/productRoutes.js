const express = require("express");
const Product = require("../models/Product");
const { protect, adminOnly } = require("../middleware/auth");
const { logAudit } = require("../utils/audit");
const upload = require("../middleware/uploadImage");
const { uploadFromMulter, deleteByUrl } = require("../config/cloudinary");

const router = express.Router();

router.get("/", async (req, res) => {
  const { search = "", category = "" } = req.query;
  const query = {};
  if (search) query.name = { $regex: search, $options: "i" };
  if (category) query.category = category;
  const products = await Product.find(query)
    .populate("category", "name icon tagline")
    .sort({ createdAt: -1 });
  res.json(products);
});

router.get("/featured", async (_, res) => {
  const products = await Product.find()
    .populate("category", "name icon tagline")
    .sort({ createdAt: -1 })
    .limit(6);
  res.json(products);
});

router.post("/", protect, adminOnly, upload.single("image"), async (req, res) => {
  let variants = [];
  try {
    variants = JSON.parse(req.body.variants || "[]");
  } catch {
    return res.status(400).json({ message: "Invalid variants format" });
  }

  let imageUrl = "";
  if (req.file) {
    try {
      imageUrl = await uploadFromMulter(req.file, "products");
    } catch (err) {
      return res.status(500).json({ message: err.message || "Image upload failed" });
    }
  }

  const payload = {
    name: req.body.name,
    category: req.body.category,
    description: req.body.description,
    variants,
    image: imageUrl
  };

  const product = await Product.create(payload);
  await logAudit({
    actor: req.user._id,
    action: "create_product",
    targetType: "product",
    targetId: product._id,
    details: { name: product.name, variants: product.variants.length }
  });
  res.status(201).json(product);
});

router.put("/:id", protect, adminOnly, upload.single("image"), async (req, res) => {
  const existing = await Product.findById(req.params.id);
  if (!existing) return res.status(404).json({ message: "Product not found" });

  let variants;
  if (req.body.variants !== undefined) {
    try {
      variants = JSON.parse(req.body.variants);
    } catch {
      return res.status(400).json({ message: "Invalid variants format" });
    }
  }

  const update = {
    name: req.body.name,
    category: req.body.category,
    description: req.body.description,
    ...(variants !== undefined && { variants })
  };

  if (req.file) {
    try {
      update.image = await uploadFromMulter(req.file, "products");
      await deleteByUrl(existing.image);
    } catch (err) {
      return res.status(500).json({ message: err.message || "Image upload failed" });
    }
  }

  const product = await Product.findByIdAndUpdate(req.params.id, update, { new: true })
    .populate("category", "name icon tagline");

  if (product) {
    await logAudit({
      actor: req.user._id,
      action: "update_product",
      targetType: "product",
      targetId: product._id,
      details: { name: product.name }
    });
  }
  res.json(product);
});

router.delete("/:id", protect, adminOnly, async (req, res) => {
  const product = await Product.findById(req.params.id);
  await Product.findByIdAndDelete(req.params.id);
  if (product) {
    await deleteByUrl(product.image);
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
