const LOGIN_PATH = "/login";

/**
 * Rejects anything but a same-origin relative path, so a crafted `returnTo` value can't send a
 * signed-in visitor off-site (e.g. `//evil.com` or `https://evil.com` both fail this check).
 *
 * @param path The candidate return path (typically read from a `returnTo` search param).
 * @returns Whether `path` is safe to redirect to.
 */
export function isSafeReturnPath(path: string | null | undefined): path is string {
  return !!path && path.startsWith("/") && !path.startsWith("//") && !path.includes("://");
}

/**
 * Builds a `/login` URL carrying the given in-app path, so a successful sign-in can return the
 * visitor to where they started instead of always landing on the home page.
 *
 * @param returnTo The path to return to after signing in (usually the current page).
 * @returns The `/login` URL, with a `returnTo` query param when one is worth keeping.
 */
export function buildLoginUrl(returnTo: string): string {
  if (!isSafeReturnPath(returnTo) || returnTo === LOGIN_PATH) {
    return LOGIN_PATH;
  }

  return `${ LOGIN_PATH }?returnTo=${ encodeURIComponent(returnTo) }`;
}
