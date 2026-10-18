import type { ImportCategoriesResult, ImportHistoryResult, ImportJobAccepted, ImportJobStatus, ImportPagingQuery, ImportRecordOutcome, ImportRecordsResult } from "@/types/import";

/** Admin ERP catalog import - uploading a CSV/XLSX export, polling a batch's progress, and
 * reviewing its history and per-row errors. */
export interface AdminImportService {
  upload(file: File, token: string): Promise<ImportJobAccepted>;
  getStatus(jobId: number, token: string): Promise<ImportJobStatus>;
  /** Asks the server to stop a queued/running job; it then finishes with status Failed. */
  cancel(jobId: number, token: string): Promise<void>;
  /** The categories a job created, parents before their children. */
  getCreatedCategories(jobId: number, query: ImportPagingQuery, token: string): Promise<ImportCategoriesResult>;
  /** A job's rows and what happened to each; `outcome` limits it to Created, Updated or Failed rows. */
  getRecords(jobId: number, outcome: ImportRecordOutcome | null, query: ImportPagingQuery, token: string): Promise<ImportRecordsResult>;
  history(query: ImportPagingQuery, token: string): Promise<ImportHistoryResult>;
}
