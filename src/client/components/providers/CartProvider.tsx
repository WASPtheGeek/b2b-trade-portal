"use client";

import type { ReactNode } from "react";
import { CartContext } from "@/lib/cart/CartContext";
import { useCartSession } from "@/hooks/useCartSession";

export interface CartProviderProps {
  children: ReactNode;
}

/** Makes the current cart state available to the component tree via `useCart`. */
export function CartProvider({ children }: CartProviderProps) {
  const session = useCartSession();

  return <CartContext.Provider value={ session }>{ children }</CartContext.Provider>;
}
