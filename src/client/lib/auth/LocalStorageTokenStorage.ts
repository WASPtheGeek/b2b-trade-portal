import type { TokenStorage } from "./TokenStorage";

const STORAGE_KEY = "elkaro.auth.token";

/**
 * `TokenStorage` backed by `localStorage`.
 *
 * Guards every access because this class is also constructed during server-side
 * rendering, where `localStorage` does not exist.
 */
export class LocalStorageTokenStorage implements TokenStorage {
  getToken(): string | null {
    if (typeof window === "undefined") {
      return null;
    }

    return window.localStorage.getItem(STORAGE_KEY);
  }

  setToken(token: string): void {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, token);
  }

  clearToken(): void {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.removeItem(STORAGE_KEY);
  }
}
