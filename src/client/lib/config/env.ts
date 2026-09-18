/**
 * Runtime configuration read from environment variables.
 *
 * Kept behind a single typed accessor so the rest of the app never reads
 * `process.env` directly — swapping the source (build-time env, remote config, …)
 * only means changing this file.
 */
export interface AppConfig {
  /** Base URL of the Elkaro API, guaranteed to have no trailing slash. */
  readonly apiBaseUrl: string;
}

const DEFAULT_API_BASE_URL = "http://localhost:5001";

/**
 * Reads and normalizes the API base URL from `NEXT_PUBLIC_API_BASE_URL`.
 *
 * @returns The configured API base URL, or a local development default when unset.
 */
function readApiBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!configured) {
    return DEFAULT_API_BASE_URL;
  }

  return configured.replace(/\/+$/, "");
}

export const appConfig: AppConfig = {
  apiBaseUrl: readApiBaseUrl(),
};
