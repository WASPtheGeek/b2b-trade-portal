import type { DisplaySettings, ImportColumnSettings } from "@/types/settings";

/** Admin-managed application settings. Each group can be read, saved, and (where offered) reset to defaults. */
export interface SettingsService {
  getImportColumns(token: string): Promise<ImportColumnSettings>;
  saveImportColumns(columns: ImportColumnSettings, token: string): Promise<ImportColumnSettings>;
  /** Restores the default ERP headers and returns them. */
  resetImportColumns(token: string): Promise<ImportColumnSettings>;
  getDisplay(token: string): Promise<DisplaySettings>;
  saveDisplay(settings: DisplaySettings, token: string): Promise<DisplaySettings>;
}
