import type { AuthUser, LoginCredentials, LoginResult, RegisterPayload, RegisterResult } from "@/types/auth";

/**
 * Auth operations the rest of the app depends on.
 *
 * Components and hooks depend on this interface rather than on `apiClient`
 * directly, so the transport (REST today) can change without touching them.
 */
export interface AuthService {
  login(credentials: LoginCredentials): Promise<LoginResult>;
  register(payload: RegisterPayload): Promise<RegisterResult>;
  fetchCurrentUser(token: string): Promise<AuthUser>;
}
