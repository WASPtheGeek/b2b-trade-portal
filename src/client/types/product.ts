import type { Category } from "./category";

/** Mirrors the server's `ProductPackagingOptionDto`. */
export interface ProductPackagingOptionDto {
  unit: "piece" | "package" | "box";
  piecesPerUnit: number;
  /** `null` for a guest (unauthenticated) request - the server never sends a real price
   * it expects the client to hide. */
  price: number | null;
}

/** Mirrors the server's `ProductListItemDto`, returned by the storefront product list/search. */
export interface ProductListItemDto {
  id: number;
  sku: string;
  name: string;
  ean: string | null;
  brandName: string | null;
  thumbnailFilename: string | null;
  isActive: boolean;
  basePrice: number | null;
  packagingOptions: ProductPackagingOptionDto[];
}

/** Mirrors the server's `ProductDetailDto`, returned by the storefront product detail page. */
export interface ProductDetailDto {
  id: number;
  sku: string;
  name: string;
  description: string | null;
  ean: string | null;
  brandName: string | null;
  isActive: boolean;
  basePrice: number | null;
  vatRatePercent: number;
  packagingOptions: ProductPackagingOptionDto[];
  imageFilenames: string[];
  categories: Category[];
  attributes: Record<string, string>;
}
