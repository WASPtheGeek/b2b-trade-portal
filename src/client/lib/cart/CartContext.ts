import { createContext } from "react";
import type { CartContextValue } from "./CartContextValue";

/** Carries the current cart state; consumed through the `useCart` hook. */
export const CartContext = createContext<CartContextValue | null>(null);
