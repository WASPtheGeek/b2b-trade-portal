"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

/**
 * Redirects an already-authenticated visitor away from a guest-only page
 * (e.g. `/login`, `/register`) once the session has finished resolving.
 *
 * @param destination The path to redirect an authenticated visitor to.
 */
export function useRedirectAuthenticatedAway(destination: string = "/"): void {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (user) {
      router.replace(destination);
    }
  }, [isLoading, user, router, destination]);
}
