"use client";

import { useAuth } from "@/hooks/useAuth";

/** Sidebar footer showing the signed-in admin's name. */
export function AdminSidebarFooter() {
  const { user } = useAuth();

  return (
    <span className="min-w-0 text-[length:var(--font-size-base)] text-white/72 overflow-hidden text-ellipsis whitespace-nowrap">
      { user ? `${user.firstName} ${user.lastName}` : null }
    </span>
  );
}
