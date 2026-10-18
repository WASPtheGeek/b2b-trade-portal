import type { HttpClient } from "@/lib/http/HttpClient";
import type {
  ImportCategoriesResult,
  ImportCategoryRecord,
  ImportHistoryResult,
  ImportJobAccepted,
  ImportJobStatus,
  ImportPagingQuery,
  ImportRecord,
  ImportRecordOutcome,
  ImportRecordsResult,
} from "@/types/import";
import type { AdminImportService } from "./AdminImportService";

const DEFAULT_PAGE_SIZE = 20;

function buildPagingParams(query: ImportPagingQuery): URLSearchParams {
  const params = new URLSearchParams();

  params.set("page", String(query.page ?? 1));
  params.set("pageSize", String(query.pageSize ?? DEFAULT_PAGE_SIZE));

  return params;
}

/** `AdminImportService` implementation backed by the Elkaro admin REST API. */
export class HttpAdminImportService implements AdminImportService {
  constructor(private readonly http: HttpClient) {}

  async upload(file: File, token: string): Promise<ImportJobAccepted> {
    const formData = new FormData();
    formData.append("file", file);

    return this.http.postForm<ImportJobAccepted>("/api/admin/products/import", formData, { token });
  }

  async getStatus(jobId: number, token: string): Promise<ImportJobStatus> {
    return this.http.get<ImportJobStatus>(`/api/admin/products/import/${jobId}`, { token });
  }

  async cancel(jobId: number, token: string): Promise<void> {
    await this.http.post<void>(`/api/admin/products/import/${jobId}/cancel`, undefined, { token });
  }

  async getCreatedCategories(jobId: number, query: ImportPagingQuery, token: string): Promise<ImportCategoriesResult> {
    const { data, total } = await this.http.getPaged<ImportCategoryRecord[]>(
      `/api/admin/products/import/${jobId}/categories?${buildPagingParams(query)}`,
      { token },
    );

    return { items: data, total };
  }

  async getRecords(
    jobId: number,
    outcome: ImportRecordOutcome | null,
    query: ImportPagingQuery,
    token: string,
  ): Promise<ImportRecordsResult> {
    const params = buildPagingParams(query);

    if (outcome) {
      params.set("outcome", outcome);
    }

    const { data, total } = await this.http.getPaged<ImportRecord[]>(
      `/api/admin/products/import/${jobId}/records?${params}`,
      { token },
    );

    return { items: data, total };
  }

  async history(query: ImportPagingQuery, token: string): Promise<ImportHistoryResult> {
    const { data, total } = await this.http.getPaged<ImportJobStatus[]>(
      `/api/admin/products/import/history?${buildPagingParams(query)}`,
      { token },
    );

    return { items: data, total };
  }
}
