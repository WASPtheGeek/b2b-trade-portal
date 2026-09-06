import type { HttpClient } from "@/lib/http/HttpClient";
import type { Brand, BrandUpsertPayload } from "@/types/brand";
import type { BrandService } from "./BrandService";

/** `BrandService` implementation backed by the Elkaro admin REST API. */
export class HttpBrandService implements BrandService {
  constructor(private readonly http: HttpClient) {}

  async list(token: string): Promise<Brand[]> {
    return this.http.get<Brand[]>("/api/admin/brands", { token });
  }

  async create(payload: BrandUpsertPayload, token: string): Promise<void> {
    await this.http.post<void>("/api/admin/brands", payload, { token });
  }

  async update(id: number, payload: BrandUpsertPayload, token: string): Promise<void> {
    await this.http.put<void>(`/api/admin/brands/${id}`, payload, { token });
  }

  async delete(id: number, token: string): Promise<void> {
    await this.http.delete<void>(`/api/admin/brands/${id}`, { token });
  }
}
