/**
 * Shape of an RFC 7807 `ProblemDetails` error body.
 *
 * Every Elkaro API endpoint returns this on failure — either via the server's
 * `ApiExceptionHandler` (which always sets `detail`), or via ASP.NET Core's
 * built-in model-validation short-circuit (which omits `detail` and sets
 * `errors` instead, one entry per invalid field).
 */
export interface ProblemDetails {
  title?: string;
  detail?: string;
  status?: number;
  errors?: Record<string, string[]>;
}
