"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { useDelayedFlag } from "@/hooks/useDelayedFlag";
import { Icon } from "./Icon";
import { Loader } from "./Loader";

export interface DataTableColumn<T> {
  key: string;
  label: string;
  mono?: boolean;
  align?: "left" | "right";
  width?: number;
  wrap?: boolean;
  sortable?: boolean;
  /** Pins the column to the right edge of the scroll container - e.g. a trailing row-actions column that should stay reachable once the table scrolls horizontally. */
  sticky?: "right";
  render?: (row: T, index: number) => ReactNode;
}

/* Shared right-pin styling for a sticky column's <th>/<td> - the background covers whatever
   would otherwise scroll underneath it (it must be opaque, not just the row's own transparent
   default), the inset shadow reads as a ledge, and `will-change-transform` promotes the cell to
   its own compositing layer so its content (e.g. the action icons) doesn't jitter sideways as
   Chromium recomputes collapsed-border geometry on every scroll frame. */
const STICKY_RIGHT = "sticky right-0 will-change-transform shadow-[-6px_0_8px_-6px_rgba(0,0,0,.12)]";
/* Marks the pinned column's left edge - only drawn while there's still column content hidden
   behind it (see `hasHiddenContent` below), so it disappears once scrolled to the end rather
   than falsely implying more content. Uses the side-specific `border-l-*` color utility, not
   the general `border-orange-500`: the latter sets border-color for all four sides, which
   `tailwind-merge` treats as the same conflict group as the `border-border-default`/`-subtle`
   colors used elsewhere on these cells' bottom border - it was winning that conflict and
   tinting the horizontal row-separator border orange too. */
const STICKY_RIGHT_EDGE = "border-l-2 border-l-orange-500";

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
  /** Shows a loading row instead of `rows` - the table shell (header, toolbar around it, the
   * card it sits in) stays mounted throughout, so only the tbody content changes instead of
   * swapping the whole table out for an unrelated loading box. */
  loading?: boolean;
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
  loading = false,
  emptyState,
  footer,
  className,
  moveRowLabel = (position) => `Move row ${position}`,
  reorderHint = "Drag to reorder (Alt + arrows)",
}: DataTableProps<T>) {
  const showLoader = useDelayedFlag(loading);
  const [hover, setHover] = useState<number | null>(null);
  const [drag, setDrag] = useState<number | null>(null);
  const [over, setOver] = useState<{ i: number; after: boolean } | null>(null);
  const [armed, setArmed] = useState<number | null>(null);
  const [hasHiddenContent, setHasHiddenContent] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  // A 1x1 marker pinned to the true right edge of the table's own box (which, unlike the sticky
  // action column, keeps its real layout position there even while its paint position is stuck) -
  // watching whether *it* is scrolled into view sidesteps every scrollWidth/clientWidth rounding
  // and stale-measurement issue that come with computing this by hand from scroll geometry.
  const endSentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = containerRef.current;
    const sentinel = endSentinelRef.current;

    if (!root || !sentinel) {
      return;
    }

    const observer = new IntersectionObserver(([entry]) => setHasHiddenContent(!entry.isIntersecting), {
      root,
      threshold: 1,
    });

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [rows.length, columns.length]);

  const move = (from: number, to: number) => {
    if (from !== to) {
      onReorder?.(from, to);
    }
  };

  const colSpan = columns.length + (selectable ? 1 : 0) + (reorderable ? 1 : 0);

  return (
    <div ref={ containerRef } className={ cn("w-full overflow-x-auto min-h-[320px]", className) }>
      { /* `border-separate`, not `border-collapse`: Chromium (and others) don't reliably apply
        `position: sticky` to table cells when the table uses collapsed borders - the sticky
        column would silently scroll along with everything else instead of staying pinned.
        Separate borders only paint on cells, not rows, so each row's bottom border moves from
        the <tr> onto its <td>s below. */ }
      <table className="relative w-full border-separate border-spacing-0 font-sans text-[14px]">
        <div ref={ endSentinelRef } aria-hidden className="absolute top-0 right-0 w-px h-px pointer-events-none" />
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
                  className={ cn(
                    "h-[38px] px-[var(--cell-pad-x)] bg-surface-subtle border-b border-border-default sticky top-0 z-[1] whitespace-nowrap",
                    c.sticky === "right" && cn(STICKY_RIGHT, "z-[2]", hasHiddenContent && STICKY_RIGHT_EDGE),
                  ) }
                  style={ { textAlign: c.align ?? "left", width: c.width } }
                >
                  <button
                    type="button"
                    disabled={ !sortable }
                    onClick={ () => sortable && onSortChange?.({ key: c.key, dir: on && sort?.dir === "asc" ? "desc" : "asc" }) }
                    className={ cn(
                      "inline-flex items-center gap-1 border-none bg-transparent p-0 font-sans text-[length:var(--font-size-base)] font-semibold tracking-[.055em] uppercase",
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
          { loading ? (
            <tr>
              <td colSpan={ colSpan } className="p-0">
                { showLoader ? (
                  <div className="flex items-center justify-center py-[54px]">
                    <Loader />
                  </div>
                ) : (
                  <div className="py-[54px]" />
                ) }
              </td>
            </tr>
          ) : rows.length === 0 && emptyState ? (
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
              // A sticky cell needs its own opaque background (unlike the row's "bg-transparent"
              // default, which just lets the Card underneath show through) so scrolled-under
              // columns don't bleed through it - kept in sync with the row's hover/drag state.
              const stickyBg = dragging ? "bg-orange-50" : hover === i ? "bg-surface-hover" : "bg-surface-card";

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
                    "transition-[background-color,box-shadow] duration-instant ease-standard",
                    dragging ? "bg-orange-50 opacity-60" : hover === i ? "bg-surface-hover" : "bg-transparent",
                    edge === "top" && "shadow-[inset_0_2px_0_var(--orange-500)]",
                    edge === "bottom" && "shadow-[inset_0_-2px_0_var(--orange-500)]",
                  ) }
                >
                  { reorderable ? (
                    <td className="w-[38px] py-0 pr-0 pb-0 pl-3 border-b border-border-subtle">
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
                  { selectable ? <td className="w-10 py-0 pr-0 pb-0 pl-3.5 border-b border-border-subtle">{ renderSelect?.(r, i) }</td> : null }
                  { columns.map((c) => (
                    <td
                      key={ c.key }
                      className={ cn(
                        "px-[var(--cell-pad-x)] text-text-body border-b border-border-subtle",
                        c.mono ? "font-mono text-[length:var(--font-size-base)] [font-variant-numeric:tabular-nums]" : undefined,
                        c.align === "right" && !c.mono ? "[font-variant-numeric:tabular-nums]" : undefined,
                        c.wrap ? "whitespace-normal" : "whitespace-nowrap",
                        c.sticky === "right" && cn(STICKY_RIGHT, stickyBg, hasHiddenContent && STICKY_RIGHT_EDGE),
                      ) }
                      style={ { height: ROW_HEIGHT[density], textAlign: c.align ?? "left", width: c.width } }
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
