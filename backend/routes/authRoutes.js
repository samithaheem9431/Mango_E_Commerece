const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body } = require("express-validator");
const User = require("../models/User");
const { protect } = require("../middleware/auth");
const { validate } = require("../middleware/validate");

const router = express.Router();

const createToken = (id, role) => {
  const adminExpiresIn = process.env.ADMIN_JWT_EXPIRES_IN || "2h";
  const userExpiresIn = process.env.USER_JWT_EXPIRES_IN || "7d";
  const expiresIn = ["admin", "superadmin"].includes(role) ? adminExpiresIn : userExpiresIn;
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn });
};

router.post("/register", async (req, res) => {
  return res.status(403).json({ message: "Public registration is disabled. Contact admin." });
});

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
    validate
  ],
  async (req, res) => {
    const { email, password } = req.body;
    const safeEmail = String(email || "").trim().toLowerCase();
    try {
      const user = await User.findOne({ email: safeEmail });
      if (!user) return res.status(401).json({ message: "Invalid credentials" });

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) return res.status(401).json({ message: "Invalid credentials" });

      res.json({
        token: createToken(user._id, user.role),
        user: { id: user._id, name: user.name, email: user.email, role: user.role }
      });
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  }
);

router.get("/me", protect, async (req, res) => {
  res.json(req.user);
});

module.exports = router;
