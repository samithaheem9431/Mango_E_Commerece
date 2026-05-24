"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import api from "../../lib/api";

const STATUS_STEPS = ["Pending", "Confirmed", "Delivered"];

const STATUS_META = {
  Pending: {
    label: "Pending",
    color: "bg-amber-100 text-amber-800 border-amber-300",
    dot: "bg-amber-400",
    icon: "🕐",
    message: "Your order has been received and is awaiting confirmation.",
  },
  Confirmed: {
    label: "Confirmed",
    color: "bg-blue-100 text-blue-800 border-blue-300",
    dot: "bg-blue-500",
    icon: "✅",
    message: "Great news! Your order has been confirmed and is being prepared.",
  },
  Delivered: {
    label: "Delivered",
    color: "bg-green-100 text-green-800 border-green-300",
    dot: "bg-green-500",
    icon: "📦",
    message: "Your order has been delivered. Enjoy your mangoes! 🥭",
  },
  Cancelled: {
    label: "Cancelled",
    color: "bg-red-100 text-red-800 border-red-300",
    dot: "bg-red-500",
    icon: "❌",
    message: "This order has been cancelled. Contact support if you have questions.",
  },
};

function StatusStepper({ status }) {
  if (status === "Cancelled") {
    return (
      <div className="flex items-center gap-3 rounded-xl border-2 border-red-200 bg-red-50 px-5 py-4">
        <span className="text-2xl">❌</span>
        <div>
          <p className="font-bold text-red-700">Order Cancelled</p>
          <p className="text-sm text-red-600">{STATUS_META.Cancelled.message}</p>
        </div>
      </div>
    );
  }

  const currentIdx = STATUS_STEPS.indexOf(status);

  return (
    <div className="rounded-xl border-2 border-green-100 bg-white/90 px-6 py-5 shadow-sm">
      <div className="flex items-center justify-between">
        {STATUS_STEPS.map((step, i) => {
          const done = i < currentIdx;
          const active = i === currentIdx;
          return (
            <div key={step} className="flex flex-1 flex-col items-center gap-1">
              {/* Connector line */}
              <div className="flex w-full items-center">
                {i > 0 && (
                  <div className={`h-1 flex-1 rounded-full transition-all ${done || active ? "bg-green-500" : "bg-green-100"}`} />
                )}
                <div
                  className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 text-lg transition-all
                    ${active ? "border-green-500 bg-green-500 text-white shadow-[0_0_16px_rgba(34,197,94,0.5)]"
                    : done ? "border-green-500 bg-green-500 text-white"
                    : "border-green-200 bg-white text-green-300"}`}
                >
                  {done ? "✓" : active ? STATUS_META[step].icon : i + 1}
                </div>
                {i < STATUS_STEPS.length - 1 && (
                  <div className={`h-1 flex-1 rounded-full transition-all ${done ? "bg-green-500" : "bg-green-100"}`} />
                )}
              </div>
              <span className={`text-xs font-semibold ${active ? "text-green-700" : done ? "text-green-600" : "text-green-300"}`}>
                {step}
              </span>
            </div>
          );
        })}
      </div>
      <p className="mt-4 text-center text-sm text-green-700/80">
        {STATUS_META[status]?.message}
      </p>
    </div>
  );
}

function TrackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [orderId, setOrderId] = useState(searchParams.get("id") ?? "");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTrack = async (e) => {
    e?.preventDefault();
    const trimmed = orderId.trim();
    if (!trimmed) return setError("Please enter your Order ID.");
    if (!/^[a-f\d]{24}$/i.test(trimmed)) return setError("That doesn't look like a valid Order ID. It should be a 24-character code from your email.");

    setError("");
    setLoading(true);
    setOrder(null);
    try {
      const { data } = await api.get(`/orders/track/${trimmed}`);
      setOrder(data);
      router.replace(`/track?id=${trimmed}`, { scroll: false });
    } catch (err) {
      setError(err.response?.data?.message || "Order not found. Please check your Order ID.");
    } finally {
      setLoading(false);
    }
  };

  // Auto-track if ID came from URL (e.g. deep link)
  useState(() => {
    if (searchParams.get("id")) handleTrack();
  });

  const meta = order ? STATUS_META[order.status] ?? STATUS_META.Pending : null;
  const grandTotal = order ? order.totalAmount + 450 : 0;

  return (
    <div className="mx-auto max-w-2xl">

      {/* ── Header ── */}
      <div className="mb-8 text-center">
        <div className="mb-3 inline-flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-3xl">
          📦
        </div>
        <h1 className="text-3xl font-bold text-green-900">Track Your Order</h1>
        <p className="mt-2 text-green-700/70">
          Enter the Order ID from your confirmation email to see the latest status.
        </p>
      </div>

      {/* ── Search box ── */}
      <form onSubmit={handleTrack} className="rounded-2xl bg-white/90 p-6 shadow-md">
        <label className="mb-2 block text-sm font-semibold text-green-800">
          Order / Tracking ID
        </label>
        <div className="flex gap-3">
          <input
            className="flex-1 rounded-xl border-2 border-green-200 bg-white px-4 py-3 font-mono text-sm text-green-900 outline-none placeholder:text-green-400/50 focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
            placeholder="e.g. 683AA1C4F2E09B3D7C8A40F1"
            value={orderId}
            onChange={(e) => { setOrderId(e.target.value); setError(""); }}
            spellCheck={false}
          />
          <button
            type="submit"
            disabled={loading}
            className="btn-primary px-6 py-3 text-base font-bold disabled:opacity-60"
          >
            {loading ? "…" : "Track"}
          </button>
        </div>
        {error && (
          <p className="mt-3 rounded-lg bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600">
            {error}
          </p>
        )}
        <p className="mt-3 text-xs text-green-600/60">
          Your Order ID is in the subject line of the confirmation email you received. It looks like a long code starting with letters and numbers.
        </p>
      </form>

      {/* ── Order result ── */}
      {order && (
        <div className="mt-6 space-y-4 animate-fade-up">

          {/* Status badge + stepper */}
          <div className="rounded-2xl bg-white/90 p-6 shadow-md space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-green-600/60">Tracking ID</p>
                <p className="mt-0.5 font-mono text-sm font-bold text-green-900 break-all">
                  #{String(order._id).toUpperCase()}
                </p>
              </div>
              <span className={`inline-flex items-center gap-2 rounded-full border-2 px-4 py-1.5 text-sm font-bold ${meta.color}`}>
                <span>{meta.icon}</span>
                {meta.label}
              </span>
            </div>

            <StatusStepper status={order.status} />

            <div className="flex items-center justify-between text-xs text-green-600/60">
              <span>📅 Placed on {new Date(order.createdAt).toLocaleDateString("en-PK", { day: "numeric", month: "long", year: "numeric" })}</span>
              <span>🏙️ {order.shippingAddress?.city}</span>
            </div>
          </div>

          {/* Items */}
          <div className="rounded-2xl bg-white/90 p-6 shadow-md">
            <h2 className="mb-4 text-lg font-bold text-green-900">🛒 Order Items</h2>
            <div className="space-y-3">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center gap-3 rounded-xl bg-green-50 p-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-green-900">{item.name}</p>
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700">
                        {item.boxSize}
                      </span>
                    </div>
                    <p className="text-xs text-green-600 mt-0.5">
                      Qty: {item.quantity} × Rs {item.price?.toLocaleString()}
                    </p>
                  </div>
                  <p className="font-bold text-amber-600 text-sm flex-shrink-0">
                    Rs {(item.quantity * (item.price || 0)).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>

            {/* Price breakdown */}
            <div className="mt-4 space-y-2 border-t-2 border-green-100 pt-4">
              <div className="flex justify-between text-sm text-green-700">
                <span>Subtotal</span>
                <span className="font-semibold">Rs {order.totalAmount?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-green-700">
                <span>Delivery</span>
                <span className="font-semibold">Rs 450</span>
              </div>
              <div className="flex justify-between border-t-2 border-green-100 pt-2">
                <span className="text-base font-bold text-green-900">Total Paid</span>
                <span className="text-lg font-black text-amber-600">Rs {grandTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Delivery info */}
          <div className="rounded-2xl bg-white/90 p-6 shadow-md">
            <h2 className="mb-3 text-lg font-bold text-green-900">📍 Delivery Details</h2>
            <div className="space-y-1.5 text-sm text-green-800">
              <p><span className="font-semibold">Name:</span> {order.customerName}</p>
              <p><span className="font-semibold">Address:</span> {order.shippingAddress?.address}, {order.shippingAddress?.city}</p>
              <p><span className="font-semibold">Phone:</span> {order.shippingAddress?.phone}</p>
              {order.riderNotes && (
                <p><span className="font-semibold">Rider Notes:</span> {order.riderNotes}</p>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense>
      <TrackContent />
    </Suspense>
  );
}
