import type { Product, ProductUnit } from "@/types/catalog";

/** One line in the cart: a product at a specific packaging unit, with a quantity. Keyed by
 * `${productId}:${unit}` so the same product can sit in the cart at two different packaging
 * units (e.g. a box and a loose piece) as two separate lines, matching the storefront design's
 * per-line unit switcher. */
export interface CartLine {
  key: string;
  product: Product;
  unit: ProductUnit["value"];
  qty: number;
}

/** Shape of the cart state exposed to the component tree via `useCart`. */
export interface CartContextValue {
  lines: readonly CartLine[];
  /** Sum of every line's quantity, for the header's cart badge. */
  totalQuantity: number;
  /** Sum of every line's unit price × quantity, at today's snapshot prices (see `add`) - only
   * for display; the order actually charged is always resolved server-side at submit time. */
  subtotal: number;
  /** `true` until the persisted cart has been read from storage - lets the cart page avoid
   * flashing an "empty" state before the real contents load. */
  isLoading: boolean;
  /** Adds a product to the cart at the given unit/quantity, merging into an existing line for
   * the same product+unit rather than duplicating it. */
  add(payload: { product: Product; unit: string; qty: number }): void;
  setQuantity(key: string, qty: number): void;
  /** Switches a line's packaging unit in place, merging into another line already at the
   * target unit if one exists. */
  setUnit(key: string, unit: string): void;
  remove(key: string): void;
  clear(): void;
}
