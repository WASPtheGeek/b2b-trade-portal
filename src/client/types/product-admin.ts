/** Mirrors the server's `ProductAdminListItemDto`. */
export interface ProductAdminListItem {
  id: number;
  sku: string;
  name: string;
  ean: string | null;
  brandName: string | null;
  thumbnailFilename: string | null;
  isActive: boolean;
  basePrice: number;
}

/**
 * Mirrors the server's `ProductAdminDetailDto` — the raw, editable fields for a
 * product, as opposed to the public catalog's resolved/display-only detail shape.
 */
export interface ProductAdminDetail {
  id: number;
  sku: string;
  name: string;
  description: string | null;
  ean: string | null;
  brandId: number | null;
  brandName: string | null;
  vatRateId: number;
  vatRatePercent: number;
  basePrice: number;
  soldByPiece: boolean;
  piecesPerBox: number | null;
  piecesPerPackage: number | null;
  isActive: boolean;
  /** Category IDs the product belongs to; the first entry is the primary category. */
  categoryIds: number[];
  imageFilenames: string[];
}

/** Mirrors the server's `ProductUpsertRequest`, sent to create or update a product. */
export interface ProductUpsertPayload {
  sku: string;
  name: string;
  description?: string;
  basePrice: number;
  vatRateId: number;
  brandId?: number;
  ean?: string;
  soldByPiece: boolean;
  piecesPerBox?: number;
  piecesPerPackage?: number;
  isActive: boolean;
  categoryIds: number[];
}

/** Mirrors the server's `ProductStatusUpdateRequest`. */
export interface ProductStatusUpdatePayload {
  isActive: boolean;
}

/** Optional filters for `GET /api/admin/products`. */
export interface ProductListQuery {
  category?: string;
  brand?: number;
  search?: string;
  page?: number;
  pageSize?: number;
}
