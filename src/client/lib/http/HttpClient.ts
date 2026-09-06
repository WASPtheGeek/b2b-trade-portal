/** Per-request overrides layered on top of the client's own defaults. */
export interface HttpRequestOptions {
  /** Bearer token to attach as the `Authorization` header, for authenticated calls. */
  token?: string;
  signal?: AbortSignal;
}

/**
 * Narrow HTTP contract the rest of the app depends on, instead of `fetch` directly.
 *
 * Keeping this as an interface lets callers (services, hooks) stay decoupled from
 * the transport — the fetch-based implementation can be swapped or mocked in tests
 * without touching any consumer.
 */
export interface HttpClient {
  get<TResponse>(path: string, options?: HttpRequestOptions): Promise<TResponse>;
  post<TResponse, TBody = unknown>(path: string, body?: TBody, options?: HttpRequestOptions): Promise<TResponse>;
  put<TResponse, TBody = unknown>(path: string, body?: TBody, options?: HttpRequestOptions): Promise<TResponse>;
  patch<TResponse, TBody = unknown>(path: string, body?: TBody, options?: HttpRequestOptions): Promise<TResponse>;
  delete<TResponse = void>(path: string, options?: HttpRequestOptions): Promise<TResponse>;
}
