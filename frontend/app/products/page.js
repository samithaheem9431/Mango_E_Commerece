"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "../../lib/api";
import ProductCard from "../../components/ProductCard";

const ctrlBase =
  "w-full rounded-xl border-2 border-green-700 bg-green-950 px-4 py-2.5 text-sm font-medium text-green-100 outline-none transition placeholder:text-green-400/60 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30 hover:border-green-500";

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [allCategories, setAllCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [category, setCategory] = useState(searchParams.get("category") ?? "");
  const [sortBy, setSortBy] = useState("newest");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load categories once
  useEffect(() => {
    api.get("/categories").then(({ data }) => setAllCategories(data)).catch(() => {});
  }, []);

  const fetchProducts = async (cat = category, q = search) => {
    try {
      setError("");
      setLoading(true);
      const { data } = await api.get("/products", { params: { search: q, category: cat } });
      setProducts(data);
    } catch {
      setError("Unable to load products. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Sync URL params → state and fetch whenever URL changes (e.g. navigating from landing search)
  useEffect(() => {
    const catParam = searchParams.get("category") ?? "";
    const searchParam = searchParams.get("search") ?? "";
    setCategory(catParam);
    setSearch(searchParam);
    fetchProducts(catParam, searchParam);
  }, [searchParams]);

  const handleCategoryChange = (val) => {
    setCategory(val);
    // Keep URL in sync so the browser back button works
    const params = new URLSearchParams(searchParams.toString());
    if (val) params.set("category", val);
    else params.delete("category");
    router.replace(`/products?${params.toString()}`, { scroll: false });
  };

  const minVariantPrice = (p) =>
    Math.min(...(p.variants ?? []).map((v) => v.price), Infinity);

  const totalStock = (p) =>
    (p.variants ?? []).reduce((s, v) => s + v.stock, 0);

  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === "priceLow") return minVariantPrice(a) - minVariantPrice(b);
    if (sortBy === "priceHigh") return minVariantPrice(b) - minVariantPrice(a);
    if (sortBy === "stockHigh") return totalStock(b) - totalStock(a);
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const activeCategoryName = allCategories.find((c) => c._id === category)?.name;

  return (
    <div>
      <h1 className="mb-1 page-title">All Mango Products</h1>
      {activeCategoryName && (
        <p className="mb-4 text-sm font-semibold text-amber-600">
          Showing: {activeCategoryName}
          <button
            onClick={() => handleCategoryChange("")}
            className="ml-2 text-green-700 underline hover:text-green-900"
          >
            Clear
          </button>
        </p>
      )}

      {/* ── Filter bar ── */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <input
          className={ctrlBase}
          placeholder="Search mango products…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && fetchProducts()}
        />

        <select
          className={ctrlBase}
          value={category}
          onChange={(e) => handleCategoryChange(e.target.value)}
        >
          <option value="">All Categories</option>
          {allCategories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          className={ctrlBase}
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="newest">Newest</option>
          <option value="priceLow">Price: Low to High</option>
          <option value="priceHigh">Price: High to Low</option>
          <option value="stockHigh">Stock: High to Low</option>
        </select>

        <button
          onClick={() => fetchProducts()}
          className="w-full rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-bold text-green-950 shadow transition hover:bg-amber-300 active:scale-95"
        >
          Apply
        </button>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-72 animate-pulse rounded-2xl bg-green-900/40" />
          ))}
        </div>
      ) : error ? (
        <div className="card text-red-400">{error}</div>
      ) : sortedProducts.length === 0 ? (
        <div className="card text-white/70">No products found for the selected filters.</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sortedProducts.map((product, index) => (
            <div
              key={product._id}
              className="animate-fade-up"
              style={{ animationDelay: `${Math.min(index * 50, 300)}ms` }}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense>
      <ProductsContent />
    </Suspense>
  );
}
