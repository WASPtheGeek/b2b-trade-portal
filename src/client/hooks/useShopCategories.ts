"use client";

import { useEffect, useState } from "react";
import { buildCategoryTree } from "@/lib/catalog/buildCategoryTree";
import { categoryService } from "@/services/categoryServiceInstance";
import type { CategoryTreeItem } from "@/types/catalog";

export interface UseShopCategoriesResult {
  tree: CategoryTreeItem[];
  isLoading: boolean;
}

/**
 * Fetches the storefront's menu-visible categories, once, on mount.
 *
 * Anonymous (no auth token) — this backs the public shop chrome, not an admin
 * screen — so a failed fetch degrades to an empty tree rather than an error.
 */
export function useShopCategories(): UseShopCategoriesResult {
  const [tree, setTree] = useState<CategoryTreeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    categoryService
      .listPublic()
      .then((categories) => setTree(buildCategoryTree(categories)))
      .catch(() => setTree([]))
      .finally(() => setIsLoading(false));
  }, []);

  return { tree, isLoading };
}
