"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const pathname = usePathname();
  const cartItems = cart?.items ?? [];
  const count = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const isAdmin = ["admin", "superadmin"].includes(user?.role);
  const adminHref = "/admin/dashboard";

  const navLink = (href, label, exact = false) => {
    const active = exact ? pathname === href : pathname.startsWith(href);
    return (
      <Link
        href={href}
        className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors
          ${active
            ? "bg-brand-sun/15 font-semibold text-brand-sun"
            : "text-brand-mint/80 hover:bg-brand-mint/10 hover:text-brand-mint"
          }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-40 border-b border-brand-forest/40 bg-brand-forest">
      <nav className="container flex items-center py-3">
        {/* ── Logo (left) ── */}
        <div className="flex flex-1">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-brand-sun transition-transform group-hover:scale-105">
              <Image
                src="/logo.svg"
                alt="aam e khaas logo"
                width={26}
                height={26}
                priority
              />
            </div>
            <div>
              <p className="font-heading text-lg font-semibold leading-tight text-brand-sun">
                aam e khaas
              </p>
              <p className="font-urdu text-xs leading-tight text-brand-mint/60">
                عامِ خاص
              </p>
            </div>
          </Link>
        </div>

        {/* ── Center nav links ── */}
        <div className="flex items-center gap-6">
          {navLink("/", "Home", true)}
          {navLink("/products", "Products")}
          {!isAdmin && navLink("/track", "📦 Track Order")}
          {!isAdmin && navLink("/contact", "Contact Us")}
          {user && !isAdmin && navLink("/orders", "My Orders")}
          {isAdmin && (
            <Link
              href={adminHref}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors
                ${pathname.startsWith("/admin")
                  ? "bg-brand-sun/15 font-semibold text-brand-sun"
                  : "text-brand-sun hover:bg-brand-sun/10"
                }`}
            >
              🛡️ Admin Panel
            </Link>
          )}
        </div>

        {/* ── Right actions ── */}
        <div className="flex flex-1 items-center justify-end gap-1">
          {/* Cart pill */}
          {!isAdmin && (
            <Link
              href="/cart"
              className="flex items-center gap-2 rounded-lg bg-brand-sun px-4 py-2 text-sm font-semibold text-brand-forest transition-colors hover:bg-brand-gold"
            >
              <span>🛒</span>
              <span>Cart</span>
              {count > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-forest text-[11px] font-bold text-brand-sun">
                  {count}
                </span>
              )}
            </Link>
          )}

          {/* Logout */}
          {user && (
            <button
              onClick={logout}
              className="rounded-lg border border-brand-mint/20 px-3 py-2 text-sm font-medium text-brand-mint/70 transition-colors hover:border-red-400/40 hover:bg-red-500/10 hover:text-red-300"
            >
              Logout
            </button>
          )}
        </div>
      </nav>
    </header>
  );
}