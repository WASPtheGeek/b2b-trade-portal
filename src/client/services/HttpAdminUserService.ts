import type { HttpClient } from "@/lib/http/HttpClient";
import type { AdminUser, AdminUserListQuery, AdminUserListResult, RejectUserPayload } from "@/types/user-admin";
import type { AdminUserService } from "./AdminUserService";

const DEFAULT_PAGE_SIZE = 20;

/** `AdminUserService` implementation backed by the Elkaro admin REST API. */
export class HttpAdminUserService implements AdminUserService {
  constructor(private readonly http: HttpClient) {}

  async list(query: AdminUserListQuery, token: string): Promise<AdminUserListResult> {
    const params = new URLSearchParams();

    if (query.status) {
      params.set("status", query.status);
    }

    params.set("page", String(query.page ?? 1));
    params.set("pageSize", String(query.pageSize ?? DEFAULT_PAGE_SIZE));

    const { data, total } = await this.http.getPaged<AdminUser[]>(`/api/admin/users?${params}`, { token });

    return { items: data, total };
  }

  async approve(id: number, token: string): Promise<void> {
    await this.http.post<void>(`/api/admin/users/${id}/approve`, undefined, { token });
  }

  async reject(id: number, payload: RejectUserPayload, token: string): Promise<void> {
    await this.http.post<void>(`/api/admin/users/${id}/reject`, payload, { token });
  }

  async suspend(id: number, token: string): Promise<void> {
    await this.http.post<void>(`/api/admin/users/${id}/suspend`, undefined, { token });
  }

  async reactivate(id: number, token: string): Promise<void> {
    await this.http.post<void>(`/api/admin/users/${id}/reactivate`, undefined, { token });
  }
}
