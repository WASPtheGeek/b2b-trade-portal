"use client";

import { useCallback, useEffect, useState } from "react";
import type { AuthContextValue } from "@/lib/auth/AuthContextValue";
import { tokenStorage } from "@/lib/auth/tokenStorageInstance";
import { authService } from "@/services/authServiceInstance";
import type { AuthUser, LoginCredentials, RegisterPayload, RegisterResult } from "@/types/auth";

/**
 * Owns the auth session lifecycle: hydrating the current user from a stored
 * token on mount, and exposing login/register/logout actions.
 *
 * Extracted out of `AuthProvider` so the provider itself stays a thin
 * presentation wrapper around this hook's return value.
 */
export function useAuthSession(): AuthContextValue {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = tokenStorage.getToken();
    const sessionUser = token ? authService.fetchCurrentUser(token) : Promise.resolve(null);

    sessionUser
      .then(setUser)
      .catch(() => tokenStorage.clearToken())
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (credentials: LoginCredentials): Promise<void> => {
    const result = await authService.login(credentials);

    tokenStorage.setToken(result.token);
    setUser(result.user);
  }, []);

  const register = useCallback(async (payload: RegisterPayload): Promise<RegisterResult> => {
    return authService.register(payload);
  }, []);

  const logout = useCallback((): void => {
    tokenStorage.clearToken();
    setUser(null);
  }, []);

  return { user, isLoading, login, register, logout };
}
