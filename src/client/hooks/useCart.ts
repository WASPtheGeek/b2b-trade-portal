"use client";

import { useContext } from "react";
import { CartContext } from "@/lib/cart/CartContext";
import type { CartContextValue } from "@/lib/cart/CartContextValue";

/** Reads the current cart session. Must be used within a `CartProvider`. */
export function useCart(): CartContextValue {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within a CartProvider.");
  }

  return context;
}
