import type {
  ProductAdminDetail,
  ProductBulkDeleteResult,
  ProductBulkStatusUpdatePayload,
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
  /** Sets the status of several products in one request, e.g. to publish an imported batch. */
  updateStatusBulk(payload: ProductBulkStatusUpdatePayload, token: string): Promise<void>;
  /** Permanently deletes a product. Fails with 409 if it has been ordered - deactivate it instead. */
  delete(id: number, token: string): Promise<void>;
  /** Permanently deletes several products; ordered ones are skipped and reported back. */
  deleteBulk(ids: number[], token: string): Promise<ProductBulkDeleteResult>;
}
