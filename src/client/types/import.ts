import type { ImportStatus } from "./server-enums";

/** Mirrors the server's `ImportJobAcceptedDto`. */
export interface ImportJobAccepted {
  jobId: number;
}

/** Mirrors the server's `ImportJobStatusDto` - an import batch's progress/outcome, whether
 * it's still running or already finished. */
export interface ImportJobStatus {
  jobId: number;
  status: ImportStatus;
  totalRows: number;
  processedRows: number;
  createdCount: number;
  updatedCount: number;
  errorCount: number;
  /** Categories the import created while resolving Katalogs/Grupa/apakšgrupa. */
  createdCategoryCount: number;
  startedAt: string;
  finishedAt: string | null;
}

/** Mirrors the server's `ImportRecordOutcome` - what happened to a single row of a batch. */
export type ImportRecordOutcome = "Created" | "Updated" | "Failed";

/** Mirrors the server's `ImportRecordDto` - one row of a batch and its outcome. */
export interface ImportRecord {
  rowNumber: number;
  ean: string | null;
  outcome: ImportRecordOutcome;
  /** The created/updated product, if the row succeeded. */
  productId: number | null;
  /** The product's current name, if it still exists. */
  productName: string | null;
  /** Why the row failed, for `Failed` rows. */
  errorMessage: string | null;
}

/** Optional paging for the import history/row-errors endpoints. */
export interface ImportPagingQuery {
  page?: number;
  pageSize?: number;
}

/** A paged batch of past import jobs, as returned by the history endpoint. */
export interface ImportHistoryResult {
  items: ImportJobStatus[];
  total: number;
}

/** A paged batch of rows of a single import job. */
export interface ImportRecordsResult {
  items: ImportRecord[];
  total: number;
}

/** Mirrors the server's `ImportCategoryRecordDto` - a category an import job created. */
export interface ImportCategoryRecord {
  /** The source file row that caused the category to be created. */
  rowNumber: number;
  categoryId: number | null;
  /** The category's path at import time, e.g. "Rotaļlietas › Galda spēles". */
  path: string;
  /** The category's current name, or `null` if it has since been deleted. */
  currentName: string | null;
}

/** A paged batch of categories an import job created. */
export interface ImportCategoriesResult {
  items: ImportCategoryRecord[];
  total: number;
}
