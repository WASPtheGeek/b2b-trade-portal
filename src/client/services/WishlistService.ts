import type { ProductListItemDto } from "@/types/product";

/** The current user's saved-products list - every method requires a bearer token, since a
 * wishlist only makes sense for a signed-in account. */
export interface WishlistService {
  list(token: string): Promise<ProductListItemDto[]>;
  /** Just the saved product IDs - the lightweight call product tiles/rows use everywhere to
   * light up their heart icon, without paying for the full product payload on every page. */
  listIds(token: string): Promise<number[]>;
  add(productId: number, token: string): Promise<void>;
  remove(productId: number, token: string): Promise<void>;
}
