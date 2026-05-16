"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "../../components/AdminSidebar";
import { useAuth } from "../../context/AuthContext";

export default function AdminLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !["admin", "superadmin"].includes(user?.role)) router.push("/login");
  }, [user, loading, router]);

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-start">
      <AdminSidebar />
      <div className="w-full flex-1">{children}</div>
    </div>
  );
}
