const bcrypt = require("bcryptjs");
const User = require("../models/User");

const ensureSuperAdmin = async () => {
  const email = String(process.env.SUPER_ADMIN_EMAIL || "").trim().toLowerCase();
  const password = String(process.env.SUPER_ADMIN_PASSWORD || "");
  const name = String(process.env.SUPER_ADMIN_NAME || "Super Admin").trim();

  if (!email || !password) return;

  const existing = await User.findOne({ email });
  if (existing) {
    const updates = {};
    if (existing.role !== "superadmin") updates.role = "superadmin";
    if (existing.name !== name) updates.name = name;

    // Keep env and DB password in sync for reliable superadmin login.
    const isPasswordMatch = await bcrypt.compare(password, existing.password);
    if (!isPasswordMatch) updates.password = await bcrypt.hash(password, 10);

    if (Object.keys(updates).length > 0) {
      await User.findByIdAndUpdate(existing._id, updates);
      console.log("Super admin account synchronized from environment");
    }
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await User.create({
    name,
    email,
    password: passwordHash,
    role: "superadmin"
  });
  console.log("Super admin created from environment");
};

// Migration no longer needed — category images are now stored as base64 in MongoDB
// (same approach as products), so no disk files are involved.
const migrateCategoryImages = async () => {};

module.exports = { ensureSuperAdmin, migrateCategoryImages };
