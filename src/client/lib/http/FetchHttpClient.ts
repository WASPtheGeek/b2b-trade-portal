import { appConfig } from "@/lib/config/env";
import { ApiError } from "./ApiError";
import type { HttpClient, HttpRequestOptions } from "./HttpClient";
import type { ProblemDetails } from "./ProblemDetails";

/** `HttpClient` implementation backed by the standard `fetch` API. */
export class FetchHttpClient implements HttpClient {
  constructor(private readonly baseUrl: string = appConfig.apiBaseUrl) {}

  async get<TResponse>(path: string, options?: HttpRequestOptions): Promise<TResponse> {
    return this.request<TResponse>("GET", path, undefined, options);
  }

  async post<TResponse, TBody = unknown>(path: string, body?: TBody, options?: HttpRequestOptions): Promise<TResponse> {
    return this.request<TResponse>("POST", path, body, options);
  }

  async put<TResponse, TBody = unknown>(path: string, body?: TBody, options?: HttpRequestOptions): Promise<TResponse> {
    return this.request<TResponse>("PUT", path, body, options);
  }

  async patch<TResponse, TBody = unknown>(path: string, body?: TBody, options?: HttpRequestOptions): Promise<TResponse> {
    return this.request<TResponse>("PATCH", path, body, options);
  }

  async delete<TResponse = void>(path: string, options?: HttpRequestOptions): Promise<TResponse> {
    return this.request<TResponse>("DELETE", path, undefined, options);
  }

  /**
   * Executes a single HTTP request against the configured API base URL.
   *
   * @param method The HTTP method to use.
   * @param path The request path, relative to the API base URL.
   * @param body The request body, serialized as JSON when present.
   * @param options Per-request overrides (auth token, abort signal).
   * @returns The parsed JSON response body.
   */
  private async request<TResponse>(
    method: string,
    path: string,
    body: unknown,
    options?: HttpRequestOptions,
  ): Promise<TResponse> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: this.buildHeaders(options?.token),
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: options?.signal,
    });

    if (!response.ok) {
      await this.throwApiError(response);
    }

    if (response.status === 204) {
      return undefined as TResponse;
    }

    return (await response.json()) as TResponse;
  }

  private buildHeaders(token?: string): HeadersInit {
    const headers: Record<string, string> = { "Content-Type": "application/json" };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Parses a failed response's body as `ProblemDetails` and throws it as an `ApiError`.
   *
   * @param response The failed `fetch` response.
   */
  private async throwApiError(response: Response): Promise<never> {
    const problem = (await response.json().catch(() => ({}))) as ProblemDetails;

    throw new ApiError(response.status, problem);
  }
}
