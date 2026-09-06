import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type LoaderSize = "sm" | "md" | "lg";
export type LoaderTone = "brand" | "neutral" | "inverse";

export interface LoaderProps extends Omit<HTMLAttributes<HTMLSpanElement>, "aria-label"> {
  size?: LoaderSize;
  /** Text shown above the dots. When omitted, `loadingLabel` becomes the accessible name instead. */
  label?: string;
  /** Read by assistive tech when no visible `label` is given. */
  loadingLabel?: string;
  tone?: LoaderTone;
  /** Centers the loader on a translucent veil filling the nearest positioned ancestor. */
  overlay?: boolean;
}

const DOT_SIZE: Record<LoaderSize, { diameter: number; gap: number }> = {
  sm: { diameter: 5, gap: 4 },
  md: { diameter: 7, gap: 5 },
  lg: { diameter: 10, gap: 7 },
};

const DOT_COLOR: Record<LoaderTone, string> = {
  brand: "var(--orange-500)",
  neutral: "var(--neutral-400)",
  inverse: "var(--orange-400)",
};

// One literal class per dot (rather than an inline `animation-delay`) so Tailwind's static
// scan can find them — a class string built at runtime from a template literal wouldn't survive it.
const DOT_ANIMATION_CLASS = [
  "animate-[elkaro-dot-bounce_1.08s_var(--ease-in-out)_0s_infinite]",
  "animate-[elkaro-dot-bounce_1.08s_var(--ease-in-out)_0.14s_infinite]",
  "animate-[elkaro-dot-bounce_1.08s_var(--ease-in-out)_0.28s_infinite]",
];

/**
 * Three-dot wave spinner in brand orange.
 *
 * Prefer a skeleton when the shape of the incoming content is known — the
 * layout shouldn't jump when data arrives. Reach for this only when there's
 * no layout to hold: a submit in flight, work inside a button, or a card
 * refreshing in place via `overlay` (the container needs `position: relative`).
 */
export function Loader({
  size = "md",
  label,
  loadingLabel = "Loading",
  tone = "brand",
  overlay = false,
  className,
  ...rest
}: LoaderProps) {
  const { diameter, gap } = DOT_SIZE[size];
  const color = DOT_COLOR[tone];
  const haloWidth = tone === "neutral" ? 0 : diameter / 2.6;

  const dots = (
    <span aria-hidden className="inline-flex items-end" style={ { gap, height: Math.round(diameter * 1.6) } }>
      { [0, 1, 2].map((i) => (
        <span
          key={ i }
          className={ cn("rounded-full", DOT_ANIMATION_CLASS[i]) }
          style={ {
            width: diameter,
            height: diameter,
            background: color,
            boxShadow: haloWidth ? `0 0 0 ${haloWidth}px var(--orange-50)` : "none",
            willChange: "transform, opacity",
          } }
        />
      )) }
    </span>
  );

  const body = (
    <span
      role="status"
      aria-live="polite"
      aria-label={ label ? undefined : loadingLabel }
      className={ cn(
        "inline-flex flex-col items-center align-middle",
        size === "lg" ? "gap-[11px]" : "gap-2",
        overlay ? undefined : className,
      ) }
      { ...(overlay ? {} : rest) }
    >
      { label ? (
        <span
          className={ cn(
            "font-mono font-medium",
            size === "lg" ? "text-[13.5px]" : "text-[12.5px]",
            tone === "inverse" ? "text-white/82" : "text-text-muted",
          ) }
        >
          { label }
        </span>
      ) : null }
      { dots }
    </span>
  );

  if (!overlay) {
    return body;
  }

  return (
    <span
      className={ cn(
        "absolute inset-0 z-[5] flex items-center justify-center rounded-[inherit] backdrop-blur-[2px]",
        "animate-[elkaro-scrim-in_var(--dur-base)_var(--ease-standard)_both]",
        tone === "inverse" ? "bg-[rgba(23,23,26,.66)]" : "bg-white/74",
        className,
      ) }
      { ...rest }
    >
      { body }
    </span>
  );
}
