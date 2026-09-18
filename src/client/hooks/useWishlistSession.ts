"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { tokenStorage } from "@/lib/auth/tokenStorageInstance";
import { buildLoginUrl } from "@/lib/auth/returnTo";
import type { WishlistContextValue } from "@/lib/wishlist/WishlistContextValue";
import { wishlistService } from "@/services/wishlistServiceInstance";

/**
 * Owns the wishlist session: the signed-in user's saved product IDs, kept as one shared set so
 * every product tile/row on the page (and the header's saved count) reflects the same state
 * instead of each holding its own out-of-sync copy.
 */
export function useWishlistSession(): WishlistContextValue {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const [ids, setIds] = useState<ReadonlySet<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  // Reset the saved-IDs set during render when the signed-in user identity changes (login/
  // logout), rather than in an effect - see "Adjusting state when a prop changes" in the React
  // docs. The effect below is left to do only the one thing effects are for here: the actual
  // fetch, once a real user is present.
  const [prevUserId, setPrevUserId] = useState(user?.id);

  if (user?.id !== prevUserId) {
    setPrevUserId(user?.id);
    setIds(new Set());
    setIsLoading(!!user);
  }

  useEffect(() => {
    if (!user) {
      return;
    }

    const token = tokenStorage.getToken();

    if (!token) {
      return;
    }

    let cancelled = false;

    wishlistService
      .listIds(token)
      .then((productIds) => {
        if (!cancelled) {
          setIds(new Set(productIds.map(String)));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setIds(new Set());
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  const toggle = useCallback(
    (productId: string): void => {
      const token = tokenStorage.getToken();

      if (!token) {
        router.push(buildLoginUrl(pathname));

        return;
      }

      const wasSaved = ids.has(productId);

      // Optimistic: flip immediately, then reconcile with the server in the background -
      // revert only if the request actually fails, rather than waiting on a round trip
      // before the heart icon responds.
      setIds((prev) => {
        const next = new Set(prev);

        if (wasSaved) {
          next.delete(productId);
        } else {
          next.add(productId);
        }

        return next;
      });

      const request = wasSaved
        ? wishlistService.remove(Number(productId), token)
        : wishlistService.add(Number(productId), token);

      request.catch(() => {
        setIds((prev) => {
          const next = new Set(prev);

          if (wasSaved) {
            next.add(productId);
          } else {
            next.delete(productId);
          }

          return next;
        });
      });
    },
    [ids, router, pathname],
  );

  const isWishlisted = useCallback((productId: string): boolean => ids.has(productId), [ids]);

  return useMemo(() => ({ ids, isLoading, isWishlisted, toggle }), [ids, isLoading, isWishlisted, toggle]);
}
