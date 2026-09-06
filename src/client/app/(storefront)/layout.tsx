import type { ReactNode } from "react";
import { dictionary } from "@/app/_i18n";
import { ShopHeader } from "@/components/features/shop/ShopHeader";

/**
 * Shared chrome for every storefront-facing page (the catalog and the
 * login/register screens).
 *
 * A single common parent for both the `(shop)` and `(auth)` route groups
 * rather than each rendering its own `ShopHeader` — that would give each
 * group a different top-level layout branch, so navigating between them
 * (e.g. `/` to `/login`) would remount the header instead of keeping the
 * same instance mounted across the navigation.
 */
export default function StorefrontLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <ShopHeader labels={ dictionary.shopHeader } />
      { children }
    </>
  );
}
