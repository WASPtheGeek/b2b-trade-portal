"use client";

import { useCallback, useEffect, useState } from "react";
import { tokenStorage } from "@/lib/auth/tokenStorageInstance";
import { resolveErrorMessage } from "@/lib/http/resolveErrorMessage";
import { wishlistService } from "@/services/wishlistServiceInstance";
import type { ProductListItemDto } from "@/types/product";

const DEFAULT_GENERIC_ERROR = "Failed to load your wishlist. Please try again.";

export interface UseWishlistProductsOptions {
  genericErrorMessage?: string;
}

export interface WishlistProductsState {
  products: ProductListItemDto[];
  isLoading: boolean;
  error: string | null;
  /** Removes a product from local state immediately, without waiting on a refetch - the
   * wishlist page's own product cards disappear the moment they're un-saved, matching the
   * toggle a reader just performed rather than lagging a round trip behind it. */
  removeLocal(productId: number): void;
}

/** Fetches the signed-in user's full wishlist (product details, not just IDs) on mount. */
export function useWishlistProducts({
  genericErrorMessage = DEFAULT_GENERIC_ERROR,
}: UseWishlistProductsOptions = {}): WishlistProductsState {
  const [products, setProducts] = useState<ProductListItemDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = tokenStorage.getToken();
    const request = token ? wishlistService.list(token) : Promise.resolve<ProductListItemDto[]>([]);

    request
      .then((items) => {
        setProducts(items);
        setError(null);
      })
      .catch((caught: unknown) => {
        setError(resolveErrorMessage(caught, genericErrorMessage));
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [genericErrorMessage]);

  const removeLocal = useCallback((productId: number): void => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  }, []);

  return { products, isLoading, error, removeLocal };
}
