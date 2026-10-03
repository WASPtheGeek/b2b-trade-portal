"use client";

import { useCallback, useEffect, useState } from "react";
import { tokenStorage } from "@/lib/auth/tokenStorageInstance";
import { resolveErrorMessage } from "@/lib/http/resolveErrorMessage";
import { adminOrderService } from "@/services/adminOrderServiceInstance";
import type { OrderSummary } from "@/types/order";

const DEFAULT_GENERIC_ERROR = "Failed to load orders. Please try again.";
const PAGE_SIZE = 20;

export interface UseAdminOrderListOptions {
  genericErrorMessage?: string;
}

export interface AdminOrderListState {
  orders: OrderSummary[];
  total: number;
  isLoading: boolean;
  error: string | null;
  status: string | null;
  setStatus(value: string | null): void;
  page: number;
  pageSize: number;
  setPage(value: number): void;
  refresh(): void;
}

/** Owns the admin order list's data fetching, status-tab filtering, and server-side paging. */
export function useAdminOrderList({
  genericErrorMessage = DEFAULT_GENERIC_ERROR,
}: UseAdminOrderListOptions = {}): AdminOrderListState {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    const token = tokenStorage.getToken();
    const request = token
      ? adminOrderService.list({ status: status ?? undefined, page, pageSize: PAGE_SIZE }, token)
      : Promise.resolve({ items: [], total: 0 });

    request
      .then(({ items, total: newTotal }) => {
        setOrders(items);
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
  }, [status, page, reloadToken]);

  const handleSetStatus = useCallback((value: string | null): void => {
    setStatus(value);
    setPage(1);
  }, []);

  const refresh = useCallback((): void => {
    setReloadToken((current) => current + 1);
  }, []);

  return { orders, total, isLoading, error, status, setStatus: handleSetStatus, page, pageSize: PAGE_SIZE, setPage, refresh };
}
