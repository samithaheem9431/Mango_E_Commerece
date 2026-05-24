"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Leaf, Sparkles, Crown, Gift } from "lucide-react";
import { fetchCategories, getCachedCategories } from "../lib/categoriesCache";
import { categoryImageSrc } from "../lib/categoryImage";

const iconMap = {
  leaf: Leaf,
  sparkles: Sparkles,
  crown: Crown,
  gift: Gift,
};

function CategoryCard({ category }) {
  const Icon = iconMap[category.icon] || Leaf;
  const href = `/products?category=${category._id}`;

  return (
    <article className="flex min-w-0 w-full flex-col">
      <Link href={href} className="relative block w-full min-w-0 overflow-hidden rounded-sm shadow-lg">
        <div className="relative aspect-[3/4] w-full overflow-hidden">
          <img
            src={categoryImageSrc(category.image)}
            alt={category.name}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 flex flex-col items-center px-4 pb-6 pt-16 text-center">
            <Icon className="mb-2 h-5 w-5 text-[#D4AF37]" strokeWidth={1.5} />
            <h3 className="font-heading text-sm font-bold uppercase tracking-[0.2em] text-[#D4AF37] sm:text-base">
              {category.name}
            </h3>
            {category.tagline && (
              <p className="mt-2 w-full font-heading text-xs leading-relaxed text-white/75 sm:text-sm">
                {category.tagline}
              </p>
            )}
            <span className="mt-4 flex items-center gap-1 font-heading text-[10px] font-semibold uppercase tracking-[0.25em] text-white/90">
              Explore <span aria-hidden>→</span>
            </span>
          </div>
        </div>
      </Link>
      <Link
        href={href}
        className="mt-2 inline-flex items-center gap-1 font-heading text-sm text-[#0b1a0b] transition hover:text-[#5c4a1a] sm:mt-3 sm:text-base"
      >
        {category.name} <span aria-hidden>→</span>
      </Link>
    </article>
  );
}

export default function ShopByCategories() {
  const [categories, setCategories] = useState([]);
  const scrollRef = useRef(null);
  const isCarousel = categories.length > 4;

  useEffect(() => {
    let cancelled = false;

    const cached = getCachedCategories();
    if (cached?.length) {
      setCategories(cached);
      return;
    }

    fetchCategories().then((data) => {
      if (!cancelled && data?.length) setCategories(data);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const scroll = (direction) => {
    const el = scrollRef.current;
    if (!el) return;
    const slide = el.querySelector(".category-carousel-slide");
    const gap = 20;
    const amount = slide ? slide.offsetWidth + gap : el.clientWidth * 0.25;
    el.scrollBy({ left: direction * amount, behavior: "smooth" });
  };

  if (categories.length === 0) return null;

  return (
    <section>
      <h2 className="page-title mb-8 text-center">Shop by Categories</h2>

      {isCarousel ? (
        <div className="relative px-9 sm:px-12">
          <button
            type="button"
            onClick={() => scroll(-1)}
            className="absolute left-0 top-[38%] z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-[#0b1a0b]/15 bg-white/95 shadow-md transition hover:bg-white sm:h-10 sm:w-10"
            aria-label="Previous categories"
          >
            <ChevronLeft className="h-4 w-4 text-[#0b1a0b] sm:h-5 sm:w-5" />
          </button>
          <button
            type="button"
            onClick={() => scroll(1)}
            className="absolute right-0 top-[38%] z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-[#0b1a0b]/15 bg-white/95 shadow-md transition hover:bg-white sm:h-10 sm:w-10"
            aria-label="Next categories"
          >
            <ChevronRight className="h-4 w-4 text-[#0b1a0b] sm:h-5 sm:w-5" />
          </button>

          <div
            ref={scrollRef}
            className="category-carousel flex gap-5 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {categories.map((category) => (
              <div key={category._id} className="category-carousel-slide group shrink-0 grow-0">
                <CategoryCard category={category} />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div
          className={`grid gap-5 ${
            categories.length === 1
              ? "mx-auto max-w-xs"
              : categories.length === 2
                ? "mx-auto max-w-2xl grid-cols-2"
                : categories.length === 3
                  ? "mx-auto max-w-4xl grid-cols-2 sm:grid-cols-3"
                  : "grid-cols-2 sm:grid-cols-2 lg:grid-cols-4"
          }`}
        >
          {categories.map((category) => (
            <CategoryCard key={category._id} category={category} />
          ))}
        </div>
      )}
    </section>
  );
}
