import { apiClient } from "@/lib/http/apiClient";
import { HttpShopProductService } from "./HttpShopProductService";
import type { ShopProductService } from "./ShopProductService";

/** Shared `ShopProductService` instance used across the app. */
export const shopProductService: ShopProductService = new HttpShopProductService(apiClient);
