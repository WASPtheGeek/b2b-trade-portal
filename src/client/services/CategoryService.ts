import type { Category, CategoryUpsertPayload } from "@/types/category";

/** Admin category management operations. */
export interface CategoryService {
  list(token: string): Promise<Category[]>;
  create(payload: CategoryUpsertPayload, token: string): Promise<void>;
  update(id: number, payload: CategoryUpsertPayload, token: string): Promise<void>;
  delete(id: number, token: string): Promise<void>;
  /** Anonymous storefront lookup: menu-visible categories, ordered for display. */
  listPublic(): Promise<Category[]>;
}
