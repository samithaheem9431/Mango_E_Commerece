const fs = require("fs");
const path = require("path");
const Category = require("../models/Category");

const uploadDir = path.join(__dirname, "../uploads/categories");

function ensureUploadDir() {
  fs.mkdirSync(uploadDir, { recursive: true });
}

function extFromMime(mime) {
  const map = { "image/jpeg": ".jpg", "image/jpg": ".jpg", "image/png": ".png", "image/webp": ".webp", "image/gif": ".gif" };
  return map[mime] || ".jpg";
}

/** Move embedded base64 image to disk; update DB. Returns public path. */
async function migrateBase64ToFile(category) {
  const { image, _id } = category;
  if (!image || !image.startsWith("data:")) return image;

  const match = image.match(/^data:(image\/[\w+.+-]+);base64,(.+)$/s);
  if (!match) return image;

  ensureUploadDir();
  const ext = extFromMime(match[1]);
  const filename = `${_id}${ext}`;
  const filepath = path.join(uploadDir, filename);

  fs.writeFileSync(filepath, Buffer.from(match[2], "base64"));
  const publicPath = `/uploads/categories/${filename}`;
  await Category.updateOne({ _id }, { $set: { image: publicPath } });
  return publicPath;
}

async function normalizeCategoryImages(categories) {
  const out = [];
  for (const cat of categories) {
    let image = cat.image;
    if (image?.startsWith("data:")) {
      image = await migrateBase64ToFile(cat);
    }
    out.push({ ...cat, image });
  }
  return out;
}

module.exports = { migrateBase64ToFile, normalizeCategoryImages, uploadDir, ensureUploadDir };
