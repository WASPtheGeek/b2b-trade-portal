"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { tokenStorage } from "@/lib/auth/tokenStorageInstance";
import { resolveErrorMessage } from "@/lib/http/resolveErrorMessage";
import { adminImportService } from "@/services/adminImportServiceInstance";
import { ImportStatus } from "@/types/server-enums";
import type { ImportJobStatus } from "@/types/import";

const DEFAULT_GENERIC_ERROR = "Failed to upload the file. Please try again.";
const POLL_INTERVAL_MS = 1500;
const ACTIVE_STATUSES: ReadonlySet<ImportStatus> = new Set([ImportStatus.Pending, ImportStatus.Running]);

export interface UseAdminImportUploadOptions {
  genericErrorMessage?: string;
  /** Called once an uploaded job reaches a final status (Success/Failed/Partial), so the
   * caller can refresh a separate history list. */
  onFinished?(): void;
}

export interface AdminImportUploadState {
  /** The most recently uploaded job's latest known status, polled while still Pending/Running. */
  job: ImportJobStatus | null;
  isUploading: boolean;
  error: string | null;
  upload(file: File): Promise<void>;
}

/** Owns uploading a catalog file and polling the resulting job until it reaches a final status. */
export function useAdminImportUpload({
  genericErrorMessage = DEFAULT_GENERIC_ERROR,
  onFinished,
}: UseAdminImportUploadOptions = {}): AdminImportUploadState {
  const [job, setJob] = useState<ImportJobStatus | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback((): void => {
    if (intervalRef.current != null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Unmount-only cleanup: stops any still-running poll interval so it doesn't keep firing
  // (and calling setState) after the component using this hook is gone.
  useEffect(() => stopPolling, [stopPolling]);

  const pollStatus = useCallback((jobId: number): void => {
    const token = tokenStorage.getToken();

    if (!token) {
      return;
    }

    adminImportService.getStatus(jobId, token)
      .then((status) => {
        setJob(status);

        if (!ACTIVE_STATUSES.has(status.status)) {
          stopPolling();
          onFinished?.();
        }
      })
      .catch(() => {
        // A single failed poll is transient (e.g. a momentary network blip) - keep the last
        // known status on screen and simply try again on the next tick.
      });
  }, [onFinished, stopPolling]);

  const upload = useCallback(async (file: File): Promise<void> => {
    const token = tokenStorage.getToken();

    if (!token) {
      return;
    }

    stopPolling();
    setIsUploading(true);
    setError(null);

    try {
      const { jobId } = await adminImportService.upload(file, token);

      setJob({
        jobId,
        status: ImportStatus.Pending,
        totalRows: 0,
        processedRows: 0,
        createdCount: 0,
        updatedCount: 0,
        errorCount: 0,
        createdCategoryCount: 0,
        startedAt: new Date().toISOString(),
        finishedAt: null,
      });
      intervalRef.current = setInterval(() => pollStatus(jobId), POLL_INTERVAL_MS);
    }
    catch (caught) {
      setError(resolveErrorMessage(caught, genericErrorMessage));
    }
    finally {
      setIsUploading(false);
    }
  }, [genericErrorMessage, pollStatus, stopPolling]);

  return { job, isUploading, error, upload };
}
