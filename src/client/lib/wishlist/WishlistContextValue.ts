/** Shape of the wishlist state exposed to the component tree via `useWishlist`. */
export interface WishlistContextValue {
  /** Saved product IDs, as strings - matching `Product.id` (see `types/catalog.ts`) so callers
   * never have to convert back and forth just to check membership. */
  ids: ReadonlySet<string>;
  /** `true` while the signed-in user's saved IDs are being fetched. Always `false` for a
   * guest - there's nothing to fetch. */
  isLoading: boolean;
  isWishlisted(productId: string): boolean;
  /** Adds or removes a product, whichever the product's current state calls for. A guest is
   * sent to sign in (returning to the current page afterward) instead of the request failing
   * silently. */
  toggle(productId: string): void;
}
