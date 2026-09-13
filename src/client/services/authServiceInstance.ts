import { apiClient } from "@/lib/http/apiClient";
import { HttpAuthService } from "./HttpAuthService";
import type { AuthService } from "./AuthService";

/** Shared `AuthService` instance used across the app. */
export const authService: AuthService = new HttpAuthService(apiClient);
