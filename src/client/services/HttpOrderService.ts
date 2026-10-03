import type { HttpClient } from "@/lib/http/HttpClient";
import type { CreateOrderPayload, Order, OrderListQuery, OrderListResult, OrderSummary } from "@/types/order";
import type { OrderService } from "./OrderService";

/** The server's maximum allowed page size, used as the default so a single request covers the whole order history. */
const DEFAULT_PAGE_SIZE = 100;

/** `OrderService` implementation backed by the Elkaro REST API. */
export class HttpOrderService implements OrderService {
  constructor(private readonly http: HttpClient) {}

  async list(query: OrderListQuery, token: string): Promise<OrderListResult> {
    const params = new URLSearchParams();
    params.set("page", String(query.page ?? 1));
    params.set("pageSize", String(query.pageSize ?? DEFAULT_PAGE_SIZE));

    const { data, total } = await this.http.getPaged<OrderSummary[]>(`/api/orders?${params}`, { token });

    return { items: data, total };
  }

  async getById(id: number, token: string): Promise<Order> {
    return this.http.get<Order>(`/api/orders/${id}`, { token });
  }

  async create(payload: CreateOrderPayload, token: string): Promise<Order> {
    return this.http.post<Order>("/api/orders", payload, { token });
  }
}
