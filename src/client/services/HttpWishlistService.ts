import type { HttpClient } from "@/lib/http/HttpClient";
import type { ProductListItemDto } from "@/types/product";
import type { WishlistService } from "./WishlistService";

/** `WishlistService` implementation backed by the Elkaro REST API. */
export class HttpWishlistService implements WishlistService {
  constructor(private readonly http: HttpClient) {}

  async list(token: string): Promise<ProductListItemDto[]> {
    return this.http.get<ProductListItemDto[]>("/api/wishlist", { token });
  }

  async listIds(token: string): Promise<number[]> {
    return this.http.get<number[]>("/api/wishlist/ids", { token });
  }

  async add(productId: number, token: string): Promise<void> {
    await this.http.post<void>(`/api/wishlist/${productId}`, undefined, { token });
  }

  async remove(productId: number, token: string): Promise<void> {
    await this.http.delete<void>(`/api/wishlist/${productId}`, { token });
  }
}
