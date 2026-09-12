import type { HttpClient } from "@/lib/http/HttpClient";
import type { Category, CategoryUpsertPayload } from "@/types/category";
import type { CategoryService } from "./CategoryService";

/** `CategoryService` implementation backed by the Elkaro admin REST API. */
export class HttpCategoryService implements CategoryService {
  constructor(private readonly http: HttpClient) {}

  async list(token: string): Promise<Category[]> {
    return this.http.get<Category[]>("/api/admin/categories", { token });
  }

  async listPublic(): Promise<Category[]> {
    return this.http.get<Category[]>("/api/categories");
  }

  async create(payload: CategoryUpsertPayload, token: string): Promise<void> {
    await this.http.post<void>("/api/admin/categories", payload, { token });
  }

  async update(id: number, payload: CategoryUpsertPayload, token: string): Promise<void> {
    await this.http.put<void>(`/api/admin/categories/${id}`, payload, { token });
  }

  async delete(id: number, token: string): Promise<void> {
    await this.http.delete<void>(`/api/admin/categories/${id}`, { token });
  }
}
