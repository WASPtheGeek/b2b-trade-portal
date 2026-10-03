"use client";

import { useCallback, useEffect, useState } from "react";
import { tokenStorage } from "@/lib/auth/tokenStorageInstance";
import { resolveErrorMessage } from "@/lib/http/resolveErrorMessage";
import { adminUserService } from "@/services/adminUserServiceInstance";
import type { AdminUser } from "@/types/user-admin";

const DEFAULT_GENERIC_ERROR = "Failed to load users. Please try again.";
const PAGE_SIZE = 20;

export interface UseAdminUserListOptions {
  genericErrorMessage?: string;
}

export interface AdminUserListState {
  users: AdminUser[];
  total: number;
  isLoading: boolean;
  error: string | null;
  status: string | null;
  setStatus(value: string | null): void;
  page: number;
  pageSize: number;
  setPage(value: number): void;
  refresh(): void;
  approve(id: number): Promise<void>;
  reject(id: number, reason: string): Promise<void>;
  suspend(id: number): Promise<void>;
  reactivate(id: number): Promise<void>;
}

/** Owns the admin user list's data fetching, status-tab filtering, server-side paging, and
 * the approve/reject/suspend/reactivate review actions. */
export function useAdminUserList({
  genericErrorMessage = DEFAULT_GENERIC_ERROR,
}: UseAdminUserListOptions = {}): AdminUserListState {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    const token = tokenStorage.getToken();
    const request = token
      ? adminUserService.list({ status: status ?? undefined, page, pageSize: PAGE_SIZE }, token)
      : Promise.resolve({ items: [], total: 0 });

    request
      .then(({ items, total: newTotal }) => {
        setUsers(items);
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
  }, [status, page, reloadToken]);

  const handleSetStatus = useCallback((value: string | null): void => {
    setStatus(value);
    setPage(1);
  }, []);

  const refresh = useCallback((): void => {
    setReloadToken((current) => current + 1);
  }, []);

  const approve = useCallback(async (id: number): Promise<void> => {
    const token = tokenStorage.getToken();

    if (!token) {
      return;
    }

    await adminUserService.approve(id, token);
    refresh();
  }, [refresh]);

  const reject = useCallback(async (id: number, reason: string): Promise<void> => {
    const token = tokenStorage.getToken();

    if (!token) {
      return;
    }

    await adminUserService.reject(id, { reason }, token);
    refresh();
  }, [refresh]);

  const suspend = useCallback(async (id: number): Promise<void> => {
    const token = tokenStorage.getToken();

    if (!token) {
      return;
    }

    await adminUserService.suspend(id, token);
    refresh();
  }, [refresh]);

  const reactivate = useCallback(async (id: number): Promise<void> => {
    const token = tokenStorage.getToken();

    if (!token) {
      return;
    }

    await adminUserService.reactivate(id, token);
    refresh();
  }, [refresh]);

  return {
    users,
    total,
    isLoading,
    error,
    status,
    setStatus: handleSetStatus,
    page,
    pageSize: PAGE_SIZE,
    setPage,
    refresh,
    approve,
    reject,
    suspend,
    reactivate,
  };
}
