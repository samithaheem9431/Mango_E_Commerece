"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "../lib/api";
import ProductCard from "../components/ProductCard";


export default function HomePage() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    api.get("/products/featured").then((res) => setProducts(res.data));
  }, []);

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-yellow-300 via-amber-300 to-green-500 p-5 text-white sm:rounded-[2rem] sm:p-8 md:p-10">
        <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/15 blur-2xl" />
        <div className="grid items-center gap-6 md:grid-cols-2">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-white/90">Premium Seasonal Mangoes</p>
            <h1 className="text-3xl font-black leading-tight text-black sm:text-4xl md:text-5xl">Fresh Mango Boxes Delivered To Your Doorstep</h1>
            <p className="mt-4 max-w-2xl text-base text-white/90 sm:text-lg">
              Order 5KG, 8KG, and 10KG mango boxes with farm-fresh quality, safe packing, and fast delivery.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/products" className="rounded-xl bg-white px-5 py-2 font-semibold text-green-700">
                Shop Now
              </Link>
              <Link href="/orders" className="rounded-xl border border-white/50 bg-white/10 px-5 py-2 font-semibold text-white">
                Track Orders
              </Link>
            </div>
          </div>
          <div className="relative flex min-h-[200px] items-center justify-center md:static md:block">
            <img
              src="/images/mango.png"
              alt="Fresh Mangoes"
              className="z-10 w-full max-w-[140px] object-contain drop-shadow-2xl md:absolute md:bottom-[0%] md:right-[0%] md:max-w-[240px] lg:max-w-[300px]"
              style={{ mixBlendMode: "multiply", opacity: 0.85 }}
            />
            <div className="absolute inset-0 z-0 bg-gradient-to-tr from-transparent via-white/10 to-white/20 blur-3xl md:hidden" />
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <h2 className="page-title">Featured Mango Products</h2>
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
    </div>
  );
}
