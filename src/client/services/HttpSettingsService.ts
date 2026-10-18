import type { HttpClient } from "@/lib/http/HttpClient";
import type { DisplaySettings, ImportColumnSettings } from "@/types/settings";
import type { SettingsService } from "./SettingsService";

/** `SettingsService` implementation backed by the Elkaro admin REST API. */
export class HttpSettingsService implements SettingsService {
  constructor(private readonly http: HttpClient) {}

  async getImportColumns(token: string): Promise<ImportColumnSettings> {
    return this.http.get<ImportColumnSettings>("/api/admin/settings/import-columns", { token });
  }

  async saveImportColumns(columns: ImportColumnSettings, token: string): Promise<ImportColumnSettings> {
    return this.http.put<ImportColumnSettings>("/api/admin/settings/import-columns", columns, { token });
  }

  async resetImportColumns(token: string): Promise<ImportColumnSettings> {
    return this.http.delete<ImportColumnSettings>("/api/admin/settings/import-columns", { token });
  }

  async getDisplay(token: string): Promise<DisplaySettings> {
    return this.http.get<DisplaySettings>("/api/admin/settings/display", { token });
  }

  async saveDisplay(settings: DisplaySettings, token: string): Promise<DisplaySettings> {
    return this.http.put<DisplaySettings>("/api/admin/settings/display", settings, { token });
  }
}
