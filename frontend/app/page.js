"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "../lib/api";
import ProductCard from "../components/ProductCard";
import ShopByCategories from "../components/ShopByCategories";

const stats = [
  { value: "2,400+", label: "Happy Customers" },
  { value: "8,000+", label: "Boxes Delivered" },
  { value: "5+", label: "Years of Quality" },
];

const whyUs = [
  {
    icon: "🌿",
    title: "Farm Fresh",
    desc: "Sourced directly from handpicked farms in Multan and Rahim Yar Khan.",
  },
  {
    icon: "📦",
    title: "Safe Packaging",
    desc: "Every box is carefully packed to keep mangoes fresh during transit.",
  },
  {
    icon: "🚚",
    title: "Fast Delivery",
    desc: "Doorstep delivery all over Pakistan within 2–3 business days.",
  },
  {
    icon: "✅",
    title: "Quality Guarantee",
    desc: "Not satisfied? Free returns within 96 hours — no questions asked.",
  },
];

const testimonials = [
  {
    name: "Hamza Tariq",
    location: "Lahore",
    rating: 5,
    text: "Absolutely the best mangoes I've had this season. The box was perfectly ripe and incredibly juicy. Will definitely order again!",
    variety: "8KG Mango Box",
  },
  {
    name: "Shazia Noor",
    location: "Karachi",
    rating: 5,
    text: "Delivered right on time and the packaging was excellent. Not a single mango was bruised. Pure quality from aam e khaas.",
    variety: "5KG Mango Box",
  },
  {
    name: "Waleed Ahmed",
    location: "Islamabad",
    rating: 5,
    text: "I've tried many online mango stores but this one stands out. Aromatic and sweet — just like straight from the farm.",
    variety: "10KG Mango Box",
  },
  {
    name: "Noor Fatima",
    location: "Faisalabad",
    rating: 5,
    text: "Ordered for a family gathering and everyone was impressed. Fresh, fragrant and beautifully packed. 10/10 recommended!",
    variety: "10KG Mango Box",
  },
];

