"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import type { CategoryTreeItem } from "@/types/catalog";

export interface MobileCategoryDrawerLabels {
  /** aria-label for the dialog itself. */
  dialogLabel: string;
  /** Visible header text. */
  title: string;
  orders: string;
  saved: string;
}

const DEFAULT_LABELS: MobileCategoryDrawerLabels = {
  dialogLabel: "Category menu",
  title: "Categories",
  orders: "Orders",
  saved: "Saved",
};

export interface MobileCategoryDrawerProps {
  open: boolean;
  tree: CategoryTreeItem[];
  onClose?: () => void;
  onPick?: (childId: string) => void;
  /** CSS length for how much header chrome sits above the drawer (e.g. UtilityBar +
   * StoreHeader stacked) - the drawer starts right below it. Defaults to just
   * StoreHeader's own height. */
  topOffset?: string;
  labels?: Partial<MobileCategoryDrawerLabels>;
  className?: string;
}

/* Full-width category drawer that slides smoothly down from just under StoreHeader, over a
   blurred scrim covering the rest of the page - the mobile counterpart to CatalogMegaMenu,
   opened by StoreHeader's hamburger button on narrow screens. Adapted from
   src/design/ui_kits/storefront/HomeMobileScreen.jsx's "collapsible top category menu"
   (which slides from the very top, covering the header too): here the header stays visible
   above the drawer instead, so the slide starts at its bottom edge. One department's
   children open at a time. */
export function MobileCategoryDrawer({
  open,
  tree,
  onClose,
  onPick,
  topOffset = "var(--store-header-h)",
  labels: labelsProp,
  className,
}: MobileCategoryDrawerProps) {
  const labels = { ...DEFAULT_LABELS, ...labelsProp };
  const [openId, setOpenId] = useState<string | undefined>(tree[0]?.id);

  return (
    <>
      <div
        aria-hidden
        onClick={ onClose }
        style={ { top: topOffset, transition: "opacity var(--dur-slow) var(--ease-standard)" } }
        className={ cn(
          "fixed inset-x-0 bottom-0 z-[46] bg-[rgba(16,16,16,.44)] backdrop-blur-[6px]",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        ) }
      />
      <div
        role="dialog"
        aria-label={ labels.dialogLabel }
        inert={ !open }
        style={ {
          top: topOffset,
          // Expanding max-height (rather than translating the whole panel down from
          // above) keeps the reveal anchored right at the header's bottom edge, instead
          // of visibly sliding in from off the top of the screen.
          maxHeight: open ? `calc(92% - ${topOffset})` : "0px",
          // Tailwind's duration-*/ease-* utility classes rely on a --duration-* theme
          // namespace Tailwind v4 doesn't actually support (see globals.css) - it silently
          // drops the utility, leaving transitions stuck at Tailwind's 150ms default. Set
          // the transition inline instead, referencing the working --dur-*/--ease-* tokens
          // directly (same pattern ScrollReveal.tsx already uses for the same reason).
          transition: "max-height var(--dur-slower) var(--ease-out), opacity var(--dur-slower) var(--ease-out)",
        } }
        className={ cn(
          "fixed inset-x-0 z-[47] flex flex-col overflow-hidden rounded-b-[24px] bg-surface-page shadow-lg",
          open ? "opacity-100" : "opacity-0",
          className,
        ) }
      >
        <div className="flex flex-none items-center border-b border-border-warm bg-surface-card px-4 py-2.5">
          <strong className="text-[15px] font-semibold text-text-strong">{ labels.title }</strong>
        </div>
        <div className="elk-scroll-y min-h-0 flex-1 px-2.5 pt-2 pb-1">
          { tree.map((group) => {
            const isOpen = openId === group.id;

            return (
              <div key={ group.id } className="border-b border-border-subtle">
                <button
                  type="button"
                  aria-expanded={ isOpen }
                  onClick={ () => setOpenId(isOpen ? undefined : group.id) }
                  className="flex min-h-[52px] w-full cursor-pointer items-center gap-2.5 border-none bg-transparent px-2 text-left font-sans text-[14.5px] font-semibold text-text-strong"
                >
                  <span className="min-w-0 flex-1">{ group.label }</span>
                  <span className="font-mono text-[11.5px] text-text-disabled">{ group.count }</span>
                  <Icon
                    name="chevron-down"
                    size={ 16 }
                    className={ cn("text-text-muted transition-transform duration-base ease-out", isOpen && "rotate-180") }
                  />
                </button>
                <div className={ cn("grid transition-[grid-template-rows] duration-slow ease-out", isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]") }>
                  <div className="overflow-hidden">
                    <div className="flex flex-col pb-2">
                      { group.children.map((c) => (
                        <button
                          key={ c.id }
                          type="button"
                          onClick={ () => onPick?.(c.id) }
                          className="flex min-h-11 w-full cursor-pointer items-center gap-2.5 border-none bg-transparent pr-2 pl-4 text-left font-sans text-[13.5px] text-text-body"
                        >
                          <span className="min-w-0 flex-1">{ c.label }</span>
                          <span className="font-mono text-[11px] text-text-disabled">{ c.count }</span>
                          <Icon name="chevron-right" size={ 14 } className="text-text-muted" />
                        </button>
                      )) }
                    </div>
                  </div>
                </div>
              </div>
            );
          }) }
        </div>
        <div className="flex flex-none gap-1.5 border-t border-border-warm bg-surface-card px-3 py-2.5">
          <Button size="lg" variant="secondary" icon="package" className="min-w-0 flex-1" onClick={ onClose }>
            { labels.orders }
          </Button>
          <Button size="lg" variant="secondary" icon="heart" className="min-w-0 flex-1" onClick={ onClose }>
            { labels.saved }
          </Button>
        </div>
      </div>
    </>
  );
}
