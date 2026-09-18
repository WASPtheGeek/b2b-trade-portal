import type { AdminNavGroup } from "@/types/admin";

export interface AdminNavLabels {
  overviewGroup: string;
  dashboardItem: string;
  companiesGroup: string;
  usersItem: string;
  ordersItem: string;
  catalogGroup: string;
  productsItem: string;
  categoriesItem: string;
  importItem: string;
  brandsItem: string;
  systemGroup: string;
  settingsItem: string;
}

const DEFAULT_LABELS: AdminNavLabels = {
  overviewGroup: "Overview",
  dashboardItem: "Dashboard",
  companiesGroup: "Companies",
  usersItem: "Users & accounts",
  ordersItem: "Orders",
  catalogGroup: "Catalog",
  productsItem: "Products",
  categoriesItem: "Categories",
  importItem: "ERP import",
  brandsItem: "Brands",
  systemGroup: "System",
  settingsItem: "Settings",
};

/** Builds the admin sidebar's nav structure - ids, icons, and routes are fixed, only the copy is localized. */
export function buildAdminNavGroups(labels: Partial<AdminNavLabels> = {}): AdminNavGroup[] {
  const l = { ...DEFAULT_LABELS, ...labels };

  return [
    {
      title: l.overviewGroup,
      items: [{ id: "dashboard", label: l.dashboardItem, icon: "layout-dashboard", href: "/admin" }],
    },
    {
      title: l.companiesGroup,
      items: [
        { id: "users", label: l.usersItem, icon: "users", href: "/admin/users" },
        { id: "orders", label: l.ordersItem, icon: "receipt", href: "/admin/orders" },
      ],
    },
    {
      title: l.catalogGroup,
      items: [
        { id: "products", label: l.productsItem, icon: "package", href: "/admin/products" },
        { id: "categories", label: l.categoriesItem, icon: "list-tree", href: "/admin/categories" },
        { id: "import", label: l.importItem, icon: "upload", href: "/admin/import" },
        { id: "brands", label: l.brandsItem, icon: "tag", href: "/admin/brands" },
      ],
    },
    {
      title: l.systemGroup,
      items: [{ id: "settings", label: l.settingsItem, icon: "settings", href: "/admin/settings" }],
    },
  ];
}
