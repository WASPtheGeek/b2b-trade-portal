"use client";

import { useEffect, useState } from "react";
import { tokenStorage } from "@/lib/auth/tokenStorageInstance";
import { resolveErrorMessage } from "@/lib/http/resolveErrorMessage";
import { orderService } from "@/services/orderServiceInstance";
import type { Order } from "@/types/order";

const DEFAULT_GENERIC_ERROR = "Failed to load the order. Please try again.";

export interface UseOrderDetailOptions {
  genericErrorMessage?: string;
}

export interface OrderDetailState {
  order: Order | null;
  isLoading: boolean;
  error: string | null;
}

/** Fetches a single one of the signed-in user's own orders by ID, once, on mount. */
export function useOrderDetail(
  id: number,
  { genericErrorMessage = DEFAULT_GENERIC_ERROR }: UseOrderDetailOptions = {},
): OrderDetailState {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = tokenStorage.getToken();
    const request = token ? orderService.getById(id, token) : Promise.resolve(null);

    request
      .then(setOrder)
      .catch((caught: unknown) => {
        setError(resolveErrorMessage(caught, genericErrorMessage));
      })
      .finally(() => {
        setIsLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return { order, isLoading, error };
}
