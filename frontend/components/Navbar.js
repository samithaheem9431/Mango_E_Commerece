"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const cartItems = cart?.items ?? [];
  const count = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const isAdmin = ["admin", "superadmin"].includes(user?.role);
  const adminHref = "/admin/dashboard";

  return (
    <header className="sticky top-0 z-40 border-b border-brand-forest/40 bg-brand-forest">
      <nav className="container flex flex-wrap items-center justify-between gap-3 py-3">
        {/* ── Logo ── */}
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

        {/* ── Nav (all sizes) ── */}
        <div className="flex flex-wrap items-center justify-end gap-1">
          <Link
            href="/"
            className="rounded-lg px-3 py-2 text-sm font-medium text-brand-mint/80 transition-colors hover:bg-brand-mint/10 hover:text-brand-mint"
          >
            Home
          </Link>

          <Link
            href="/products"
            className="rounded-lg px-3 py-2 text-sm font-medium text-brand-mint/80 transition-colors hover:bg-brand-mint/10 hover:text-brand-mint"
          >
            Products
          </Link>

          {!isAdmin && (
            <Link
              href="/contact"
              className="rounded-lg px-3 py-2 text-sm font-medium text-brand-mint/80 transition-colors hover:bg-brand-mint/10 hover:text-brand-mint"
            >
              Contact Us
            </Link>
          )}

          {user && !isAdmin && (
            <Link
              href="/orders"
              className="rounded-lg px-3 py-2 text-sm font-medium text-brand-mint/80 transition-colors hover:bg-brand-mint/10 hover:text-brand-mint"
            >
              My Orders
            </Link>
          )}

          {isAdmin && (
            <Link
              href={adminHref}
              className="rounded-lg px-3 py-2 text-sm font-medium text-brand-sun transition-colors hover:bg-brand-sun/10"
            >
              🛡️ Admin Panel
            </Link>
          )}

          {/* Cart pill */}
          {!isAdmin && (
            <Link
              href="/cart"
              className="ml-1 flex items-center gap-2 rounded-lg bg-brand-sun px-4 py-2 text-sm font-semibold text-brand-forest transition-colors hover:bg-brand-gold"
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
              className="ml-1 rounded-lg border border-brand-mint/20 px-3 py-2 text-sm font-medium text-brand-mint/70 transition-colors hover:border-red-400/40 hover:bg-red-500/10 hover:text-red-300"
            >
              Logout
            </button>
          )}
        </div>
      </nav>
    </header>
  );
}