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
/** A `GET` response paged via the `X-Total-Count` response header. */
export interface HttpPagedResponse<TResponse> {
  data: TResponse;
  total: number;
}

export interface HttpClient {
  get<TResponse>(path: string, options?: HttpRequestOptions): Promise<TResponse>;
  /** Like `get`, but also reads the `X-Total-Count` header the paged list endpoints set -
   * needed for real pagination controls, which the plain `get` result (just the parsed body)
   * can't provide. Falls back to the response array's own length if the header is absent. */
  getPaged<TResponse extends unknown[]>(path: string, options?: HttpRequestOptions): Promise<HttpPagedResponse<TResponse>>;
  post<TResponse, TBody = unknown>(path: string, body?: TBody, options?: HttpRequestOptions): Promise<TResponse>;
  put<TResponse, TBody = unknown>(path: string, body?: TBody, options?: HttpRequestOptions): Promise<TResponse>;
  patch<TResponse, TBody = unknown>(path: string, body?: TBody, options?: HttpRequestOptions): Promise<TResponse>;
  delete<TResponse = void>(path: string, options?: HttpRequestOptions): Promise<TResponse>;
}
