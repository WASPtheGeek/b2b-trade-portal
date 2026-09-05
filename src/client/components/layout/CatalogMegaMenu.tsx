"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";
import type { CatalogMenuDepartment } from "@/types/catalog";

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
                      "flex items-center w-full gap-2 py-[9px] pr-3.5 pl-0.5 border-none bg-transparent cursor-pointer text-left font-sans text-[13.5px]",
                      d.id === activeId ? "font-semibold text-orange-700" : "font-normal text-text-body",
                    ) }
                  >
                    <span className="flex-1">{ d.label }</span>
                    <Icon name="chevron-right" size={ 14 } className={ d.id === activeId ? "text-orange-600" : "text-text-disabled" } />
                  </button>
                </li>
              )) }
            </ul>
            <div className="flex-1 min-w-0 py-5 pb-6 pl-[30px] grid grid-cols-3 gap-[26px]">
              { active?.groups.map((g) => (
                <div key={ g.title }>
                  <h4 className="font-mono text-[10.5px] font-medium tracking-[.12em] uppercase text-text-strong">{ g.title }</h4>
                  <ul className="list-none m-0 mt-3 p-0 flex flex-col gap-2">
                    { g.links.map((l) => (
                      <li key={ l }>
                        <a
                          href="#"
                          onClick={ (e) => {
                            e.preventDefault();
                            onPick?.();
                          } }
                          className="text-[12.5px] text-text-muted no-underline hover:text-text-body"
                        >
                          { l }
                        </a>
                      </li>
                    )) }
                  </ul>
                </div>
              )) }
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
