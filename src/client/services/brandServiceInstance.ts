import { apiClient } from "@/lib/http/apiClient";
import { HttpBrandService } from "./HttpBrandService";
import type { BrandService } from "./BrandService";

/** Shared `BrandService` instance used across the app. */
export const brandService: BrandService = new HttpBrandService(apiClient);
