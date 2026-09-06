"use client";

import { useRouter } from "next/navigation";
import { StoreHeader, type StoreHeaderLabels } from "@/components/layout/StoreHeader";
import { IconButton } from "@/components/ui/IconButton";
import { useAuth } from "@/hooks/useAuth";
import { getAccountDisplayName, getAccountStatusLabel } from "@/lib/auth/accountDisplay";

export interface ShopHeaderLabels extends StoreHeaderLabels {
  signOut: string;
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

  const handleLogin = (): void => {
    router.push("/login");
  };

  const handleLogout = (): void => {
    logout();
    router.push("/");
  };

  return (
    <StoreHeader
      user={ user ? { name: getAccountDisplayName(user) } : null }
      cartTotal={ user ? getAccountStatusLabel(user) : undefined }
      onLogin={ handleLogin }
      right={ user ? <IconButton icon="log-out" label={ labels.signOut } onClick={ handleLogout } /> : null }
      labels={ labels }
    />
  );
}
