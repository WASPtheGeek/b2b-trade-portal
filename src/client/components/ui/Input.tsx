"use client";

import { useState, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  size?: "sm" | "md" | "lg";
  invalid?: boolean;
  mono?: boolean;
  suffix?: ReactNode;
  fullWidth?: boolean;
}

const HEIGHT: Record<NonNullable<InputProps["size"]>, string> = {
  sm: "h-control-sm",
  md: "h-control-md",
  lg: "h-control-lg",
};

export function Input({
  size = "md",
  invalid = false,
  mono = false,
  suffix,
  fullWidth = true,
  disabled,
  className,
  ...rest
}: InputProps) {
  const [focus, setFocus] = useState(false);

  return (
    <div
      className={ cn(
        "flex items-center border rounded-control bg-white transition-[border-color,box-shadow] duration-fast ease-standard",
        fullWidth ? "w-full" : "inline-flex",
        HEIGHT[size],
        disabled ? "bg-action-disabled-bg" : undefined,
        invalid
          ? "border-border-danger shadow-[0_0_0_3px_rgba(220,38,38,.16)]"
          : focus
            ? "border-orange-500 shadow-[var(--focus-ring-shadow)]"
            : "border-border-default",
        className,
      ) }
    >
      <input
        disabled={ disabled }
        onFocus={ (e) => {
          setFocus(true);
          rest.onFocus?.(e);
        } }
        onBlur={ (e) => {
          setFocus(false);
          rest.onBlur?.(e);
        } }
        className={ cn(
          "flex-1 min-w-0 h-full px-3 border-none outline-hidden bg-transparent",
          "font-sans text-[13.5px] text-text-strong disabled:text-text-disabled disabled:cursor-not-allowed",
          mono ? "font-mono tabular-nums" : undefined,
          size === "lg" ? "text-[14.5px]" : undefined,
        ) }
        { ...rest }
      />
      { suffix ? <span className="pr-[11px] text-[12.5px] text-text-subtle flex-none">{ suffix }</span> : null }
    </div>
  );
}
