import { apiClient } from "@/lib/http/apiClient";
import { HttpOrderService } from "./HttpOrderService";
import type { OrderService } from "./OrderService";

/** Shared `OrderService` instance used across the app. */
export const orderService: OrderService = new HttpOrderService(apiClient);
