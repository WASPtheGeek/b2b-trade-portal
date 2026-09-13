/** Mirrors the server's `BrandDto`. */
export interface Brand {
  id: number;
  name: string;
}

/** Mirrors the server's `BrandUpsertRequest`, sent to create or update a brand. */
export interface BrandUpsertPayload {
  name: string;
}
