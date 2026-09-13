import { createContext } from "react";
import type { WishlistContextValue } from "./WishlistContextValue";

/** Carries the current wishlist state; consumed through the `useWishlist` hook. */
export const WishlistContext = createContext<WishlistContextValue | null>(null);
