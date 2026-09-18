"use client";

import { useLayoutEffect, useState } from "react";

export type CategoryViewMode = "grid" | "list";

const STORAGE_KEY = "elkaro-category-view";

/**
 * The category page's grid/list toggle, kept in `sessionStorage` so switching categories (or
 * reloading) keeps the shopper's last choice instead of always reopening in grid view - cleared
 * once the tab closes, unlike `AdminSidebar`'s `localStorage` collapse state, since this is a
 * browsing preference for the current visit rather than a lasting setting.
 *
 * The stored value is read in a layout effect - not a plain effect - specifically so it lands
 * *before* the browser paints: the first render still has to use `initial` (sessionStorage
 * isn't reachable during SSR, so the server-rendered markup has no other option), but a layout
 * effect's correction runs synchronously post-mount, pre-paint, so a shopper who last chose
 * "list" never actually sees the "grid" frame - unlike a plain effect (which runs after paint)
 * or an `isReady` loading gate (which would hold up every load, including the common case where
 * `initial` was already right, just to cover the rare one where it wasn't).
 */
export function useCategoryViewMode(initial: CategoryViewMode = "grid"): [CategoryViewMode, (mode: CategoryViewMode) => void] {
  const [view, setView] = useState<CategoryViewMode>(initial);

  useLayoutEffect(() => {
    let saved: string | null = null;

    try {
      saved = window.sessionStorage.getItem(STORAGE_KEY);
    } catch {
      saved = null;
    }

    if (saved === "grid" || saved === "list") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setView(saved);
    }
  }, []);

  const setPersistedView = (mode: CategoryViewMode): void => {
    setView(mode);

    try {
      window.sessionStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // private browsing mode - the choice just won't be remembered for the rest of the session
    }
  };

  return [view, setPersistedView];
}
