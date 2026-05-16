"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/orders", label: "Orders" }
];

export default function AdminSidebar() {
  const path = usePathname();

  return (
    <>
      <aside className="w-full rounded-2xl border border-brand-mint bg-brand-forest p-3 text-white shadow-sm md:hidden">
        <div className="mb-3 flex items-center gap-2">
          <Image src="/logo.svg" alt="aam e khaas logo" width={30} height={30} />
          <div>
            <h2 className="font-heading text-base font-semibold text-brand-sun">aam e khaas</h2>
            <p className="text-[11px] text-brand-mint">Admin Control</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-xl px-2 py-2 text-center text-sm font-semibold ${
                path === link.href
                  ? "bg-gradient-to-r from-brand-sun to-brand-gold text-brand-forest"
                  : "bg-brand-leaf/50 text-brand-mint"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </aside>

      <aside className="hidden min-h-[calc(100vh-7rem)] w-72 rounded-2xl border border-brand-mint bg-brand-forest p-5 text-white shadow-sm md:sticky md:top-24 md:block">
        <div className="mb-6 flex items-center gap-3">
          <Image src="/logo.svg" alt="aam e khaas logo" width={36} height={36} />
          <div>
            <h2 className="font-heading text-lg font-semibold text-brand-sun">aam e khaas</h2>
            <p className="text-xs text-brand-mint">Admin Control</p>
          </div>
        </div>
        <div className="space-y-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`block rounded-xl px-3 py-2 font-semibold ${
                path === link.href
                  ? "bg-gradient-to-r from-brand-sun to-brand-gold text-brand-forest"
                  : "text-brand-mint hover:bg-brand-leaf"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </aside>
    </>
  );
}
