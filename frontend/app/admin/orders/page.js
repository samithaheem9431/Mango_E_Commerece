"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import api from "../../../lib/api";
import StatusBadge from "../../../components/StatusBadge";
import { Download, ChevronDown, ChevronUp, MapPin, Phone, Mail, User, StickyNote, Package } from "lucide-react";

const card = "rounded-xl bg-white border border-slate-200 shadow-sm";
const inputCls = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100";
const statuses = ["Pending", "Confirmed", "Delivered", "Cancelled"];

function OrderRow({ order, onStatusChange }) {
  const [open, setOpen] = useState(false);

  const name = order.customerName || order.user?.name || "—";
  const email = order.customerEmail || order.user?.email || "—";
  const addr = order.shippingAddress;

  return (
    <div className={card}>
      {/* ── Summary row (always visible) ── */}
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-slate-900">{name}</p>
          </div>
          <p className="text-sm text-slate-500">{email}</p>
          <p className="font-mono text-xs text-slate-400">#{order._id}</p>
          <p className="text-xs text-slate-400">{new Date(order.createdAt).toLocaleString()}</p>
          <div className="flex gap-4 pt-1">
            <span className="text-sm font-bold text-slate-900">Rs {order.totalAmount?.toLocaleString()}</span>
            <span className="text-sm text-slate-500">{order.items?.length || 0} item(s)</span>
          </div>
        </div>

        <div className="flex flex-col items-start gap-2 sm:items-end">
          <StatusBadge status={order.status} />
          <select
            value={order.status}
            onChange={(e) => onStatusChange(order._id, e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          >
            {statuses.map((s) => <option key={s}>{s}</option>)}
          </select>
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100"
          >
            {open ? <><ChevronUp className="h-3.5 w-3.5" /> Hide details</> : <><ChevronDown className="h-3.5 w-3.5" /> View details</>}
          </button>
        </div>
      </div>

      {/* ── Expanded details ── */}
      {open && (
        <div className="border-t border-slate-100 px-5 pb-5 pt-4 space-y-5">

          {/* Customer & delivery info */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Customer</p>
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <User className="h-4 w-4 text-slate-400 shrink-0" />
                {name}
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                {email}
              </div>
              {addr?.phone && (
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                  {addr.phone}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Delivery Address</p>
              {addr ? (
                <div className="flex items-start gap-2 text-sm text-slate-700">
                  <MapPin className="mt-0.5 h-4 w-4 text-slate-400 shrink-0" />
                  <span>{addr.address}{addr.city ? `, ${addr.city}` : ""}</span>
                </div>
              ) : (
                <p className="text-sm text-slate-400">No address provided</p>
              )}
              {order.riderNotes && (
                <div className="flex items-start gap-2 text-sm text-amber-700">
                  <StickyNote className="mt-0.5 h-4 w-4 text-amber-400 shrink-0" />
                  <span>{order.riderNotes}</span>
                </div>
              )}
            </div>
          </div>

          {/* Items */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Items Ordered</p>
            <div className="space-y-2">
              {order.items?.map((item, i) => {
                const imageSrc = item.image
                  ? item.image.startsWith("data:") || item.image.startsWith("http")
                    ? item.image
                    : `${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}${item.image}`
                  : null;
                return (
                  <div key={i} className="flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-2">
                    {imageSrc ? (
                      <img src={imageSrc} alt={item.name} className="h-10 w-10 rounded-md object-cover ring-1 ring-slate-200" />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-200">
                        <Package className="h-5 w-5 text-slate-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-800">{item.name}</p>
                      <p className="text-xs text-slate-500">
                        {item.boxSize} · Qty {item.quantity} × Rs {item.price?.toLocaleString()}
                      </p>
                    </div>
                    <p className="text-sm font-bold text-slate-800">
                      Rs {(item.quantity * item.price)?.toLocaleString()}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Price summary */}
          <div className="flex justify-end">
            <div className="w-56 space-y-1 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>Rs {order.totalAmount?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Delivery</span>
                <span>Rs 450</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-1 font-bold text-slate-900">
                <span>Grand Total</span>
                <span>Rs {((order.totalAmount || 0) + 450).toLocaleString()}</span>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [exporting, setExporting] = useState(false);

  const loadOrders = async () => {
    const { data } = await api.get("/orders");
    setOrders(data);
  };

  useEffect(() => { loadOrders(); }, []);

  const updateStatus = async (id, status) => {
    await api.put(`/orders/${id}/status`, { status });
    toast.success("Status updated");
    loadOrders();
  };

  const filteredOrders = orders.filter((order) => {
    const matchStatus = statusFilter ? order.status === statusFilter : true;
    const q = query.toLowerCase();
    if (!matchStatus) return false;
    if (!q) return true;
    return (
      order._id.toLowerCase().includes(q) ||
      order.customerName?.toLowerCase().includes(q) ||
      order.customerEmail?.toLowerCase().includes(q) ||
      order.user?.name?.toLowerCase().includes(q) ||
      order.user?.email?.toLowerCase().includes(q) ||
      order.shippingAddress?.city?.toLowerCase().includes(q) ||
      order.shippingAddress?.phone?.includes(q)
    );
  });

  const exportCsv = async () => {
    try {
      setExporting(true);
      const response = await api.get("/admin/orders-export.csv", { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: "text/csv" }));
      const a = document.createElement("a");
      a.href = url; a.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a); a.click(); a.remove();
      window.URL.revokeObjectURL(url);
      toast.success("CSV exported");
    } catch { toast.error("Export failed"); }
    finally { setExporting(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
          <p className="mt-1 text-sm text-slate-500">{orders.length} total orders</p>
        </div>
        <button
          onClick={exportCsv}
          disabled={exporting}
          className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          {exporting ? "Exporting..." : "Export CSV"}
        </button>
      </div>

      {/* Filters */}
      <div className={`${card} flex flex-col gap-3 p-5 sm:flex-row`}>
        <input className={inputCls} placeholder="Search by name, email, phone, city or order ID…" value={query} onChange={(e) => setQuery(e.target.value)} />
        <select className={`${inputCls} sm:w-48`} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          {statuses.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Orders list */}
      <div className="space-y-3">
        {filteredOrders.map((order) => (
          <OrderRow key={order._id} order={order} onStatusChange={updateStatus} />
        ))}
        {filteredOrders.length === 0 && (
          <div className={`${card} p-5`}>
            <p className="text-center text-sm text-slate-400">No orders match your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
