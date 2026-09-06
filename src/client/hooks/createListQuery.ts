"use client";

import { useEffect, useState } from "react";
import type { ListService } from "@/lib/http/createListService";
import { tokenStorage } from "@/lib/auth/tokenStorageInstance";

export interface ListQueryResult<T> {
  data: T[];
  isLoading: boolean;
}

/**
 * Builds a hook that fetches every item from a `ListService` once, on mount.
 *
 * A failed fetch is treated as "no options available" (empty `data`) rather than
 * surfaced as an error - these are supporting lookups (categories, brands, VAT
 * rates) for a form, not the form's own primary action, so a missing option list
 * degrades to an empty picker instead of blocking the page.
 *
 * @param service The list service to fetch from.
 * @returns A hook returning the fetched items and whether the fetch is in flight.
 */
export function createListQuery<T>(service: ListService<T>) {
  return function useListQuery(): ListQueryResult<T> {
    const [data, setData] = useState<T[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      const token = tokenStorage.getToken();
      const items = token ? service.list(token) : Promise.resolve([]);

      items
        .then(setData)
        .catch(() => setData([]))
        .finally(() => setIsLoading(false));
    }, []);

    return { data, isLoading };
  };
}
