"use client";

import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { computeOrderTotals } from "@/lib/pricing";

const CartContext = createContext(null);
const STORAGE_KEY = "treatsbox_cart_v1";
const CUSTOMER_KEY = "treatsbox_customer_v1";

function loadFromStorage(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [customer, setCustomer] = useState({ name: "", phone: "", whatsapp: "", email: "", notes: "" });
  const [hydrated, setHydrated] = useState(false);
  const [catalog, setCatalog] = useState({ products: [], packages: [] });

  useEffect(() => {
    setItems(loadFromStorage(STORAGE_KEY, []));
    setCustomer(loadFromStorage(CUSTOMER_KEY, { name: "", phone: "", whatsapp: "", email: "", notes: "" }));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(CUSTOMER_KEY, JSON.stringify(customer));
  }, [customer, hydrated]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch("/api/products").then((r) => r.json()),
      fetch("/api/packages").then((r) => r.json()),
    ]).then(([p, pk]) => {
      if (!cancelled) setCatalog({ products: p.products || [], packages: pk.packages || [] });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const setQuantity = useCallback((itemType, refId, quantity) => {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.itemType === itemType && i.refId === refId);
      if (quantity <= 0) {
        if (idx === -1) return prev;
        return prev.filter((_, i) => i !== idx);
      }
      if (idx === -1) {
        return [...prev, { itemType, refId, quantity }];
      }
      const next = [...prev];
      next[idx] = { ...next[idx], quantity };
      return next;
    });
  }, []);

  const increment = useCallback(
    (itemType, refId) => {
      setItems((prev) => {
        const idx = prev.findIndex((i) => i.itemType === itemType && i.refId === refId);
        if (idx === -1) return [...prev, { itemType, refId, quantity: 1 }];
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 };
        return next;
      });
    },
    []
  );

  const decrement = useCallback((itemType, refId) => {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.itemType === itemType && i.refId === refId);
      if (idx === -1) return prev;
      const qty = prev[idx].quantity - 1;
      if (qty <= 0) return prev.filter((_, i) => i !== idx);
      const next = [...prev];
      next[idx] = { ...next[idx], quantity: qty };
      return next;
    });
  }, []);

  const removeItem = useCallback((itemType, refId) => {
    setItems((prev) => prev.filter((i) => !(i.itemType === itemType && i.refId === refId)));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const getQuantity = useCallback(
    (itemType, refId) => items.find((i) => i.itemType === itemType && i.refId === refId)?.quantity || 0,
    [items]
  );

  const totals = useMemo(
    () => computeOrderTotals(items, catalog.products, catalog.packages),
    [items, catalog]
  );

  const itemCount = useMemo(() => items.reduce((s, i) => s + i.quantity, 0), [items]);

  const value = {
    items,
    catalog,
    customer,
    setCustomer,
    hydrated,
    setQuantity,
    increment,
    decrement,
    removeItem,
    clearCart,
    getQuantity,
    totals,
    itemCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
