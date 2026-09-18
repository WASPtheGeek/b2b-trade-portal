import type { HttpClient } from "@/lib/http/HttpClient";
import type {
  ProductAdminDetail,
  ProductAdminListItem,
  ProductListQuery,
  ProductStatusUpdatePayload,
  ProductUpsertPayload,
} from "@/types/product-admin";
import type { ProductService } from "./ProductService";

/** The server's maximum allowed page size, used as the default so a single request covers the whole catalog. */
const DEFAULT_PAGE_SIZE = 200;

/** `ProductService` implementation backed by the Elkaro admin REST API. */
export class HttpProductService implements ProductService {
  constructor(private readonly http: HttpClient) {}

  async list(query: ProductListQuery, token: string): Promise<ProductAdminListItem[]> {
    const params = this.buildListParams(query);

    return this.http.get<ProductAdminListItem[]>(`/api/admin/products?${params}`, { token });
  }

  async getById(id: number, token: string): Promise<ProductAdminDetail> {
    return this.http.get<ProductAdminDetail>(`/api/admin/products/${id}`, { token });
  }

  async create(payload: ProductUpsertPayload, token: string): Promise<void> {
    await this.http.post<void>("/api/admin/products", payload, { token });
  }

  async update(id: number, payload: ProductUpsertPayload, token: string): Promise<void> {
    await this.http.put<void>(`/api/admin/products/${id}`, payload, { token });
  }

  async updateStatus(id: number, payload: ProductStatusUpdatePayload, token: string): Promise<void> {
    await this.http.patch<void>(`/api/admin/products/${id}/status`, payload, { token });
  }

  async deactivate(id: number, token: string): Promise<void> {
    await this.http.delete<void>(`/api/admin/products/${id}`, { token });
  }

  /**
   * Builds the query string for the product list endpoint.
   *
   * @param query The filters and paging to apply.
   * @returns The assembled query string parameters.
   */
  private buildListParams(query: ProductListQuery): URLSearchParams {
    const params = new URLSearchParams();

    if (query.category) {
      params.set("category", query.category);
    }

    if (query.brand !== undefined) {
      params.set("brand", String(query.brand));
    }

    if (query.search) {
      params.set("search", query.search);
    }

    params.set("page", String(query.page ?? 1));
    params.set("pageSize", String(query.pageSize ?? DEFAULT_PAGE_SIZE));

    return params;
  }
}
