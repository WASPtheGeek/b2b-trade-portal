"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { buildLoginUrl } from "@/lib/auth/returnTo";

const ADMIN_ROLE = "admin";

export interface RequireAdminResult {
  /** True while the session is still resolving or an away-redirect is in flight. */
  isChecking: boolean;
}

/**
 * Redirects away from an admin-only page unless the signed-in user has the admin role.
 *
 * Signed-out visitors are sent to `/login`; signed-in non-admins are sent home rather
 * than shown a dedicated "forbidden" page, since this is a UX convenience only — the
 * server enforces the real boundary (`[Authorize(Roles = "admin")]`) independently.
 *
 * @returns Whether the check (and any resulting redirect) is still in progress.
 */
export function useRequireAdmin(): RequireAdminResult {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading } = useAuth();
  const isAdmin = user?.role === ADMIN_ROLE;

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!user) {
      router.replace(buildLoginUrl(pathname));

      return;
    }

    if (!isAdmin) {
      router.replace("/");
    }
  }, [isLoading, user, isAdmin, router, pathname]);

  return { isChecking: isLoading || !isAdmin };
}
