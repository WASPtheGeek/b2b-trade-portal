"use client";

import { useCallback, useEffect, useState } from "react";
import { tokenStorage } from "@/lib/auth/tokenStorageInstance";
import { resolveErrorMessage } from "@/lib/http/resolveErrorMessage";
import { adminImportService } from "@/services/adminImportServiceInstance";
import type { ImportCategoryRecord } from "@/types/import";

const DEFAULT_GENERIC_ERROR = "Failed to load the created categories. Please try again.";
const PAGE_SIZE = 20;

export interface UseAdminImportCategoriesOptions {
  genericErrorMessage?: string;
}

export interface AdminImportCategoriesState {
  categories: ImportCategoryRecord[];
  total: number;
  isLoading: boolean;
  error: string | null;
  page: number;
  pageSize: number;
  setPage(value: number): void;
}

/** Owns the list of categories one import job created, and its server-side paging. */
export function useAdminImportCategories(
  jobId: number,
  { genericErrorMessage = DEFAULT_GENERIC_ERROR }: UseAdminImportCategoriesOptions = {},
): AdminImportCategoriesState {
  const [categories, setCategories] = useState<ImportCategoryRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const token = tokenStorage.getToken();
    const request = token
      ? adminImportService.getCreatedCategories(jobId, { page, pageSize: PAGE_SIZE }, token)
      : Promise.resolve({ items: [], total: 0 });

    request
      .then(({ items, total: newTotal }) => {
        setCategories(items);
        setTotal(newTotal);
        setError(null);
      })
      .catch((caught: unknown) => {
        setError(resolveErrorMessage(caught, genericErrorMessage));
      })
      .finally(() => {
        setIsLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId, page]);

  // Loading starts here rather than in the effect, so a page change shows the table's loader.
  const changePage = useCallback((value: number): void => {
    setIsLoading(true);
    setPage(value);
  }, []);

  return { categories, total, isLoading, error, page, pageSize: PAGE_SIZE, setPage: changePage };
}
