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

export interface CatalogMenuDepartment {
  id: string;
  label: string;
  groups: FooterColumn[];
}

export interface CategoryTreeChild {
  id: string;
  label: string;
  count: number;
}

export interface CategoryTreeItem {
  id: string;
  label: string;
  count: number;
  children: CategoryTreeChild[];
}
