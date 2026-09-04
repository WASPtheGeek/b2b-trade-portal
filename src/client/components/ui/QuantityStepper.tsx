"use client";

import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "./Icon";

export interface QuantityStepperProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  value?: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unitLabel?: string;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  decreaseLabel?: string;
  increaseLabel?: string;
}

const H = { sm: 32, md: 38, lg: 44 };

export function QuantityStepper({
  value = 1,
  onChange,
  min = 1,
  max = 9999,
  step = 1,
  unitLabel,
  size = "md",
  disabled = false,
  decreaseLabel = "Decrease quantity",
  increaseLabel = "Increase quantity",
  className,
  ...rest
}: QuantityStepperProps) {
  const h = H[size];
  const set = (n: number) => onChange?.(Math.max(min, Math.min(max, n)));

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-control border border-border-default overflow-hidden",
        disabled ? "bg-action-disabled-bg" : "bg-white",
        className,
      )}
      style={{ height: h }}
      {...rest}
    >
      <button
        type="button"
        aria-label={decreaseLabel}
        disabled={disabled}
        onClick={() => set(value - step)}
        className={cn(
          "h-full flex items-center justify-center bg-transparent",
          disabled ? "text-text-disabled cursor-not-allowed" : "text-text-muted cursor-pointer",
        )}
        style={{ width: h - 2 }}
      >
        <Icon name="minus" size={14} />
      </button>
      <input
        value={value}
        disabled={disabled}
        inputMode="numeric"
        onChange={(e) => {
          const n = Number.parseInt(e.target.value.replace(/\D/g, ""), 10);
          set(Number.isNaN(n) ? min : n);
        }}
        className={cn(
          "h-full text-center border-x border-border-subtle outline-hidden bg-transparent",
          "font-mono text-[13px] font-medium text-text-strong [font-variant-numeric:tabular-nums]",
        )}
        style={{ width: unitLabel ? 58 : 42 }}
      />
      {unitLabel ? <span className="px-2 text-[11.5px] text-text-subtle whitespace-nowrap">{unitLabel}</span> : null}
      <button
        type="button"
        aria-label={increaseLabel}
        disabled={disabled}
        onClick={() => set(value + step)}
        className={cn(
          "h-full flex items-center justify-center bg-transparent",
          disabled ? "text-text-disabled cursor-not-allowed" : "text-text-muted cursor-pointer",
        )}
        style={{ width: h - 2 }}
      >
        <Icon name="plus" size={14} />
      </button>
    </div>
  );
}
