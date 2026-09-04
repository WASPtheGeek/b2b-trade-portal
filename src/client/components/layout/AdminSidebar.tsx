"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";
import { Logo } from "@/components/ui/Logo";
import type { AdminNavGroup } from "@/types/admin";

export interface AdminSidebarProps extends HTMLAttributes<HTMLElement> {
  items: AdminNavGroup[];
  logoSrc?: string;
  footer?: ReactNode;
}

/* Dark 236px nav rail - the admin counterpart to the storefront's DepartmentNav, but there's
   no accompanying top bar: each admin screen renders its own inline page header, so the
   sidebar is the entire chrome. Active state comes from the current route (usePathname),
   not a controlled prop, since every nav item is a real page rather than a client-side view
   switch. */
export function AdminSidebar({ items, logoSrc, footer, className, ...rest }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <nav
      className={ cn("w-admin-sidebar flex-none bg-surface-inverse border-r border-border-inverse flex flex-col", className) }
      { ...rest }
    >
      <div className="h-header flex-none flex items-center gap-[9px] px-4 border-b border-border-inverse">
        <Logo height={ 24 } src={ logoSrc } />
        <span className="text-[10.5px] tracking-[.09em] uppercase text-white/45 font-semibold mt-0.5">Admin</span>
      </div>
      <div className="flex-1 overflow-y-auto py-2.5 px-2 flex flex-col gap-3">
        { items.map((group, gi) => (
          <div key={ group.title ?? gi } className="flex flex-col gap-px">
            { group.title ? (
              <div className="text-[10px] tracking-[.09em] uppercase text-white/34 font-semibold px-2 pt-1.5 pb-1">{ group.title }</div>
            ) : null }
            { group.items.map((it) => {
              // Exact match for "/admin" itself - every other admin route also starts with
              // "/admin/", which would otherwise mark the dashboard link active everywhere.
              const on = it.href === "/admin" ? pathname === "/admin" : pathname === it.href || pathname.startsWith(`${it.href}/`);

              return (
                <Link
                  key={ it.id }
                  href={ it.href }
                  className={ cn(
                    "relative flex items-center gap-[9px] min-h-[34px] px-[9px] rounded-sm no-underline font-sans text-[13px] transition-[background-color,color] duration-base ease-standard",
                    on ? "bg-orange-500/15 text-orange-300 font-semibold" : "text-white/72 font-normal hover:bg-white/6 hover:text-white",
                  ) }
                >
                  { on ? <span aria-hidden className="absolute -left-2 top-1.5 bottom-1.5 w-[2.5px] rounded-[0_2px_2px_0] bg-orange-500" /> : null }
                  <Icon name={ it.icon } size={ 15 } />
                  <span className="flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">{ it.label }</span>
                  { it.badge != null ? (
                    <span className="min-w-[18px] h-[18px] px-[5px] rounded-full bg-brand text-white text-[10.5px] font-semibold flex items-center justify-center [font-variant-numeric:tabular-nums]">
                      { it.badge }
                    </span>
                  ) : null }
                </Link>
              );
            }) }
          </div>
        )) }
      </div>
      { footer ? <div className="flex-none p-3 border-t border-border-inverse">{ footer }</div> : null }
    </nav>
  );
}
