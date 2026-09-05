import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface SectionLabelProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  align?: "left" | "center";
  tone?: "brand" | "muted" | "strong";
  rules?: boolean;
}

const TONE_CLASS: Record<NonNullable<SectionLabelProps["tone"]>, string> = {
  brand: "text-orange-600",
  muted: "text-text-subtle",
  strong: "text-text-strong",
};

/* Editorial rule-line label: hairline - tracked mono small caps - hairline. The tracking is
   what makes it read as considered rather than as a plain heading. */
export function SectionLabel({ children, align = "center", tone = "brand", rules = true, className, ...rest }: SectionLabelProps) {
  const rule = <span aria-hidden className="h-px flex-1 min-w-4 bg-border-warm" />;

  return (
    <div className={ cn("flex items-center gap-4", className) } { ...rest }>
      { rules && align !== "left" ? rule : null }
      <span className={ cn("font-mono text-[11px] font-medium tracking-[.15em] uppercase whitespace-nowrap", TONE_CLASS[tone]) }>
        { children }
      </span>
      { rules ? rule : null }
    </div>
  );
}
