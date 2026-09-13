import type { CategoryTreeChild, CategoryTreeItem } from "@/types/catalog";

/**
 * Walks a category tree to find the ancestor chain (department -> ... -> the matched node)
 * for the given slug, however deep the tree runs.
 *
 * @param tree The full category tree to search.
 * @param id The slug (`CategoryTreeChild.id`) to find.
 * @returns The trail from the top-level department down to the matched node, or `[]` if no
 * node in the tree has that id.
 */
export function findCategoryTrail(tree: CategoryTreeItem[], id: string | undefined): CategoryTreeChild[] {
  if (!id) {
    return [];
  }

  const walk = (nodes: CategoryTreeChild[], trail: CategoryTreeChild[]): CategoryTreeChild[] | null => {
    for (const node of nodes) {
      const nextTrail = [...trail, node];

      if (node.id === id) {
        return nextTrail;
      }

      const found = node.children ? walk(node.children, nextTrail) : null;

      if (found) {
        return found;
      }
    }

    return null;
  };

  return walk(tree, []) ?? [];
}
