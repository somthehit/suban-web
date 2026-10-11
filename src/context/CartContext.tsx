"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";

export interface CartItem {
  id: string; // Unique key e.g. "the-stare-tiger-tier-ext"
  slug: string;
  title: string;
  subtitle?: string;
  species?: string;
  image?: string;
  format?: "digital" | "print" | string;
  tier?: string;
  priceUsd: number;
  priceNpr: number;
  quantity: number;
  archiveRef?: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }, openDrawer?: boolean) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalCount: number;
  subtotalUsd: number;
  subtotalNpr: number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  currency: "USD" | "NPR";
  setCurrency: (c: "USD" | "NPR") => void;
  isLoaded: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "suban_cart_items_v1";
const CURRENCY_STORAGE_KEY = "suban_active_currency";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [currency, setCurrencyState] = useState<"USD" | "NPR">("USD");
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on client mount
  useEffect(() => {
    try {
      const savedItems = localStorage.getItem(CART_STORAGE_KEY);
      if (savedItems) {
        const parsed = JSON.parse(savedItems);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }

      const savedCurrency = localStorage.getItem(CURRENCY_STORAGE_KEY);
      if (savedCurrency === "USD" || savedCurrency === "NPR") {
        setCurrencyState(savedCurrency);
      }
    } catch (e) {
      console.warn("Failed to read cart from localStorage:", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save items to localStorage whenever they change
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn("Failed to persist cart items:", e);
    }
  }, [items, isLoaded]);

  // Save currency to localStorage
  const setCurrency = useCallback((c: "USD" | "NPR") => {
    setCurrencyState(c);
    try {
      localStorage.setItem(CURRENCY_STORAGE_KEY, c);
    } catch (e) {
      console.warn("Failed to persist currency:", e);
    }
  }, []);

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);
  const toggleCart = useCallback(() => setIsCartOpen((prev) => !prev), []);

  const addItem = useCallback(
    (newItem: Omit<CartItem, "quantity"> & { quantity?: number }, openDrawer: boolean = true) => {
      const qty = newItem.quantity && newItem.quantity > 0 ? newItem.quantity : 1;
      setItems((prev) => {
        const existingIdx = prev.findIndex((i) => i.id === newItem.id);
        if (existingIdx > -1) {
          const updated = [...prev];
          updated[existingIdx] = {
            ...updated[existingIdx],
            quantity: updated[existingIdx].quantity + qty,
          };
          return updated;
        } else {
          return [
            ...prev,
            {
              ...newItem,
              quantity: qty,
            },
          ];
        }
      });

      if (openDrawer) {
        setIsCartOpen(true);
      }
    },
    []
  );

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.id !== id));
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity } : i))
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalCount = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.quantity || 1), 0);
  }, [items]);

  const subtotalUsd = useMemo(() => {
    return items.reduce((sum, item) => sum + item.priceUsd * (item.quantity || 1), 0);
  }, [items]);

  const subtotalNpr = useMemo(() => {
    return items.reduce((sum, item) => sum + item.priceNpr * (item.quantity || 1), 0);
  }, [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalCount,
        subtotalUsd,
        subtotalNpr,
        isCartOpen,
        openCart,
        closeCart,
        toggleCart,
        currency,
        setCurrency,
        isLoaded,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
