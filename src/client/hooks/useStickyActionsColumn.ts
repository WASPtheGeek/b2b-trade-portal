"use client";

import { useState } from "react";
import { useDisplaySettings } from "@/hooks/useDisplaySettings";

export interface StickyActionsColumnState {
  stickyActions: boolean;
  setStickyActions(value: boolean): void;
}

/** The "pin actions column" toggle of an admin table: starts from the shared display setting,
 * and a per-page toggle overrides it until the page is left. */
export function useStickyActionsColumn(): StickyActionsColumnState {
  const { settings } = useDisplaySettings();
  const [override, setOverride] = useState<boolean | null>(null);

  return { stickyActions: override ?? settings.stickyActionsColumn, setStickyActions: setOverride };
}
