import { apiClient } from "@/lib/http/apiClient";
import { HttpWishlistService } from "./HttpWishlistService";
import type { WishlistService } from "./WishlistService";

/** Shared `WishlistService` instance used across the app. */
export const wishlistService: WishlistService = new HttpWishlistService(apiClient);
