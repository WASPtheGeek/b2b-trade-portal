import type { Brand, BrandUpsertPayload } from "@/types/brand";

/** Admin brand management operations. */
export interface BrandService {
  list(token: string): Promise<Brand[]>;
  create(payload: BrandUpsertPayload, token: string): Promise<void>;
  update(id: number, payload: BrandUpsertPayload, token: string): Promise<void>;
  delete(id: number, token: string): Promise<void>;
}
