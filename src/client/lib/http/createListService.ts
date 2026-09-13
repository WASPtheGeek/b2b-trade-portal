import type { HttpClient } from "./HttpClient";

/** A minimal read-only "list everything" service. */
export interface ListService<T> {
  list(token: string): Promise<T[]>;
}

/**
 * Builds a `ListService` against a fixed admin endpoint that returns a flat array.
 *
 * Several admin lookups (categories, brands, VAT rates) share this exact shape —
 * a single GET returning every option — so this factory replaces what would
 * otherwise be three near-identical interface/implementation pairs.
 *
 * @param http The HTTP client to issue the request through.
 * @param path The endpoint to fetch the list from.
 * @returns A `ListService` for the given type and endpoint.
 */
export function createListService<T>(http: HttpClient, path: string): ListService<T> {
  return {
    async list(token: string): Promise<T[]> {
      return http.get<T[]>(path, { token });
    },
  };
}
