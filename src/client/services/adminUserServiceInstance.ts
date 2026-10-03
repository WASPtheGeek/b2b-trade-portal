import { apiClient } from "@/lib/http/apiClient";
import { HttpAdminUserService } from "./HttpAdminUserService";
import type { AdminUserService } from "./AdminUserService";

/** Shared `AdminUserService` instance used across the app. */
export const adminUserService: AdminUserService = new HttpAdminUserService(apiClient);
