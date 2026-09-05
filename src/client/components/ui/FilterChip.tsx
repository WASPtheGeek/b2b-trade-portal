"use client";

import { useState, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "./Icon";

export interface FilterChipProps extends HTMLAttributes<HTMLSpanElement> {
  label?: ReactNode;
  value: ReactNode;
  onRemove?: () => void;
  tone?: "neutral" | "brand";
  removeLabel?: (value: string) => string;
}

export function FilterChip({
  label,
  value,
  onRemove,
  tone = "neutral",
  removeLabel = (v) => `Remove filter: ${v}`,
  className,
  ...rest
}: FilterChipProps) {
  const [hover, setHover] = useState(false);
  const brand = tone === "brand";

  return (
    <span
      onMouseEnter={ () => setHover(true) }
      onMouseLeave={ () => setHover(false) }
      className={ cn(
        "inline-flex items-center gap-1.5 h-7 rounded-pill border font-sans text-[12.5px] whitespace-nowrap animate-pop transition-[background-color,border-color,color] duration-fast ease-standard",
        onRemove ? "pl-[11px] pr-1" : "pl-[11px] pr-[11px]",
        brand ? "bg-orange-50 border-orange-200 text-orange-800" : hover ? "bg-neutral-100 border-border-default text-text-body" : "bg-neutral-50 border-border-default text-text-body",
        className,
      ) }
      { ...rest }
    >
      { label ? <span className={ brand ? "text-orange-600" : "text-text-subtle" }>{ label }:</span> : null }
      <span className="font-medium">{ value }</span>
      { onRemove ? (
        <button
          type="button"
          onClick={ onRemove }
          aria-label={ removeLabel(String(value)) }
          className={ cn(
            "flex items-center justify-center w-5 h-5 rounded-full border-none bg-transparent cursor-pointer",
            brand ? "text-orange-600" : "text-text-subtle",
          ) }
        >
          <Icon name="x" size={ 12 } />
        </button>
      ) : null }
    </span>
  );
}
