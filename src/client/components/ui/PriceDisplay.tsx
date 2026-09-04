import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { fmtEur } from "@/lib/money";
import { Icon } from "./Icon";

export interface PriceDisplayProps extends HTMLAttributes<HTMLDivElement> {
  price: number;
  unit?: string;
  masked?: boolean;
  size?: "sm" | "md" | "lg";
  total?: number;
  totalLabel?: string;
  maskedText?: string;
  note?: string;
}

export function PriceDisplay({
  price,
  unit = "pc.",
  masked = false,
  size = "md",
  total,
  totalLabel = "Total",
  maskedText = "Sign in to see wholesale prices",
  note = "excl. VAT",
  className,
  ...rest
}: PriceDisplayProps) {
  if (masked) {
    return (
      <div
        className={ cn(
          "flex items-center gap-[7px] text-text-subtle leading-[1.4]",
          size === "sm" ? "text-xs" : "text-[12.5px]",
          className,
        ) }
        { ...rest }
      >
        <Icon name="lock" size={ 13 } className="text-text-disabled" />
        <span className="text-balance">{ maskedText }</span>
      </div>
    );
  }

  return (
    <div className={ className } { ...rest }>
      <div className="flex items-baseline gap-[5px] flex-wrap">
        <span
          className={ cn(
            "font-semibold text-price [font-variant-numeric:tabular-nums] text-text-strong",
            size === "sm" && "text-price-s",
            size === "lg" && "text-[26px]",
          ) }
        >
          { fmtEur(price) }
        </span>
        { unit ? <span className={ cn("font-normal text-text-subtle", size === "sm" ? "text-xs" : "text-[13px]") }>/ { unit }</span> : null }
        { note ? <span className="text-[11px] text-text-disabled">{ note }</span> : null }
      </div>
      { total != null ? (
        <div className="mt-1 text-[13px] text-text-body [font-variant-numeric:tabular-nums]">
          <span className="text-text-subtle">{ totalLabel }: </span>
          <span className="font-semibold text-orange-700">{ fmtEur(total) }</span>
        </div>
      ) : null }
    </div>
  );
}
