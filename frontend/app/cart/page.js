"use client";

import Link from "next/link";
import { toast } from "react-hot-toast";
import { useCart } from "../../context/CartContext";

export default function CartPage() {
  const { cart, total, updateCartItem, removeItem, clearCart } = useCart();
  const cartItems = cart?.items ?? [];

  const handleClearCart = () => {
    clearCart();
    toast.success("Cart cleared");
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="mb-6 text-3xl font-bold text-green-900">Your Cart</h1>

      <div className="space-y-4">
        {cartItems.length === 0 && (
          <div className="rounded-2xl bg-white/90 p-8 text-center shadow-md">
            <p className="text-lg text-green-800">Your cart is empty.</p>
            <Link href="/products" className="btn-primary mt-4 inline-block">
              Browse Products
            </Link>
          </div>
        )}

        {cartItems.map((item, idx) => {
          const imageSrc = !item.product?.image
            ? "/mango.jpg"
            : item.product.image.startsWith("data:") || item.product.image.startsWith("http")
              ? item.product.image
              : `${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}${item.product.image}`;

          return (
            <div
              key={`${item.product?._id}-${item.boxSize}-${idx}`}
              className="animate-fade-up flex flex-col gap-4 rounded-2xl bg-white/90 p-4 shadow-md transition hover:shadow-lg sm:flex-row sm:items-center"
            >
              <img
                src={imageSrc}
                alt={item.product?.name}
                className="h-20 w-20 rounded-xl object-cover ring-2 ring-amber-200"
              />

              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-bold text-green-900">{item.product?.name}</h3>
                  <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-700">
                    {item.boxSize}
                  </span>
                </div>
                <p className="text-sm text-green-700/70">Rs {item.price?.toLocaleString()} each</p>
                <p className="mt-1 font-semibold text-amber-600">
                  Subtotal: Rs {((item.price || 0) * item.quantity).toLocaleString()}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center overflow-hidden rounded-xl border-2 border-green-200 bg-green-50">
                  <button
                    onClick={() => updateCartItem(item.product, Math.max(0, item.quantity - 1), item.boxSize, item.price)}
                    className="flex h-9 w-9 items-center justify-center text-lg font-bold text-green-800 transition hover:bg-green-100 active:scale-95"
                  >
                    −
                  </button>
                  <span className="w-8 text-center font-bold text-green-900">{item.quantity}</span>
                  <button
                    onClick={() => updateCartItem(item.product, Math.min(10, item.quantity + 1), item.boxSize, item.price)}
                    className="flex h-9 w-9 items-center justify-center text-lg font-bold text-green-800 transition hover:bg-green-100 active:scale-95"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={() => removeItem(item.product._id, item.boxSize)}
                  className="rounded-xl border-2 border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100 active:scale-95"
                >
                  Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Order summary */}
      <div className="mt-6 rounded-2xl bg-white/90 p-6 shadow-md">
        <div className="flex items-center justify-between border-b border-green-100 pb-4">
          <span className="text-green-700">Items ({cartItems.reduce((s, i) => s + i.quantity, 0)})</span>
          <span className="font-semibold text-green-900">Rs {total?.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between border-b border-green-100 py-4">
          <span className="text-green-700">Delivery</span>
          <span className="font-semibold text-green-900">Rs 450</span>
        </div>
        <div className="flex items-center justify-between pt-4">
          <span className="text-xl font-bold text-green-900">Total</span>
          <span className="text-2xl font-black text-amber-600">
            Rs {((total || 0) + (cartItems.length > 0 ? 450 : 0)).toLocaleString()}
          </span>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <button
            onClick={handleClearCart}
            disabled={cartItems.length === 0}
            className="rounded-xl border-2 border-green-300 bg-green-50 px-5 py-2.5 font-semibold text-green-800 transition hover:bg-green-100 disabled:pointer-events-none disabled:opacity-40"
          >
            Clear Cart
          </button>
          <Link
            href="/checkout"
            className={`btn-primary flex-1 text-center py-2.5 text-base ${cartItems.length === 0 ? "pointer-events-none opacity-50" : ""}`}
          >
            Proceed to Checkout →
          </Link>
        </div>
      </div>
    </div>
  );
}
