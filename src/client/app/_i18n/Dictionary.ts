import type { AdminNavLabels } from "@/app/admin/adminNav";
import type { OrderListLabels } from "@/components/features/admin/orders/OrderList";
import type { BrandFormLabels } from "@/components/features/admin/brands/BrandForm";
import type { BrandListLabels } from "@/components/features/admin/brands/BrandList";
import type { CategoryFormLabels } from "@/components/features/admin/categories/CategoryForm";
import type { CategoryListLabels } from "@/components/features/admin/categories/CategoryList";
import type { ImportDashboardLabels } from "@/components/features/admin/import/ImportDashboard";
import type { SettingsPageLabels } from "@/components/features/admin/settings/SettingsPage";
import type { ProductFormLabels } from "@/components/features/admin/products/ProductForm";
import type { ProductListLabels } from "@/components/features/admin/products/ProductList";
import type { UserListLabels } from "@/components/features/admin/users/UserList";
import type { AuthCardLabels } from "@/components/features/auth/AuthCard";
import type { GuestBrowseCtaLabels } from "@/components/features/auth/GuestBrowseCta";
import type { LoginFormLabels } from "@/components/features/auth/LoginForm";
import type { RegisterConfirmationLabels } from "@/components/features/auth/RegisterConfirmation";
import type { RegisterFormLabels } from "@/components/features/auth/RegisterForm";
import type { AccountPageLabels } from "@/components/features/shop/AccountPage";
import type { CartPageLabels } from "@/components/features/shop/CartPage";
import type { CategoryPageLabels } from "@/components/features/shop/CategoryPage";
import type { HomePageLabels } from "@/components/features/shop/HomePage";
import type { OrdersPageLabels } from "@/components/features/shop/OrdersPage";
import type { ProductPageLabels } from "@/components/features/shop/ProductPage";
import type { ShopHeaderLabels } from "@/components/features/shop/ShopHeader";
import type { WishlistPageLabels } from "@/components/features/shop/WishlistPage";
import type { AdminSidebarLabels } from "@/components/layout/AdminSidebar";
import type { StoreFooterLabels } from "@/components/layout/StoreFooter";

/**
 * Every localizable string used across the app, grouped by the feature
 * component that owns its shape.
 *
 * Each group's type is imported from the component itself rather than
 * redeclared here, so a component's label contract has exactly one source of
 * truth — this file only aggregates values, it never defines new shapes.
 */
export interface Dictionary {
  shopHeader: ShopHeaderLabels;
  storeFooter: StoreFooterLabels;
  homePage: HomePageLabels;
  categoryPage: CategoryPageLabels;
  productPage: ProductPageLabels;
  wishlistPage: WishlistPageLabels;
  ordersPage: OrdersPageLabels;
  cartPage: CartPageLabels;
  accountPage: AccountPageLabels;
  authCard: AuthCardLabels;
  guestBrowseCta: GuestBrowseCtaLabels;
  loginForm: LoginFormLabels;
  registerForm: RegisterFormLabels;
  registerConfirmation: RegisterConfirmationLabels;
  adminSidebar: AdminSidebarLabels;
  adminNav: AdminNavLabels;
  adminProductList: ProductListLabels;
  productForm: ProductFormLabels;
  categoryList: CategoryListLabels;
  categoryForm: CategoryFormLabels;
  brandList: BrandListLabels;
  brandForm: BrandFormLabels;
  adminOrderList: OrderListLabels;
  adminUserList: UserListLabels;
  adminImportDashboard: ImportDashboardLabels;
  adminSettings: SettingsPageLabels;
}
