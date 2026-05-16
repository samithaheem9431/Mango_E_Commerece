"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import api from "../../lib/api";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";

export default function CheckoutPage() {
  const router = useRouter();
  const { total, clearCart, cart } = useCart();
  const cartItems = cart?.items ?? [];
  const [address, setAddress] = useState({ address: "", city: "", phone: "" });
  const [riderNotes, setRiderNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const placeOrder = async () => {
    if (!address.address || !address.city || !address.phone) {
      return toast.error("Please fill all shipping fields");
    }
    if (cartItems.length === 0) {
      return toast.error("Your cart is empty");
    }
    setLoading(true);
    try {
      const cartPayload = cartItems.map((item) => ({
        product: item.product._id,
        quantity: item.quantity,
      }));

      await api.post("/orders/checkout", { shippingAddress: address, cartItems, riderNotes });
      toast.success("Order placed successfully");
      clearCart();
      router.push("/products");
    } catch (error) {
      toast.error(error.response?.data?.message || "Checkout failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column: Form Details */}
        <div className="lg:col-span-2 space-y-6">
          <section className="card animate-fade-up">
            <h1 className="mb-1 text-2xl font-black">Secure Checkout</h1>
            <p className="mb-6 subtle-text text-lg">Fill delivery details for fresh mango dispatch.</p>
            
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">Delivery Address</label>
                  <input 
                    className="input" 
                    placeholder="e.g. Street 12, House 45" 
                    onChange={(e) => setAddress({ ...address, address: e.target.value })} 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">City</label>
                  <input 
                    className="input" 
                    placeholder="e.g. Multan" 
                    onChange={(e) => setAddress({ ...address, city: e.target.value })} 
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Phone Number</label>
                <input 
                  className="input" 
                  placeholder="e.g. 0300-1234567" 
                  onChange={(e) => setAddress({ ...address, phone: e.target.value })} 
                />
              </div>
            </div>
          </section>

          <section className="card animate-fade-up" style={{ animationDelay: "0.1s" }}>
            <h2 className="mb-2 text-xl font-bold">Suggestions for the Rider</h2>
            <p className="mb-4 subtle-text">Any specific instructions? (e.g. "Ring the bell loudly" or "Leave at the gate")</p>
            <textarea 
              className="input min-h-[100px] resize-none py-3" 
              placeholder="Type your notes here..." 
              value={riderNotes}
              onChange={(e) => setRiderNotes(e.target.value)}
            />
          </section>
        </div>

        {/* Right Column: Order Summary Panel */}
        <div className="lg:col-span-1">
          <aside className="sticky top-24 space-y-4 animate-fade-up" style={{ animationDelay: "0.2s" }}>
            <div className="card bg-brand-harvest/30 border-brand-leaf/20">
              <h2 className="mb-4 text-xl font-bold">Order Summary</h2>
              
              <div className="max-h-[400px] overflow-y-auto space-y-4 pr-2">
                {cartItems.map((item) => (
                  <div key={item.product?._id} className="flex items-center gap-3">
                    <img 
                      src={!item.product?.image ? "/mango.jpg" : item.product.image.startsWith("data:") || item.product.image.startsWith("http") ? item.product.image : `${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}${item.product.image}`}
                      alt={item.product?.name}
                      className="h-14 w-14 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-sm line-clamp-1">{item.product?.name}</p>
                      <p className="text-xs subtle-text">Qty: {item.quantity} x Rs {item.product?.price}</p>
                    </div>
                    <p className="text-sm font-bold text-brand-forest">Rs {item.quantity * item.product?.price}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-brand-leaf/20">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-600">Subtotal</span>
                  <span className="font-semibold text-slate-800">Rs {total}</span>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-slate-600">Delivery</span>
                  <span className="font-semibold text-green-600">FREE</span>
                </div>
                <div className="flex justify-between items-center text-lg font-black pt-2">
                  <span>Total Payable</span>
                  <span className="text-brand-forest">Rs {total}</span>
                </div>
              </div>

              <button 
                onClick={placeOrder} 
                className="btn-primary mt-6 w-full py-4 text-lg active:scale-95 disabled:opacity-50" 
                disabled={loading || cartItems.length === 0}
              >
                {loading ? "Processing..." : "Place Order Now"}
              </button>
              
              <p className="mt-4 text-center text-xs text-slate-500">
                By placing this order, you agree to our Terms & Conditions.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
