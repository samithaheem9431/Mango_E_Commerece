"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import api from "../../../lib/api";
import { useAuth } from "../../../context/AuthContext";
import { ShoppingBag, DollarSign, Users, AlertTriangle } from "lucide-react";

const card = "rounded-xl bg-white border border-slate-200 shadow-sm p-5";
const inputCls = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100";
const labelCls = "mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500";

const metricConfig = [
  { key: "totalOrders",   title: "Total Orders",     icon: <ShoppingBag   className="h-5 w-5 text-blue-500"   />, bg: "bg-blue-50"   },
  { key: "revenue",       title: "Revenue",          icon: <DollarSign    className="h-5 w-5 text-green-500"  />, bg: "bg-green-50"  },
  { key: "customers",     title: "Customers",        icon: <Users         className="h-5 w-5 text-purple-500" />, bg: "bg-purple-50" },
  { key: "lowStockCount", title: "Low Stock Alerts", icon: <AlertTriangle className="h-5 w-5 text-orange-500" />, bg: "bg-orange-50" },
];

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [adminForm, setAdminForm] = useState({ name: "", email: "", password: "" });
  const [creating, setCreating] = useState(false);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    api.get("/admin/metrics").then((res) => setMetrics(res.data));
    if (user?.role === "superadmin") {
      api.get("/admin/users").then((res) => setUsers(res.data));
    }
  }, [user]);

  const createAdmin = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post("/admin/create-admin", adminForm);
      toast.success("Admin account created");
      setAdminForm({ name: "", email: "", password: "" });
      const { data } = await api.get("/admin/users");
      setUsers(data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create admin");
    } finally {
      setCreating(false);
    }
  };

  const deleteUser = async (id, role) => {
    if (!window.confirm(`Delete this ${role} account? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success("User deleted");
      const { data } = await api.get("/admin/users");
      setUsers(data);
      const logs = await api.get("/admin/audit-logs");
      setAuditLogs(logs.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete user");
    }
  };

  if (!metrics) return (
    <div className="flex h-64 items-center justify-center">
      <p className="text-slate-400">Loading dashboard...</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Welcome back. Here's an overview of your store.</p>
      </div>

      {/* Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metricConfig.map(({ key, title, icon, bg }) => (
          <div key={key} className={card}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">{title}</p>
                <p className="mt-1 text-3xl font-black text-slate-900">
                  {key === "revenue" ? `Rs ${(metrics[key] || 0).toLocaleString()}` : metrics[key]}
                </p>
              </div>
              <div className={`flex h-11 w-11 items-center justify-center rounded-full ${bg}`}>{icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Low stock */}
      <div className={card}>
        <h2 className="mb-3 font-semibold text-slate-900">Low Stock Products</h2>
        {metrics.lowStockProducts.length === 0 ? (
          <p className="text-sm text-slate-400">All products are well stocked.</p>
        ) : (
          <ul className="space-y-2">
            {metrics.lowStockProducts.map((item) => (
              <li key={item._id} className="flex items-center justify-between rounded-lg bg-orange-50 px-3 py-2">
                <span className="text-sm font-medium text-slate-800">{item.name}</span>
                <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-600">Stock: {item.stock}</span>
              </li>
            ))}
          </ul>
        )}
      </div>


      {/* Create admin */}
      {user?.role === "superadmin" && (
        <form onSubmit={createAdmin} className={`${card} space-y-4`}>
          <h2 className="font-semibold text-slate-900">Create Admin Account</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {[{ f: "name", l: "Name", t: "text" }, { f: "email", l: "Email", t: "email" }, { f: "password", l: "Password", t: "password" }].map(({ f, l, t }) => (
              <div key={f}>
                <label className={labelCls}>{l}</label>
                <input className={inputCls} type={t} placeholder={l} value={adminForm[f]}
                  onChange={(e) => setAdminForm({ ...adminForm, [f]: e.target.value })}
                  minLength={f === "password" ? 8 : undefined} />
              </div>
            ))}
          </div>
          <button className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50" disabled={creating}>
            {creating ? "Creating..." : "Create Admin"}
          </button>
        </form>
      )}

      {/* User management */}
      {user?.role === "superadmin" && (
        <div className={card}>
          <h2 className="mb-3 font-semibold text-slate-900">User Management</h2>
          <div className="space-y-2">
            {users.map((u) => (
              <div key={u._id} className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{u.name}</p>
                  <p className="text-xs text-slate-500">{u.email}</p>
                </div>
                {u.role === "superadmin" ? (
                  <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">superadmin</span>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">{u.role}</span>
                    <button onClick={() => deleteUser(u._id, u.role)} className="rounded-lg bg-red-50 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-100">Delete</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
