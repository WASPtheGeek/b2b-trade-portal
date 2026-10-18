"use client";

import { useCallback, useEffect, useState } from "react";
import { tokenStorage } from "@/lib/auth/tokenStorageInstance";
import { resolveErrorMessage } from "@/lib/http/resolveErrorMessage";
import { adminImportService } from "@/services/adminImportServiceInstance";
import type { ImportRecord, ImportRecordOutcome } from "@/types/import";

const DEFAULT_GENERIC_ERROR = "Failed to load the import rows. Please try again.";
const PAGE_SIZE = 20;

export interface UseAdminImportRecordsOptions {
  genericErrorMessage?: string;
}

export interface AdminImportRecordsState {
  records: ImportRecord[];
  total: number;
  isLoading: boolean;
  error: string | null;
  page: number;
  pageSize: number;
  setPage(value: number): void;
}

/** Owns one import job's row list for a single outcome (created/updated/failed) and its
 * server-side paging. Remount (e.g. via `key`) to switch outcome with paging reset to page 1. */
export function useAdminImportRecords(
  jobId: number,
  outcome: ImportRecordOutcome,
  { genericErrorMessage = DEFAULT_GENERIC_ERROR }: UseAdminImportRecordsOptions = {},
): AdminImportRecordsState {
  const [records, setRecords] = useState<ImportRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const token = tokenStorage.getToken();
    const request = token
      ? adminImportService.getRecords(jobId, outcome, { page, pageSize: PAGE_SIZE }, token)
      : Promise.resolve({ items: [], total: 0 });

    request
      .then(({ items, total: newTotal }) => {
        setRecords(items);
        setTotal(newTotal);
        setError(null);
      })
      .catch((caught: unknown) => {
        setError(resolveErrorMessage(caught, genericErrorMessage));
      })
      .finally(() => {
        setIsLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId, outcome, page]);

  // Loading starts here rather than in the effect, so a page change shows the table's loader.
  const changePage = useCallback((value: number): void => {
    setIsLoading(true);
    setPage(value);
  }, []);

  return { records, total, isLoading, error, page, pageSize: PAGE_SIZE, setPage: changePage };
}
