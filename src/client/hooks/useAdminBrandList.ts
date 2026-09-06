"use client";

import { useCallback, useEffect, useState } from "react";
import { tokenStorage } from "@/lib/auth/tokenStorageInstance";
import { resolveErrorMessage } from "@/lib/http/resolveErrorMessage";
import { brandService } from "@/services/brandServiceInstance";
import type { Brand } from "@/types/brand";

const DEFAULT_GENERIC_ERROR = "Failed to load brands. Please try again.";

export interface UseAdminBrandListOptions {
  genericErrorMessage?: string;
}

export interface AdminBrandListState {
  brands: Brand[];
  isLoading: boolean;
  error: string | null;
  deleteBrand(id: number): Promise<void>;
}

/**
 * Owns the admin brand list's data fetching and delete action.
 *
 * Deleting a brand clears it from any product that referenced it (the
 * schema's foreign key is ON DELETE SET NULL) rather than blocking the
 * delete or removing those products - the caller is responsible for
 * confirming that with the admin before calling `deleteBrand`.
 */
export function useAdminBrandList({
  genericErrorMessage = DEFAULT_GENERIC_ERROR,
}: UseAdminBrandListOptions = {}): AdminBrandListState {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    const token = tokenStorage.getToken();
    const request = token ? brandService.list(token) : Promise.resolve<Brand[]>([]);

    request
      .then((data) => {
        setBrands(data);
        setError(null);
      })
      .catch((caught: unknown) => {
        setError(resolveErrorMessage(caught, genericErrorMessage));
      })
      .finally(() => {
        setIsLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadToken]);

  const deleteBrand = useCallback(async (id: number): Promise<void> => {
    const token = tokenStorage.getToken();

    if (!token) {
      return;
    }

    await brandService.delete(id, token);
    setReloadToken((current) => current + 1);
  }, []);

  return { brands, isLoading, error, deleteBrand };
}
