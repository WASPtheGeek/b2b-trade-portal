/**
 * Persists the bearer token across page reloads.
 *
 * The backend has no refresh or logout endpoint yet (a single longer-lived JWT
 * is issued at login), so "logging out" is purely a client-side concern —
 * this abstraction is what makes that concern swappable (e.g. for an
 * httpOnly-cookie-backed implementation later) without touching consumers.
 */
export interface TokenStorage {
  getToken(): string | null;
  setToken(token: string): void;
  clearToken(): void;
}
