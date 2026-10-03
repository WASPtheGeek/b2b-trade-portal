import type { CreateOrderPayload, Order, OrderListQuery, OrderListResult } from "@/types/order";

/** The current user's own orders - every method requires a bearer token, since an order
 * history only makes sense for a signed-in business account. */
export interface OrderService {
  list(query: OrderListQuery, token: string): Promise<OrderListResult>;
  getById(id: number, token: string): Promise<Order>;
  /** Submits the cart as a new order (server-resolved price/VAT/name/sku snapshot). */
  create(payload: CreateOrderPayload, token: string): Promise<Order>;
}
