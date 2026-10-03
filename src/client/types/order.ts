/** Mirrors the server's `OrderItemDto`. */
export interface OrderItem {
  id: number;
  productId: number | null;
  sku: string;
  productName: string;
  brand: string | null;
  packagingUnit: string;
  piecesPerUnit: number;
  quantity: number;
  unitPrice: number;
  vatRatePercent: number;
  lineSubtotal: number;
  lineVatAmount: number;
  lineTotal: number;
}

/** Mirrors the server's `OrderDto` — full order detail, including line items. */
export interface Order {
  id: number;
  orderNumber: string;
  status: string;
  currency: string;
  subtotalAmount: number;
  vatAmount: number;
  totalAmount: number;
  notes: string | null;
  placedAt: string;
  items: OrderItem[];
}

/** Mirrors the server's `OrderSummaryDto` — used for order listings, without line items. */
export interface OrderSummary {
  id: number;
  orderNumber: string;
  status: string;
  currency: string;
  totalAmount: number;
  placedAt: string;
  userId: number;
  businessName: string | null;
}

/** Optional paging for `GET /api/orders`. */
export interface OrderListQuery {
  page?: number;
  pageSize?: number;
}

/** Optional filtering/paging for `GET /api/admin/orders`. */
export interface AdminOrderListQuery extends OrderListQuery {
  status?: string;
}

/** A paged batch of order summaries, as returned by the list endpoints. */
export interface OrderListResult {
  items: OrderSummary[];
  total: number;
}

/** Mirrors the server's `OrderStatusUpdateRequest`. */
export interface OrderStatusUpdatePayload {
  status: string;
  note?: string;
}

/** Mirrors the server's `CreateOrderItemRequest`. */
export interface CreateOrderItemPayload {
  productId: number;
  /** "piece" | "package" | "box" - the server's `PackagingUnit` enum, lowercased. */
  packagingUnit: string;
  quantity: number;
}

/** Mirrors the server's `CreateOrderRequest`, sent by the cart at checkout. */
export interface CreateOrderPayload {
  items: CreateOrderItemPayload[];
  shippingAddressId?: number;
  billingAddressId?: number;
  notes?: string;
}
