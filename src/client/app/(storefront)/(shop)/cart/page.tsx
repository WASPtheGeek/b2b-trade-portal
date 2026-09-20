"use client";

import { dictionary } from "@/app/_i18n";
import { CartPage } from "@/components/features/shop/CartPage";

export default function CartRoutePage() {
  return (
    <div className="relative flex-1 bg-surface-warm">
      <CartPage labels={ dictionary.cartPage } />
    </div>
  );
}
