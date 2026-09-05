import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon, type IconName } from "./Icon";

export interface EmptyStateProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  icon?: IconName;
  title: ReactNode;
  actions?: ReactNode;
  tone?: "neutral" | "danger" | "brand";
  compact?: boolean;
}

const TONE: Record<NonNullable<EmptyStateProps["tone"]>, { bg: string; fg: string }> = {
  neutral: { bg: "bg-surface-sunken", fg: "text-text-subtle" },
  danger: { bg: "bg-red-50", fg: "text-red-500" },
  brand: { bg: "bg-orange-50", fg: "text-orange-600" },
};

export function EmptyState({ icon = "search-x", title, children, actions, tone = "neutral", compact = false, className, ...rest }: EmptyStateProps) {
  const t = TONE[tone];

  return (
    <div className={ cn("flex flex-col items-center text-center", compact ? "py-[30px] px-5" : "py-[54px] px-6", className) } { ...rest }>
      <span
        className={ cn("flex items-center justify-center rounded-full mb-[15px]", compact ? "w-10 h-10" : "w-[52px] h-[52px]", t.bg, t.fg) }
      >
        <Icon name={ icon } size={ compact ? 19 : 24 } />
      </span>
      <h3 className={ cn("font-semibold text-text-strong tracking-[-0.008em]", compact ? "text-[14.5px]" : "text-h3") }>{ title }</h3>
      { children ? <p className="text-[13.5px] leading-[1.55] text-text-muted mt-[7px] max-w-[400px] text-balance">{ children }</p> : null }
      { actions ? <div className="flex gap-2 mt-[18px] flex-wrap justify-center">{ actions }</div> : null }
    </div>
  );
}
