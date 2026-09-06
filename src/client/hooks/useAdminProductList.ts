"use client";

import { useCallback, useEffect, useState } from "react";
import { tokenStorage } from "@/lib/auth/tokenStorageInstance";
import { resolveErrorMessage } from "@/lib/http/resolveErrorMessage";
import { productService } from "@/services/productServiceInstance";
import type { ProductAdminListItem } from "@/types/product-admin";

const DEFAULT_GENERIC_ERROR = "Failed to load products. Please try again.";
const SEARCH_DEBOUNCE_MS = 300;

export interface UseAdminProductListOptions {
  genericErrorMessage?: string;
}

export interface AdminProductListState {
  products: ProductAdminListItem[];
  isLoading: boolean;
  error: string | null;
  search: string;
  setSearch(value: string): void;
  setProductStatus(id: number, isActive: boolean): Promise<void>;
}

/** Owns the admin product list's data fetching, debounced search, and status-toggle action. */
export function useAdminProductList({
  genericErrorMessage = DEFAULT_GENERIC_ERROR,
}: UseAdminProductListOptions = {}): AdminProductListState {
  const [products, setProducts] = useState<ProductAdminListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    const handle = setTimeout(() => setDebouncedSearch(search), SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(handle);
  }, [search]);

  useEffect(() => {
    const token = tokenStorage.getToken();
    const request = token
      ? productService.list({ search: debouncedSearch || undefined }, token)
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
  }, [debouncedSearch, reloadToken]);

  const setProductStatus = useCallback(async (id: number, isActive: boolean): Promise<void> => {
    const token = tokenStorage.getToken();

    if (!token) {
      return;
    }

    await productService.updateStatus(id, { isActive }, token);
    setReloadToken((current) => current + 1);
  }, []);

  return { products, isLoading, error, search, setSearch, setProductStatus };
}
