"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import type { CategoryTreeChild, CategoryTreeItem } from "@/types/catalog";

export interface MobileCategoryDrawerUser {
  name: string;
}

export interface MobileCategoryDrawerLabels {
  /** aria-label for the dialog itself. */
  dialogLabel: string;
  orders: string;
  saved: string;
  cart: string;
  account: string;
  signOut: string;
  adminPanel: string;
}

const DEFAULT_LABELS: MobileCategoryDrawerLabels = {
  dialogLabel: "Category menu",
  orders: "Orders",
  saved: "Saved",
  cart: "Cart",
  account: "Business account",
  signOut: "Sign out",
  adminPanel: "Admin panel",
};

export interface MobileCategoryDrawerProps {
  open: boolean;
  tree: CategoryTreeItem[];
  onClose?: () => void;
  onPick?: (childId: string) => void;
  /** The signed-in business, or `null`/omitted for a guest. */
  user?: MobileCategoryDrawerUser | null;
  /** Shown under the user's name when signed in (e.g. account status). */
  cartTotal?: string;
  /** Shows the admin panel shortcut when the signed-in user has admin access. */
  isAdmin?: boolean;
  savedCount?: number;
  cartCount?: number;
  onLogin?: () => void;
  onLogout?: () => void;
  onSaved?: () => void;
  onCart?: () => void;
  onAdminPanel?: () => void;
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
  user,
  cartTotal,
  isAdmin = false,
  savedCount,
  cartCount,
  onLogin,
  onLogout,
  onSaved,
  onCart,
  onAdminPanel,
  topOffset = "var(--store-header-h)",
  labels: labelsProp,
  className,
}: MobileCategoryDrawerProps) {
  const labels = { ...DEFAULT_LABELS, ...labelsProp };
  const [openId, setOpenId] = useState<string | undefined>(tree[0]?.id);
  // Every category below the top level toggles independently (a category tree can run
  // arbitrarily deep, so a single "one open at a time" id - fine for the top level's small,
  // fixed list of departments - doesn't generalize below it).
  const [openDescendantIds, setOpenDescendantIds] = useState<ReadonlySet<string>>(new Set());
  const toggleDescendant = (id: string): void => {
    setOpenDescendantIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  // The account row at the very bottom expands in place to reveal every account-scoped
  // action (orders, wishlist, cart, admin, sign-out) - kept out of the primary view so the
  // menu a reader opens to browse categories isn't dominated by account chrome.
  const [accountOpen, setAccountOpen] = useState(false);

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
                  { group.count != null ? (
                    <span className="font-mono text-[length:var(--font-size-base)] text-text-disabled">{ group.count }</span>
                  ) : null }
                  <Icon
                    name="chevron-down"
                    size={ 16 }
                    className={ cn("text-text-muted transition-transform duration-base ease-out", isOpen && "rotate-180") }
                  />
                </button>
                <div className={ cn("grid transition-[grid-template-rows] duration-slow ease-out", isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]") }>
                  <div className="overflow-hidden">
                    <div className="flex flex-col pb-2">
                      <CategoryChildren
                        items={ group.children }
                        depth={ 1 }
                        openIds={ openDescendantIds }
                        onToggle={ toggleDescendant }
                        onPick={ onPick }
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          }) }
        </div>
        { user ? (
          <div className="flex-none border-t border-border-warm bg-surface-card">
            <button
              type="button"
              aria-expanded={ accountOpen }
              onClick={ () => setAccountOpen((o) => !o) }
              className="flex min-h-[64px] w-full cursor-pointer items-center gap-3 border-none bg-transparent px-3 text-left"
            >
              <div className="min-w-0 flex-1">
                <div className="text-[15px] font-semibold text-text-strong truncate">{ user.name }</div>
                { cartTotal ? <div className="text-[length:var(--font-size-base)] text-text-subtle truncate">{ cartTotal }</div> : null }
              </div>
              <Icon
                name="chevron-down"
                size={ 16 }
                className={ cn("flex-none text-text-muted transition-transform duration-base ease-out", accountOpen && "rotate-180") }
              />
            </button>
            <div className={ cn("grid transition-[grid-template-rows] duration-slow ease-out", accountOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]") }>
              <div className="overflow-hidden">
                <div className="flex flex-col gap-2 px-3 pb-3">
                  { isAdmin ? (
                    <Button size="lg" variant="secondary" icon="shield-check" className="w-full" onClick={ onAdminPanel }>
                      { labels.adminPanel }
                    </Button>
                  ) : null }
                  <Button size="lg" variant="secondary" icon="package" className="w-full" onClick={ onClose }>
                    { labels.orders }
                  </Button>
                  <Button size="lg" variant="secondary" icon="heart" className="w-full" onClick={ onSaved }>
                    { labels.saved }{ savedCount ? ` (${ savedCount })` : "" }
                  </Button>
                  <Button size="lg" variant="secondary" icon="shopping-cart" className="w-full" onClick={ onCart }>
                    { labels.cart }{ cartCount ? ` (${ cartCount })` : "" }
                  </Button>
                  <Button size="lg" variant="secondary" icon="log-out" className="w-full" onClick={ onLogout }>
                    { labels.signOut }
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-none border-t border-border-warm bg-surface-card px-3 py-3">
            <Button size="lg" icon="user" className="w-full" onClick={ onLogin }>
              { labels.account }
            </Button>
          </div>
        ) }
      </div>
    </>
  );
}

