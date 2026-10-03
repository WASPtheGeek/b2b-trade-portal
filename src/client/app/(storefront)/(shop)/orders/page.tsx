"use client";

import { dictionary } from "@/app/_i18n";
import { OrdersPage } from "@/components/features/shop/OrdersPage";

export default function OrdersRoutePage() {
  return (
    <div className="relative flex-1 bg-surface-warm">
      <OrdersPage labels={ dictionary.ordersPage } />
    </div>
  );
}
