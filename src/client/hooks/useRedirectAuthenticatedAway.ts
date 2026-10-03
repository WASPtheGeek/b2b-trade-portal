"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { isSafeReturnPath } from "@/lib/auth/returnTo";

const ADMIN_ROLE = "admin";

/**
 * Redirects an already-authenticated visitor away from a guest-only page
 * (e.g. `/login`, `/register`) once the session has finished resolving.
 *
 * Honors a `returnTo` search param when present (e.g. a signed-in visitor who follows a
 * bookmarked or shared `/login?returnTo=/product/42` link), falling back to `destination` -
 * or, when the caller doesn't override it, to `/admin` for an admin account and `/` for
 * everyone else, so an admin who revisits `/login` (back button, bookmark, stale tab) while
 * already signed in still lands on the admin panel rather than the storefront.
 *
 * @param destination The path to redirect an authenticated visitor to, absent a `returnTo`.
 * Omit it to use the role-based default instead.
 */
export function useRedirectAuthenticatedAway(destination?: string): void {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading } = useAuth();
  const returnTo = searchParams.get("returnTo");
  const resolvedDestination = destination ?? (user?.role === ADMIN_ROLE ? "/admin" : "/");

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (user) {
      router.replace(isSafeReturnPath(returnTo) ? returnTo : resolvedDestination);
    }
  }, [isLoading, user, router, resolvedDestination, returnTo]);
}
