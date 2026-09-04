import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface ProgressBarProps extends HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  label?: string;
  sublabel?: string;
  tone?: "brand" | "success" | "danger" | "yellow";
  size?: "sm" | "md" | "lg";
  showPercent?: boolean;
}

const FILL: Record<NonNullable<ProgressBarProps["tone"]>, string> = {
  brand: "bg-orange-500",
  success: "bg-green-500",
  danger: "bg-red-500",
  yellow: "bg-amber-500",
};

const HEIGHT: Record<NonNullable<ProgressBarProps["size"]>, string> = {
  sm: "h-[5px]",
  md: "h-[7px]",
  lg: "h-2.5",
};

export function ProgressBar({
  value = 0,
  max = 100,
  label,
  sublabel,
  tone = "brand",
  size = "md",
  showPercent = true,
  className,
  ...rest
}: ProgressBarProps) {
  const pct = max ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;

  return (
    <div className={ className } { ...rest }>
      { label || showPercent ? (
        <div className="flex items-baseline justify-between gap-3 mb-[7px]">
          <span className="text-[13px] text-text-body [font-variant-numeric:tabular-nums]">{ label }</span>
          { showPercent ? <span className="font-mono text-[13px] font-semibold text-text-strong">{ Math.round(pct) }%</span> : null }
        </div>
      ) : null }
      <div className={ cn("rounded-pill bg-neutral-200 overflow-hidden", HEIGHT[size]) }>
        <div className={ cn("h-full rounded-pill transition-[width] duration-slow ease-out", FILL[tone]) } style={ { width: `${pct}%` } } />
      </div>
      { sublabel ? <p className="text-xs text-text-subtle mt-[7px] [font-variant-numeric:tabular-nums]">{ sublabel }</p> : null }
    </div>
  );
}
