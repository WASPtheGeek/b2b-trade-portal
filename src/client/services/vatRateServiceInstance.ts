import { apiClient } from "@/lib/http/apiClient";
import { createListService, type ListService } from "@/lib/http/createListService";
import type { VatRate } from "@/types/vat-rate";

/** Shared service for listing VAT rates available to assign to a product. */
export const vatRateService: ListService<VatRate> = createListService(apiClient, "/api/admin/vat-rates");
