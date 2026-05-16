"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import StatusBadge from "../../components/StatusBadge";

export default function MyOrdersPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }
    if (user) {
      api.get("/orders/my-orders").then((res) => {
        setOrders(res.data);
        setPageLoading(false);
      });
    }
  }, [user, loading, router]);

  if (loading || pageLoading) return <p>Loading orders...</p>;

  return (
    <div className="space-y-3">
      <h1 className="page-title">My Orders</h1>
      {orders.length === 0 && <div className="card">No orders yet.</div>}
      {orders.map((order) => (
        <div key={order._id} className="card">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-semibold">Order ID: {order._id}</p>
            <StatusBadge status={order.status} />
          </div>
          <p className="mt-2">Total: Rs {order.totalAmount}</p>
          <p className="subtle-text">Items: {order.items?.length || 0}</p>
          <p className="subtle-text">Delivery city: {order.shippingAddress?.city || "N/A"}</p>
          <p className="text-sm text-slate-600">{new Date(order.createdAt).toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
}
