import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface CardProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  title?: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  padding?: number;
  elevation?: "flat" | "xs" | "sm" | "md" | "lg";
  bodyClassName?: string;
}

const SHADOW: Record<NonNullable<CardProps["elevation"]>, string> = {
  flat: "shadow-none",
  xs: "shadow-xs",
  sm: "shadow-sm",
  md: "shadow-md",
  lg: "shadow-lg",
};

export function Card({
  children,
  title,
  subtitle,
  actions,
  padding = 16,
  elevation = "flat",
  bodyClassName,
  className,
  ...rest
}: CardProps) {
  return (
    <section
      className={ cn("bg-surface-card border border-border-default rounded-card overflow-hidden", SHADOW[elevation], className) }
      { ...rest }
    >
      { title || actions ? (
        <header className="flex items-center justify-between gap-3 py-[13px] px-4 border-b border-border-subtle">
          <div className="min-w-0">
            { title ? <h3 className="text-h4 font-semibold text-text-strong">{ title }</h3> : null }
            { subtitle ? <p className="text-[12.5px] text-text-subtle mt-[3px]">{ subtitle }</p> : null }
          </div>
          { actions ? <div className="flex items-center gap-2 flex-none">{ actions }</div> : null }
        </header>
      ) : null }
      <div className={ bodyClassName } style={ { padding } }>
        { children }
      </div>
    </section>
  );
}
