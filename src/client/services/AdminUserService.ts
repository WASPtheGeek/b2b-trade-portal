import type { AdminUserListQuery, AdminUserListResult, RejectUserPayload } from "@/types/user-admin";

/** Admin operations for reviewing self-registered business accounts. */
export interface AdminUserService {
  list(query: AdminUserListQuery, token: string): Promise<AdminUserListResult>;
  approve(id: number, token: string): Promise<void>;
  reject(id: number, payload: RejectUserPayload, token: string): Promise<void>;
  suspend(id: number, token: string): Promise<void>;
  reactivate(id: number, token: string): Promise<void>;
}
