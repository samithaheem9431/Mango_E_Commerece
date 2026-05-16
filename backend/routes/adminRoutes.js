const express = require("express");
const bcrypt = require("bcryptjs");
const { body, param } = require("express-validator");
const Order = require("../models/Order");
const User = require("../models/User");
const Product = require("../models/Product");
const AuditLog = require("../models/AuditLog");
const { protect, adminOnly, superAdminOnly } = require("../middleware/auth");
const { logAudit } = require("../utils/audit");
const { validate } = require("../middleware/validate");

const router = express.Router();

router.get("/metrics", protect, adminOnly, async (_, res) => {
  const [orders, customers, products] = await Promise.all([
    Order.find(),
    User.countDocuments({ role: "customer" }),
    Product.find()
  ]);

  const revenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const lowStock = products.filter((p) => p.stock <= 5);
  const now = new Date();
  const trendMap = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    trendMap[key] = { date: key, orders: 0, revenue: 0 };
  }
  orders.forEach((order) => {
    const key = new Date(order.createdAt).toISOString().slice(0, 10);
    if (trendMap[key]) {
      trendMap[key].orders += 1;
      trendMap[key].revenue += order.totalAmount;
    }
  });

  res.json({
    totalOrders: orders.length,
    revenue,
    customers,
    lowStockCount: lowStock.length,
    lowStockProducts: lowStock,
    weeklyTrend: Object.values(trendMap)
  });
});

router.post(
  "/create-admin",
  protect,
  superAdminOnly,
  [
    body("name").trim().isLength({ min: 2, max: 60 }).withMessage("Name must be between 2 and 60 characters"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 10 })
      .withMessage("Password must be at least 10 characters")
      .matches(/[A-Z]/)
      .withMessage("Password must include one uppercase letter")
      .matches(/[a-z]/)
      .withMessage("Password must include one lowercase letter")
      .matches(/[0-9]/)
      .withMessage("Password must include one number"),
    validate
  ],
  async (req, res) => {
  const { name, email, password } = req.body;
  const safeName = String(name || "").trim();
  const safeEmail = String(email || "").trim().toLowerCase();

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email and password are required" });
  }

  if (password.length < 8) {
    return res.status(400).json({ message: "Password must be at least 8 characters" });
  }

  const existing = await User.findOne({ email: safeEmail });
  if (existing) {
    return res.status(400).json({ message: "Email already in use" });
  }

  const hash = await bcrypt.hash(password, 10);
  const admin = await User.create({
    name: safeName,
    email: safeEmail,
    password: hash,
    role: "admin"
  });

  await logAudit({
    actor: req.user._id,
    action: "create_admin",
    targetType: "user",
    targetId: admin._id,
    details: { email: admin.email }
  });

  return res.status(201).json({
    message: "Admin created successfully",
    admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role }
  });
});

router.get("/users", protect, superAdminOnly, async (_, res) => {
  const users = await User.find().select("-password").sort({ createdAt: -1 });
  res.json(users);
});

router.put(
  "/users/:id/role",
  protect,
  superAdminOnly,
  [
    param("id").isMongoId().withMessage("Invalid user id"),
    body("role").isIn(["customer", "admin"]).withMessage("Invalid role"),
    validate
  ],
  async (req, res) => {
  const { role } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  if (user.role === "superadmin") {
    return res.status(400).json({ message: "Super admin role cannot be changed" });
  }
  const previousRole = user.role;
  user.role = role;
  await user.save();
  await logAudit({
    actor: req.user._id,
    action: "change_user_role",
    targetType: "user",
    targetId: user._id,
    details: { previousRole, newRole: role, email: user.email }
  });
  res.json({ message: "User role updated", user: { id: user._id, role: user.role } });
});

router.delete(
  "/users/:id",
  protect,
  superAdminOnly,
  [param("id").isMongoId().withMessage("Invalid user id"), validate],
  async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  if (user.role === "superadmin") {
    return res.status(400).json({ message: "Super admin account cannot be deleted" });
  }
  if (String(user._id) === String(req.user._id)) {
    return res.status(400).json({ message: "You cannot delete your own account" });
  }
  await User.findByIdAndDelete(user._id);
  await logAudit({
    actor: req.user._id,
    action: "delete_user",
    targetType: "user",
    targetId: user._id,
    details: { email: user.email, role: user.role }
  });
  res.json({ message: "User deleted successfully" });
});

router.get("/audit-logs", protect, adminOnly, async (_, res) => {
  const logs = await AuditLog.find()
    .populate("actor", "name email role")
    .sort({ createdAt: -1 })
    .limit(50);
  res.json(logs);
});

router.get("/orders-export.csv", protect, adminOnly, async (_, res) => {
  const orders = await Order.find().populate("user", "name email").sort({ createdAt: -1 });
  const header = ["orderId", "customerName", "customerEmail", "totalAmount", "status", "itemsCount", "createdAt"];
  const rows = orders.map((order) => [
    order._id,
    `"${(order.user?.name || "").replace(/"/g, '""')}"`,
    `"${(order.user?.email || "").replace(/"/g, '""')}"`,
    order.totalAmount,
    order.status,
    order.items?.length || 0,
    order.createdAt.toISOString()
  ]);
  const csv = [header.join(","), ...rows.map((r) => r.join(","))].join("\n");
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=orders-export.csv");
  res.send(csv);
});

module.exports = router;
