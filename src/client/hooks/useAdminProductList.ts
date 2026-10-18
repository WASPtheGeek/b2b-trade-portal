"use client";

import { useCallback, useEffect, useState } from "react";
import { tokenStorage } from "@/lib/auth/tokenStorageInstance";
import { resolveErrorMessage } from "@/lib/http/resolveErrorMessage";
import { productService } from "@/services/productServiceInstance";
import type { ProductAdminListItem, ProductBulkDeleteResult } from "@/types/product-admin";

const DEFAULT_GENERIC_ERROR = "Failed to load products. Please try again.";
const DEFAULT_BULK_STATUS_ERROR = "Failed to update the selected products. Please try again.";
const DEFAULT_DELETE_ERROR = "Failed to delete the product. Please try again.";
const SEARCH_DEBOUNCE_MS = 300;

/** Which products the list shows, by active status. */
export type ProductStatusFilter = "all" | "active" | "inactive";

const STATUS_FILTER_QUERY: Record<ProductStatusFilter, boolean | undefined> = {
  all: undefined,
  active: true,
  inactive: false,
};

export interface UseAdminProductListOptions {
  genericErrorMessage?: string;
  bulkStatusErrorMessage?: string;
  deleteErrorMessage?: string;
}

export interface AdminProductListState {
  products: ProductAdminListItem[];
  isLoading: boolean;
  error: string | null;
  search: string;
  setSearch(value: string): void;
  statusFilter: ProductStatusFilter;
  setStatusFilter(value: ProductStatusFilter): void;
  setProductStatus(id: number, isActive: boolean): Promise<void>;
  setProductsStatus(ids: number[], isActive: boolean): Promise<void>;
  /** Permanently deletes a product; on failure (e.g. it has orders) the reason lands in `error`. */
  deleteProduct(id: number): Promise<void>;
  /** Permanently deletes several products; ordered ones are skipped (see `bulkDeleteResult`). */
  deleteProducts(ids: number[]): Promise<void>;
  /** The outcome of the last bulk delete, until dismissed. */
  bulkDeleteResult: ProductBulkDeleteResult | null;
  dismissBulkDeleteResult(): void;
  /** True while a bulk status update or bulk delete is in flight. */
  isBulkUpdating: boolean;
  refresh(): void;
}

/** Owns the admin product list's data fetching, debounced search, status filter, and the single
 * and bulk status-toggle actions. */
export function useAdminProductList({
  genericErrorMessage = DEFAULT_GENERIC_ERROR,
  bulkStatusErrorMessage = DEFAULT_BULK_STATUS_ERROR,
  deleteErrorMessage = DEFAULT_DELETE_ERROR,
}: UseAdminProductListOptions = {}): AdminProductListState {
  const [products, setProducts] = useState<ProductAdminListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProductStatusFilter>("all");
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const [bulkDeleteResult, setBulkDeleteResult] = useState<ProductBulkDeleteResult | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    const handle = setTimeout(() => setDebouncedSearch(search), SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(handle);
  }, [search]);

  useEffect(() => {
    const token = tokenStorage.getToken();
    const request = token
      ? productService.list({ search: debouncedSearch || undefined, isActive: STATUS_FILTER_QUERY[statusFilter] }, token)
      : Promise.resolve<ProductAdminListItem[]>([]);

    request
      .then((data) => {
        setProducts(data);
        setError(null);
      })
      .catch((caught: unknown) => {
        setError(resolveErrorMessage(caught, genericErrorMessage));
      })
      .finally(() => {
        setIsLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, statusFilter, reloadToken]);

  const setProductStatus = useCallback(async (id: number, isActive: boolean): Promise<void> => {
    const token = tokenStorage.getToken();

    if (!token) {
      return;
    }

    await productService.updateStatus(id, { isActive }, token);
    setReloadToken((current) => current + 1);
  }, []);

  const setProductsStatus = useCallback(async (ids: number[], isActive: boolean): Promise<void> => {
    const token = tokenStorage.getToken();

    if (!token || ids.length === 0) {
      return;
    }

    setIsBulkUpdating(true);

    try {
      await productService.updateStatusBulk({ ids, isActive }, token);
      setError(null);
    }
    catch (caught) {
      setError(resolveErrorMessage(caught, bulkStatusErrorMessage));
    }
    finally {
      setIsBulkUpdating(false);
    }

    setReloadToken((current) => current + 1);
  }, [bulkStatusErrorMessage]);

  const deleteProduct = useCallback(async (id: number): Promise<void> => {
    const token = tokenStorage.getToken();

    if (!token) {
      return;
    }

    try {
      await productService.delete(id, token);
      setError(null);
      setReloadToken((current) => current + 1);
    }
    catch (caught) {
      setError(resolveErrorMessage(caught, deleteErrorMessage));
    }
  }, [deleteErrorMessage]);

  const deleteProducts = useCallback(async (ids: number[]): Promise<void> => {
    const token = tokenStorage.getToken();

    if (!token || ids.length === 0) {
      return;
    }

    setIsBulkUpdating(true);
    setBulkDeleteResult(null);

    try {
      setBulkDeleteResult(await productService.deleteBulk(ids, token));
      setError(null);
    }
    catch (caught) {
      setError(resolveErrorMessage(caught, deleteErrorMessage));
    }
    finally {
      setIsBulkUpdating(false);
    }

    setReloadToken((current) => current + 1);
  }, [deleteErrorMessage]);

  const dismissBulkDeleteResult = useCallback((): void => {
    setBulkDeleteResult(null);
  }, []);

  const refresh = useCallback((): void => {
    setReloadToken((current) => current + 1);
  }, []);

  return {
    products,
    isLoading,
    error,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    setProductStatus,
    setProductsStatus,
    deleteProduct,
    deleteProducts,
    bulkDeleteResult,
    dismissBulkDeleteResult,
    isBulkUpdating,
    refresh,
  };
}
