"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { LayoutDashboard, Package, ClipboardList, LogOut, Tags } from "lucide-react";

const links = [
  { href: "/admin/dashboard",  label: "Dashboard",  icon: <LayoutDashboard className="h-4 w-4" /> },
  { href: "/admin/products",   label: "Products",   icon: <Package        className="h-4 w-4" /> },
  { href: "/admin/categories", label: "Categories", icon: <Tags           className="h-4 w-4" /> },
  { href: "/admin/orders",     label: "Orders",     icon: <ClipboardList  className="h-4 w-4" /> },
];

export default function AdminSidebar() {
  const path = usePathname();
  const { logout } = useAuth();

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col bg-gray-900 shadow-xl">

      {/* Logo */}
      <div className="flex items-center gap-3 border-b border-gray-700/60 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-400">
          <Image src="/logo.svg" alt="logo" width={22} height={22} />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">aam e khaas</p>
          <p className="text-[11px] text-gray-400">Admin Panel</p>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 space-y-1 px-3 py-5">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-gray-500">
          Navigation
        </p>
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              path === link.href
                ? "bg-blue-600 text-white"
                : "text-gray-400 hover:bg-gray-800 hover:text-white"
            }`}
          >
            {link.icon}
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div className="border-t border-gray-700/60 px-3 py-4">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-400 transition-colors hover:bg-red-900/30 hover:text-red-400"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
