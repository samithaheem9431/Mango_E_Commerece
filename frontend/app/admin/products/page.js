"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import api from "../../../lib/api";
import { Pencil, Trash2, Plus } from "lucide-react";

const card = "rounded-xl bg-white border border-slate-200 shadow-sm p-5";
const inputCls = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100";
const labelCls = "mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500";

const BOX_SIZES = ["5KG", "8KG", "10KG"];
const defaultVariants = BOX_SIZES.map((s) => ({ boxSize: s, price: "", stock: "" }));
const defaultForm = { name: "", category: "", description: "" };

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(defaultForm);
  const [variants, setVariants] = useState(defaultVariants);
  const [image, setImage] = useState(null);
  const [editingId, setEditingId] = useState("");
  const [search, setSearch] = useState("");

  const loadProducts = async () => {
    const { data } = await api.get("/products");
    setProducts(data);
  };

  const loadCategories = async () => {
    const { data } = await api.get("/categories");
    setCategories(data);
  };

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  // Set default category once categories are loaded (for new product form)
  useEffect(() => {
    if (!editingId && categories.length > 0 && !form.category) {
      setForm((f) => ({ ...f, category: categories[0]._id }));
    }
  }, [categories, editingId]);

  const updateVariant = (boxSize, field, value) => {
    setVariants((prev) =>
      prev.map((v) => (v.boxSize === boxSize ? { ...v, [field]: value } : v))
    );
  };

  const submit = async (e) => {
    e.preventDefault();
    const builtVariants = variants
      .filter((v) => v.price !== "" || v.stock !== "")
      .map((v) => ({ boxSize: v.boxSize, price: Number(v.price) || 0, stock: Number(v.stock) || 0 }));

    if (builtVariants.length === 0) {
      return toast.error("Add at least one box size with a price");
    }

    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("category", form.category);
    fd.append("description", form.description);
    fd.append("variants", JSON.stringify(builtVariants));
    if (image) fd.append("image", image);

    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, fd);
        toast.success("Product updated");
      } else {
        await api.post("/products", fd);
        toast.success("Product created");
      }
      setForm({ ...defaultForm, category: categories[0]?._id ?? "" });
      setVariants(defaultVariants);
      setImage(null);
      setEditingId("");
      loadProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save product");
    }
  };

  const edit = (p) => {
    setEditingId(p._id);
    setForm({
      name: p.name,
      category: p.category?._id ?? p.category,
      description: p.description
    });
    // Merge saved variants back into the fixed 3-row grid
    setVariants(
      BOX_SIZES.map((s) => {
        const saved = p.variants?.find((v) => v.boxSize === s);
        return saved
          ? { boxSize: s, price: String(saved.price), stock: String(saved.stock) }
          : { boxSize: s, price: "", stock: "" };
      })
    );
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    await api.delete(`/products/${id}`);
    toast.success("Product deleted");
    loadProducts();
  };

  const cancel = () => {
    setForm({ ...defaultForm, category: categories[0]?._id ?? "" });
    setVariants(defaultVariants);
    setImage(null);
    setEditingId("");
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Products</h1>
        <p className="mt-1 text-sm text-slate-500">{products.length} products in your catalogue</p>
      </div>

      {/* ── Form ── */}
      <form onSubmit={submit} className={`${card} space-y-4`}>
        <h2 className="font-semibold text-slate-900">{editingId ? "Edit Product" : "Add New Product"}</h2>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Name */}
          <div>
            <label className={labelCls}>Name</label>
            <input
              className={inputCls}
              placeholder="Product name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          {/* Category from DB */}
          <div>
            <label className={labelCls}>Category</label>
            <select
              className={inputCls}
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              required
            >
              {categories.length === 0 && (
                <option value="">No categories yet — add one first</option>
              )}
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className={labelCls}>Description</label>
            <input
              className={inputCls}
              placeholder="Short product description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
            />
          </div>

          {/* Image */}
          <div className="md:col-span-2">
            <label className={labelCls}>Product Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files?.[0] || null)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-600 file:mr-3 file:rounded file:border-0 file:bg-blue-50 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-blue-700"
            />
          </div>
        </div>

        {/* ── Box-size variants ── */}
        <div>
          <label className={labelCls}>Box Sizes — Price &amp; Stock</label>
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 w-24">Size</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Price (Rs)</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Stock (boxes)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {variants.map((v) => (
                  <tr key={v.boxSize}>
                    <td className="px-4 py-2">
                      <span className="inline-block rounded-md bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-700">
                        {v.boxSize}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        min="0"
                        className={inputCls}
                        placeholder="e.g. 1900"
                        value={v.price}
                        onChange={(e) => updateVariant(v.boxSize, "price", e.target.value)}
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        min="0"
                        className={inputCls}
                        placeholder="e.g. 50"
                        value={v.stock}
                        onChange={(e) => updateVariant(v.boxSize, "stock", e.target.value)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-1 text-xs text-slate-400">Leave a row blank to skip that size.</p>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            {editingId ? "Update Product" : "Add Product"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={cancel}
              className="rounded-lg border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* ── Search ── */}
      <input
        className={inputCls}
        placeholder="Search products…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* ── Product list ── */}
      <div className="space-y-3">
        {filtered.map((p) => {
          const imgSrc = !p.image
            ? "/images/mango.png"
            : p.image.startsWith("data:") || p.image.startsWith("http")
              ? p.image
              : `${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}${p.image}`;

          const totalStock = (p.variants ?? []).reduce((s, v) => s + v.stock, 0);
          const lowStock = totalStock <= 5;

          return (
            <div key={p._id} className={`${card} flex flex-col gap-3 sm:flex-row sm:items-start`}>
              <img src={imgSrc} alt={p.name} className="h-14 w-14 flex-shrink-0 rounded-lg object-cover ring-1 ring-slate-200" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900">{p.name}</p>
                <p className="text-xs text-slate-400">{p.category?.name ?? "—"}</p>
                {/* Variant pills */}
                <div className="mt-1.5 flex flex-wrap gap-2">
                  {(p.variants ?? []).map((v) => (
                    <span
                      key={v.boxSize}
                      className={`rounded-md px-2 py-0.5 text-xs font-semibold ${
                        v.stock === 0
                          ? "bg-red-50 text-red-500"
                          : v.stock <= 5
                            ? "bg-orange-50 text-orange-600"
                            : "bg-green-50 text-green-700"
                      }`}
                    >
                      {v.boxSize} · Rs {v.price.toLocaleString()} · {v.stock} left
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 sm:flex-shrink-0">
                <button
                  onClick={() => edit(p)}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </button>
                <button
                  onClick={() => remove(p._id)}
                  className="flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-100"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className={card}>
            <p className="text-center text-sm text-slate-400">No products found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
