"use client";

import { dictionary } from "@/app/_i18n";
import { AccountPage } from "@/components/features/shop/AccountPage";

export default function AccountRoutePage() {
  return (
    <div className="relative flex-1 bg-surface-warm">
      <AccountPage labels={ dictionary.accountPage } />
    </div>
  );
}
