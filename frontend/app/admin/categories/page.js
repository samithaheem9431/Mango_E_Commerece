"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import api from "../../../lib/api";
import {
  fetchCategories,
  getCachedCategories,
  invalidateCategoriesCache,
} from "../../../lib/categoriesCache";
import { categoryImageSrc } from "../../../lib/categoryImage";
import { Pencil, Trash2, Plus, Leaf, Sparkles, Crown, Gift } from "lucide-react";

const card = "rounded-xl bg-white border border-slate-200 shadow-sm p-5";
const inputCls =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100";
const labelCls = "mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500";

const iconOptions = [
  { value: "leaf", label: "Leaf", Icon: Leaf },
  { value: "sparkles", label: "Sparkles", Icon: Sparkles },
  { value: "crown", label: "Crown", Icon: Crown },
  { value: "gift", label: "Gift Box", Icon: Gift },
];

const defaultForm = { name: "", tagline: "", icon: "leaf", sortOrder: "0" };

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(defaultForm);
  const [image, setImage] = useState(null);
  const [editingId, setEditingId] = useState("");
  const [search, setSearch] = useState("");

  const loadCategories = async (force = false) => {
    const data = await fetchCategories({ force });
    setCategories(data);
  };

  useEffect(() => {
    const cached = getCachedCategories();
    if (cached?.length) {
      setCategories(cached);
      return;
    }
    loadCategories();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (image) fd.append("image", image);

    try {
      if (editingId) {
        await api.put(`/categories/${editingId}`, fd);
        toast.success("Category updated");
      } else {
        if (!image) {
          toast.error("Please upload a category image");
          return;
        }
        await api.post("/categories", fd);
        toast.success("Category created");
      }
      setForm(defaultForm);
      setImage(null);
      setEditingId("");
      invalidateCategoriesCache();
      loadCategories(true);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Something went wrong");
    }
  };

  const edit = (c) => {
    setEditingId(c._id);
    setForm({
      name: c.name,
      tagline: c.tagline || "",
      icon: c.icon || "leaf",
      sortOrder: String(c.sortOrder ?? 0),
    });
    setImage(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    await api.delete(`/categories/${id}`);
    toast.success("Category deleted");
    invalidateCategoriesCache();
    loadCategories(true);
  };

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Categories</h1>
        <p className="mt-1 text-sm text-slate-500">
          {categories.length} categories — shown on the homepage under &quot;Shop by Categories&quot;
        </p>
      </div>

      <form onSubmit={submit} className={`${card} space-y-4`}>
        <h2 className="font-semibold text-slate-900">
          {editingId ? "Edit Category" : "Add New Category"}
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className={labelCls}>Name</label>
            <input
              className={inputCls}
              placeholder="e.g. Early Harvest"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className={labelCls}>Icon</label>
            <select
              className={inputCls}
              value={form.icon}
              onChange={(e) => setForm({ ...form, icon: e.target.value })}
            >
              {iconOptions.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className={labelCls}>Tagline</label>
            <input
              className={inputCls}
              placeholder="Short description shown on the card"
              value={form.tagline}
              onChange={(e) => setForm({ ...form, tagline: e.target.value })}
            />
          </div>
          <div>
            <label className={labelCls}>Display order</label>
            <input
              className={inputCls}
              type="number"
              placeholder="0"
              value={form.sortOrder}
              onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
            />
          </div>
          <div>
            <label className={labelCls}>Category image {editingId && "(leave empty to keep current)"}</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files?.[0] || null)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-600 file:mr-3 file:rounded file:border-0 file:bg-blue-50 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-blue-700"
              required={!editingId}
            />
          </div>
        </div>
        <div className="flex gap-3">
          <button
            type="submit"
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            {editingId ? "Update Category" : "Add Category"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setForm(defaultForm);
                setEditingId("");
                setImage(null);
              }}
              className="rounded-lg border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <input
        className={inputCls}
        placeholder="Search categories…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="space-y-3">
        {filtered.map((c) => {
          const IconComp = iconOptions.find((o) => o.value === c.icon)?.Icon || Leaf;
          return (
            <div key={c._id} className={`${card} flex flex-col gap-3 sm:flex-row sm:items-center`}>
              <img
                src={categoryImageSrc(c.image)}
                alt={c.name}
                className="h-20 w-14 rounded-lg object-cover ring-1 ring-slate-200"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <IconComp className="h-4 w-4 text-amber-600" />
                  <p className="font-semibold text-slate-900">{c.name}</p>
                </div>
                {c.tagline && <p className="mt-0.5 text-sm text-slate-500">{c.tagline}</p>}
                <p className="mt-0.5 text-xs text-slate-400">Order: {c.sortOrder ?? 0}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => edit(c)}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </button>
                <button
                  onClick={() => remove(c._id)}
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
            <p className="text-center text-sm text-slate-400">No categories found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
