import { apiClient } from "@/lib/http/apiClient";
import { HttpAdminOrderService } from "./HttpAdminOrderService";
import type { AdminOrderService } from "./AdminOrderService";

/** Shared `AdminOrderService` instance used across the app. */
export const adminOrderService: AdminOrderService = new HttpAdminOrderService(apiClient);
