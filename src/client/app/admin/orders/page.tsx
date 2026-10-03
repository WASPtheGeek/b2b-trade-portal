"use client";

import { dictionary } from "@/app/_i18n";
import { OrderList } from "@/components/features/admin/orders/OrderList";

export default function AdminOrdersPage() {
  return <OrderList labels={ dictionary.adminOrderList } />;
}
