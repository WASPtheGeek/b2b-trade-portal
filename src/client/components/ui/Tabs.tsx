"use client";

import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Badge } from "./Badge";

export interface TabItem {
  value: string;
  label: ReactNode;
  count?: number | string;
}

export interface TabsProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  tabs?: TabItem[];
  value?: string;
  onChange?: (value: string) => void;
  variant?: "underline" | "pill";
}

export function Tabs({ tabs = [], value, onChange, variant = "underline", className, ...rest }: TabsProps) {
  const pill = variant === "pill";

  return (
    <div
      role="tablist"
      className={ cn("flex items-center", pill ? "gap-1.5" : "gap-5 border-b border-border-default", className) }
      { ...rest }
    >
      { tabs.map((tab) => {
        const on = tab.value === value;

        return (
          <button
            key={ tab.value }
            type="button"
            role="tab"
            aria-selected={ on }
            onClick={ () => onChange?.(tab.value) }
            className={ cn(
              "flex items-center gap-[7px] font-sans text-[13.5px] whitespace-nowrap cursor-pointer transition-colors duration-fast ease-standard",
              on ? "font-semibold" : "font-normal",
              pill
                ? cn(
                  "h-8 px-[13px] rounded-pill border",
                  on ? "bg-neutral-900 text-white border-transparent" : "bg-white text-text-body border-border-default hover:bg-surface-hover",
                )
                : cn(
                  "h-10 -mb-px border-b-2",
                  on ? "border-orange-500 text-text-strong" : "border-transparent text-text-muted hover:text-text-body",
                ),
            ) }
          >
            { tab.label }
            { tab.count != null ? (
              <Badge
                tone={ on && !pill ? "brand" : on ? "outline" : "neutral" }
                size="sm"
                className={ on && pill ? "bg-white/16 text-white border-transparent" : undefined }
              >
                { tab.count }
              </Badge>
            ) : null }
          </button>
        );
      }) }
    </div>
  );
}
