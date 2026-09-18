"use client";

import { useContext } from "react";
import { AuthContext } from "@/lib/auth/AuthContext";
import type { AuthContextValue } from "@/lib/auth/AuthContextValue";

/** Reads the current auth session. Must be used within an `AuthProvider`. */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }

  return context;
}
