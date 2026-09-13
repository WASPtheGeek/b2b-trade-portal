import type {
  ProductAdminDetail,
  ProductAdminListItem,
  ProductListQuery,
  ProductStatusUpdatePayload,
  ProductUpsertPayload,
} from "@/types/product-admin";

/** Admin product management operations. */
export interface ProductService {
  list(query: ProductListQuery, token: string): Promise<ProductAdminListItem[]>;
  getById(id: number, token: string): Promise<ProductAdminDetail>;
  create(payload: ProductUpsertPayload, token: string): Promise<void>;
  update(id: number, payload: ProductUpsertPayload, token: string): Promise<void>;
  updateStatus(id: number, payload: ProductStatusUpdatePayload, token: string): Promise<void>;
  /** Soft-deletes (deactivates) a product — products are never hard-deleted. */
  deactivate(id: number, token: string): Promise<void>;
}
