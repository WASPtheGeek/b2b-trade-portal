import type { Dictionary } from "../Dictionary";
import { adminNav } from "./adminNav";
import { adminOrderList } from "./adminOrderList";
import { adminProductList } from "./adminProductList";
import { adminSidebar } from "./adminSidebar";
import { adminUserList } from "./adminUserList";
import { authCard } from "./authCard";
import { brandForm } from "./brandForm";
import { brandList } from "./brandList";
import { cartPage } from "./cartPage";
import { categoryForm } from "./categoryForm";
import { categoryList } from "./categoryList";
import { categoryPage } from "./categoryPage";
import { confirmEmailCard } from "./confirmEmailCard";
import { guestBrowseCta } from "./guestBrowseCta";
import { loginForm } from "./loginForm";
import { ordersPage } from "./ordersPage";
import { productForm } from "./productForm";
import { productPage } from "./productPage";
import { registerConfirmation } from "./registerConfirmation";
import { registerForm } from "./registerForm";
import { shopHeader } from "./shopHeader";
import { storeFooter } from "./storeFooter";
import { wishlistPage } from "./wishlistPage";

/** Latvian dictionary — the only locale implemented so far. */
export const lv: Dictionary = {
  shopHeader,
  storeFooter,
  categoryPage,
  productPage,
  wishlistPage,
  ordersPage,
  cartPage,
  authCard,
  guestBrowseCta,
  loginForm,
  registerForm,
  registerConfirmation,
  confirmEmailCard,
  adminSidebar,
  adminNav,
  adminProductList,
  productForm,
  categoryList,
  categoryForm,
  brandList,
  brandForm,
  adminOrderList,
  adminUserList,
};
