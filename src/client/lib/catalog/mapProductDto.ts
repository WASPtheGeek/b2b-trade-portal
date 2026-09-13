import type { Product, ProductSpec, ProductUnit } from "@/types/catalog";
import type { ProductDetailDto, ProductListItemDto, ProductPackagingOptionDto } from "@/types/product";

// The storefront tiles/rows/media components (ProductTile, ProductRow, ProductMedia) were
// built against this mock-era `Product` shape (types/catalog.ts) rather than the real API
// DTOs (numeric id, nullable/guest-masked prices, packagingOptions instead of units, category
// filenames instead of image URLs) - these map one to the other so that UI stays unchanged.

const UNIT_VALUE_BY_PACKAGING: Record<ProductPackagingOptionDto["unit"], ProductUnit["value"]> = {
  piece: "gab",
  package: "iep",
  box: "kaste",
};

/** The display text for each packaging unit - kept out of this file (an id, not a localized
 * one) so callers source it from the dictionary, same as any other UI copy. */
export type PackagingUnitLabels = Record<ProductPackagingOptionDto["unit"], Pick<ProductUnit, "label" | "short">>;

function mapPackagingOptions(options: ProductPackagingOptionDto[], unitLabels: PackagingUnitLabels): ProductUnit[] {
  return options.map((option) => ({
    value: UNIT_VALUE_BY_PACKAGING[option.unit],
    ...unitLabels[option.unit],
    qty: option.unit === "piece" ? undefined : String(option.piecesPerUnit),
    price: option.price ?? 0,
  }));
}

/**
 * Maps a storefront product list item, as returned by `GET /api/products`, onto the tile/row
 * components' `Product` shape.
 *
 * @param dto The list item to map.
 * @param unitLabels The display text for each packaging unit, sourced from the dictionary.
 * @param categoryLabel The category label to show as the tile's kicker - list items don't
 * carry their own category (see `ProductListItemDto`), so the page passes whichever category
 * it's currently browsing.
 * @returns The mapped product.
 */
export function mapProductListItem(dto: ProductListItemDto, unitLabels: PackagingUnitLabels, categoryLabel?: string): Product {
  return {
    id: String(dto.id),
    name: dto.name,
    brand: dto.brandName ?? "",
    category: categoryLabel ?? "",
    sku: dto.sku,
    ean: dto.ean ?? "",
    price: dto.basePrice ?? 0,
    units: mapPackagingOptions(dto.packagingOptions, unitLabels),
    // No image-serving endpoint exists yet for `thumbnailFilename`/`imageFilenames` (see
    // ProductMedia's own placeholder comment) - leaving `image` unset renders that placeholder
    // instead of a broken `<img>`.
  };
}

/**
 * Maps a storefront product detail, as returned by `GET /api/products/{id}`, onto the tile/row
 * components' `Product` shape.
 *
 * @param dto The product detail to map.
 * @param unitLabels The display text for each packaging unit, sourced from the dictionary.
 * @returns The mapped product.
 */
export function mapProductDetail(dto: ProductDetailDto, unitLabels: PackagingUnitLabels): Product {
  const specs: ProductSpec[] = Object.entries(dto.attributes).map(([label, value]) => ({ label, value }));

  return {
    id: String(dto.id),
    name: dto.name,
    brand: dto.brandName ?? "",
    category: dto.categories[0]?.name ?? "",
    sku: dto.sku,
    ean: dto.ean ?? "",
    price: dto.basePrice ?? 0,
    units: mapPackagingOptions(dto.packagingOptions, unitLabels),
    description: dto.description ?? undefined,
    specs: specs.length ? specs : undefined,
  };
}
