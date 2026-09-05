"use client";

import { useEffect, useRef, useState, type ChangeEventHandler, type HTMLAttributes, type ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { Logo } from "@/components/ui/Logo";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";

export interface StoreHeaderUser {
  name: string;
}

export interface StoreHeaderLabels {
  searchPlaceholder: string;
  submitSearch: string;
  searchIcon: string;
  saved: string;
  cart: string;
  account: string;
  cancelSearch: string;
  openMenu: string;
  closeMenu: string;
}

const DEFAULT_LABELS: StoreHeaderLabels = {
  searchPlaceholder: "Search products, articles or EAN…",
  submitSearch: "Search",
  searchIcon: "Search",
  saved: "Saved",
  cart: "Cart",
  account: "Business account",
  cancelSearch: "Cancel",
  openMenu: "Category menu",
  closeMenu: "Close menu",
};

export interface StoreHeaderProps extends HTMLAttributes<HTMLDivElement> {
  logoSrc?: string;
  savedCount?: number;
  onSaved?: () => void;
  search?: string;
  onSearchChange?: ChangeEventHandler<HTMLInputElement>;
  onSearchSubmit?: () => void;
  cartCount?: number;
  cartTotal?: string;
  user?: StoreHeaderUser | null;
  onLogin?: () => void;
  onCart?: () => void;
  right?: ReactNode;
  menuOpen?: boolean;
  onMenuToggle?: () => void;
  labels?: Partial<StoreHeaderLabels>;
}

function SearchField({
  search,
  onSearchChange,
  onSearchSubmit,
  autoFocus,
  placeholder,
  submitLabel,
  className,
}: {
  search?: string;
  onSearchChange?: ChangeEventHandler<HTMLInputElement>;
  onSearchSubmit?: () => void;
  autoFocus?: boolean;
  placeholder: string;
  submitLabel: string;
  className?: string;
}) {
  const [focus, setFocus] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Both the default and "searching" rows stay mounted (see StoreHeader) so their swap can
  // cross-fade, so the native `autoFocus` attribute (which only fires once, on mount) can't
  // focus this field each time it reappears - focus it manually whenever the caller flips
  // `autoFocus` on instead.
  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  return (
    <form
      onSubmit={ (e) => {
        e.preventDefault();
        onSearchSubmit?.();
      } }
      className={ cn(
        "min-w-0 flex items-center h-10 rounded-pill overflow-hidden border transition-[border-color,box-shadow] duration-fast ease-standard bg-warm-50",
        focus ? "border-orange-500 shadow-[var(--focus-ring-shadow)]" : "border-border-warm",
        className,
      ) }
    >
      <input
        ref={ inputRef }
        value={ search }
        onChange={ onSearchChange }
        onFocus={ () => setFocus(true) }
        onBlur={ () => setFocus(false) }
        placeholder={ placeholder }
        className="flex-1 min-w-0 h-[38px] pl-[18px] pr-1.5 border-none outline-hidden bg-transparent font-sans text-[13.5px] text-text-strong"
      />
      <button
        type="submit"
        aria-label={ submitLabel }
        className="flex-none flex items-center justify-center w-[52px] h-[38px] border-none bg-brand text-white cursor-pointer"
      >
        <Icon name="search" size={ 16 } />
      </button>
    </form>
  );
}

/* White header with the scoped search. Semi-transparent + blurred once the page scrolls, so
   the catalogue reads through it instead of being cut off by a solid bar. Below md, the
   inline search bar collapses to an icon that expands into a full-width search row (the
   design's HomeMobileScreen "searching" state), since logo + search + saved + cart + login
   don't fit a phone-width row at once. Below md a hamburger button also appears, flipping to
   an "x" while open - the caller renders whatever it opens (MobileCategoryDrawer, in the
   design's HomeMobileScreen). */
export function StoreHeader({
  logoSrc,
  savedCount,
  onSaved,
  search,
  onSearchChange,
  onSearchSubmit,
  cartCount,
  cartTotal,
  user,
  onLogin,
  onCart,
  right,
  menuOpen = false,
  onMenuToggle,
  labels: labelsProp,
  className,
  ...rest
}: StoreHeaderProps) {
  const labels = { ...DEFAULT_LABELS, ...labelsProp };
  const [scrolled, setScrolled] = useState(false);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const accountAction = user ? (
    <button onClick={ onCart } className="flex items-center gap-[9px] h-10 pl-3 pr-1.5 bg-transparent border-none cursor-pointer text-left">
      <span className="hidden md:flex flex-col leading-[1.25]">
        <span className="text-[12.5px] font-semibold text-text-strong whitespace-nowrap">{ user.name }</span>
        <span className="text-[11px] text-text-subtle whitespace-nowrap">{ cartTotal }</span>
      </span>
    </button>
  ) : (
    <Button variant="primary" pill size="md" icon="user" onClick={ onLogin } className="px-3 md:px-4">
      <span className="hidden md:inline">{ labels.account }</span>
    </Button>
  );

  return (
    <div
      className={ cn(
        "sticky top-0 z-[45] border-b transition-[background-color,box-shadow,border-color] duration-base ease-standard",
        scrolled
          ? "bg-white/86 backdrop-blur-[14px] backdrop-saturate-[180%] border-border-warm shadow-[0_1px_14px_rgba(26,26,26,0.06)]"
          : "bg-surface-card border-transparent shadow-none",
        className,
      ) }
      { ...rest }
    >
      <div className="relative max-w-layout-max mx-auto h-store-header px-gutter">
        {/* Both rows stay mounted so the swap between them can cross-fade instead of
            popping instantly - conditionally rendering one or the other would unmount/
            remount completely different DOM, which CSS can't transition between. */}
        <div
          aria-hidden={ searching }
          inert={ searching }
          style={ { transition: "opacity var(--dur-base) var(--ease-standard), translate var(--dur-base) var(--ease-out)" } }
          className={ cn(
            "absolute inset-0 flex items-center gap-3 md:gap-5",
            searching ? "opacity-0 -translate-y-1 pointer-events-none" : "opacity-100 translate-y-0",
          ) }
        >
          <Link href="/" className="flex-none flex items-center">
            <Logo height={ 32 } src={ logoSrc } />
          </Link>

          <SearchField
            search={ search }
            onSearchChange={ onSearchChange }
            onSearchSubmit={ onSearchSubmit }
            placeholder={ labels.searchPlaceholder }
            submitLabel={ labels.submitSearch }
            className="hidden md:flex flex-1 max-w-[720px]"
          />

          <div className="flex items-center gap-1.5 md:gap-2.5 ml-auto flex-none">
            { right }
            <IconButton icon="search" label={ labels.searchIcon } size="md" className="md:hidden" onClick={ () => setSearching(true) } />
            <IconButton icon="heart" label={ labels.saved } size="md" badge={ savedCount || undefined } onClick={ onSaved } />
            <IconButton icon="shopping-cart" label={ labels.cart } size="md" badge={ cartCount || undefined } onClick={ onCart } />
            { accountAction }
            <IconButton
              icon={ menuOpen ? "x" : "menu" }
              label={ menuOpen ? labels.closeMenu : labels.openMenu }
              size="md"
              className="md:hidden"
              onClick={ onMenuToggle }
            />
          </div>
        </div>

        <div
          aria-hidden={ !searching }
          inert={ !searching }
          style={ { transition: "opacity var(--dur-base) var(--ease-standard), translate var(--dur-base) var(--ease-out)" } }
          className={ cn(
            "absolute inset-0 flex items-center gap-3",
            searching ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1 pointer-events-none",
          ) }
        >
          <SearchField
            search={ search }
            onSearchChange={ onSearchChange }
            onSearchSubmit={ onSearchSubmit }
            autoFocus={ searching }
            placeholder={ labels.searchPlaceholder }
            submitLabel={ labels.submitSearch }
            className="flex-1"
          />
          <Button variant="link" size="sm" onClick={ () => setSearching(false) } className="flex-none">
            { labels.cancelSearch }
          </Button>
        </div>
      </div>
    </div>
  );
}
