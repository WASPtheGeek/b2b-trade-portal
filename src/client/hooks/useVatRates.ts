"use client";

import { createListQuery } from "@/hooks/createListQuery";
import { vatRateService } from "@/services/vatRateServiceInstance";
import type { VatRate } from "@/types/vat-rate";

/** Fetches every VAT rate available to assign to a product, once, on mount. */
export const useVatRates = createListQuery<VatRate>(vatRateService);
