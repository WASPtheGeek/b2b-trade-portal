"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "./Icon";

export interface DataTableColumn<T> {
  key: string;
  label: string;
  mono?: boolean;
  align?: "left" | "right";
  width?: number;
  wrap?: boolean;
  sortable?: boolean;
  render?: (row: T, index: number) => ReactNode;
}

export interface DataTableSort {
  key: string;
  dir: "asc" | "desc";
}

export interface DataTableProps<T extends { id?: string | number }> {
  columns: DataTableColumn<T>[];
  rows: T[];
  sort?: DataTableSort;
  onSortChange?: (sort: DataTableSort) => void;
  density?: "compact" | "default" | "relaxed";
  selectable?: boolean;
  renderSelect?: (row: T, index: number) => ReactNode;
  reorderable?: boolean;
  onReorder?: (from: number, to: number) => void;
  /** Renders the whole `<tr>` for a row (e.g. a component with its own layout/columns),
   * bypassing the per-column cell rendering below - `columns` still drives the `<thead>`.
   * Incompatible with `selectable`/`reorderable`, which need their own leading `<td>`. */
  renderRow?: (row: T, index: number) => ReactNode;
  emptyState?: ReactNode;
  footer?: ReactNode;
  className?: string;
  /** aria-label for a reorder handle, given the row's 1-based position. */
  moveRowLabel?: (position: number) => string;
  reorderHint?: string;
}

const ROW_HEIGHT: Record<NonNullable<DataTableProps<never>["density"]>, string> = {
  compact: "var(--spacing-row-compact)",
  default: "var(--spacing-row-default)",
  relaxed: "var(--spacing-row-relaxed)",
};

/* Table with sortable headers, an optional selection column, and native-HTML5-drag row
   reordering (a handle button arms `draggable` on mousedown/touchstart so links, checkboxes
   and row actions elsewhere in the row keep normal pointer behavior). Alt+Arrow on a
   focused handle reorders without a pointer, for keyboard/screen-reader users. */
