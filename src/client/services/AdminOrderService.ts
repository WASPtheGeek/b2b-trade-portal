import type { AdminOrderListQuery, Order, OrderListResult, OrderStatusUpdatePayload } from "@/types/order";

/** Admin order management operations - listing across every business account and
 * transitioning an order's status through its review workflow. */
export interface AdminOrderService {
  list(query: AdminOrderListQuery, token: string): Promise<OrderListResult>;
  getById(id: number, token: string): Promise<Order>;
  updateStatus(id: number, payload: OrderStatusUpdatePayload, token: string): Promise<void>;
}
