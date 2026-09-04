import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { Icon, type IconName } from "./Icon";

export type BadgeTone =
  | "neutral"
  | "brand"
  | "amber"
  | "green"
  | "red"
  | "blue"
  | "purple"
  | "cyan"
  | "yellow"
  | "dark"
  | "outline";

/* soft (default): tinted body + accent cap bar. solid: saturated fill, for counts/promos. */
export type BadgeVariant = "soft" | "solid";

const TONES: Record<BadgeTone, { soft: string; solid: string; cap: string; dot: string }> = {
  neutral: { soft: "bg-neutral-100 text-neutral-700 border-neutral-200", solid: "bg-neutral-700 border-neutral-800", cap: "bg-neutral-500", dot: "bg-neutral-500" },
  brand: { soft: "bg-orange-50 text-orange-700 border-orange-200", solid: "bg-brand border-orange-700", cap: "bg-orange-500", dot: "bg-orange-500" },
  amber: { soft: "bg-status-pending-bg text-status-pending-fg border-status-pending-bd", solid: "bg-amber-500 border-amber-600", cap: "bg-amber-500", dot: "bg-amber-500" },
  green: { soft: "bg-status-approved-bg text-status-approved-fg border-status-approved-bd", solid: "bg-green-500 border-green-700", cap: "bg-green-500", dot: "bg-green-500" },
  red: { soft: "bg-status-rejected-bg text-status-rejected-fg border-status-rejected-bd", solid: "bg-red-500 border-red-700", cap: "bg-red-500", dot: "bg-red-500" },
  blue: { soft: "bg-status-confirmed-bg text-status-confirmed-fg border-status-confirmed-bd", solid: "bg-blue-500 border-blue-600", cap: "bg-blue-500", dot: "bg-blue-500" },
  purple: { soft: "bg-status-processing-bg text-status-processing-fg border-status-processing-bd", solid: "bg-purple-600 border-purple-600", cap: "bg-purple-600", dot: "bg-purple-600" },
  cyan: { soft: "bg-status-shipped-bg text-status-shipped-fg border-status-shipped-bd", solid: "bg-cyan-600 border-cyan-600", cap: "bg-cyan-600", dot: "bg-cyan-600" },
  yellow: { soft: "bg-status-partial-bg text-status-partial-fg border-status-partial-bd", solid: "bg-yellow-600 border-yellow-600", cap: "bg-yellow-600", dot: "bg-yellow-600" },
  dark: { soft: "bg-neutral-900 text-white border-neutral-900", solid: "bg-neutral-900 border-neutral-950", cap: "bg-orange-400", dot: "bg-orange-400" },
  outline: { soft: "bg-transparent text-text-muted border-border-default", solid: "bg-transparent border-border-default", cap: "bg-neutral-400", dot: "bg-neutral-400" },
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  size?: "sm" | "md";
  variant?: BadgeVariant;
  dot?: boolean;
  icon?: IconName;
  square?: boolean;
  cap?: boolean;
}

export function Badge({
  children,
  tone = "neutral",
  size = "md",
  variant = "soft",
  dot = false,
  icon,
  square = false,
  cap = true,
  className,
  ...rest
}: BadgeProps) {
  const sm = size === "sm";
  const solid = variant === "solid";
  const showCap = cap && !solid && tone !== "outline";
  const t = TONES[tone];

  return (
    <span
      className={ cn(
        "relative inline-flex items-center align-middle whitespace-nowrap overflow-hidden border",
        "font-sans text-[12.5px] font-medium tracking-[0.002em] leading-[1.3]",
        sm && "gap-[5px] text-[11.5px] py-0.5",
        !sm && "gap-1.5 py-[3px]",
        square ? "rounded-sm" : "rounded-badge",
        showCap ? (sm ? "pl-[11px] pr-[9px]" : "pl-[13px] pr-[11px]") : sm ? "px-[9px]" : "px-[11px]",
        solid ? cn(t.solid, "text-white shadow-xs") : t.soft,
        className,
      ) }
      { ...rest }
    >
      { showCap ? <span aria-hidden className={ cn("absolute left-0 top-0 bottom-0 w-[3.5px] opacity-90", t.cap) } /> : null }
      { dot ? (
        <span
          aria-hidden
          className={ cn("shrink-0 rounded-full", sm ? "w-[5px] h-[5px]" : "w-1.5 h-1.5", solid ? "bg-white/92" : t.dot) }
        />
      ) : null }
      { icon ? <Icon name={ icon } size={ sm ? 11 : 12 } className={ solid ? "text-white/95" : undefined } /> : null }
      { children }
    </span>
  );
}
