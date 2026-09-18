import { FetchHttpClient } from "./FetchHttpClient";
import type { HttpClient } from "./HttpClient";

/** Shared `HttpClient` instance used across the app. */
export const apiClient: HttpClient = new FetchHttpClient();
