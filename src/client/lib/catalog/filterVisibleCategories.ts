import type { CategoryTreeChild, CategoryTreeItem } from "@/types/catalog";

function filterChildren(items: CategoryTreeChild[]): CategoryTreeChild[] {
  return items
    .filter((item) => item.showInMenu !== false)
    .map((item) => (item.children ? { ...item, children: filterChildren(item.children) } : item));
}

/**
 * Recursively drops every category (at any depth) whose `showInMenu` is `false`, keeping
 * the rest of the tree shape intact. Used for CatalogMegaMenu's panel content, which shows
 * the storefront's normal menu-visible taxonomy - independent of DepartmentNav's rail,
 * which surfaces `isCustom`-flagged departments regardless of their own visibility.
 */
export function filterVisibleCategories(tree: CategoryTreeItem[]): CategoryTreeItem[] {
  return tree
    .filter((item) => item.showInMenu !== false)
    .map((item) => ({ ...item, children: filterChildren(item.children) }));
}
