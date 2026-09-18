import type { DataTableSort } from "@/components/ui/DataTable";

/**
 * Sorts a copy of `rows` by the field named in `sort.key`, comparing strings, numbers and
 * booleans appropriately, and reverses the result for `dir: "desc"`.
 *
 * @param rows The rows to sort.
 * @param sort The active sort, or `undefined` to leave `rows` in its original order.
 * @returns The sorted rows (a new array), or `rows` itself when `sort` is unset.
 */
export function sortRows<T>(rows: T[], sort: DataTableSort | undefined): T[] {
  if (!sort) {
    return rows;
  }

  const sorted = [...rows].sort((a, b) => {
    const av = (a as Record<string, unknown>)[sort.key];
    const bv = (b as Record<string, unknown>)[sort.key];

    if (typeof av === "string" && typeof bv === "string") {
      return av.localeCompare(bv);
    }

    if (typeof av === "number" && typeof bv === "number") {
      return av - bv;
    }

    if (typeof av === "boolean" && typeof bv === "boolean") {
      return Number(av) - Number(bv);
    }

    if (av == null && bv == null) {
      return 0;
    }

    return av == null ? -1 : 1;
  });

  return sort.dir === "desc" ? sorted.reverse() : sorted;
}
