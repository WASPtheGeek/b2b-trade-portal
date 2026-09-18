import { ApiError } from "./ApiError";

/**
 * Extracts a user-facing message from a caught error.
 *
 * @param error The value caught from a rejected request promise.
 * @param fallback The message to use when `error` isn't an `ApiError`.
 * @returns The message to display to the user.
 */
export function resolveErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  return fallback;
}
