"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MobileCategoryDrawer } from "@/components/layout/MobileCategoryDrawer";
import { StoreHeader, type StoreHeaderLabels } from "@/components/layout/StoreHeader";
import { UtilityBar, type UtilityBarLink } from "@/components/layout/UtilityBar";
import { IconButton } from "@/components/ui/IconButton";
import { useAuth } from "@/hooks/useAuth";
import { getAccountDisplayName, getAccountStatusLabel } from "@/lib/auth/accountDisplay";

const ADMIN_ROLE = "admin";

export interface ShopHeaderLabels extends StoreHeaderLabels {
  signOut: string;
  adminPanel: string;
  utilityMessage: string;
  orderHelp: string;
  supportPhone: string;
}

const DEFAULT_LABELS: ShopHeaderLabels = {
  searchPlaceholder: "Search products, articles or EAN…",
  submitSearch: "Search",
  searchIcon: "Search",
  saved: "Saved",
  cart: "Cart",
  account: "Business account",
  cancelSearch: "Cancel",
  openMenu: "Category menu",
  closeMenu: "Close menu",
  signOut: "Sign out",
  adminPanel: "Admin panel",
  utilityMessage: "Welcome!",
  orderHelp: "How ordering works",
  supportPhone: "",
};

export interface ShopHeaderProps {
  labels?: Partial<ShopHeaderLabels>;
}

/**
 * Store header wired to the current auth session.
 *
 * Shows the sign-in action for guests, and the signed-in business's name plus
 * account status and a sign-out action once authenticated.
 */
export function ShopHeader({ labels: labelsProp }: ShopHeaderProps) {
  const labels = { ...DEFAULT_LABELS, ...labelsProp };
  const router = useRouter();
  const { user, logout } = useAuth();
  const isAdmin = user?.role === ADMIN_ROLE;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // Always a defined string (never `undefined`) so the input stays a controlled component
  // from the very first render - an `undefined` value here left it effectively uncontrolled,
  // which is what caused the hydration mismatch on mobile Safari (it restores/autofills a
  // previous value into an uncontrolled field before React hydrates).
  const [search, setSearch] = useState("");

  const handleLogin = (): void => {
    setMobileMenuOpen(false);
    router.push("/login");
  };

  const handleLogout = (): void => {
    setMobileMenuOpen(false);
    logout();
    router.push("/");
  };

  const handleAdminPanel = (): void => {
    setMobileMenuOpen(false);
    router.push("/admin");
  };

  const utilityLinks: UtilityBarLink[] = [
    { label: labels.orderHelp, icon: "circle-help" },
    { label: labels.supportPhone, icon: "phone" },
    ...(isAdmin ? [{ label: labels.adminPanel, href: "/admin", icon: "shield-check" } satisfies UtilityBarLink] : []),
  ];

  return (
    <>
      <UtilityBar message={ labels.utilityMessage } links={ utilityLinks } />
      <StoreHeader
        user={ user ? { name: getAccountDisplayName(user) } : null }
        cartTotal={ user ? getAccountStatusLabel(user) : undefined }
        search={ search }
        onSearchChange={ (event) => setSearch(event.target.value) }
        onLogin={ handleLogin }
        right={ user ? <IconButton icon="log-out" label={ labels.signOut } onClick={ handleLogout } className="hidden md:inline-flex" /> : null }
        menuOpen={ mobileMenuOpen }
        onMenuToggle={ () => setMobileMenuOpen((open) => !open) }
        labels={ labels }
      />
      <MobileCategoryDrawer
        open={ mobileMenuOpen }
        tree={ [] }
        onClose={ () => setMobileMenuOpen(false) }
        user={ user ? { name: getAccountDisplayName(user) } : null }
        cartTotal={ user ? getAccountStatusLabel(user) : undefined }
        isAdmin={ isAdmin }
        onLogin={ handleLogin }
        onLogout={ handleLogout }
        onAdminPanel={ handleAdminPanel }
        labels={ {
          saved: labels.saved,
          cart: labels.cart,
          account: labels.account,
          signOut: labels.signOut,
          adminPanel: labels.adminPanel,
        } }
      />
    </>
  );
}
