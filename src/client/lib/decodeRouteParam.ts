/**
 * Decodes a dynamic route segment from `useParams()`, which hands back non-ASCII segments still
 * percent-encoded (e.g. `lod%C4%AB%C5%A1u`). Services encode the value again when building API
 * URLs, so passing it on undecoded double-encodes it (`%25C4…`) and the lookup 404s.
 *
 * @param value The raw route segment.
 * @returns The decoded segment, or `value` unchanged if it isn't valid percent-encoding.
 */
export function decodeRouteParam(value: string): string {
  try {
    return decodeURIComponent(value);
  }
  catch {
    return value;
  }
}