export function DataTable<T extends { id?: string | number }>({
  columns,
  rows,
  sort,
  onSortChange,
  density = "default",
  selectable = false,
  renderSelect,
  reorderable = false,
  onReorder,
  renderRow,
  emptyState,
  footer,
  className,
  moveRowLabel = (position) => `Move row ${position}`,
  reorderHint = "Drag to reorder (Alt + arrows)",
}: DataTableProps<T>) {
  const [hover, setHover] = useState<number | null>(null);
  const [drag, setDrag] = useState<number | null>(null);
  const [over, setOver] = useState<{ i: number; after: boolean } | null>(null);
  const [armed, setArmed] = useState<number | null>(null);

  const move = (from: number, to: number) => {
    if (from !== to) {
      onReorder?.(from, to);
    }
  };

  const colSpan = columns.length + (selectable ? 1 : 0) + (reorderable ? 1 : 0);

  return (
    <div className={ cn("w-full overflow-x-auto", className) }>
      <table className="w-full border-collapse font-sans text-[13px]">
        <thead>
          <tr>
            { reorderable ? <th className="w-[38px] bg-surface-subtle border-b border-border-default sticky top-0" /> : null }
            { selectable ? <th className="w-10 bg-surface-subtle border-b border-border-default sticky top-0" /> : null }
            { columns.map((c) => {
              const on = sort?.key === c.key;
              const sortable = c.sortable !== false && !!onSortChange;

              return (
                <th
                  key={ c.key }
                  className="h-[38px] px-[var(--cell-pad-x)] bg-surface-subtle border-b border-border-default sticky top-0 z-[1] whitespace-nowrap"
                  style={ { textAlign: c.align ?? "left", width: c.width } }
                >
                  <button
                    type="button"
                    disabled={ !sortable }
                    onClick={ () => sortable && onSortChange?.({ key: c.key, dir: on && sort?.dir === "asc" ? "desc" : "asc" }) }
                    className={ cn(
                      "inline-flex items-center gap-1 border-none bg-transparent p-0 font-sans text-[11px] font-semibold tracking-[.055em] uppercase",
                      c.align === "right" && "flex-row-reverse",
                      sortable ? "cursor-pointer" : "cursor-default",
                      on ? "text-text-strong" : "text-text-subtle",
                    ) }
                  >
                    { c.label }
                    { sortable ? (
                      <Icon
                        name={ on ? (sort?.dir === "asc" ? "chevron-up" : "chevron-down") : "chevrons-up-down" }
                        size={ 12 }
                        className={ on ? "text-orange-600" : "text-neutral-300" }
                      />
                    ) : null }
                  </button>
                </th>
              );
            }) }
          </tr>
        </thead>
        <tbody>
          { rows.length === 0 && emptyState ? (
            <tr>
              <td colSpan={ colSpan } className="p-0">
                { emptyState }
              </td>
            </tr>
          ) : renderRow ? (
            rows.map((r, i) => renderRow(r, i))
          ) : (
            rows.map((r, i) => {
              const dragging = drag === i;
              const edge = over && over.i === i && drag != null && drag !== i ? (over.after ? "bottom" : "top") : null;

              return (
                <tr
                  key={ r.id ?? i }
                  draggable={ reorderable && armed === i }
                  onDragStart={ (e) => {
                    setDrag(i);
                    e.dataTransfer.effectAllowed = "move";
                    e.dataTransfer.setData("text/plain", String(i));
                  } }
                  onDragOver={ (e) => {
                    if (!reorderable || drag == null) return;
                    e.preventDefault();
                    const b = e.currentTarget.getBoundingClientRect();
                    setOver({ i, after: e.clientY > b.top + b.height / 2 });
                  } }
                  onDrop={ (e) => {
                    if (!reorderable || drag == null) return;
                    e.preventDefault();
                    const b = e.currentTarget.getBoundingClientRect();
                    let to = e.clientY > b.top + b.height / 2 ? i + 1 : i;
                    if (drag < to) to -= 1;
                    move(drag, to);
                    setDrag(null);
                    setOver(null);
                    setArmed(null);
                  } }
                  onDragEnd={ () => {
                    setDrag(null);
                    setOver(null);
                    setArmed(null);
                  } }
                  onMouseEnter={ () => setHover(i) }
                  onMouseLeave={ () => setHover(null) }
                  className={ cn(
                    "border-b border-border-subtle transition-[background-color,box-shadow] duration-instant ease-standard",
                    dragging ? "bg-orange-50 opacity-60" : hover === i ? "bg-surface-hover" : "bg-transparent",
                    edge === "top" && "shadow-[inset_0_2px_0_var(--orange-500)]",
                    edge === "bottom" && "shadow-[inset_0_-2px_0_var(--orange-500)]",
                  ) }
                >
                  { reorderable ? (
                    <td className="w-[38px] py-0 pr-0 pb-0 pl-3">
                      <button
                        type="button"
                        aria-label={ moveRowLabel(i + 1) }
                        title={ reorderHint }
                        onMouseDown={ () => setArmed(i) }
                        onTouchStart={ () => setArmed(i) }
                        onMouseUp={ () => setArmed(null) }
                        onKeyDown={ (e) => {
                          if (!e.altKey) {
                            return;
                          }

                          if (e.key === "ArrowUp" && i > 0) {
                            e.preventDefault();
                            move(i, i - 1);
                          }

                          if (e.key === "ArrowDown" && i < rows.length - 1) {
                            e.preventDefault();
                            move(i, i + 1);
                          }
                        } }
                        className={ cn(
                          "flex items-center justify-center w-[26px] h-[26px] border-none rounded-sm cursor-grab transition-[background-color,color] duration-instant ease-standard",
                          hover === i || dragging ? "bg-surface-sunken" : "bg-transparent",
                          dragging ? "text-orange-600" : "text-text-disabled",
                        ) }
                      >
                        <Icon name="grip-vertical" size={ 14 } />
                      </button>
                    </td>
                  ) : null }
                  { selectable ? <td className="w-10 py-0 pr-0 pb-0 pl-3.5">{ renderSelect?.(r, i) }</td> : null }
                  { columns.map((c) => (
                    <td
                      key={ c.key }
                      className={ cn(
                        "px-[var(--cell-pad-x)] text-text-body",
                        c.mono ? "font-mono text-[12.5px] [font-variant-numeric:tabular-nums]" : undefined,
                        c.align === "right" && !c.mono ? "[font-variant-numeric:tabular-nums]" : undefined,
                        c.wrap ? "whitespace-normal" : "whitespace-nowrap",
                      ) }
                      style={ { height: ROW_HEIGHT[density], textAlign: c.align ?? "left" } }
                    >
                      { c.render ? c.render(r, i) : ((r as Record<string, ReactNode>)[c.key] ?? null) }
                    </td>
                  )) }
                </tr>
              );
            })
          ) }
        </tbody>
      </table>
      { footer ? <div className="py-3 px-[var(--cell-pad-x)] border-t border-border-subtle">{ footer }</div> : null }
    </div>
  );
}
