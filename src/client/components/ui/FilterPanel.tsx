"use client";

import { useState, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "./Icon";
import type { CategoryTreeChild, CategoryTreeItem } from "@/types/catalog";

export interface FilterPanelProps extends HTMLAttributes<HTMLElement> {
  title: string;
  children?: ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
  note?: ReactNode;
  collapseLabel?: string;
  expandLabel?: string;
}

/* Each facet is its own bordered card, stacked with gaps - keeps a long brand list from
   pushing the price filter off screen, and makes each facet feel independently dismissible. */
export function FilterPanel({
  title,
  children,
  collapsible = true,
  defaultOpen = true,
  note,
  collapseLabel = "Collapse",
  expandLabel = "Expand",
  className,
  ...rest
}: FilterPanelProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className={ cn("bg-surface-card border border-border-warm rounded-card overflow-hidden", className) } { ...rest }>
      <button
        type="button"
        disabled={ !collapsible }
        onClick={ () => setOpen((v) => !v) }
        aria-expanded={ open }
        aria-label={ open ? collapseLabel : expandLabel }
        className={ cn(
          "flex w-full items-center gap-2 py-3 px-3.5 border-none bg-transparent text-left",
          collapsible ? "cursor-pointer" : "cursor-default",
          open && "border-b border-border-subtle",
        ) }
      >
        <h3 className="flex-1 text-[13px] font-semibold text-text-strong">{ title }</h3>
        { collapsible ? <Icon name={ open ? "minus" : "plus" } size={ 14 } className="text-text-disabled" /> : null }
      </button>
      { open ? (
        <div className="pt-3 px-3.5 pb-3.5">
          { note ? <p className="text-xs leading-normal text-text-subtle text-balance mb-2.5">{ note }</p> : null }
          { children }
        </div>
      ) : null }
    </section>
  );
}

export interface CategoryPanelListProps {
  nodes?: (CategoryTreeItem | CategoryTreeChild)[];
  selected?: string;
  onSelect?: (id: string) => void;
  depth?: number;
  className?: string;
}

/* Nested category list for the sidebar - the current branch only, with counts. Depth 0 =
   department, depth 1 = group, depth 2 = subgroup. */
export function CategoryPanelList({ nodes = [], selected, onSelect, depth = 0, className }: CategoryPanelListProps) {
  const [hover, setHover] = useState<string | null>(null);

  return (
    <ul className={ cn("list-none m-0 p-0 flex flex-col gap-px", className) }>
      { nodes.map((n) => {
        const on = n.id === selected;
        const hv = hover === n.id;
        const kids = n.children ?? [];

        return (
          <li key={ n.id }>
            <a
              href="#"
              onClick={ (e) => {
                e.preventDefault();
                onSelect?.(n.id);
              } }
              onMouseEnter={ () => setHover(n.id) }
              onMouseLeave={ () => setHover(null) }
              style={ { paddingLeft: depth * 12 } }
              className={ cn(
                "flex items-center gap-1.5 py-[5px] no-underline transition-colors duration-fast ease-standard",
                depth === 0 ? "text-[13px]" : "text-[12.5px]",
                on ? "font-semibold text-orange-700" : depth === 0 ? "font-medium" : "font-normal",
                !on && (hv ? "text-text-strong" : "text-text-body"),
              ) }
            >
              <span className="flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">{ n.label }</span>
              { n.count != null ? (
                <span className={ cn("font-mono text-[11px]", on ? "text-orange-600" : "text-text-disabled") }>({ n.count })</span>
              ) : null }
            </a>
            { kids.length && (on || kids.some((k) => k.id === selected) || depth === 0) ? (
              <CategoryPanelList nodes={ kids } selected={ selected } onSelect={ onSelect } depth={ depth + 1 } />
            ) : null }
          </li>
        );
      }) }
    </ul>
  );
}
