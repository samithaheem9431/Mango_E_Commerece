"use client";

import { useEffect, useState } from "react";
import api from "../../lib/api";
import ProductCard from "../../components/ProductCard";

const categories = ["", "5KG Mango Box", "8KG Mango Box", "10KG Mango Box"];

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchProducts = async () => {
    try {
      setError("");
      setLoading(true);
      const { data } = await api.get("/products", { params: { search, category } });
      setProducts(data);
    } catch {
      setError("Unable to load products. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [category]);

  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === "priceLow") return a.price - b.price;
    if (sortBy === "priceHigh") return b.price - a.price;
    if (sortBy === "stockHigh") return b.stock - a.stock;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  return (
    <div>
      <h1 className="mb-4 page-title">All Mango Products</h1>
      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <input
          className="input w-full"
          placeholder="Search mango products"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="input w-full" value={category} onChange={(e) => setCategory(e.target.value)}>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c || "All Categories"}
            </option>
          ))}
        </select>
        <select className="input w-full" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="newest">Newest</option>
          <option value="priceLow">Price: Low to High</option>
          <option value="priceHigh">Price: High to Low</option>
          <option value="stockHigh">Stock: High to Low</option>
        </select>
        <button onClick={fetchProducts} className="btn-primary w-full">
          Apply
        </button>
      </div>

      {loading ? (
        <p>Loading products...</p>
      ) : error ? (
        <div className="card text-red-700">{error}</div>
      ) : products.length === 0 ? (
        <div className="card">No products found for selected filters.</div>
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
