const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const path = require("path");

function isConfigured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
}

function ensureConfigured() {
  if (!isConfigured()) {
    throw new Error(
      "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET."
    );
  }
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });
}

function getPublicIdFromUrl(url) {
  if (!url || !url.includes("res.cloudinary.com")) return null;
  try {
    const afterUpload = url.split("/upload/")[1];
    if (!afterUpload) return null;
    const withoutVersion = afterUpload.replace(/^v\d+\//, "");
    const lastDot = withoutVersion.lastIndexOf(".");
    return lastDot > 0 ? withoutVersion.slice(0, lastDot) : withoutVersion;
  } catch {
    return null;
  }
}

/** Upload a multer memory file to Cloudinary. Returns secure HTTPS URL. */
async function uploadFromMulter(file, folder) {
  ensureConfigured();
  const dataUri = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
  const result = await cloudinary.uploader.upload(dataUri, {
    folder: `mango/${folder}`,
    resource_type: "image"
  });
  return result.secure_url;
}

/** Upload base64 data URI or local file path to Cloudinary. */
async function uploadFromSource(source, folder, id) {
  ensureConfigured();

  if (source.startsWith("data:")) {
    const result = await cloudinary.uploader.upload(source, {
      folder: `mango/${folder}`,
      public_id: id ? `${folder}-${id}` : undefined,
      overwrite: true,
      resource_type: "image"
    });
    return result.secure_url;
  }

  if (source.startsWith("/uploads/")) {
    const fullPath = path.join(__dirname, "..", source.replace(/^\//, ""));
    if (!fs.existsSync(fullPath)) return source;
    const result = await cloudinary.uploader.upload(fullPath, {
      folder: `mango/${folder}`,
      public_id: id ? `${folder}-${id}` : undefined,
      overwrite: true,
      resource_type: "image"
    });
    return result.secure_url;
  }

  return source;
}

async function deleteByUrl(url) {
  if (!url || !isConfigured()) return;
  const publicId = getPublicIdFromUrl(url);
  if (!publicId) return;
  ensureConfigured();
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch {
    /* ignore missing assets */
  }
}

function needsMigration(image) {
  if (!image) return false;
  return !image.includes("res.cloudinary.com");
}

module.exports = {
  isConfigured,
  ensureConfigured,
  uploadFromMulter,
  uploadFromSource,
  deleteByUrl,
  getPublicIdFromUrl,
  needsMigration
};
