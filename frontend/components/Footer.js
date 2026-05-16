"use client";

import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-brand-leaf/20 bg-brand-bark text-brand-mint">
      <div className="container grid gap-8 py-10 md:grid-cols-3">
        <div className="text-center md:text-left">
          <div className="mb-3 flex items-center justify-center gap-3 md:justify-start">
            <Image src="/logo.svg" alt="aam e khaas logo" width={36} height={36} />
            <div>
              <p className="font-heading text-xl font-semibold text-brand-sun">aam e khaas</p>
              <p className="font-urdu text-sm text-brand-mint">عامِ خاص</p>
            </div>
          </div>
          <p className="text-sm text-green-100/90">Premium mango boxes with trusted quality and smooth doorstep delivery.</p>
        </div>

        <div className="text-center md:text-left">
          <h3 className="font-heading text-lg text-brand-sun">Quick Links</h3>
          <div className="mt-3 flex flex-col gap-2 text-sm">
            <Link href="/products" className="hover:text-white">
              Products
            </Link>
            <Link href="/cart" className="hover:text-white">
              Cart
            </Link>
            <Link href="/orders" className="hover:text-white">
              My Orders
            </Link>
            <Link href="/admin/dashboard" className="hover:text-white">
              Admin Panel
            </Link>
          </div>
        </div>

        <div className="text-center md:text-left">
          <h3 className="font-heading text-lg text-brand-sun">Customer Promise</h3>
          <ul className="mt-3 space-y-2 text-sm text-green-100/90">
            <li>Freshly packed mangoes from selected farms</li>
            <li>Secure checkout and protected accounts</li>
            <li>Transparent stock and order status updates</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-brand-leaf/20 py-4 text-center text-xs text-green-100/80">
        © {new Date().getFullYear()} aam e khaas. All rights reserved.
      </div>
    </footer>
  );
}
