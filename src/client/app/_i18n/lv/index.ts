import type { Dictionary } from "../Dictionary";
import { adminNav } from "./adminNav";
import { adminProductList } from "./adminProductList";
import { adminSidebar } from "./adminSidebar";
import { authCard } from "./authCard";
import { brandForm } from "./brandForm";
import { brandList } from "./brandList";
import { categoryForm } from "./categoryForm";
import { categoryList } from "./categoryList";
import { categoryPage } from "./categoryPage";
import { guestBrowseCta } from "./guestBrowseCta";
import { loginForm } from "./loginForm";
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
  authCard,
  guestBrowseCta,
  loginForm,
  registerForm,
  registerConfirmation,
  adminSidebar,
  adminNav,
  adminProductList,
  productForm,
  categoryList,
  categoryForm,
  brandList,
  brandForm,
};
