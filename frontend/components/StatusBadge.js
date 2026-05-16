"use client";

export default function StatusBadge({ status }) {
  const normalized = String(status || "").toLowerCase();
  const colorMap = {
    pending: "bg-amber-100 text-amber-800",
    confirmed: "bg-blue-100 text-blue-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800"
  };

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${colorMap[normalized] || "bg-slate-100 text-slate-700"}`}>
      {status}
    </span>
  );
}
