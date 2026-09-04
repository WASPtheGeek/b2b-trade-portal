import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { Icon, type IconName } from "./Icon";
import type { StatusTone } from "@/lib/status-labels";

const TONE: Record<StatusTone, { tint: string; ink: string; line: string; ac: string; acText: string; icon: IconName }> = {
  neutral: { tint: "bg-neutral-100", ink: "text-neutral-700", line: "border-neutral-200", ac: "bg-neutral-500", acText: "text-neutral-500", icon: "circle-pause" },
  progress: { tint: "bg-status-pending-bg", ink: "text-status-pending-fg", line: "border-status-pending-bd", ac: "bg-amber-500", acText: "text-amber-500", icon: "clock" },
  done: { tint: "bg-status-approved-bg", ink: "text-status-approved-fg", line: "border-status-approved-bd", ac: "bg-green-500", acText: "text-green-500", icon: "circle-check" },
  stopped: { tint: "bg-status-rejected-bg", ink: "text-status-rejected-fg", line: "border-status-rejected-bd", ac: "bg-red-500", acText: "text-red-500", icon: "circle-slash" },
};

export interface StatusBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Visual category - in progress (amber), settled (green), stopped (red), dormant (neutral).
   * Look this up per status from lib/status-labels.ts's *_STATUS_TONES map for the enum
   * you're displaying (types/server-enums.ts) - a bare status string like "Pending" means
   * different things across enums (e.g. UserStatus.Pending vs ImportStatus.Pending), so this
   * component takes the already-resolved tone rather than guessing from the raw value. */
  tone: StatusTone;
  /** Display text - pass the localized label (see the matching *_STATUS_LABELS map) rather
   * than the raw enum value. */
  label: string;
  /** Overrides the tone's default glyph, for statuses with a more specific icon (e.g. a
   * shipped order gets a truck instead of the generic "in progress" clock). */
  icon?: IconName;
  size?: "sm" | "md";
}

/* Four tones only - in progress (amber, pulsing), settled (green), stopped (red), dormant
   (neutral) - but each is a printed chip: a saturated leading cap and a state glyph. Purely
   presentational: it knows nothing about UserStatus/OrderStatus/etc, the caller resolves
   tone + label from the enum it's displaying (see lib/status-labels.ts). */
export function StatusBadge({ tone, label, icon, size = "md", className, ...rest }: StatusBadgeProps) {
  const t = TONE[tone];
  const sm = size === "sm";
  const live = tone === "progress";

  return (
    <span
      title={label}
      className={cn(
        "relative inline-flex items-center overflow-hidden rounded-badge border shadow-[inset_0_1px_0_rgba(255,255,255,.7)]",
        "font-sans font-medium leading-[1.3] tracking-[0.002em] whitespace-nowrap align-middle",
        t.tint,
        t.ink,
        t.line,
        sm ? "gap-[5px] pl-[10px] pr-[9px] py-[2px] text-[11.5px]" : "gap-1.5 pl-[12px] pr-[11px] py-[3px] text-[12.5px]",
        className,
      )}
      {...rest}
    >
      <span aria-hidden className={cn("absolute left-0 top-0 bottom-0 opacity-90", sm ? "w-[3px]" : "w-[3.5px]", t.ac)} />
      <span className={cn("relative flex flex-none items-center justify-center", sm ? "w-3 h-3" : "w-[13px] h-[13px]")}>
        {live ? (
          <span
            aria-hidden
            className={cn("absolute rounded-full animate-[elkaro-status-pulse_2.4s_var(--ease-out)_infinite]", sm ? "inset-[3px]" : "inset-[3.5px]", t.ac)}
          />
        ) : null}
        <Icon name={icon ?? t.icon} size={sm ? 12 : 13} className={t.acText} />
      </span>
      {label}
    </span>
  );
}
