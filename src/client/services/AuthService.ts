import type {
  AuthUser,
  LoginCredentials,
  LoginResult,
  RegisterPayload,
  RegisterResult,
  UpdateProfilePayload,
} from "@/types/auth";

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
  /** Updates the signed-in user's own profile. */
  updateProfile(payload: UpdateProfilePayload, token: string): Promise<AuthUser>;
}
