"use client";

import { useEffect, useState } from "react";

const DEFAULT_DELAY_MS = 200;

/**
 * Returns `true` only once `active` has stayed `true` continuously for at least `delayMs`.
 *
 * Meant for loading indicators: gating on this instead of the raw loading flag means a
 * request that resolves quickly never shows a spinner at all, avoiding the flash-then-swap
 * "jump" that comes from briefly rendering a loading state with a different height than the
 * content that replaces it.
 */
export function useDelayedFlag(active: boolean, delayMs: number = DEFAULT_DELAY_MS): boolean {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (!active) {
      // Syncing this internal visibility flag to the caller's `active` prop is exactly what
      // this effect is for, not incidental setup - there's no way to express "hide as soon as
      // active goes false" as a value derived purely from render.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShown(false);

      return;
    }

    const timer = setTimeout(() => setShown(true), delayMs);

    return () => clearTimeout(timer);
  }, [active, delayMs]);

  return shown;
}
