"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { buildLoginUrl } from "@/lib/auth/returnTo";

export interface RequireAuthResult {
  /** True while the session is still resolving or an away-redirect is in flight. */
  isChecking: boolean;
}

/**
 * Redirects a signed-out visitor away from an account-only page (e.g. the wishlist) to
 * `/login`, returning to the current page once they've signed in.
 *
 * @returns Whether the check (and any resulting redirect) is still in progress.
 */
export function useRequireAuth(): RequireAuthResult {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!user) {
      router.replace(buildLoginUrl(pathname));
    }
  }, [isLoading, user, router, pathname]);

  return { isChecking: isLoading || !user };
}
