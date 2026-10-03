import { OrderStatus } from "@/types/server-enums";

// Mirrors the allowed-transition switch in Admin/OrdersController.UpdateStatus exactly - kept
// here so the admin UI only ever offers a status change the server will actually accept,
// rather than letting an admin pick an invalid one and learn that from a 400 response.
const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.Pending]: [OrderStatus.Confirmed, OrderStatus.Cancelled],
  [OrderStatus.Confirmed]: [OrderStatus.Processing, OrderStatus.Cancelled],
  [OrderStatus.Processing]: [OrderStatus.Shipped, OrderStatus.Cancelled],
  [OrderStatus.Shipped]: [OrderStatus.Delivered, OrderStatus.Refunded],
  [OrderStatus.Delivered]: [OrderStatus.Refunded],
  [OrderStatus.Cancelled]: [],
  [OrderStatus.Refunded]: [],
};

/** The statuses an order in `current` status can be moved to next. */
export function getAllowedNextStatuses(current: string): OrderStatus[] {
  return ALLOWED_TRANSITIONS[current as OrderStatus] ?? [];
}
