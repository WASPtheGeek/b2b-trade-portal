import { lv } from "./lv";
import type { Dictionary } from "./Dictionary";

export type { Dictionary } from "./Dictionary";

/**
 * The app's active dictionary.
 *
 * Only one locale exists today, so this resolves statically. Adding a second
 * locale means: add `./<locale>/` implementing every field of `Dictionary`
 * (the compiler enforces parity with `lv`), then change this constant to
 * pick between them by request locale.
 */
export const dictionary: Dictionary = lv;
