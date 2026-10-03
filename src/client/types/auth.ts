import type { UserRole, UserStatus } from "./server-enums";

/** Mirrors the server's `UserDto` (see `AuthController.ToDto`). */
export interface AuthUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  businessName: string | null;
  registrationNumber: string | null;
  vatNumber: string | null;
  phone: string | null;
  isVatExempt: boolean;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  /** Why the account was rejected, when `status` is `Rejected`. */
  rejectionReason: string | null;
}

/** Credentials submitted to `POST /api/auth/login`. */
export interface LoginCredentials {
  email: string;
  password: string;
}

/** Response body returned by `POST /api/auth/login`. */
export interface LoginResult {
  token: string;
  user: AuthUser;
}

/** Fields collected by the self-registration form, sent to `POST /api/auth/register`. */
export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  businessName: string;
  registrationNumber: string;
  phone?: string;
}

/** Response body returned by `POST /api/auth/register`. */
export interface RegisterResult {
  message: string;
  userId: number;
  status: UserStatus;
}

/** Fields the signed-in user can edit about their own profile, sent to `PUT /api/auth/me`.
 * Deliberately excludes email/password - see `UpdateProfileRequest` on the server. */
export interface UpdateProfilePayload {
  firstName: string;
  lastName: string;
  businessName: string;
  registrationNumber: string;
  vatNumber?: string;
  phone?: string;
}
