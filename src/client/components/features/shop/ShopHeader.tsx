"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { CatalogMegaMenu } from "@/components/layout/CatalogMegaMenu";
import { DepartmentNav } from "@/components/layout/DepartmentNav";
import { MobileCategoryDrawer } from "@/components/layout/MobileCategoryDrawer";
import { StoreHeader, type StoreHeaderLabels } from "@/components/layout/StoreHeader";
import { UtilityBar, type UtilityBarLink } from "@/components/layout/UtilityBar";
import { Icon } from "@/components/ui/Icon";
import { IconButton } from "@/components/ui/IconButton";
import { useAuth } from "@/hooks/useAuth";
import { useShopCategories } from "@/hooks/useShopCategories";
import { useWishlist } from "@/hooks/useWishlist";
import { getAccountDisplayName, getAccountStatusLabel } from "@/lib/auth/accountDisplay";
import { buildLoginUrl } from "@/lib/auth/returnTo";
import { buildMegaMenuDepartments } from "@/lib/catalog/buildMegaMenuDepartments";
import { filterVisibleCategories } from "@/lib/catalog/filterVisibleCategories";

const ADMIN_ROLE = "admin";

export interface ShopHeaderLabels extends StoreHeaderLabels {
  categories: string;
  scrollDepartmentsLeft: string;
  scrollDepartmentsRight: string;
  orders: string;
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
  categories: "Categories",
  scrollDepartmentsLeft: "Scroll departments left",
  scrollDepartmentsRight: "Scroll departments right",
  orders: "Orders",
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
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { tree: categoryTree } = useShopCategories();
  const { ids: wishlistIds } = useWishlist();
  const isAdmin = user?.role === ADMIN_ROLE;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // Always a defined string (never `undefined`) so the input stays a controlled component
  // from the very first render - an `undefined` value here left it effectively uncontrolled,
  // which is what caused the hydration mismatch on mobile Safari (it restores/autofills a
  // previous value into an uncontrolled field before React hydrates).
  const [search, setSearch] = useState("");
  const [megaOpen, setMegaOpen] = useState(false);
  const [activeDept, setActiveDept] = useState<string | undefined>(undefined);
  const closeMegaTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const openMega = (): void => {
    clearTimeout(closeMegaTimer.current);
    setMegaOpen(true);
  };
  const closeMega = (delay = 0): void => {
    clearTimeout(closeMegaTimer.current);
    closeMegaTimer.current = setTimeout(() => setMegaOpen(false), delay);
  };
  useEffect(() => () => clearTimeout(closeMegaTimer.current), []);

  // DepartmentNav's rail surfaces just the admin-curated "custom navigation node"
  // departments (see CategoryForm's isCustomLabel) regardless of their own menu visibility -
  // it's a shortcut bar, not the full taxonomy. The mega menu it opens is the opposite: the
  // normal, complete menu-visible category tree, independent of which departments got
  // featured as shortcuts above it. The mobile drawer below still browses the full tree.
  const desktopDepartments = categoryTree.filter((department) => department.isCustom);
  const megaCatalog = buildMegaMenuDepartments(filterVisibleCategories(categoryTree));

  const handleLogin = (): void => {
    setMobileMenuOpen(false);
    router.push(buildLoginUrl(pathname));
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

  const handleCategoryPick = (id: string): void => {
    setActiveDept(id);
    setMobileMenuOpen(false);
    closeMega();
    router.push(`/category/${id}`);
  };

  const handleSaved = (): void => {
    setMobileMenuOpen(false);
    router.push("/wishlist");
  };

  const utilityLinks: UtilityBarLink[] = [
    { label: labels.orderHelp, icon: "circle-help" },
    { label: labels.supportPhone, icon: "phone" },
    ...(isAdmin ? [{ label: labels.adminPanel, href: "/admin", icon: "shield-check" } satisfies UtilityBarLink] : []),
  ];

  return (
    <>
      <UtilityBar message={ labels.utilityMessage } links={ utilityLinks } />
      { /* StoreHeader and the categories bar below it (DepartmentNav desktop, the plain
        "Kategorijas" trigger on mobile) share one sticky container rather than each
        sticking independently, so there's only one sticky calculation - see the storefront
        reference for why two independently-sticky bars can drift apart by a pixel on mobile
        scroll. */ }
      <div className="sticky top-0 z-[45]">
        <StoreHeader
          user={ user ? { name: getAccountDisplayName(user) } : null }
          cartTotal={ user ? getAccountStatusLabel(user) : undefined }
          search={ search }
          onSearchChange={ (event) => setSearch(event.target.value) }
          onLogin={ handleLogin }
          savedCount={ wishlistIds.size }
          onSaved={ handleSaved }
          right={ user ? <IconButton icon="log-out" label={ labels.signOut } onClick={ handleLogout } className="hidden md:inline-flex" /> : null }
          menuOpen={ mobileMenuOpen }
          onMenuToggle={ () => setMobileMenuOpen((open) => !open) }
          labels={ labels }
          className="static"
        />
        <div
          onMouseLeave={ () => closeMega(140) }
          onMouseEnter={ () => clearTimeout(closeMegaTimer.current) }
          className="hidden md:block"
        >
          <DepartmentNav
            items={ desktopDepartments.map((department) => ({ id: department.id, label: department.label })) }
            active={ activeDept }
            onSelect={ handleCategoryPick }
            deptOpen={ megaOpen }
            onDeptClick={ () => (megaOpen ? closeMega() : openMega()) }
            deptLabel={ labels.categories }
            scrollLeftLabel={ labels.scrollDepartmentsLeft }
            scrollRightLabel={ labels.scrollDepartmentsRight }
            className="static"
          />
          <CatalogMegaMenu open={ megaOpen } departments={ megaCatalog } onClose={ () => closeMega() } onPick={ handleCategoryPick } />
        </div>
        { /* Mobile-only counterpart to the DepartmentNav bar above: just the branded
          "categories" trigger, opening the same drawer as StoreHeader's own hamburger
          button. */ }
        <button
          type="button"
          aria-expanded={ mobileMenuOpen }
          onClick={ () => setMobileMenuOpen((open) => !open) }
          className="flex md:hidden items-center gap-[9px] w-full h-dept-nav px-gutter border-none bg-brand text-white font-sans text-[length:var(--font-size-base)] font-semibold cursor-pointer whitespace-nowrap"
        >
          <Icon name={ mobileMenuOpen ? "x" : "menu" } size={ 15 } />
          { labels.categories }
        </button>
      </div>
      <MobileCategoryDrawer
        open={ mobileMenuOpen }
        tree={ categoryTree }
        onClose={ () => setMobileMenuOpen(false) }
        onPick={ handleCategoryPick }
        user={ user ? { name: getAccountDisplayName(user) } : null }
        cartTotal={ user ? getAccountStatusLabel(user) : undefined }
        isAdmin={ isAdmin }
        onLogin={ handleLogin }
        onLogout={ handleLogout }
        onAdminPanel={ handleAdminPanel }
        savedCount={ wishlistIds.size }
        onSaved={ handleSaved }
        labels={ {
          dialogLabel: labels.categories,
          orders: labels.orders,
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
