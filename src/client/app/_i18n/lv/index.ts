import type { Dictionary } from "../Dictionary";
import { adminProductList } from "./adminProductList";
import { adminSidebarFooter } from "./adminSidebarFooter";
import { authCard } from "./authCard";
import { brandForm } from "./brandForm";
import { brandList } from "./brandList";
import { categoryForm } from "./categoryForm";
import { categoryList } from "./categoryList";
import { guestBrowseCta } from "./guestBrowseCta";
import { loginForm } from "./loginForm";
import { productForm } from "./productForm";
import { registerConfirmation } from "./registerConfirmation";
import { registerForm } from "./registerForm";
import { shopHeader } from "./shopHeader";

/** Latvian dictionary — the only locale implemented so far. */
export const lv: Dictionary = {
  shopHeader,
  authCard,
  guestBrowseCta,
  loginForm,
  registerForm,
  registerConfirmation,
  adminSidebarFooter,
  adminProductList,
  productForm,
  categoryList,
  categoryForm,
  brandList,
  brandForm,
};
