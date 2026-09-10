"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";
import { IconButton } from "@/components/ui/IconButton";
import { Logo } from "@/components/ui/Logo";
import type { AdminNavGroup } from "@/types/admin";

export interface AdminSidebarLabels {
  openMenu: string;
  closeMenu: string;
  collapseMenu: string;
  expandMenu: string;
}

const DEFAULT_LABELS: AdminSidebarLabels = {
  openMenu: "Open menu",
  closeMenu: "Close menu",
  collapseMenu: "Collapse menu",
  expandMenu: "Expand menu",
};

const COLLAPSED_STORAGE_KEY = "elkaro-admin-sidebar-collapsed";

export interface AdminSidebarProps extends HTMLAttributes<HTMLElement> {
  items: AdminNavGroup[];
  logoSrc?: string;
  footer?: ReactNode;
  labels?: Partial<AdminSidebarLabels>;
}

/* Dark 236px nav rail on md+ - the admin counterpart to the storefront's DepartmentNav, but
   there's no accompanying top bar there: each admin screen renders its own inline page header,
   so the sidebar is the entire chrome. Below md the rail can't fit, so it collapses into a
   black top bar (logo + hamburger) with the same nav opening as a slide-in drawer instead -
   the admin counterpart to the storefront's StoreHeader hamburger + MobileCategoryDrawer.
   Active state comes from the current route (usePathname), not a controlled prop, since every
   nav item is a real page rather than a client-side view switch. */
