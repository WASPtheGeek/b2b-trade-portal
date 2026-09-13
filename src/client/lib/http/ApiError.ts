import type { ProblemDetails } from "./ProblemDetails";

const DEFAULT_TITLE = "Pieprasījums neizdevās";
const DEFAULT_DETAIL = "Neizdevās izpildīt pieprasījumu. Lūdzu, mēģiniet vēlreiz.";

/** Thrown by the HTTP client whenever the API responds with a non-2xx status code. */
export class ApiError extends Error {
  readonly status: number;
  readonly title: string;

  constructor(status: number, problem: ProblemDetails) {
    super(resolveDetail(problem));

    this.name = "ApiError";
    this.status = status;
    this.title = problem.title ?? DEFAULT_TITLE;
  }
}

/**
 * Resolves a human-readable message from a `ProblemDetails` body.
 *
 * Prefers the explicit `detail` set by the server's `ApiExceptionHandler`; falls
 * back to flattening ASP.NET Core's automatic model-validation `errors` map,
 * since that path never sets `detail`.
 *
 * @param problem The parsed error body.
 * @returns The message to surface to the user.
 */
function resolveDetail(problem: ProblemDetails): string {
  if (problem.detail) {
    return problem.detail;
  }

  if (problem.errors) {
    const messages = Object.values(problem.errors).flat();

    if (messages.length > 0) {
      return messages.join(" ");
    }
  }

  return DEFAULT_DETAIL;
}
