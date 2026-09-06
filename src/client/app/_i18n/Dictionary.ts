import type { AdminSidebarFooterLabels } from "@/components/features/admin/AdminSidebarFooter";
import type { BrandFormLabels } from "@/components/features/admin/brands/BrandForm";
import type { BrandListLabels } from "@/components/features/admin/brands/BrandList";
import type { CategoryFormLabels } from "@/components/features/admin/categories/CategoryForm";
import type { CategoryListLabels } from "@/components/features/admin/categories/CategoryList";
import type { ProductFormLabels } from "@/components/features/admin/products/ProductForm";
import type { ProductListLabels } from "@/components/features/admin/products/ProductList";
import type { AuthCardLabels } from "@/components/features/auth/AuthCard";
import type { LoginFormLabels } from "@/components/features/auth/LoginForm";
import type { RegisterConfirmationLabels } from "@/components/features/auth/RegisterConfirmation";
import type { RegisterFormLabels } from "@/components/features/auth/RegisterForm";
import type { ShopHeaderLabels } from "@/components/features/shop/ShopHeader";

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
  authCard: AuthCardLabels;
  loginForm: LoginFormLabels;
  registerForm: RegisterFormLabels;
  registerConfirmation: RegisterConfirmationLabels;
  adminSidebarFooter: AdminSidebarFooterLabels;
  adminProductList: ProductListLabels;
  productForm: ProductFormLabels;
  categoryList: CategoryListLabels;
  categoryForm: CategoryFormLabels;
  brandList: BrandListLabels;
  brandForm: BrandFormLabels;
}
