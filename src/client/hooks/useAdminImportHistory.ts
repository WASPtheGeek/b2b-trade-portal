"use client";

import { useCallback, useEffect, useState } from "react";
import { tokenStorage } from "@/lib/auth/tokenStorageInstance";
import { resolveErrorMessage } from "@/lib/http/resolveErrorMessage";
import { adminImportService } from "@/services/adminImportServiceInstance";
import { ImportStatus } from "@/types/server-enums";
import type { ImportJobStatus } from "@/types/import";

const DEFAULT_GENERIC_ERROR = "Failed to load the import history. Please try again.";
const PAGE_SIZE = 10;
const ACTIVE_POLL_INTERVAL_MS = 4000;
const ACTIVE_STATUSES: ReadonlySet<ImportStatus> = new Set([ImportStatus.Pending, ImportStatus.Running]);

export interface UseAdminImportHistoryOptions {
  genericErrorMessage?: string;
}

export interface AdminImportHistoryState {
  jobs: ImportJobStatus[];
  total: number;
  isLoading: boolean;
  error: string | null;
  page: number;
  pageSize: number;
  setPage(value: number): void;
  refresh(): void;
}

/** Owns the import history list's data fetching and server-side paging. While any job on the
 * current page is still Pending/Running (e.g. started just before this page loaded, or from
 * another tab), it quietly re-fetches every few seconds so that row's status keeps moving
 * without the admin having to refresh manually - and stops again once nothing is active. */
export function useAdminImportHistory({
  genericErrorMessage = DEFAULT_GENERIC_ERROR,
}: UseAdminImportHistoryOptions = {}): AdminImportHistoryState {
  const [jobs, setJobs] = useState<ImportJobStatus[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    const token = tokenStorage.getToken();
    const request = token
      ? adminImportService.history({ page, pageSize: PAGE_SIZE }, token)
      : Promise.resolve({ items: [], total: 0 });

    request
      .then(({ items, total: newTotal }) => {
        setJobs(items);
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
  }, [page, reloadToken]);

  const refresh = useCallback((): void => {
    setReloadToken((current) => current + 1);
  }, []);

  const hasActiveJob = jobs.some((j) => ACTIVE_STATUSES.has(j.status));

  useEffect(() => {
    if (!hasActiveJob) {
      return;
    }

    const timer = setInterval(refresh, ACTIVE_POLL_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [hasActiveJob, refresh]);

  return { jobs, total, isLoading, error, page, pageSize: PAGE_SIZE, setPage, refresh };
}
