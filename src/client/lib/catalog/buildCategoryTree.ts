import type { Category } from "@/types/category";
import type { CategoryTreeChild, CategoryTreeItem } from "@/types/catalog";

/**
 * Builds a full-depth display tree (every category with its descendants, however many
 * levels deep) from the flat, `parentId`-linked list the categories API returns. Input
 * order is preserved, so a list already sorted by display order stays sorted.
 */
export function buildCategoryTree(categories: Category[]): CategoryTreeItem[] {
  const childrenByParentId = new Map<number, Category[]>();

  for (const category of categories) {
    if (category.parentId == null) continue;
    const siblings = childrenByParentId.get(category.parentId) ?? [];
    siblings.push(category);
    childrenByParentId.set(category.parentId, siblings);
  }

  const toTreeChild = (category: Category): CategoryTreeChild => {
    const children = (childrenByParentId.get(category.id) ?? []).map(toTreeChild);

    return {
      id: category.slug,
      label: category.name,
      isCustom: category.isCustom,
      showInMenu: category.showInMenu,
      ...(children.length ? { children } : {}),
    };
  };

  return categories
    .filter((category) => category.parentId == null)
    .map((category) => ({
      ...toTreeChild(category),
      children: (childrenByParentId.get(category.id) ?? []).map(toTreeChild),
    }));
}
