export function categoryImageSrc(image) {
  if (!image) return "/images/mango.png";
  if (image.startsWith("data:") || image.startsWith("http")) return image;
  const base = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:5000";
  return `${base}${image.startsWith("/") ? image : `/${image}`}`;
}
