"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { isSafeReturnPath } from "@/lib/auth/returnTo";

/**
 * Redirects an already-authenticated visitor away from a guest-only page
 * (e.g. `/login`, `/register`) once the session has finished resolving.
 *
 * Honors a `returnTo` search param when present (e.g. a signed-in visitor who follows a
 * bookmarked or shared `/login?returnTo=/product/42` link), falling back to `destination`.
 *
 * @param destination The path to redirect an authenticated visitor to, absent a `returnTo`.
 */
export function useRedirectAuthenticatedAway(destination: string = "/"): void {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading } = useAuth();
  const returnTo = searchParams.get("returnTo");

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (user) {
      router.replace(isSafeReturnPath(returnTo) ? returnTo : destination);
    }
  }, [isLoading, user, router, destination, returnTo]);
}
