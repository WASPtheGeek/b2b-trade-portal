// ICU treats lv-LV as useGrouping:"min2", which suppresses the thousands space on 4-digit
// numbers ((1284).toLocaleString('lv-LV') === "1284"). Latvian convention groups from four
// digits up, so grouping is forced on. Never call toLocaleString directly for these — go
// through these helpers instead.
const LV_GROUP: Intl.NumberFormatOptions = { useGrouping: "always" };

/** 1284 -> "1 284" */
export function fmtInt(n: number): string {
  return Number(n).toLocaleString("lv-LV", LV_GROUP);
}

/** 1240 -> "€1 240,00" */
export function fmtEur(n: number): string {
  return (
    "€" +
    Number(n).toLocaleString("lv-LV", {
      ...LV_GROUP,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

/** Latvian count agreement: counts ending in 1 (but not 11) take the singular. */
export function plural(n: number, one: string, many: string): string {
  const abs = Math.abs(n) % 100;
  const last = abs % 10;
  return last === 1 && abs !== 11 ? one : many;
}

export const Money = { eur: fmtEur, int: fmtInt, plural };
