import api from "./api";

const CACHE_KEY = "mango_categories_v2";

function isLightweight(categories) {
  return (
    Array.isArray(categories) &&
    categories.length > 0 &&
    categories.every((c) => !c.image || !String(c.image).startsWith("data:"))
  );
}

export function getCachedCategories() {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!isLightweight(parsed)) {
      sessionStorage.removeItem(CACHE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function setCachedCategories(categories) {
  if (typeof window === "undefined" || !isLightweight(categories)) return;
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(categories));
  } catch {
    /* quota exceeded */
  }
}

export function invalidateCategoriesCache() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(CACHE_KEY);
  sessionStorage.removeItem("mango_categories_v1");
}

/** Returns cached list instantly when valid; otherwise fetches small JSON from API. */
export async function fetchCategories({ force = false } = {}) {
  if (!force) {
    const cached = getCachedCategories();
    if (cached) return cached;
  }

  const { data } = await api.get("/categories");
  const lightweight = Array.isArray(data)
    ? data.map(({ image, ...rest }) => ({
        ...rest,
        image: image?.startsWith("data:") ? "" : image,
      }))
    : [];

  setCachedCategories(lightweight);
  return lightweight;
}
