"use client";

import { useCallback, useEffect, useState } from "react";
import { tokenStorage } from "@/lib/auth/tokenStorageInstance";
import { resolveErrorMessage } from "@/lib/http/resolveErrorMessage";
import { adminOrderService } from "@/services/adminOrderServiceInstance";
import type { Order, OrderStatusUpdatePayload } from "@/types/order";

const DEFAULT_GENERIC_ERROR = "Failed to load the order. Please try again.";

export interface UseAdminOrderDetailOptions {
  genericErrorMessage?: string;
}

export interface AdminOrderDetailState {
  order: Order | null;
  isLoading: boolean;
  error: string | null;
  isUpdating: boolean;
  updateStatus(payload: OrderStatusUpdatePayload): Promise<void>;
}

/** Fetches a single order's full admin detail by ID, and exposes the status-transition action. */
export function useAdminOrderDetail(
  id: number,
  { genericErrorMessage = DEFAULT_GENERIC_ERROR }: UseAdminOrderDetailOptions = {},
): AdminOrderDetailState {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    const token = tokenStorage.getToken();
    const request = token ? adminOrderService.getById(id, token) : Promise.resolve(null);

    request
      .then(setOrder)
      .catch((caught: unknown) => {
        setError(resolveErrorMessage(caught, genericErrorMessage));
      })
      .finally(() => {
        setIsLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, reloadToken]);

  const updateStatus = useCallback(async (payload: OrderStatusUpdatePayload): Promise<void> => {
    const token = tokenStorage.getToken();

    if (!token) {
      return;
    }

    setIsUpdating(true);

    try {
      await adminOrderService.updateStatus(id, payload, token);
      setReloadToken((current) => current + 1);
    }
    finally {
      setIsUpdating(false);
    }
  }, [id]);

  return { order, isLoading, error, isUpdating, updateStatus };
}