const heroSlides = [
  {
    key: "s1",
    image: "/images/1.png",
    onlyButton: true,
  },
  {
    key: "s2",
    image: "/images/2.png",
    twoButtons: true,
  },
  {
    key: "s3",
    image: "/images/3.png",
    title: "Straight From",
    highlight: "The Orchard to You",
    subtitle: "Handpicked at peak ripeness. Every mango in every box is selected for sweetness, aroma, and perfect texture.",
    onlyButton: true,
    contentAlign: "top",
    narrowText: true,
  },
  {
    key: "s4",
    image: "/images/4.png",
    noButtons: true,
    objectPosition: "center top",
  },
];

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    api.get("/products/featured")
      .then((res) => setProducts(res.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroSlides.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-16">

      {/* ── Hero Carousel (full-bleed) ── */}
      <section
        className="relative -mt-6 overflow-hidden"
        style={{ width: "100vw", marginLeft: "calc(-50vw + 50%)", height: "540px" }}
      >
        {heroSlides.map((slide, i) => (
          <div
            key={slide.key}
            className={`absolute inset-0 transition-opacity duration-700 ${activeSlide === i ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"}`}
          >
            {/* Full-cover image */}
            <img src={slide.image} alt="" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: slide.objectPosition || "center center" }} />

            {/* Overlay: left gradient for slides with text, bottom fade for button-only */}
            {slide.title ? (
              <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-transparent" />
            ) : (
              <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black/60 to-transparent" />
            )}

            {/* Content */}
            <div className={`absolute inset-0 flex flex-col pl-10 sm:pl-16 md:pl-24 ${slide.contentAlign === "top" ? "justify-start pt-12 sm:pt-16" : "justify-end pb-14"}`}>

              {/* Text block — only shown when slide has a title */}
              {slide.title && (
                <div className={`mb-5 ${slide.narrowText ? "max-w-xs" : "max-w-lg"}`}>
                  {slide.badge && (
                    <span className="mb-3 inline-block rounded-full border border-white/30 bg-black/35 px-4 py-1 text-xs font-bold uppercase tracking-widest text-brand-sun backdrop-blur-sm">
                      {slide.badge}
                    </span>
                  )}
                  <h1 className="text-3xl font-black leading-tight text-white sm:text-4xl md:text-5xl">
                    {slide.title}<br />
                    <span className="text-brand-sun drop-shadow-[0_0_20px_rgba(253,224,71,0.55)]">
                      {slide.highlight}
                    </span>
                  </h1>
                  <p className="mt-3 text-sm text-white/80 sm:text-base">{slide.subtitle}</p>
                </div>
              )}

              {/* Buttons */}
              {!slide.noButtons && (
                <div className="flex flex-wrap gap-3">
                  {slide.twoButtons ? (
                    <>
                      <Link href="/products" className="rounded-xl bg-brand-bark px-7 py-3 font-bold text-brand-sun shadow-lg transition hover:-translate-y-0.5 hover:shadow-[0_0_24px_rgba(253,224,71,0.4)]">
                        Shop Now
                      </Link>
                      <Link href="/orders" className="rounded-xl border border-white/40 bg-black/25 px-7 py-3 font-semibold text-white backdrop-blur transition hover:bg-black/40">
                        Track My Order
                      </Link>
                    </>
                  ) : (
                    <Link href="/products" className="rounded-xl bg-brand-bark px-8 py-3 font-bold text-brand-sun shadow-lg transition hover:-translate-y-0.5 hover:shadow-[0_0_24px_rgba(253,224,71,0.4)]">
                      Order Now
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Dot navigation */}
        <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 gap-2">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveSlide(i)}
              className={`h-2 rounded-full transition-all duration-300 ${activeSlide === i ? "w-8 bg-brand-sun" : "w-2 bg-white/50 hover:bg-white/80"}`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section className="grid grid-cols-3 divide-x divide-brand-sun/25 overflow-hidden rounded-2xl border border-brand-sun/25 shadow-[0_0_30px_rgba(0,0,0,0.25)] backdrop-blur" style={{ background: "rgba(10, 40, 20, 0.92)" }}>
        {stats.map(({ value, label }) => (
          <div key={label} className="flex flex-col items-center px-4 py-6 text-center">
            <span className="text-2xl font-black text-brand-sun drop-shadow-[0_0_16px_rgba(253,224,71,0.7)] sm:text-3xl">
              {value}
            </span>
            <span className="mt-1 text-sm text-white/80">{label}</span>
          </div>
        ))}
      </section>

      {/* ── Why Choose Us ── */}
      <section>
        <h2 className="page-title mb-2 text-center">Why Choose aam e khaas?</h2>
        <p className="mb-8 text-center text-green-900/70">We take pride in bringing you the finest mangoes of the season.</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {whyUs.map(({ icon, title, desc }) => (
            <div key={title} className="card hover-lift flex flex-col items-center gap-3 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-sun/15 text-3xl ring-1 ring-brand-sun/25">
                {icon}
              </div>
              <h3 className="font-semibold text-brand-sun">{title}</h3>
              <p className="text-sm text-white/80">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Shop by Categories ── */}
      <ShopByCategories />

      {/* ── Featured Products ── */}
      <section>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="page-title">Featured Mango Products</h2>
            <p className="mt-1 text-sm text-green-900/70">Handpicked for the season — order before stock runs out.</p>
          </div>
          <Link href="/products" className="btn-secondary">
            View All
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section>
        <h2 className="page-title mb-2 text-center">What Our Customers Say</h2>
        <p className="mb-8 text-center text-green-900/70">Real experiences from mango lovers all over Pakistan.</p>
        <div className="marquee-wrapper py-4">
          <div className="marquee-track">
            {[...testimonials, ...testimonials].map(({ name, location, rating, text, variety }, i) => (
              <div key={`${name}-${i}`} className="testimonial-card card flex flex-col gap-3">
                <div className="text-lg text-brand-sun">{"★".repeat(rating)}</div>
                <p className="flex-1 text-sm leading-relaxed text-white/85">"{text}"</p>
                <div className="mt-auto border-t border-brand-sun/15 pt-3">
                  <p className="text-sm font-semibold text-brand-sun">{name}</p>
                  <p className="text-xs text-white/60">{location} · {variety}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
