import type { HttpClient } from "@/lib/http/HttpClient";
import type { AdminOrderListQuery, Order, OrderListResult, OrderStatusUpdatePayload, OrderSummary } from "@/types/order";
import type { AdminOrderService } from "./AdminOrderService";

const DEFAULT_PAGE_SIZE = 20;

/** `AdminOrderService` implementation backed by the Elkaro admin REST API. */
export class HttpAdminOrderService implements AdminOrderService {
  constructor(private readonly http: HttpClient) {}

  async list(query: AdminOrderListQuery, token: string): Promise<OrderListResult> {
    const params = new URLSearchParams();

    if (query.status) {
      params.set("status", query.status);
    }

    params.set("page", String(query.page ?? 1));
    params.set("pageSize", String(query.pageSize ?? DEFAULT_PAGE_SIZE));

    const { data, total } = await this.http.getPaged<OrderSummary[]>(`/api/admin/orders?${params}`, { token });

    return { items: data, total };
  }

  async getById(id: number, token: string): Promise<Order> {
    return this.http.get<Order>(`/api/admin/orders/${id}`, { token });
  }

  async updateStatus(id: number, payload: OrderStatusUpdatePayload, token: string): Promise<void> {
    await this.http.patch<void>(`/api/admin/orders/${id}/status`, payload, { token });
  }
}
