"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import api from "../../../lib/api";
import StatusBadge from "../../../components/StatusBadge";

const statuses = ["Pending", "Confirmed", "Delivered", "Cancelled"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [exporting, setExporting] = useState(false);

  const loadOrders = async () => {
    const { data } = await api.get("/orders");
    setOrders(data);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const updateStatus = async (id, status) => {
    await api.put(`/orders/${id}/status`, { status });
    toast.success("Order status updated");
    loadOrders();
  };

  const filteredOrders = orders.filter((order) => {
    const matchStatus = statusFilter ? order.status === statusFilter : true;
    const q = query.toLowerCase();
    const matchQuery =
      !q ||
      order.user?.name?.toLowerCase().includes(q) ||
      order.user?.email?.toLowerCase().includes(q) ||
      order._id.toLowerCase().includes(q);
    return matchStatus && matchQuery;
  });

  const exportCsv = async () => {
    try {
      setExporting(true);
      const response = await api.get("/admin/orders-export.csv", { responseType: "blob" });
      const blobUrl = window.URL.createObjectURL(new Blob([response.data], { type: "text/csv" }));
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `orders-export-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(blobUrl);
      toast.success("Orders CSV exported");
    } catch {
      toast.error("Failed to export CSV");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div>
      <h1 className="mb-4 page-title">Order Monitoring</h1>
      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <input
          className="input w-full"
          placeholder="Search by customer, email or order id"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select className="input w-full" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          {statuses.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <button className="btn-secondary w-full xl:w-auto" onClick={exportCsv} disabled={exporting}>
          {exporting ? "Exporting..." : "Export CSV"}
        </button>
      </div>
      <div className="space-y-3">
        {filteredOrders.map((order) => (
          <div key={order._id} className="card">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold">Customer: {order.user?.name}</p>
                <p className="subtle-text">{order.user?.email}</p>
                <p className="font-bold">Total: Rs {order.totalAmount}</p>
                <p className="subtle-text">Items: {order.items?.length || 0}</p>
                <p className="subtle-text">{new Date(order.createdAt).toLocaleString()}</p>
              </div>
              <div className="flex flex-col gap-2 sm:items-end">
                <StatusBadge status={order.status} />
                <select value={order.status} onChange={(e) => updateStatus(order._id, e.target.value)} className="input w-full sm:w-44">
                  {statuses.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ))}
        {filteredOrders.length === 0 && <div className="card">No orders match selected filters.</div>}
      </div>
    </div>
  );
}
