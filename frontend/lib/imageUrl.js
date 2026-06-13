/** Resolve product/category image stored as Cloudinary URL, legacy path, or base64. */
export function resolveImageUrl(image, fallback = "/images/mango.png") {
  if (!image) return fallback;
  if (image.startsWith("data:") || image.startsWith("http")) return image;
  const base =
    process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:5000";
  return `${base}${image.startsWith("/") ? image : `/${image}`}`;
}
