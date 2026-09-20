"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import type { CartContextValue, CartLine } from "@/lib/cart/CartContextValue";
import type { Product } from "@/types/catalog";

const STORAGE_PREFIX = "elkaro.cart.";

function lineKey(productId: string, unit: string): string {
  return `${productId}:${unit}`;
}

function readStoredLines(userId: number): CartLine[] {
  try {
    const raw = window.localStorage.getItem(`${STORAGE_PREFIX}${userId}`);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];

    return Array.isArray(parsed) ? (parsed as CartLine[]) : [];
  }
  catch {
    return [];
  }
}

function writeStoredLines(userId: number, lines: readonly CartLine[]): void {
  try {
    window.localStorage.setItem(`${STORAGE_PREFIX}${userId}`, JSON.stringify(lines));
  }
  catch {
    // Storage can throw (private browsing, quota) - the cart still works for the rest of
    // this session, it just won't survive a reload.
  }
}

function resolveUnitPrice(line: CartLine): number {
  return line.product.units.find((u) => u.value === line.unit)?.price ?? line.product.price;
}

/**
 * Owns the cart session: a client-side-only cart (there is no backend cart entity - see
 * README.md's "client-side cart" architecture note) persisted to `localStorage` per signed-in
 * user, so it survives reloads but never leaks between accounts on a shared browser. Cleared
 * on `clear()` after a successful checkout (`POST /api/orders`, which is the actual source of
 * truth for price/VAT once submitted).
 */
export function useCartSession(): CartContextValue {
  const { user } = useAuth();
  const [lines, setLines] = useState<CartLine[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Reset to empty during render when the signed-in user identity changes (login/logout/switch
  // account), rather than in an effect - see useWishlistSession's identical pattern. The actual
  // localStorage read happens below in an effect instead of here, since this "adjust during
  // render" block also runs during server rendering, where `window` doesn't exist.
  const [prevUserId, setPrevUserId] = useState(user?.id);

  if (user?.id !== prevUserId) {
    setPrevUserId(user?.id);
    setLines([]);
    setIsLoading(!!user);
  }

  useEffect(() => {
    let cancelled = false;
    const request = user ? Promise.resolve(readStoredLines(user.id)) : Promise.resolve<CartLine[]>([]);

    request.then((stored) => {
      if (!cancelled) {
        setLines(stored);
        setIsLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [user]);

  const add = useCallback(
    (payload: { product: Product; unit: string; qty: number }): void => {
      if (!user) {
        return;
      }

      const key = lineKey(payload.product.id, payload.unit);

      setLines((prev) => {
        const existing = prev.find((l) => l.key === key);
        const next = existing
          ? prev.map((l) => (l.key === key ? { ...l, qty: l.qty + payload.qty, product: payload.product } : l))
          : [...prev, { key, product: payload.product, unit: payload.unit as CartLine["unit"], qty: payload.qty }];

        writeStoredLines(user.id, next);

        return next;
      });
    },
    [user],
  );

  const setQuantity = useCallback(
    (key: string, qty: number): void => {
      if (!user || qty < 1) {
        return;
      }

      setLines((prev) => {
        const next = prev.map((l) => (l.key === key ? { ...l, qty } : l));
        writeStoredLines(user.id, next);

        return next;
      });
    },
    [user],
  );

  const setUnit = useCallback(
    (key: string, unit: string): void => {
      if (!user) {
        return;
      }

      setLines((prev) => {
        const line = prev.find((l) => l.key === key);

        if (!line) {
          return prev;
        }

        const newKey = lineKey(line.product.id, unit);

        if (newKey === key) {
          return prev;
        }

        const withoutLine = prev.filter((l) => l.key !== key);
        const target = withoutLine.find((l) => l.key === newKey);
        const next = target
          ? withoutLine.map((l) => (l.key === newKey ? { ...l, qty: l.qty + line.qty } : l))
          : [...withoutLine, { ...line, key: newKey, unit: unit as CartLine["unit"] }];

        writeStoredLines(user.id, next);

        return next;
      });
    },
    [user],
  );

  const remove = useCallback(
    (key: string): void => {
      if (!user) {
        return;
      }

      setLines((prev) => {
        const next = prev.filter((l) => l.key !== key);
        writeStoredLines(user.id, next);

        return next;
      });
    },
    [user],
  );

  const clear = useCallback((): void => {
    if (!user) {
      return;
    }

    setLines([]);
    writeStoredLines(user.id, []);
  }, [user]);

  const totalQuantity = useMemo(() => lines.reduce((sum, l) => sum + l.qty, 0), [lines]);
  const subtotal = useMemo(() => lines.reduce((sum, l) => sum + resolveUnitPrice(l) * l.qty, 0), [lines]);

  return useMemo(
    () => ({ lines, totalQuantity, subtotal, isLoading, add, setQuantity, setUnit, remove, clear }),
    [lines, totalQuantity, subtotal, isLoading, add, setQuantity, setUnit, remove, clear],
  );
}
