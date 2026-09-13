"use client";

import { useEffect, useState } from "react";
import { tokenStorage } from "@/lib/auth/tokenStorageInstance";
import { resolveErrorMessage } from "@/lib/http/resolveErrorMessage";
import { productService } from "@/services/productServiceInstance";
import type { ProductAdminDetail } from "@/types/product-admin";

const DEFAULT_GENERIC_ERROR = "Failed to load the product. Please try again.";

export interface UseProductDetailOptions {
  genericErrorMessage?: string;
}

export interface ProductDetailState {
  product: ProductAdminDetail | null;
  isLoading: boolean;
  error: string | null;
}

/** Fetches a single product's full admin details by ID, once, on mount. */
export function useProductDetail(
  id: number,
  { genericErrorMessage = DEFAULT_GENERIC_ERROR }: UseProductDetailOptions = {},
): ProductDetailState {
  const [product, setProduct] = useState<ProductAdminDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = tokenStorage.getToken();
    const request = token ? productService.getById(id, token) : Promise.resolve(null);

    request
      .then(setProduct)
      .catch((caught: unknown) => {
        setError(resolveErrorMessage(caught, genericErrorMessage));
      })
      .finally(() => {
        setIsLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return { product, isLoading, error };
}
