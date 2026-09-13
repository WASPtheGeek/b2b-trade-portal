"use client";

import { useEffect, useState } from "react";
import { tokenStorage } from "@/lib/auth/tokenStorageInstance";
import { ApiError } from "@/lib/http/ApiError";
import { resolveErrorMessage } from "@/lib/http/resolveErrorMessage";
import { shopProductService } from "@/services/shopProductServiceInstance";
import type { ProductDetailDto, ProductListItemDto } from "@/types/product";

const RELATED_PAGE_SIZE = 6;
const DEFAULT_GENERIC_ERROR = "Failed to load this product. Please try again.";

export interface UseShopProductDetailOptions {
  genericErrorMessage?: string;
}

export interface ShopProductDetailState {
  product: ProductDetailDto | null;
  /** Other products from the same primary category, excluding this one - empty until the
   * product itself has loaded, since the category to search within comes from its own data. */
  related: ProductListItemDto[];
  isLoading: boolean;
  error: string | null;
  notFound: boolean;
}

/**
 * Fetches a storefront product by numeric id, then a handful of related products from its
 * primary category, on mount and whenever the id changes.
 */
export function useShopProductDetail(
  id: number,
  { genericErrorMessage = DEFAULT_GENERIC_ERROR }: UseShopProductDetailOptions = {},
): ShopProductDetailState {
  const [product, setProduct] = useState<ProductDetailDto | null>(null);
  const [related, setRelated] = useState<ProductListItemDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const token = tokenStorage.getToken() ?? undefined;

    shopProductService
      .getById(id, token)
      .then(async (result) => {
        if (cancelled) {
          return;
        }

        setProduct(result);
        setError(null);
        setNotFound(false);

        const primaryCategory = result.categories[0];

        if (!primaryCategory) {
          setRelated([]);
          return;
        }

        const relatedResult = await shopProductService.list({ category: primaryCategory.slug, pageSize: RELATED_PAGE_SIZE + 1 }, token);

        if (!cancelled) {
          setRelated(relatedResult.items.filter((item) => item.id !== result.id).slice(0, RELATED_PAGE_SIZE));
        }
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
  }, [id, genericErrorMessage]);

  return { product, related, isLoading, error, notFound };
}
