const Product = require("../models/Product");
const Category = require("../models/Category");
const {
  isConfigured,
  uploadFromSource,
  needsMigration
} = require("../config/cloudinary");

async function migrateCollection(Model, folder, label) {
  const rows = await Model.find().select("_id image name").lean();
  const pending = rows.filter((r) => needsMigration(r.image));
  if (pending.length === 0) return;

  console.log(`Migrating ${pending.length} ${label} image(s) to Cloudinary…`);

  for (const row of pending) {
    try {
      const url = await uploadFromSource(row.image, folder, String(row._id));
      await Model.updateOne({ _id: row._id }, { $set: { image: url } });
      console.log(`  ✓ ${label}: ${row.name || row._id}`);
    } catch (err) {
      console.error(`  ✗ ${label} ${row._id}:`, err.message);
    }
  }

  console.log(`${label} image migration complete.`);
}

async function migrateImagesToCloudinary() {
  if (!isConfigured()) {
    console.log("Cloudinary not configured — skipping image migration.");
    return;
  }

  await migrateCollection(Product, "products", "product");
  await migrateCollection(Category, "categories", "category");
}

module.exports = { migrateImagesToCloudinary };
