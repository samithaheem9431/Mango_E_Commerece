"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import WaveDivider from "./WaveDivider";
import WhatsAppFloat from "./WhatsAppFloat";

export default function ClientShell({ children }) {
  const path = usePathname();
  const isAdmin = path?.startsWith("/admin");
  const showWhatsApp =
    path === "/" ||
    path?.startsWith("/products") ||
    path?.startsWith("/contact") ||
    path?.startsWith("/track");

  if (isAdmin) {
    return <div className="min-h-screen bg-slate-100">{children}</div>;
  }

  return (
    <>
      <Navbar />
      <div className="overflow-hidden border-b border-brand-sun/20 bg-brand-bark py-2 text-xs text-brand-sun">
        <div className="marquee-track items-center gap-16 whitespace-nowrap">
          {[0, 1].map((i) => (
            <div key={i} className="flex items-center gap-10 pr-16">
              <span>🚚 Delivery Rs.450 — All over Pakistan</span>
              <span className="text-brand-sun/30">✦</span>
              <span>↩ Free returns within 96 hours</span>
              <span className="text-brand-sun/30">✦</span>
              <span>📞 24/7 Customer Support</span>
              <span className="text-brand-sun/30">✦</span>
              <span>🥭 Premium Farm-Fresh Mangoes</span>
              <span className="text-brand-sun/30">✦</span>
              <span>🌿 100% Natural Quality</span>
              <span className="text-brand-sun/30">✦</span>
            </div>
          ))}
        </div>
      </div>
      <main className="container min-h-[70vh] py-6">{children}</main>
      {showWhatsApp && <WhatsAppFloat />}
      <WaveDivider fill="#1a2e05" flip height={48} />
      <Footer />
    </>
  );
}
