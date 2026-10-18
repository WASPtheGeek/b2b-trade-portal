"use client";

import { useCallback, useMemo, useState } from "react";

export interface RowSelectionState {
  /** The selected IDs that are among `visibleIds` - selections hidden by a filter/search don't count. */
  selectedIds: number[];
  isSelected(id: number): boolean;
  toggle(id: number, selected: boolean): void;
  /** Selects every visible row, or clears them all if they're all selected already. */
  toggleAll(): void;
  allSelected: boolean;
  someSelected: boolean;
  clear(): void;
}

/** Owns multi-row checkbox selection for a table whose visible rows can change (search, filters,
 * reloads). Only currently visible rows count as selected, so a bulk action never touches a row
 * the admin can no longer see. */
export function useRowSelection(visibleIds: number[]): RowSelectionState {
  const [selected, setSelected] = useState<ReadonlySet<number>>(() => new Set());

  const selectedIds = useMemo(() => visibleIds.filter((id) => selected.has(id)), [visibleIds, selected]);
  const allSelected = visibleIds.length > 0 && selectedIds.length === visibleIds.length;
  const someSelected = selectedIds.length > 0 && !allSelected;

  const isSelected = useCallback((id: number): boolean => selected.has(id), [selected]);

  const toggle = useCallback((id: number, value: boolean): void => {
    setSelected((current) => {
      const next = new Set(current);

      if (value) {
        next.add(id);
      }
      else {
        next.delete(id);
      }

      return next;
    });
  }, []);

  const toggleAll = useCallback((): void => {
    setSelected(allSelected ? new Set() : new Set(visibleIds));
  }, [allSelected, visibleIds]);

  const clear = useCallback((): void => {
    setSelected(new Set());
  }, []);

  return { selectedIds, isSelected, toggle, toggleAll, allSelected, someSelected, clear };
}
