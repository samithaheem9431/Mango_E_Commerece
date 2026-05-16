"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import api from "../../../lib/api";

const defaultForm = {
  name: "",
  category: "5KG Mango Box",
  price: "",
  description: "",
  stock: ""
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(defaultForm);
  const [image, setImage] = useState(null);
  const [editingId, setEditingId] = useState("");
  const [search, setSearch] = useState("");

  const loadProducts = async () => {
    const { data } = await api.get("/products");
    setProducts(data);
  };
  useEffect(() => {
    loadProducts();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (image) fd.append("image", image);

    if (editingId) {
      await api.put(`/products/${editingId}`, fd);
      toast.success("Product updated");
    } else {
      await api.post("/products", fd);
      toast.success("Product created");
    }
    setForm(defaultForm);
    setImage(null);
    setEditingId("");
    loadProducts();
  };

  const edit = (p) => {
    setEditingId(p._id);
    setForm({
      name: p.name,
      category: p.category,
      price: p.price,
      description: p.description,
      stock: p.stock
    });
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    await api.delete(`/products/${id}`);
    toast.success("Product deleted");
    loadProducts();
  };

  const filteredProducts = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-5">
      <h1 className="page-title">Product Management</h1>
      <input
        className="input w-full sm:max-w-md"
        placeholder="Search products by name"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <form onSubmit={submit} className="card grid gap-3 md:grid-cols-2">
        <input className="input" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
          <option>5KG Mango Box</option>
          <option>8KG Mango Box</option>
          <option>10KG Mango Box</option>
        </select>
        <input className="input" type="number" placeholder="Price" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
        <input className="input" type="number" placeholder="Stock" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} required />
        <input className="input md:col-span-2" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
        <input className="md:col-span-2 subtle-text" type="file" onChange={(e) => setImage(e.target.files?.[0] || null)} />
        <button className="btn-primary md:col-span-2">{editingId ? "Update Product" : "Create Product"}</button>
      </form>

      <div className="space-y-2">
        {filteredProducts.map((p) => (
          <div key={p._id} className="card flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold">{p.name}</p>
              <p className="subtle-text">Rs {p.price} | Stock: {p.stock}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="btn-secondary !py-1" onClick={() => edit(p)}>
                Edit
              </button>
              <button className="rounded-xl bg-red-100 px-3 py-2 font-semibold text-red-700 transition hover:bg-red-200" onClick={() => remove(p._id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
        {filteredProducts.length === 0 && <div className="card">No products match your search.</div>}
      </div>
    </div>
  );
}
