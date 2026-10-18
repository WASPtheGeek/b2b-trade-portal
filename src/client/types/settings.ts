/** Mirrors the server's `ImportColumnSettings` - the ERP file header expected for each product field. */
export interface ImportColumnSettings {
  ean: string;
  name: string;
  brand: string;
  price: string;
  soldByPiece: string;
  piecesPerPackage: string;
  piecesPerBox: string;
  description: string;
  catalog: string;
  group: string;
  subgroup: string;
}

export type ImportColumnField = keyof ImportColumnSettings;

/** The fields in the ERP file's usual column order. */
export const IMPORT_COLUMN_FIELDS: readonly ImportColumnField[] = [
  "ean",
  "name",
  "brand",
  "price",
  "soldByPiece",
  "piecesPerPackage",
  "piecesPerBox",
  "description",
  "catalog",
  "group",
  "subgroup",
];

/** The server's defaults - the client's current ERP export headers. */
export const DEFAULT_IMPORT_COLUMNS: ImportColumnSettings = {
  ean: "EAN",
  name: "Nosaukums",
  brand: "Zīmols",
  price: "Cena",
  soldByPiece: "gb",
  piecesPerPackage: "iep.",
  piecesPerBox: "kaste",
  description: "Apraksts",
  catalog: "Katalogs",
  group: "Grupa",
  subgroup: "apakšgrupa",
};

/** Mirrors the server's `DisplaySettings` - admin UI preferences shared by every admin. */
export interface DisplaySettings {
  /** Whether admin tables pin their actions column to the right edge by default. */
  stickyActionsColumn: boolean;
}

export const DEFAULT_DISPLAY_SETTINGS: DisplaySettings = {
  stickyActionsColumn: true,
};
