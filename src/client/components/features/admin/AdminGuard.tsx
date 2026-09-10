"use client";

import type { ReactNode } from "react";
import { Loader } from "@/components/ui/Loader";
import { useRequireAdmin } from "@/hooks/useRequireAdmin";

export interface AdminGuardProps {
  children: ReactNode;
}

/** Blocks access to its children until the signed-in user is confirmed as an admin. */
export function AdminGuard({ children }: AdminGuardProps) {
  const { isChecking } = useRequireAdmin();

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader size="lg" />
      </div>
    );
  }

  return <>{ children }</>;
}
