"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import api from "../../lib/api";
import { useCart } from "../../context/CartContext";

export default function CheckoutPage() {
  const router = useRouter();
  const { total, clearCart, cart } = useCart();
  const cartItems = cart?.items ?? [];
  const [address, setAddress] = useState({ address: "", city: "", phone: "" });
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [riderNotes, setRiderNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const grandTotal = (total || 0) + (cartItems.length > 0 ? 450 : 0);

  const placeOrder = async () => {
    if (!customerName.trim()) return toast.error("Please enter your name");
    if (!customerEmail.trim() || !/\S+@\S+\.\S+/.test(customerEmail))
      return toast.error("Please enter a valid email address");
    if (!address.address || !address.city || !address.phone)
      return toast.error("Please fill all shipping fields");
    if (cartItems.length === 0)
      return toast.error("Your cart is empty");
    setLoading(true);
    try {
      const slimItems = cartItems.map(({ product, boxSize, quantity }) => ({
        product: product?._id ?? product,
        boxSize,
        quantity
      }));
      await api.post("/orders/checkout", { shippingAddress: address, cartItems: slimItems, riderNotes, customerName: customerName.trim(), customerEmail: customerEmail.trim() });
      toast.success("Order placed successfully");
      clearCart();
      router.push("/products");
    } catch (error) {
      toast.error(error.response?.data?.message || "Checkout failed");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full rounded-xl border-2 border-green-200 bg-white px-4 py-2.5 text-green-900 outline-none transition placeholder:text-green-400/60 focus:border-amber-400 focus:ring-2 focus:ring-amber-200";
  const labelClass = "mb-1 block text-sm font-semibold text-green-800";

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="mb-6 text-3xl font-bold text-green-900">Checkout</h1>

      <div className="grid gap-6 lg:grid-cols-3">

        {/* ── Left: delivery form ── */}
        <div className="space-y-5 lg:col-span-2">

          {/* Shipping details */}
          <section className="animate-fade-up rounded-2xl bg-white/90 p-6 shadow-md">
            <h2 className="mb-1 text-xl font-bold text-green-900">Delivery Details</h2>
            <p className="mb-5 text-sm text-green-700/70">Fill in your shipping information below.</p>

            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className={labelClass}>Full Name</label>
                  <input
                    className={inputClass}
                    placeholder="e.g. Ahmed Khan"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClass}>Email Address</label>
                  <input
                    type="email"
                    className={inputClass}
                    placeholder="e.g. ahmed@gmail.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className={labelClass}>Delivery Address</label>
                  <input
                    className={inputClass}
                    placeholder="e.g. Street 12, House 45"
                    onChange={(e) => setAddress({ ...address, address: e.target.value })}
                  />
                </div>
                <div>
                  <label className={labelClass}>City</label>
                  <input
                    className={inputClass}
                    placeholder="e.g. Multan"
                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Phone Number</label>
                <input
                  className={inputClass}
                  placeholder="e.g. 0300-1234567"
                  onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                />
              </div>
            </div>
          </section>

          {/* Rider notes */}
          <section className="animate-fade-up rounded-2xl bg-white/90 p-6 shadow-md" style={{ animationDelay: "0.1s" }}>
            <h2 className="mb-1 text-xl font-bold text-green-900">Rider Instructions</h2>
            <p className="mb-4 text-sm text-green-700/70">Any special instructions? (e.g. "Ring bell loudly" or "Leave at gate")</p>
            <textarea
              className={`${inputClass} min-h-[100px] resize-none`}
              placeholder="Type your notes here..."
              value={riderNotes}
              onChange={(e) => setRiderNotes(e.target.value)}
            />
          </section>
        </div>

        {/* ── Right: order summary ── */}
        <aside className="lg:col-span-1">
          <div className="sticky top-24 animate-fade-up space-y-4" style={{ animationDelay: "0.15s" }}>

            <div className="rounded-2xl bg-white/90 p-5 shadow-md">
              <h2 className="mb-4 text-xl font-bold text-green-900">Order Summary</h2>

              {/* Items list */}
              <div className="max-h-64 space-y-3 overflow-y-auto pr-1">
                {cartItems.map((item) => {
                  const imageSrc = !item.product?.image
                    ? "/mango.jpg"
                    : item.product.image.startsWith("data:") || item.product.image.startsWith("http")
                      ? item.product.image
                      : `${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}${item.product.image}`;
                  return (
                    <div key={`${item.product?._id}-${item.boxSize}`} className="flex items-center gap-3 rounded-xl bg-green-50 p-2">
                      <img src={imageSrc} alt={item.product?.name} className="h-12 w-12 rounded-lg object-cover ring-2 ring-amber-200" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="truncate text-sm font-semibold text-green-900">{item.product?.name}</p>
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">{item.boxSize}</span>
                        </div>
                        <p className="text-xs text-green-600">Qty: {item.quantity} × Rs {item.price?.toLocaleString()}</p>
                      </div>
                      <p className="text-sm font-bold text-amber-600">Rs {(item.quantity * (item.price || 0)).toLocaleString()}</p>
                    </div>
                  );
                })}
              </div>

              {/* Price breakdown */}
              <div className="mt-4 space-y-2 border-t-2 border-green-100 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-green-700">Subtotal</span>
                  <span className="font-semibold text-green-900">Rs {total?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-green-700">Delivery</span>
                  <span className="font-semibold text-green-900">Rs 450</span>
                </div>
                <div className="flex justify-between border-t-2 border-green-100 pt-2">
                  <span className="text-lg font-bold text-green-900">Total</span>
                  <span className="text-xl font-black text-amber-600">Rs {grandTotal.toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={placeOrder}
                disabled={loading || cartItems.length === 0}
                className="btn-primary mt-5 w-full py-3 text-base active:scale-95 disabled:opacity-50"
              >
                {loading ? "Processing..." : "Place Order Now →"}
              </button>

              <p className="mt-3 text-center text-xs text-green-600/60">
                By placing this order you agree to our Terms & Conditions.
              </p>
              <p className="mt-1 text-center text-xs text-amber-600/80">
                📧 A receipt will be sent to your email after order confirmation.
              </p>
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}