/* Recurses over a category subtree to arbitrary depth: a node with children toggles its own
   nested list open/closed (independently of its siblings - see `openDescendantIds`), a leaf
   node just picks. Indentation grows with `depth` via inline style since Tailwind has no
   fixed set of step classes to pick from at an unbounded depth. */
function CategoryChildren({
  items,
  depth,
  openIds,
  onToggle,
  onPick,
}: {
  items: CategoryTreeChild[];
  depth: number;
  openIds: ReadonlySet<string>;
  onToggle: (id: string) => void;
  onPick?: (childId: string) => void;
}) {
  const paddingLeft = 16 + depth * 12;

  return (
    <>
      { items.map((item) => {
        if (!item.children?.length) {
          return (
            <button
              key={ item.id }
              type="button"
              onClick={ () => onPick?.(item.id) }
              style={ { paddingLeft } }
              className="flex min-h-11 w-full cursor-pointer items-center gap-2.5 border-none bg-transparent pr-2 text-left font-sans text-[length:var(--font-size-base)] text-text-muted"
            >
              <span className="min-w-0 flex-1">{ item.label }</span>
              { item.count != null ? (
                <span className="font-mono text-[length:var(--font-size-base)] text-text-disabled">{ item.count }</span>
              ) : null }
              <Icon name="chevron-right" size={ 14 } className="text-text-muted" />
            </button>
          );
        }

        const isOpen = openIds.has(item.id);

        return (
          <div key={ item.id }>
            <button
              type="button"
              aria-expanded={ isOpen }
              onClick={ () => onToggle(item.id) }
              style={ { paddingLeft } }
              className="flex min-h-11 w-full cursor-pointer items-center gap-2.5 border-none bg-transparent pr-2 text-left font-sans text-[length:var(--font-size-base)] text-text-body"
            >
              <span className="min-w-0 flex-1">{ item.label }</span>
              { item.count != null ? (
                <span className="font-mono text-[length:var(--font-size-base)] text-text-disabled">{ item.count }</span>
              ) : null }
              <Icon
                name="chevron-down"
                size={ 14 }
                className={ cn("text-text-muted transition-transform duration-base ease-out", isOpen && "rotate-180") }
              />
            </button>
            <div className={ cn("grid transition-[grid-template-rows] duration-slow ease-out", isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]") }>
              <div className="overflow-hidden">
                <div className="flex flex-col pb-1">
                  <CategoryChildren items={ item.children } depth={ depth + 1 } openIds={ openIds } onToggle={ onToggle } onPick={ onPick } />
                </div>
              </div>
            </div>
          </div>
        );
      }) }
    </>
  );
}
