import type { AuthUser, LoginCredentials, RegisterPayload, RegisterResult } from "@/types/auth";

/** Shape of the auth session exposed to the component tree via `useAuth`. */
export interface AuthContextValue {
  /** The signed-in user, or `null` when signed out or not yet resolved. */
  user: AuthUser | null;
  /** `true` while the initial session (stored token → current user) is being resolved. */
  isLoading: boolean;
  /** Resolves with the freshly signed-in user, so a caller (e.g. the login form, to route an
   * admin straight to `/admin`) doesn't have to wait on a re-render to know their role. */
  login(credentials: LoginCredentials): Promise<AuthUser>;
  register(payload: RegisterPayload): Promise<RegisterResult>;
  logout(): void;
  /** Updates the in-memory session user (e.g. after a profile edit), without a re-login. */
  setUser(user: AuthUser): void;
}
