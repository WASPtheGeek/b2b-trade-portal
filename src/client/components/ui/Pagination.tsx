import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon, type IconName } from "./Icon";
import { fmtInt } from "@/lib/money";

const defaultRenderSummary = (from: number, to: number, total: number): ReactNode => (
  <>
    Showing { fmtInt(from) }–{ fmtInt(to) } of { fmtInt(total) }
  </>
);

export interface PaginationProps extends HTMLAttributes<HTMLDivElement> {
  page?: number;
  pageCount?: number;
  total?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  prevLabel?: string;
  nextLabel?: string;
  /** Renders the "showing X-Y of Z" summary - a render prop rather than a plain string
   * since the phrasing/word order isn't the same across languages. */
  renderSummary?: (from: number, to: number, total: number) => ReactNode;
}

function NavButton({ icon, target, label, pageCount, onPageChange }: { icon: IconName; target: number; label: string; pageCount: number; onPageChange?: (page: number) => void }) {
  const disabled = target < 1 || target > pageCount;
  return (
    <button
      type="button"
      aria-label={ label }
      disabled={ disabled }
      onClick={ () => onPageChange?.(target) }
      className={ cn(
        "flex items-center justify-center w-8 h-8 rounded-sm border border-border-default bg-white",
        disabled ? "cursor-not-allowed text-text-disabled" : "cursor-pointer text-text-body",
      ) }
    >
      <Icon name={ icon } size={ 15 } />
    </button>
  );
}

export function Pagination({
  page = 1,
  pageCount = 1,
  total,
  pageSize,
  onPageChange,
  prevLabel = "Previous page",
  nextLabel = "Next page",
  renderSummary = defaultRenderSummary,
  className,
  ...rest
}: PaginationProps) {
  const nums: (number | "…")[] = [];

  if (pageCount <= 7) {
    for (let i = 1; i <= pageCount; i++) {
      nums.push(i);
    }
  }
  else {
    nums.push(1);

    if (page > 3) {
      nums.push("…");
    }

    for (let i = Math.max(2, page - 1); i <= Math.min(pageCount - 1, page + 1); i++) {
      nums.push(i);
    }

    if (page < pageCount - 2) {
      nums.push("…");
    }

    nums.push(pageCount);
  }

  return (
    <div className={ cn("flex items-center justify-between gap-4 flex-wrap", className) } { ...rest }>
      { total != null ? (
        <span className="text-[12.5px] text-text-subtle [font-variant-numeric:tabular-nums]">
          { renderSummary((page - 1) * (pageSize ?? 0) + 1, Math.min(page * (pageSize ?? 0), total), total) }
        </span>
      ) : (
        <span />
      ) }
      <div className="flex items-center gap-1">
        <NavButton icon="chevron-left" target={ page - 1 } label={ prevLabel } pageCount={ pageCount } onPageChange={ onPageChange } />
        { nums.map((n, i) =>
          n === "…" ? (
            <span key={ `e${i}` } className="w-5 text-center text-text-disabled text-[13px]">
              …
            </span>
          ) : (
            <button
              key={ n }
              type="button"
              onClick={ () => onPageChange?.(n) }
              className={ cn(
                "min-w-8 h-8 px-1.5 rounded-sm border font-sans text-[13px] cursor-pointer [font-variant-numeric:tabular-nums]",
                n === page ? "border-transparent bg-neutral-900 text-white font-semibold" : "border-border-default bg-white text-text-body font-normal",
              ) }
            >
              { n }
            </button>
          ),
        ) }
        <NavButton icon="chevron-right" target={ page + 1 } label={ nextLabel } pageCount={ pageCount } onPageChange={ onPageChange } />
      </div>
    </div>
  );
}
