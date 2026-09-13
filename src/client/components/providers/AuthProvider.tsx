"use client";

import type { ReactNode } from "react";
import { AuthContext } from "@/lib/auth/AuthContext";
import { useAuthSession } from "@/hooks/useAuthSession";

export interface AuthProviderProps {
  children: ReactNode;
}

/** Makes the current auth session available to the component tree via `useAuth`. */
export function AuthProvider({ children }: AuthProviderProps) {
  const session = useAuthSession();

  return <AuthContext.Provider value={ session }>{ children }</AuthContext.Provider>;
}
