import type { CatalogMenuDepartment, CatalogMenuGroup, CategoryTreeChild, CategoryTreeItem } from "@/types/catalog";

/**
 * Maps the full-depth category tree into the desktop mega-menu's department/group/item
 * shape: a department's third-level-and-deeper descendants become a column's items (each
 * still carrying its own nested `children`, so CatalogMegaMenu can recurse past them),
 * grouped under their second-level parent's name. Second-level categories with no children
 * of their own (already leaves) are collected into one untitled column instead of repeating
 * the department's own name as a group heading - the department is already shown once, as
 * the rail entry the reader hovered to get here.
 */
export function buildMegaMenuDepartments(categoryTree: CategoryTreeItem[]): CatalogMenuDepartment[] {
  return categoryTree.map((department) => {
    const groups: CatalogMenuGroup[] = [];
    const directItems: CategoryTreeChild[] = [];

    for (const child of department.children) {
      if (child.children?.length) {
        groups.push({ title: child.label, items: child.children });
      } else {
        directItems.push(child);
      }
    }

    if (directItems.length) {
      groups.push({ title: "", items: directItems });
    }

    return { id: department.id, label: department.label, count: department.count, groups };
  });
}
