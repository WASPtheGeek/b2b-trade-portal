import { createContext } from "react";
import type { AuthContextValue } from "./AuthContextValue";

/** Carries the current auth session; consumed through the `useAuth` hook. */
export const AuthContext = createContext<AuthContextValue | null>(null);
