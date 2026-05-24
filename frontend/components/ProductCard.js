"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { useCart } from "../context/CartContext";

export default function ProductCard({ product }) {
  const { updateCartItem } = useCart();
  const variants = product.variants ?? [];

  // Default to first in-stock variant, else first variant
  const defaultVariant = variants.find((v) => v.stock > 0) ?? variants[0];
  const [selectedBoxSize, setSelectedBoxSize] = useState(defaultVariant?.boxSize ?? "5KG");
  const [quantity, setQuantity] = useState(1);

  const selected = variants.find((v) => v.boxSize === selectedBoxSize);
  const stock = selected?.stock ?? 0;
  const price = selected?.price ?? 0;

  const addToCart = () => {
    if (!selected) return toast.error("Select a box size");
    if (quantity > stock) return toast.error("Requested quantity exceeds stock");
    updateCartItem(product, quantity, selectedBoxSize, price);
    toast.success(`${selectedBoxSize} box added to cart`);
  };

  const imageSrc = !product.image
    ? "/mango.jpg"
    : product.image.startsWith("data:") || product.image.startsWith("http")
      ? product.image
      : `${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}${product.image}`;

  const decrement = () => setQuantity((q) => Math.max(1, q - 1));
  const increment = () => setQuantity((q) => Math.min(stock, q + 1));

  return (
    <div className="card hover-lift animate-pop-in flex flex-col">
      <div className="relative overflow-hidden rounded-xl">
        <img
          src={imageSrc}
          alt={product.name}
          className="h-48 w-full object-cover transition duration-300 hover:scale-[1.03]"
        />
        <div className="absolute right-2 top-2">
          {stock === 0 ? (
            <span className="rounded-full bg-red-900/70 px-2 py-0.5 text-xs font-semibold text-red-300">Out of Stock</span>
          ) : stock <= 5 ? (
            <span className="rounded-full bg-orange-900/70 px-2 py-0.5 text-xs font-semibold text-orange-300">Only {stock} left!</span>
          ) : (
            <span className="rounded-full bg-green-900/70 px-2 py-0.5 text-xs font-semibold text-green-300">In Stock</span>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-col flex-1 gap-1">
        <h3 className="text-lg font-semibold text-white">{product.name}</h3>
        <p className="text-sm leading-snug text-white/80">{product.description}</p>

        {/* Box size selector */}
        <div className="mt-2 flex flex-wrap gap-2">
          {variants.map((v) => (
            <button
              key={v.boxSize}
              onClick={() => { setSelectedBoxSize(v.boxSize); setQuantity(1); }}
              disabled={v.stock === 0}
              className={`rounded-lg border px-3 py-1 text-xs font-semibold transition
                ${v.stock === 0
                  ? "border-white/10 text-white/25 cursor-not-allowed"
                  : selectedBoxSize === v.boxSize
                    ? "border-brand-sun bg-brand-sun text-brand-forest"
                    : "border-brand-sun/30 text-brand-sun hover:border-brand-sun hover:bg-brand-sun/10"
                }`}
            >
              {v.boxSize}
            </button>
          ))}
        </div>

        <p className="mt-2 text-xl font-black text-brand-sun drop-shadow-[0_0_8px_rgba(253,224,71,0.4)]">
          Rs {price.toLocaleString()}
        </p>
      </div>

      {stock > 0 ? (
        <div className="mt-4 flex items-center gap-3">
          <div className="flex items-center overflow-hidden rounded-xl border border-brand-sun/25 bg-brand-sun/10">
            <button
              onClick={decrement}
              className="flex h-9 w-9 items-center justify-center text-lg font-bold text-brand-sun transition hover:bg-brand-sun/20"
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="w-8 text-center text-sm font-semibold text-white">{quantity}</span>
            <button
              onClick={increment}
              className="flex h-9 w-9 items-center justify-center text-lg font-bold text-brand-sun transition hover:bg-brand-sun/20"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
          <button className="btn-primary flex-1 active:scale-[0.98]" onClick={addToCart}>
            Add to Cart
          </button>
        </div>
      ) : (
        <button disabled className="mt-4 w-full cursor-not-allowed rounded-xl border border-brand-sun/10 bg-brand-sun/5 px-4 py-2 text-sm font-semibold text-green-100/30">
          Out of Stock
        </button>
      )}
    </div>
  );
}
