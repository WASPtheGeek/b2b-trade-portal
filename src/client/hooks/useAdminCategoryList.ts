"use client";

import { useCallback, useEffect, useState } from "react";
import { tokenStorage } from "@/lib/auth/tokenStorageInstance";
import { resolveErrorMessage } from "@/lib/http/resolveErrorMessage";
import { categoryService } from "@/services/categoryServiceInstance";
import type { Category } from "@/types/category";

const DEFAULT_GENERIC_ERROR = "Failed to load categories. Please try again.";

export interface UseAdminCategoryListOptions {
  genericErrorMessage?: string;
}

export interface AdminCategoryListState {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  deleteCategory(id: number): Promise<void>;
}

/**
 * Owns the admin category list's data fetching and delete action.
 *
 * Deleting a category cascades to its children and clears it from any
 * product's category list (the schema's foreign keys are ON DELETE CASCADE) -
 * the caller is responsible for confirming that with the admin before calling
 * `deleteCategory`.
 */
export function useAdminCategoryList({
  genericErrorMessage = DEFAULT_GENERIC_ERROR,
}: UseAdminCategoryListOptions = {}): AdminCategoryListState {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    const token = tokenStorage.getToken();
    const request = token ? categoryService.list(token) : Promise.resolve<Category[]>([]);

    request
      .then((data) => {
        setCategories(data);
        setError(null);
      })
      .catch((caught: unknown) => {
        setError(resolveErrorMessage(caught, genericErrorMessage));
      })
      .finally(() => {
        setIsLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadToken]);

  const deleteCategory = useCallback(async (id: number): Promise<void> => {
    const token = tokenStorage.getToken();

    if (!token) {
      return;
    }

    await categoryService.delete(id, token);
    setReloadToken((current) => current + 1);
  }, []);

  return { categories, isLoading, error, deleteCategory };
}
