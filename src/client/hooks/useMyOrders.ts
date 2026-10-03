"use client";

import { useCallback, useEffect, useState } from "react";
import { tokenStorage } from "@/lib/auth/tokenStorageInstance";
import { resolveErrorMessage } from "@/lib/http/resolveErrorMessage";
import { orderService } from "@/services/orderServiceInstance";
import type { OrderSummary } from "@/types/order";

const DEFAULT_GENERIC_ERROR = "Failed to load your orders. Please try again.";

export interface UseMyOrdersOptions {
  genericErrorMessage?: string;
}

export interface MyOrdersState {
  orders: OrderSummary[];
  isLoading: boolean;
  error: string | null;
  refresh(): void;
}

/** Fetches the signed-in business's own order history on mount - a single request covers the
 * whole history (see HttpOrderService's page size), so the list/detail views can filter and
 * search client-side rather than round-tripping the server for every tab switch. */
export function useMyOrders({
  genericErrorMessage = DEFAULT_GENERIC_ERROR,
}: UseMyOrdersOptions = {}): MyOrdersState {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    const token = tokenStorage.getToken();
    const request = token ? orderService.list({}, token) : Promise.resolve({ items: [], total: 0 });

    request
      .then(({ items }) => {
        setOrders(items);
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

  const refresh = useCallback((): void => {
    setReloadToken((current) => current + 1);
  }, []);

  return { orders, isLoading, error, refresh };
}
