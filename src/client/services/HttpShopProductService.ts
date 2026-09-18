import type { HttpClient } from "@/lib/http/HttpClient";
import type { ProductDetailDto, ProductListItemDto } from "@/types/product";
import type { ShopProductListQuery, ShopProductListResult, ShopProductService } from "./ShopProductService";

/** `ShopProductService` implementation backed by the Elkaro public REST API. */
export class HttpShopProductService implements ShopProductService {
  constructor(private readonly http: HttpClient) {}

  async list(query: ShopProductListQuery = {}, token?: string): Promise<ShopProductListResult> {
    const params = new URLSearchParams();

    if (query.category) params.set("category", query.category);
    if (query.brand) params.set("brand", query.brand);
    if (query.search) params.set("search", query.search);
    if (query.page) params.set("page", String(query.page));
    if (query.pageSize) params.set("pageSize", String(query.pageSize));

    const { data, total } = await this.http.getPaged<ProductListItemDto[]>(`/api/products?${params.toString()}`, { token });

    return { items: data, total };
  }

  async getById(id: number, token?: string): Promise<ProductDetailDto> {
    return this.http.get<ProductDetailDto>(`/api/products/${id}`, { token });
  }
}
