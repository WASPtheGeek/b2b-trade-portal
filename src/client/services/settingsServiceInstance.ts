import { apiClient } from "@/lib/http/apiClient";
import { HttpSettingsService } from "./HttpSettingsService";
import type { SettingsService } from "./SettingsService";

/** Shared `SettingsService` instance used across the app. */
export const settingsService: SettingsService = new HttpSettingsService(apiClient);
