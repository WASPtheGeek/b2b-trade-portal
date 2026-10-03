import type {
  AuthUser,
  LoginCredentials,
  LoginResult,
  MessageResult,
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
  /** Confirms a user's email address using the token from their confirmation email. */
  confirmEmail(token: string): Promise<MessageResult>;
  /** Resends the confirmation email for an account that hasn't confirmed its email yet. */
  resendConfirmation(email: string): Promise<MessageResult>;
  /** Updates the signed-in user's own profile. */
  updateProfile(payload: UpdateProfilePayload, token: string): Promise<AuthUser>;
}
