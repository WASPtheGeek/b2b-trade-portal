"use client";

import { useCallback, useEffect, useState } from "react";
import { tokenStorage } from "@/lib/auth/tokenStorageInstance";
import { resolveErrorMessage } from "@/lib/http/resolveErrorMessage";
import { settingsService } from "@/services/settingsServiceInstance";
import { DEFAULT_DISPLAY_SETTINGS, type DisplaySettings } from "@/types/settings";

const DEFAULT_SAVE_ERROR = "Failed to save the display settings. Please try again.";

export interface UseDisplaySettingsOptions {
  saveErrorMessage?: string;
}

export interface DisplaySettingsState {
  /** The current settings - the defaults until loaded (or if loading fails). */
  settings: DisplaySettings;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  /** Whether the last save succeeded. */
  justSaved: boolean;
  /** Saves the given changes merged into the current settings. */
  update(changes: Partial<DisplaySettings>): Promise<void>;
}

/** Owns the shared admin display preferences. Load failures fall back to the defaults silently,
 * since tables only use these as starting values. */
export function useDisplaySettings({ saveErrorMessage = DEFAULT_SAVE_ERROR }: UseDisplaySettingsOptions = {}): DisplaySettingsState {
  const [settings, setSettings] = useState<DisplaySettings>(DEFAULT_DISPLAY_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    const token = tokenStorage.getToken();

    if (!token) {
      return;
    }

    settingsService.getDisplay(token)
      .then(setSettings)
      .catch(() => {
        // Keep the defaults - see the hook's doc comment.
      })
      .finally(() => setIsLoading(false));
  }, []);

  const update = useCallback(async (changes: Partial<DisplaySettings>): Promise<void> => {
    const token = tokenStorage.getToken();

    if (!token) {
      return;
    }

    const next = { ...settings, ...changes };

    setSettings(next);
    setIsSaving(true);
    setError(null);
    setJustSaved(false);

    try {
      setSettings(await settingsService.saveDisplay(next, token));
      setJustSaved(true);
    }
    catch (caught) {
      setSettings(settings);
      setError(resolveErrorMessage(caught, saveErrorMessage));
    }
    finally {
      setIsSaving(false);
    }
  }, [settings, saveErrorMessage]);

  return { settings, isLoading, isSaving, error, justSaved, update };
}
