import type { IconName } from "@/components/ui/Icon";

// UI-level packaging option for a product, as resolved by the catalog for display.
// `value` mirrors the design system's Latvian unit codes ("gab" | "iep" | "kaste"); the
// backend's canonical enum is PackagingUnit: "Piece" | "Package" | "Box" (FRONTEND_CONTEXT.md
// §5) and will need to map onto this shape once real API data replaces the mock data below.
export interface ProductUnit {
  value: "gab" | "iep" | "kaste";
  label: string;
  short: string;
  qty?: string;
  price: number;
  available?: boolean;
}

export interface ProductSpec {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  sku: string;
  ean: string;
  price: number;
  discount?: number;
  units: ProductUnit[];
  image?: string;
  description?: string;
  features?: string[];
  specs?: ProductSpec[];
}

export interface DepartmentNavItem {
  id: string;
  label: string;
}

export interface DepartmentCardItem {
  id: string;
  label: string;
  icon: IconName;
  count: string;
}

export interface FooterColumn {
  title: string;
  links: string[];
}

export interface CategoryTreeChild {
  id: string;
  label: string;
  // Optional because it's a product-count aggregate the category-listing API doesn't
  // provide yet — real DB-backed categories render without one (see FilterPanel's
  // `n.count != null` handling of the same case).
  count?: number;
  // Optional so the same shape works for the (typically 2-level) mobile drawer tree and the
  // category sidebar's recursive department/group/subgroup tree.
  children?: CategoryTreeChild[];
  // Mirrors `Category.isCustom` (an admin-authored "custom navigation node", e.g. a
  // temporary promotion - see CategoryForm's isCustomLabel) - only meaningful at the top
  // level, where the desktop catalog nav (DepartmentNav + CatalogMegaMenu) uses it to show
  // just those curated entries instead of every product category.
  isCustom?: boolean;
  // Mirrors `Category.showInMenu`. Unlike `isCustom` above, this applies at every depth:
  // CatalogMegaMenu's panel content is filtered to just the categories marked visible here,
  // independently of which top-level ones are also flagged `isCustom` for the DepartmentNav
  // rail. Absent (as in hand-authored mock/demo trees) is treated as visible.
  showInMenu?: boolean;
}

export interface CategoryTreeItem extends CategoryTreeChild {
  children: CategoryTreeChild[];
}

export interface CatalogMenuGroup {
  /** Column heading; blank for the column holding a department's childless (leaf) categories,
   * so the department's own name (already shown in the rail beside it) isn't repeated. */
  title: string;
  // Each item's own `children` (if any) render nested inside the same column, indented -
  // a category tree can run deeper than the department/group/item levels this column
  // layout was originally built for, and columns aren't collapsible the way the mobile
  // drawer's rows are, so there's nowhere else for extra depth to go.
  items: CategoryTreeChild[];
}

export interface CatalogMenuDepartment {
  id: string;
  label: string;
  count?: number;
  groups: CatalogMenuGroup[];
}

export interface Brand {
  name: string;
  count: number;
}
