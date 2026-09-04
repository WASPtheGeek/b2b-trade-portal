import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon, type IconName } from "./Icon";

export type NoticeTone = "brand" | "info" | "amber" | "success" | "danger" | "neutral";

const TONES: Record<NoticeTone, { bg: string; bd: string; fg: string; ic: string; icon: IconName }> = {
  brand: { bg: "bg-orange-50", bd: "border-orange-200", fg: "text-orange-800", ic: "text-orange-600", icon: "info" },
  info: { bg: "bg-blue-50", bd: "border-blue-100", fg: "text-blue-600", ic: "text-blue-500", icon: "info" },
  amber: { bg: "bg-amber-50", bd: "border-amber-100", fg: "text-amber-600", ic: "text-amber-500", icon: "clock" },
  success: { bg: "bg-green-50", bd: "border-green-100", fg: "text-green-600", ic: "text-green-500", icon: "circle-check" },
  danger: { bg: "bg-red-50", bd: "border-red-100", fg: "text-red-600", ic: "text-red-500", icon: "circle-alert" },
  neutral: { bg: "bg-neutral-50", bd: "border-border-default", fg: "text-text-body", ic: "text-text-subtle", icon: "info" },
};

export interface NoticeBannerProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  title?: ReactNode;
  tone?: NoticeTone;
  icon?: IconName;
  actions?: ReactNode;
  onDismiss?: () => void;
  compact?: boolean;
  dismissLabel?: string;
}

export function NoticeBanner({
  children,
  title,
  tone = "brand",
  icon,
  actions,
  onDismiss,
  compact = false,
  dismissLabel = "Dismiss notification",
  className,
  ...rest
}: NoticeBannerProps) {
  const t = TONES[tone];

  return (
    <div
      role="status"
      className={ cn(
        "flex items-start gap-[11px] rounded-card border animate-slide-down",
        t.bg,
        t.bd,
        compact ? "py-[9px] px-3" : "py-[13px] px-[15px]",
        className,
      ) }
      { ...rest }
    >
      <span className={ cn("flex shrink-0 mt-px", t.ic) }>
        <Icon name={ icon || t.icon } size={ compact ? 15 : 17 } />
      </span>
      <div className="flex-1 min-w-0">
        { title ? <p className={ cn("text-[13.5px] font-semibold mb-[3px]", t.fg) }>{ title }</p> : null }
        <div className={ cn("leading-[1.5] text-balance", compact ? "text-[12.5px]" : "text-[13.5px]", t.fg) }>{ children }</div>
        { actions ? <div className="flex gap-2 mt-[11px]">{ actions }</div> : null }
      </div>
      { onDismiss ? (
        <button
          type="button"
          onClick={ onDismiss }
          aria-label={ dismissLabel }
          className={ cn("flex shrink-0 border-none bg-transparent cursor-pointer p-0.5", t.ic) }
        >
          <Icon name="x" size={ 15 } />
        </button>
      ) : null }
    </div>
  );
}
