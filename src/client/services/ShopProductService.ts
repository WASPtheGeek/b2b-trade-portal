import type { ProductDetailDto, ProductListItemDto } from "@/types/product";

export interface ShopProductListQuery {
  /** Category slug or numeric id, matching the server's `category` filter. */
  category?: string;
  brand?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface ShopProductListResult {
  items: ProductListItemDto[];
  total: number;
}

/** Storefront product browsing - unlike `ProductService` (admin, token-gated CRUD), every
 * method here works anonymously. `token` is optional and only changes what's in the response:
 * the server includes real prices when it identifies an authenticated caller, and masks them
 * (`null`) otherwise - passing the current user's token (when there is one) is what lets a
 * signed-in visitor see their prices here, exactly as the same endpoints already do when
 * called directly. */
export interface ShopProductService {
  list(query?: ShopProductListQuery, token?: string): Promise<ShopProductListResult>;
  getById(id: number, token?: string): Promise<ProductDetailDto>;
}
