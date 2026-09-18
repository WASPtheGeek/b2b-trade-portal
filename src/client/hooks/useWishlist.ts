"use client";

import { useContext } from "react";
import { WishlistContext } from "@/lib/wishlist/WishlistContext";
import type { WishlistContextValue } from "@/lib/wishlist/WishlistContextValue";

/** Reads the current wishlist state. Must be used within a `WishlistProvider`. */
export function useWishlist(): WishlistContextValue {
  const context = useContext(WishlistContext);

  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider.");
  }

  return context;
}
