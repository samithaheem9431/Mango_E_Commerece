"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import api from "../../../lib/api";
import { useAuth } from "../../../context/AuthContext";
import FormInput from "../../../components/FormInput";

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [adminForm, setAdminForm] = useState({ name: "", email: "", password: "" });
  const [creating, setCreating] = useState(false);
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  useEffect(() => {
    api.get("/admin/metrics").then((res) => setMetrics(res.data));
    api.get("/admin/audit-logs").then((res) => setAuditLogs(res.data));
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
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create admin");
    } finally {
      setCreating(false);
    }
  };

  const changeRole = async (id, role) => {
    try {
      await api.put(`/admin/users/${id}/role`, { role });
      toast.success("Role updated");
      const { data } = await api.get("/admin/users");
      setUsers(data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Role update failed");
    }
  };

  const deleteUser = async (id, role) => {
    if (!window.confirm(`Delete this ${role} account? This action cannot be undone.`)) return;
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success("User deleted");
      const { data } = await api.get("/admin/users");
      setUsers(data);
      const logs = await api.get("/admin/audit-logs");
      setAuditLogs(logs.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete user");
    }
  };

  if (!metrics) return <p>Loading dashboard...</p>;

  return (
    <div className="space-y-5">
      <h1 className="page-title">Admin Dashboard</h1>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="card h-full transition hover:-translate-y-0.5"><p className="subtle-text">Total Orders</p><p className="mt-2 text-2xl font-black">{metrics.totalOrders}</p></div>
        <div className="card h-full transition hover:-translate-y-0.5"><p className="subtle-text">Revenue</p><p className="mt-2 text-2xl font-black">Rs {metrics.revenue}</p></div>
        <div className="card h-full transition hover:-translate-y-0.5"><p className="subtle-text">Customers</p><p className="mt-2 text-2xl font-black">{metrics.customers}</p></div>
        <div className="card h-full transition hover:-translate-y-0.5"><p className="subtle-text">Low Stock Alerts</p><p className="mt-2 text-2xl font-black">{metrics.lowStockCount}</p></div>
      </div>
      <div className="card">
        <h2 className="mb-2 text-xl font-semibold">Low Stock Products</h2>
        <ul className="space-y-1">
          {metrics.lowStockProducts.map((item) => (
            <li key={item._id}>
              {item.name} - stock {item.stock}
            </li>
          ))}
        </ul>
      </div>

      <div className="card">
        <h2 className="mb-3 text-xl font-semibold">Last 7 Days Performance</h2>
        <div className="overflow-x-auto">
          <div className="grid min-w-[560px] grid-cols-7 gap-2">
            {metrics.weeklyTrend?.map((d) => {
            const maxRevenue = Math.max(...(metrics.weeklyTrend || []).map((x) => x.revenue || 0), 1);
            const h = Math.max(8, Math.round((d.revenue / maxRevenue) * 90));
            return (
              <div key={d.date} className="flex flex-col items-center gap-1">
                <div className="w-full rounded-md bg-brand-mint p-1">
                  <div className="mx-auto w-6 rounded bg-brand-leaf" style={{ height: `${h}px` }} />
                </div>
                <p className="text-[10px] text-slate-600">{d.date.slice(5)}</p>
                <p className="text-[10px] font-semibold text-brand-forest">Rs {d.revenue}</p>
              </div>
            );
            })}
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="mb-3 text-xl font-semibold">Recent Admin Activity</h2>
        <div className="space-y-2">
          {auditLogs.map((log) => (
            <div key={log._id} className="rounded-xl border border-brand-mint p-3">
              <p className="font-semibold text-brand-soil">
                {log.action.replace(/_/g, " ")} by {log.actor?.name || "Admin"}
              </p>
              <p className="subtle-text">{new Date(log.createdAt).toLocaleString()}</p>
              {log.targetType !== "system" && (
                <p className="subtle-text">
                  Target: {log.targetType} ({log.targetId})
                </p>
              )}
            </div>
          ))}
          {auditLogs.length === 0 && <p className="subtle-text">No activity yet.</p>}
        </div>
      </div>

      {user?.role === "superadmin" && (
        <form onSubmit={createAdmin} className="card space-y-3">
          <h2 className="text-xl font-semibold">Create Admin (Super Admin Only)</h2>
          <FormInput
            placeholder="Admin Name"
            value={adminForm.name}
            onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
          />
          <FormInput
            placeholder="Admin Email"
            type="email"
            value={adminForm.email}
            onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
          />
          <FormInput
            placeholder="Temporary Password (min 8 chars)"
            type="password"
            value={adminForm.password}
            onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
            minLength={8}
          />
          <button className="btn-primary" disabled={creating}>
            {creating ? "Creating..." : "Create Admin"}
          </button>
        </form>
      )}

      {user?.role === "superadmin" && (
        <div className="card">
          <h2 className="mb-3 text-xl font-semibold">User Role Management</h2>
          <div className="space-y-2">
            {users.map((u) => (
              <div key={u._id} className="flex flex-col gap-2 rounded-lg border p-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold">{u.name}</p>
                  <p className="text-sm text-slate-600">{u.email}</p>
                </div>
                {u.role === "superadmin" ? (
                  <span className="rounded-full bg-purple-100 px-3 py-1 text-sm font-semibold text-purple-700">
                    superadmin
                  </span>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                      {u.role}
                    </span>
                    <button
                      onClick={() => deleteUser(u._id, u.role)}
                      className="rounded-lg bg-red-100 px-3 py-1 text-sm font-semibold text-red-700 hover:bg-red-200"
                    >
                      Delete
                    </button>
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
