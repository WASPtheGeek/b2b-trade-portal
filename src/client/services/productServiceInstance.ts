import { apiClient } from "@/lib/http/apiClient";
import { HttpProductService } from "./HttpProductService";
import type { ProductService } from "./ProductService";

/** Shared `ProductService` instance used across the app. */
export const productService: ProductService = new HttpProductService(apiClient);
