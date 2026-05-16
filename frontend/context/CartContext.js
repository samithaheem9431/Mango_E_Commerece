"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../lib/api";
import { useAuth } from "./AuthContext";

const CartContext = createContext({
  cart: { items: [] },
  total: 0,
  updateCartItem: () => {},
  removeItem: () => {},
  clearCart: () => {},
});

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [] });
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCart(parsedCart?.items ? parsedCart : { items: [] });
      } catch (e) {
        console.error("Failed to parse cart", e);
        setCart({ items: [] });
      }
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("cart", JSON.stringify(cart));
    }
  }, [cart, isInitialized]);

  const updateCartItem = (product, quantity) => {
    setCart((prev) => {
      const items = [...prev.items];
      const idx = items.findIndex((i) => i.product._id === product._id);
      if (idx >= 0) {
        if (quantity <= 0) {
          items.splice(idx, 1);
        } else {
          items[idx] = { ...items[idx], quantity };
        }
      } else if (quantity > 0) {
        items.push({ product, quantity });
      }
      return { ...prev, items };
    });
  };

  const removeItem = (productId) => {
    setCart((prev) => ({
      ...prev,
      items: prev.items.filter((i) => i.product._id !== productId),
    }));
  };

  const clearCart = () => {
    setCart({ items: [] });
  };

  const total = useMemo(
    () => (cart?.items ?? []).reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0),
    [cart]
  );

  return (
    <CartContext.Provider value={{ cart, total, updateCartItem, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
