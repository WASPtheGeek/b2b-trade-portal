"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";
import type { CatalogMenuDepartment, CategoryTreeChild } from "@/types/catalog";

export interface CatalogMegaMenuProps {
  open: boolean;
  departments: CatalogMenuDepartment[];
  onClose?: () => void;
  onPick?: () => void;
  className?: string;
}

/* Catalogue mega-menu opened by DepartmentNav's "Katalogs" button: a department rail (hover
   to preview) on the left, that department's subcategory groups on the right. Ported from
   src/design/ui_kits/storefront/StoreChrome.jsx's MegaMenu. The panel's height animates via
   a grid-template-rows 0fr/1fr trick since the content's natural height isn't known upfront. */
export function CatalogMegaMenu({ open, departments, onClose, onPick, className }: CatalogMegaMenuProps) {
  const [activeId, setActiveId] = useState(departments[0]?.id);
  const active = departments.find((d) => d.id === activeId) ?? departments[0];

  return (
    <>
      <div
        aria-hidden
        onClick={ onClose }
        className={ cn(
          "fixed inset-0 z-[41] bg-[rgba(16,16,16,.34)] transition-opacity duration-slow ease-standard",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        ) }
      />
      <div
        inert={ !open }
        className={ cn(
          "sticky z-[43] grid overflow-hidden bg-surface-card border-b transition-[grid-template-rows,opacity,box-shadow] duration-base ease-standard",
          open ? "grid-rows-[1fr] opacity-100 border-border-warm shadow-lg" : "grid-rows-[0fr] opacity-0 border-transparent shadow-none",
          className,
        ) }
        style={ { top: "calc(var(--store-header-h) + var(--dept-nav-h))" } }
      >
        <div className="overflow-hidden">
          <div className="max-w-layout-max mx-auto px-gutter flex min-h-[300px]">
            <ul className="list-none m-0 py-3.5 w-[250px] flex-none border-r border-border-subtle">
              { departments.map((d) => (
                <li key={ d.id }>
                  <button
                    type="button"
                    onMouseEnter={ () => setActiveId(d.id) }
                    onClick={ onPick }
                    className={ cn(
                      "flex items-center w-full gap-2 py-[9px] pr-3.5 pl-0.5 border-none bg-transparent cursor-pointer text-left font-sans text-[length:var(--font-size-base)]",
                      d.id === activeId ? "font-semibold text-orange-700" : "font-normal text-text-body",
                    ) }
                  >
                    <span className="flex-1">
                      { d.label }
                      { d.count != null && d.groups.length === 0 ? <span className="ml-1 font-mono text-text-disabled">({ d.count })</span> : null }
                    </span>
                    <Icon name="chevron-right" size={ 14 } className={ d.id === activeId ? "text-orange-600" : "text-text-disabled" } />
                  </button>
                </li>
              )) }
            </ul>
            <div className="flex-1 min-w-0 py-5 pb-6 pl-[30px] grid grid-cols-3 gap-[26px]">
              { active?.groups.map((g, i) => (
                <div key={ g.title || `_${ i }` }>
                  { g.title ? (
                    <h4 className="font-mono text-[length:var(--font-size-base)] font-medium tracking-[.12em] uppercase text-text-strong">{ g.title }</h4>
                  ) : null }
                  <div className={ g.title ? "mt-3" : "mt-0" }>
                    <CatalogMenuItemList items={ g.items } depth={ 0 } onPick={ onPick } />
                  </div>
                </div>
              )) }
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* Recurses over a column's items to arbitrary depth - the mega-menu's columns aren't
   collapsible the way the mobile drawer's rows are (it's a hover preview, everything shows
   at once), so a deeper category just nests further indented in the same column instead of
   needing its own toggle. */
function CatalogMenuItemList({ items, depth, onPick }: { items: CategoryTreeChild[]; depth: number; onPick?: () => void }) {
  return (
    <ul className={ cn("list-none m-0 p-0 flex flex-col gap-2", depth > 0 && "mt-2") }>
      { items.map((item) => (
        <li key={ item.id }>
          <a
            href="#"
            onClick={ (e) => {
              e.preventDefault();
              onPick?.();
            } }
            style={ { paddingLeft: depth * 14 } }
            className="block text-[length:var(--font-size-base)] text-text-muted no-underline hover:text-text-body"
          >
            { item.label }
            { item.count != null && !item.children?.length ? <span className="ml-1 font-mono text-text-disabled">({ item.count })</span> : null }
          </a>
          { item.children?.length ? <CatalogMenuItemList items={ item.children } depth={ depth + 1 } onPick={ onPick } /> : null }
        </li>
      )) }
    </ul>
  );
}
