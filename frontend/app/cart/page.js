"use client";

import Link from "next/link";
import { toast } from "react-hot-toast";
import api from "../../lib/api";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";

export default function CartPage() {
  const { cart, total, updateCartItem, removeItem, clearCart } = useCart();
  const cartItems = cart?.items ?? [];

  const handleClearCart = () => {
    clearCart();
    toast.success("Cart cleared");
  };

  return (
    <div>
      <h1 className="mb-4 page-title">Your Cart</h1>
      <div className="space-y-3">
        {cartItems.map((item) => {
          const imageSrc = !item.product?.image
            ? "/mango.jpg"
            : item.product.image.startsWith("data:") || item.product.image.startsWith("http")
              ? item.product.image
              : `${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}${item.product.image}`;

          return (
            <div key={item.product?._id} className="card animate-fade-up hover-lift flex flex-col gap-4 sm:flex-row sm:items-center">
              <img
                src={imageSrc}
                alt={item.product?.name}
                className="h-20 w-20 rounded-xl object-cover"
              />
              <div className="flex-1">
                <h3 className="font-semibold">{item.product?.name}</h3>
                <p className="subtle-text">Rs {item.product?.price}</p>
                <p className="text-sm font-semibold text-brand-forest">
                  Subtotal: Rs {(item.product?.price || 0) * item.quantity}
                </p>
              </div>
              <div className="flex w-full items-center gap-2 sm:w-auto">
                <button className="btn-secondary !px-3 !py-1 active:scale-95" onClick={() => updateCartItem(item.product, Math.max(0, item.quantity - 1))}>-</button>
                <span className="w-6 text-center font-semibold">{item.quantity}</span>
                <button className="btn-secondary !px-3 !py-1 active:scale-95" onClick={() => updateCartItem(item.product, Math.min(10, item.quantity + 1))}>+</button>
                <button onClick={() => removeItem(item.product._id)} className="ml-auto rounded-xl bg-red-100 px-3 py-2 font-semibold text-red-700 sm:ml-0">
                  Remove
                </button>
              </div>
            </div>
          );
        })}
        {cartItems.length === 0 && <div className="card">Your cart is empty.</div>}
      </div>

      <div className="mt-6 card animate-pop-in">
        <p className="text-xl font-bold">Total: Rs {total}</p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <button
            onClick={handleClearCart}
            className={`btn-secondary ${cartItems.length === 0 ? "pointer-events-none opacity-50" : ""}`}
          >
            Clear Cart
          </button>
        <Link
          href="/checkout"
          className={`btn-primary inline-block text-center ${cartItems.length === 0 ? "pointer-events-none opacity-50" : ""}`}
        >
          Proceed to Checkout
        </Link>
        </div>
      </div>
    </div>
  );
}
