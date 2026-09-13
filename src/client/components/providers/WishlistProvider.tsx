"use client";

import type { ReactNode } from "react";
import { WishlistContext } from "@/lib/wishlist/WishlistContext";
import { useWishlistSession } from "@/hooks/useWishlistSession";

export interface WishlistProviderProps {
  children: ReactNode;
}

/** Makes the current user's wishlist state available to the component tree via `useWishlist`. */
export function WishlistProvider({ children }: WishlistProviderProps) {
  const session = useWishlistSession();

  return <WishlistContext.Provider value={ session }>{ children }</WishlistContext.Provider>;
}
