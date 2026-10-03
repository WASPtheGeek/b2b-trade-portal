"use client";

import { useCallback, useState } from "react";
import { PACKAGING_BY_UNIT_VALUE } from "@/lib/catalog/mapProductDto";
import { tokenStorage } from "@/lib/auth/tokenStorageInstance";
import { resolveErrorMessage } from "@/lib/http/resolveErrorMessage";
import { orderService } from "@/services/orderServiceInstance";
import type { CartLine } from "@/lib/cart/CartContextValue";
import type { Order } from "@/types/order";

const DEFAULT_GENERIC_ERROR = "Failed to submit the order. Please try again.";

export interface UseCheckoutOptions {
  genericErrorMessage?: string;
}

export interface CheckoutState {
  isSubmitting: boolean;
  error: string | null;
  /** Submits the given cart lines as a new order. Returns the created order, or `null` if
   * the submission failed or there was nothing to submit. */
  submit(lines: readonly CartLine[], notes: string): Promise<Order | null>;
}

/** Converts the cart into a single `POST /api/orders` call - price/VAT/name/sku are all
 * resolved authoritatively by the server from live data, the cart's own snapshot prices are
 * display-only. */
export function useCheckout({ genericErrorMessage = DEFAULT_GENERIC_ERROR }: UseCheckoutOptions = {}): CheckoutState {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(async (lines: readonly CartLine[], notes: string): Promise<Order | null> => {
    const token = tokenStorage.getToken();

    if (!token || lines.length === 0) {
      return null;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      return await orderService.create(
        {
          items: lines.map((line) => ({
            productId: Number(line.product.id),
            packagingUnit: PACKAGING_BY_UNIT_VALUE[line.unit],
            quantity: line.qty,
          })),
          notes: notes.trim() || undefined,
        },
        token,
      );
    }
    catch (caught) {
      setError(resolveErrorMessage(caught, genericErrorMessage));

      return null;
    }
    finally {
      setIsSubmitting(false);
    }
  }, [genericErrorMessage]);

  return { isSubmitting, error, submit };
}
