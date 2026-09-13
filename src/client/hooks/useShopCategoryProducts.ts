"use client";

import { useEffect, useState } from "react";
import { tokenStorage } from "@/lib/auth/tokenStorageInstance";
import { ApiError } from "@/lib/http/ApiError";
import { resolveErrorMessage } from "@/lib/http/resolveErrorMessage";
import { categoryService } from "@/services/categoryServiceInstance";
import { shopProductService } from "@/services/shopProductServiceInstance";
import type { Category } from "@/types/category";
import type { ProductListItemDto } from "@/types/product";

const DEFAULT_PAGE_SIZE = 24;
const DEFAULT_GENERIC_ERROR = "Failed to load this category. Please try again.";

export interface UseShopCategoryProductsOptions {
  page?: number;
  pageSize?: number;
  genericErrorMessage?: string;
}

export interface ShopCategoryProductsState {
  category: Category | null;
  products: ProductListItemDto[];
  total: number;
  isLoading: boolean;
  error: string | null;
  /** No category exists for this slug (a 404 from the category lookup) - distinct from
   * `error`, so the page can render a proper "not found" state instead of a generic error. */
  notFound: boolean;
}

/**
 * Fetches a storefront category by slug together with its current page of products, on mount
 * and whenever the slug or page changes.
 */
export function useShopCategoryProducts(
  slug: string,
  { page = 1, pageSize = DEFAULT_PAGE_SIZE, genericErrorMessage = DEFAULT_GENERIC_ERROR }: UseShopCategoryProductsOptions = {},
): ShopCategoryProductsState {
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<ProductListItemDto[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const token = tokenStorage.getToken() ?? undefined;

    Promise.all([
      categoryService.getBySlug(slug),
      shopProductService.list({ category: slug, page, pageSize }, token),
    ])
      .then(([categoryResult, productsResult]) => {
        if (cancelled) {
          return;
        }

        setCategory(categoryResult);
        setProducts(productsResult.items);
        setTotal(productsResult.total);
        setError(null);
        setNotFound(false);
      })
      .catch((caught: unknown) => {
        if (cancelled) {
          return;
        }

        if (caught instanceof ApiError && caught.status === 404) {
          setNotFound(true);
          return;
        }

        setError(resolveErrorMessage(caught, genericErrorMessage));
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [slug, page, pageSize, genericErrorMessage]);

  return { category, products, total, isLoading, error, notFound };
}
