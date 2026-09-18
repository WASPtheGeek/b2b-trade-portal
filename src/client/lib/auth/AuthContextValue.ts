import type { AuthUser, LoginCredentials, RegisterPayload, RegisterResult } from "@/types/auth";

/** Shape of the auth session exposed to the component tree via `useAuth`. */
export interface AuthContextValue {
  /** The signed-in user, or `null` when signed out or not yet resolved. */
  user: AuthUser | null;
  /** `true` while the initial session (stored token → current user) is being resolved. */
  isLoading: boolean;
  login(credentials: LoginCredentials): Promise<void>;
  register(payload: RegisterPayload): Promise<RegisterResult>;
  logout(): void;
}
