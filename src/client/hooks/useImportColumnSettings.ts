"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { tokenStorage } from "@/lib/auth/tokenStorageInstance";
import { resolveErrorMessage } from "@/lib/http/resolveErrorMessage";
import { settingsService } from "@/services/settingsServiceInstance";
import { DEFAULT_IMPORT_COLUMNS, IMPORT_COLUMN_FIELDS, type ImportColumnField, type ImportColumnSettings } from "@/types/settings";

const DEFAULT_LOAD_ERROR = "Failed to load the import columns. Please try again.";
const DEFAULT_SAVE_ERROR = "Failed to save the import columns. Please try again.";
const DEFAULT_EMPTY_ERROR = "Enter a column name.";
const DEFAULT_DUPLICATE_ERROR = "Another field already uses this column name.";

export interface UseImportColumnSettingsOptions {
  loadErrorMessage?: string;
  saveErrorMessage?: string;
  emptyErrorMessage?: string;
  duplicateErrorMessage?: string;
}

export interface ImportColumnSettingsState {
  /** The saved settings (defaults until loaded). */
  saved: ImportColumnSettings;
  /** The form's current, possibly unsaved values. */
  draft: ImportColumnSettings;
  setColumn(field: ImportColumnField, value: string): void;
  /** Per-field problems with the draft (empty or duplicate names); saving is blocked while any exist. */
  fieldErrors: Partial<Record<ImportColumnField, string>>;
  isDirty: boolean;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  /** Whether the last save/reset succeeded - cleared again by the next edit. */
  justSaved: boolean;
  save(): Promise<void>;
  /** Restores the server defaults (saved immediately). */
  reset(): Promise<void>;
  discard(): void;
}

/**
 * Finds empty and duplicate (case-insensitive, trimmed) header names in a draft.
 *
 * @param draft The edited settings.
 * @param emptyMessage Message for an empty name.
 * @param duplicateMessage Message for a name used by more than one field.
 * @returns The problems, keyed by field.
 */
function validate(draft: ImportColumnSettings, emptyMessage: string, duplicateMessage: string): Partial<Record<ImportColumnField, string>> {
  const errors: Partial<Record<ImportColumnField, string>> = {};
  const counts = new Map<string, number>();

  for (const field of IMPORT_COLUMN_FIELDS) {
    const key = draft[field].trim().toLowerCase();

    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  for (const field of IMPORT_COLUMN_FIELDS) {
    const key = draft[field].trim().toLowerCase();

    if (!key) {
      errors[field] = emptyMessage;
    }
    else if ((counts.get(key) ?? 0) > 1) {
      errors[field] = duplicateMessage;
    }
  }

  return errors;
}

/** Owns the ERP import column mapping: loading it, editing a draft, validating, saving and resetting. */
export function useImportColumnSettings({
  loadErrorMessage = DEFAULT_LOAD_ERROR,
  saveErrorMessage = DEFAULT_SAVE_ERROR,
  emptyErrorMessage = DEFAULT_EMPTY_ERROR,
  duplicateErrorMessage = DEFAULT_DUPLICATE_ERROR,
}: UseImportColumnSettingsOptions = {}): ImportColumnSettingsState {
  const [saved, setSaved] = useState<ImportColumnSettings>(DEFAULT_IMPORT_COLUMNS);
  const [draft, setDraft] = useState<ImportColumnSettings>(DEFAULT_IMPORT_COLUMNS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    const token = tokenStorage.getToken();

    if (!token) {
      return;
    }

    settingsService.getImportColumns(token)
      .then((columns) => {
        setSaved(columns);
        setDraft(columns);
      })
      .catch((caught: unknown) => setError(resolveErrorMessage(caught, loadErrorMessage)))
      .finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fieldErrors = useMemo(
    () => validate(draft, emptyErrorMessage, duplicateErrorMessage),
    [draft, emptyErrorMessage, duplicateErrorMessage],
  );
  const isDirty = IMPORT_COLUMN_FIELDS.some((field) => draft[field] !== saved[field]);

  const setColumn = useCallback((field: ImportColumnField, value: string): void => {
    setDraft((current) => ({ ...current, [field]: value }));
    setJustSaved(false);
  }, []);

  const persist = useCallback(async (request: (token: string) => Promise<ImportColumnSettings>): Promise<void> => {
    const token = tokenStorage.getToken();

    if (!token) {
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const columns = await request(token);

      setSaved(columns);
      setDraft(columns);
      setJustSaved(true);
    }
    catch (caught) {
      setError(resolveErrorMessage(caught, saveErrorMessage));
    }
    finally {
      setIsSaving(false);
    }
  }, [saveErrorMessage]);

  const save = useCallback(async (): Promise<void> => {
    if (Object.keys(fieldErrors).length > 0) {
      return;
    }

    await persist((token) => settingsService.saveImportColumns(draft, token));
  }, [draft, fieldErrors, persist]);

  const reset = useCallback(
    (): Promise<void> => persist((token) => settingsService.resetImportColumns(token)),
    [persist],
  );

  const discard = useCallback((): void => {
    setDraft(saved);
    setJustSaved(false);
  }, [saved]);

  return { saved, draft, setColumn, fieldErrors, isDirty, isLoading, isSaving, error, justSaved, save, reset, discard };
}
