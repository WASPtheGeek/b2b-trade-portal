import type { HttpClient } from "@/lib/http/HttpClient";
import type {
  AuthUser,
  LoginCredentials,
  LoginResult,
  RegisterPayload,
  RegisterResult,
  UpdateProfilePayload,
} from "@/types/auth";
import type { AuthService } from "./AuthService";

/** `AuthService` implementation backed by the Elkaro REST API. */
export class HttpAuthService implements AuthService {
  constructor(private readonly http: HttpClient) {}

  async login(credentials: LoginCredentials): Promise<LoginResult> {
    return this.http.post<LoginResult>("/api/auth/login", credentials);
  }

  async register(payload: RegisterPayload): Promise<RegisterResult> {
    return this.http.post<RegisterResult>("/api/auth/register", payload);
  }

  async fetchCurrentUser(token: string): Promise<AuthUser> {
    return this.http.get<AuthUser>("/api/auth/me", { token });
  }

  async updateProfile(payload: UpdateProfilePayload, token: string): Promise<AuthUser> {
    return this.http.put<AuthUser>("/api/auth/me", payload, { token });
  }
}
