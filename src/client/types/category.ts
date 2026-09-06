/** Mirrors the server's `CategoryDto`. */
export interface Category {
  id: number;
  parentId: number | null;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  isCustom: boolean;
  showInMenu: boolean;
}

/** Mirrors the server's `CategoryUpsertRequest`, sent to create or update a category. */
export interface CategoryUpsertPayload {
  parentId?: number;
  name: string;
  slug: string;
  description?: string;
  sortOrder: number;
  isCustom: boolean;
  showInMenu: boolean;
}
