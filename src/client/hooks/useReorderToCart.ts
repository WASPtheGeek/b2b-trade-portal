"use client";

import { useCallback, useState } from "react";
import { useCart } from "@/hooks/useCart";
import { mapProductDetail, UNIT_VALUE_BY_PACKAGING, type PackagingUnitLabels } from "@/lib/catalog/mapProductDto";
import { tokenStorage } from "@/lib/auth/tokenStorageInstance";
import { resolveErrorMessage } from "@/lib/http/resolveErrorMessage";
import { orderService } from "@/services/orderServiceInstance";
import { shopProductService } from "@/services/shopProductServiceInstance";
import type { CartContextValue } from "@/lib/cart/CartContextValue";
import type { OrderItem } from "@/types/order";

const DEFAULT_GENERIC_ERROR = "Failed to add these items to your cart. Please try again.";

/**
 * Re-adds an order's items to the cart, one at a time, re-priced and re-validated against the
 * *current* catalog (not the order's frozen snapshot) - the same "use current prices" policy
 * the server's own `POST /api/orders/{id}/reorder` already applies, just surfaced to the user
 * for review instead of immediately placing a new order. A line is silently skipped if its
 * product no longer exists or is inactive, matching that endpoint's own filtering.
 */
async function addOrderItemsToCart(
  items: readonly OrderItem[],
  packagingUnits: PackagingUnitLabels,
  addToCart: CartContextValue["add"],
  token: string,
): Promise<number> {
  let added = 0;

  for (const item of items) {
    if (item.productId == null) {
      continue;
    }

    try {
      const dto = await shopProductService.getById(item.productId, token);
      const product = mapProductDetail(dto, packagingUnits);
      const targetUnitValue = UNIT_VALUE_BY_PACKAGING[item.packagingUnit as keyof typeof UNIT_VALUE_BY_PACKAGING];
      const unit =
        product.units.find((u) => u.value === targetUnitValue && u.available !== false) ??
        product.units.find((u) => u.available !== false) ??
        product.units[0];

      if (!unit) {
        continue;
      }

      addToCart({ product, unit: unit.value, qty: item.quantity });
      added += 1;
    }
    catch {
      // Product no longer exists or is inactive - skip this line rather than failing the
      // whole reorder over one discontinued item.
    }
  }

  return added;
}

export interface UseReorderToCartOptions {
  genericErrorMessage?: string;
}

export interface ReorderToCartState {
  isProcessing: boolean;
  error: string | null;
  /** Adds the given (already-loaded) order items to the cart. Returns how many lines were
   * actually added. */
  addItemsToCart(items: readonly OrderItem[], packagingUnits: PackagingUnitLabels): Promise<number>;
  /** Fetches the given order, then adds its items to the cart the same way. */
  reorderToCart(orderId: number, packagingUnits: PackagingUnitLabels): Promise<number>;
}

/** Backs the "Reorder" action on the order history/detail views: instead of instantly placing
 * a duplicate order, it loads the original items into the cart so the user can adjust
 * quantities, drop items, and add a note before actually submitting. */
export function useReorderToCart({
  genericErrorMessage = DEFAULT_GENERIC_ERROR,
}: UseReorderToCartOptions = {}): ReorderToCartState {
  const cart = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addItemsToCart = useCallback(async (items: readonly OrderItem[], packagingUnits: PackagingUnitLabels): Promise<number> => {
    const token = tokenStorage.getToken();

    if (!token) {
      return 0;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const added = await addOrderItemsToCart(items, packagingUnits, cart.add, token);

      if (added === 0) {
        setError(genericErrorMessage);
      }

      return added;
    }
    finally {
      setIsProcessing(false);
    }
  }, [cart.add, genericErrorMessage]);

  const reorderToCart = useCallback(async (orderId: number, packagingUnits: PackagingUnitLabels): Promise<number> => {
    const token = tokenStorage.getToken();

    if (!token) {
      return 0;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const order = await orderService.getById(orderId, token);
      const added = await addOrderItemsToCart(order.items, packagingUnits, cart.add, token);

      if (added === 0) {
        setError(genericErrorMessage);
      }

      return added;
    }
    catch (caught) {
      setError(resolveErrorMessage(caught, genericErrorMessage));

      return 0;
    }
    finally {
      setIsProcessing(false);
    }
  }, [cart.add, genericErrorMessage]);

  return { isProcessing, error, addItemsToCart, reorderToCart };
}
