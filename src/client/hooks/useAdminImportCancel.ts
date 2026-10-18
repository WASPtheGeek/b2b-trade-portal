"use client";

import { useCallback, useState } from "react";
import { tokenStorage } from "@/lib/auth/tokenStorageInstance";
import { resolveErrorMessage } from "@/lib/http/resolveErrorMessage";
import { adminImportService } from "@/services/adminImportServiceInstance";

const DEFAULT_GENERIC_ERROR = "Failed to stop the import. Please try again.";

export interface UseAdminImportCancelOptions {
  genericErrorMessage?: string;
  /** Called after the server accepted the stop request, e.g. to refresh the history list. The
   * job itself only reaches its final status a moment later, once the worker notices. */
  onCancelled?(): void;
}

export interface AdminImportCancelState {
  /** The job a stop request is currently in flight for, if any. */
  cancellingJobId: number | null;
  error: string | null;
  cancel(jobId: number): Promise<void>;
}

/** Owns stopping a queued/running import job. Progress keeps being reported by the existing
 * status/history polling, which picks up the job's final status once the worker has stopped. */
export function useAdminImportCancel({
  genericErrorMessage = DEFAULT_GENERIC_ERROR,
  onCancelled,
}: UseAdminImportCancelOptions = {}): AdminImportCancelState {
  const [cancellingJobId, setCancellingJobId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cancel = useCallback(async (jobId: number): Promise<void> => {
    const token = tokenStorage.getToken();

    if (!token) {
      return;
    }

    setCancellingJobId(jobId);
    setError(null);

    try {
      await adminImportService.cancel(jobId, token);
      onCancelled?.();
    }
    catch (caught) {
      setError(resolveErrorMessage(caught, genericErrorMessage));
    }
    finally {
      setCancellingJobId(null);
    }
  }, [genericErrorMessage, onCancelled]);

  return { cancellingJobId, error, cancel };
}
