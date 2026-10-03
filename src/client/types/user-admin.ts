/** Mirrors the server's `UserDto` (see `AuthController.ToDto`). */
export interface AdminUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  businessName: string | null;
  registrationNumber: string | null;
  vatNumber: string | null;
  phone: string | null;
  isVatExempt: boolean;
  role: string;
  status: string;
  createdAt: string;
}

/** Optional filtering/paging for `GET /api/admin/users`. */
export interface AdminUserListQuery {
  status?: string;
  page?: number;
  pageSize?: number;
}

/** A paged batch of users, as returned by the list endpoint. */
export interface AdminUserListResult {
  items: AdminUser[];
  total: number;
}

/** Mirrors the server's `RejectUserRequest`. */
export interface RejectUserPayload {
  reason: string;
}