export function AdminSidebar({ items, logoSrc, footer, labels: labelsProp, className, ...rest }: AdminSidebarProps) {
  const labels = { ...DEFAULT_LABELS, ...labelsProp };
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    // Close the mobile drawer after following a nav link to a new route - syncing this to
    // the route itself (rather than each Link's onClick) also covers back/forward navigation.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    // Read the saved collapse state after mount (rather than in the initializer) so
    // server and first-paint client markup match - same pattern as CookieBanner's consent read.
    let saved: string | null = null;

    try {
      saved = window.localStorage.getItem(COLLAPSED_STORAGE_KEY);
    } catch {
      saved = null;
    }

    if (saved === "1") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCollapsed(true);
    }
  }, []);

  const toggleCollapsed = (): void => {
    setCollapsed((current) => {
      const next = !current;

      try {
        window.localStorage.setItem(COLLAPSED_STORAGE_KEY, next ? "1" : "0");
      } catch {
        // private browsing mode - the collapse state just won't be remembered next visit
      }

      return next;
    });
  };

  const navGroups = (
    <div className="flex-1 elk-scroll-y py-3 px-3 md:py-4 md:px-3.5 flex flex-col gap-4 md:gap-5 mask-b-from-[calc(100%-28px)] mask-b-to-100%">
      { items.map((group, gi) => (
        <div key={ group.title ?? gi } className="flex flex-col gap-1.5">
          { group.title ? (
            <div
              className={ cn(
                "text-[length:var(--font-size-base)] tracking-[.09em] uppercase text-white/34 font-semibold px-3.5 pt-2.5 pb-2",
                collapsed && "md:hidden",
              ) }
            >
              { group.title }
            </div>
          ) : null }
          { group.items.map((it) => {
            // Exact match for "/admin" itself - every other admin route also starts with
            // "/admin/", which would otherwise mark the dashboard link active everywhere.
            const on = it.href === "/admin" ? pathname === "/admin" : pathname === it.href || pathname.startsWith(`${it.href}/`);

            return (
              <Link
                key={ it.id }
                href={ it.href }
                title={ collapsed ? it.label : undefined }
                className={ cn(
                  "relative flex items-center gap-[10px] md:gap-[12px] min-h-[40px] md:min-h-[48px] px-[13px] md:px-[16px] rounded-sm no-underline font-sans text-[15px] md:text-[18px] transition-[background-color,color] duration-base ease-standard",
                  collapsed && "md:justify-center md:px-0",
                  on ? "bg-orange-500/15 text-orange-300 font-semibold" : "text-white/72 font-normal hover:bg-white/6 hover:text-white",
                ) }
              >
                { on ? <span aria-hidden className="absolute -left-2 top-1.5 bottom-1.5 w-[2.5px] rounded-[0_2px_2px_0] bg-orange-500" /> : null }
                <Icon name={ it.icon } size={ 18 } className="flex-none" />
                <span className={ cn("flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap", collapsed && "md:hidden") }>
                  { it.label }
                </span>
                { it.badge != null ? (
                  <span
                    className={ cn(
                      "min-w-[18px] h-[18px] px-[5px] rounded-full bg-brand text-white text-[length:var(--font-size-base)] font-semibold flex items-center justify-center [font-variant-numeric:tabular-nums]",
                      collapsed && "md:hidden",
                    ) }
                  >
                    { it.badge }
                  </span>
                ) : null }
              </Link>
            );
          }) }
        </div>
      )) }
    </div>
  );

  return (
    <>
      <div className="md:hidden sticky top-0 z-[45] h-header flex-none flex items-center justify-between px-4 bg-surface-inverse border-b border-border-inverse">
        <Link href="/" className="flex items-center">
          <Logo height={ 26 } src={ logoSrc } />
        </Link>
        <IconButton
          icon={ mobileOpen ? "x" : "menu" }
          label={ mobileOpen ? labels.closeMenu : labels.openMenu }
          variant="inverse"
          onClick={ () => setMobileOpen((open) => !open) }
        />
      </div>

      { /* Both the scrim and the panel stay mounted (toggled via opacity/max-height rather
        than being added/removed from the DOM) so closing animates too, not just opening -
        same approach as the storefront's MobileCategoryDrawer. The panel starts right below
        the top bar (`top: var(--header-h)`) and expands its max-height downward from there,
        so the header stays visible and interactive instead of being covered. */ }
      <div
        aria-hidden
        onClick={ () => setMobileOpen(false) }
        style={ { top: "var(--header-h)", transition: "opacity var(--dur-slow) var(--ease-standard)" } }
        className={ cn(
          "md:hidden fixed inset-x-0 bottom-0 z-40 bg-[rgba(16,16,16,.44)] backdrop-blur-[6px]",
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        ) }
      />
      <nav
        role="dialog"
        aria-label={ labels.openMenu }
        inert={ !mobileOpen }
        style={ {
          top: "var(--header-h)",
          maxHeight: mobileOpen ? "calc(100vh - var(--header-h))" : "0px",
          transition: "max-height var(--dur-slower) var(--ease-out), opacity var(--dur-slower) var(--ease-out)",
        } }
        className={ cn(
          "md:hidden fixed inset-x-0 z-40 flex flex-col overflow-hidden bg-surface-inverse border-b border-border-inverse shadow-lg",
          mobileOpen ? "opacity-100" : "opacity-0",
        ) }
      >
        { navGroups }
        { footer ? <div className="flex-none p-3.5 md:p-5 border-t border-border-inverse">{ footer }</div> : null }
      </nav>

      <nav
        className={ cn(
          "hidden md:flex flex-none bg-surface-inverse border-r border-border-inverse flex-col transition-[width] duration-slow ease-standard",
          collapsed ? "w-[84px]" : "w-admin-sidebar",
          className,
        ) }
        { ...rest }
      >
        { collapsed ? null : (
          <div className="h-header flex-none flex items-center px-6 border-b border-border-inverse">
            <Link href="/" className="flex items-center">
              <Logo height={ 50 } src={ logoSrc } />
            </Link>
            <span className="text-[11px] tracking-[.09em] uppercase text-white/45 font-semibold mt-0.5">Admin</span>
          </div>
        ) }
        { navGroups }
        <div
          className={ cn(
            "flex-none border-t border-border-inverse flex items-center gap-2",
            collapsed ? "justify-center p-2" : "justify-between p-3.5 md:p-5",
          ) }
        >
          { collapsed ? null : <div className="min-w-0 flex-1">{ footer }</div> }
          <IconButton
            icon={ collapsed ? "chevron-right" : "chevron-left" }
            label={ collapsed ? labels.expandMenu : labels.collapseMenu }
            variant="inverse"
            onClick={ toggleCollapsed }
          />
        </div>
      </nav>
    </>
  );
}
