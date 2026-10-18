import { apiClient } from "@/lib/http/apiClient";
import { HttpAdminImportService } from "./HttpAdminImportService";
import type { AdminImportService } from "./AdminImportService";

/** Shared `AdminImportService` instance used across the app. */
export const adminImportService: AdminImportService = new HttpAdminImportService(apiClient);
