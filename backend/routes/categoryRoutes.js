const express = require("express");
const multer = require("multer");
const Category = require("../models/Category");
const { protect, adminOnly } = require("../middleware/auth");
const { logAudit } = require("../utils/audit");

const router = express.Router();

// Memory storage — image is kept in req.file.buffer and saved as base64 in MongoDB.
// Same approach used by productRoutes so images survive server restarts.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image uploads are allowed"));
    }
    cb(null, true);
  }
});

const toDataUri = (file) =>
  `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;

router.get("/", async (_, res) => {
  const categories = await Category.find()
    .select("name tagline icon image sortOrder createdAt updatedAt")
    .sort({ sortOrder: 1, createdAt: 1 })
    .lean();
  res.set("Cache-Control", "public, max-age=60");
  res.json(categories);
});

router.post("/", protect, adminOnly, upload.single("image"), async (req, res) => {
  const { name, tagline, icon, sortOrder } = req.body;
  if (!name?.trim()) {
    return res.status(400).json({ message: "Category name is required" });
  }
  if (!req.file) {
    return res.status(400).json({ message: "Category image is required" });
  }

  const category = await Category.create({
    name: name.trim(),
    tagline: (tagline || "").trim(),
    icon: icon || "leaf",
    sortOrder: Number(sortOrder) || 0,
    image: toDataUri(req.file)
  });

  await logAudit({
    actor: req.user._id,
    action: "create_category",
    targetType: "category",
    targetId: category._id,
    details: { name: category.name }
  });

  res.status(201).json(category);
});

router.put("/:id", protect, adminOnly, upload.single("image"), async (req, res) => {
  const existing = await Category.findById(req.params.id);
  if (!existing) return res.status(404).json({ message: "Category not found" });

  const update = {};
  if (req.body.name) update.name = req.body.name.trim();
  if (req.body.tagline !== undefined) update.tagline = req.body.tagline.trim();
  if (req.body.icon) update.icon = req.body.icon;
  if (req.body.sortOrder !== undefined) update.sortOrder = Number(req.body.sortOrder) || 0;

  if (req.file) {
    update.image = toDataUri(req.file);
  }

  const category = await Category.findByIdAndUpdate(req.params.id, update, { new: true });

  await logAudit({
    actor: req.user._id,
    action: "update_category",
    targetType: "category",
    targetId: category._id,
    details: { name: category.name }
  });

  res.json(category);
});

router.delete("/:id", protect, adminOnly, async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (category) {
    await Category.findByIdAndDelete(category._id);
    await logAudit({
      actor: req.user._id,
      action: "delete_category",
      targetType: "category",
      targetId: category._id,
      details: { name: category.name }
    });
  }
  res.json({ message: "Category deleted" });
});

module.exports = router;
