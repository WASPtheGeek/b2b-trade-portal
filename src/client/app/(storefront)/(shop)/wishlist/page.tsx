"use client";

import { dictionary } from "@/app/_i18n";
import { WishlistPage } from "@/components/features/shop/WishlistPage";

export default function WishlistRoutePage() {
  return (
    <div className="relative flex-1 bg-surface-warm">
      <WishlistPage labels={ dictionary.wishlistPage } />
    </div>
  );
}
