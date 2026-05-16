"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function ProductCard({ product }) {
  const [quantity, setQuantity] = useState(1);
  const { user } = useAuth();
  const { updateCartItem } = useCart();

  const addToCart = async () => {
    if (quantity > product.stock) return toast.error("Requested quantity exceeds stock");
    updateCartItem(product, quantity);
    toast.success("Added to cart");
  };

  const imageSrc = !product.image
    ? "/mango.jpg"
    : product.image.startsWith("data:") || product.image.startsWith("http")
      ? product.image
      : `${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}${product.image}`;

  return (
    <div className="card hover-lift animate-pop-in">
      <img
        src={imageSrc}
        alt={product.name}
        className="h-44 w-full rounded-xl object-cover transition duration-300 hover:scale-[1.02]"
      />
      <h3 className="mt-3 text-lg font-semibold">{product.name}</h3>
      <p className="text-sm text-slate-600">{product.description}</p>
      <p className="mt-2 font-bold text-green-700">Rs {product.price}</p>
      <p className={product.stock <= 5 ? "text-sm text-red-600" : "text-sm text-green-700"}>
        Stock: {product.stock}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <label htmlFor={`qty-${product._id}`}>Qty</label>
        <select
          id={`qty-${product._id}`}
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          className="rounded-lg border px-2 py-1"
        >
          {Array.from({ length: 11 }).map((_, i) => (
            <option key={i} value={i} disabled={i > product.stock}>
              {i}
            </option>
          ))}
        </select>
        <button className="btn-primary w-full active:scale-[0.98] sm:ml-auto sm:w-auto" onClick={addToCart}>
          Add to Cart
        </button>
      </div>
    </div>
  );
}
