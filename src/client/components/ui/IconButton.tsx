"use client";

import { useEffect, useRef, useState, type ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";
import { Icon, type IconName } from "./Icon";

const iconButton = cva(
  [
    "relative inline-flex items-center justify-center rounded-control border",
    "transition-[background-color,border-color,color,transform] duration-base ease-standard",
    "hover:-translate-y-[1.5px]",
    "disabled:cursor-not-allowed disabled:translate-y-0 disabled:bg-action-disabled-bg disabled:text-action-disabled-fg disabled:border-border-subtle",
  ],
  {
    variants: {
      variant: {
        primary: "bg-brand text-white border-transparent hover:bg-orange-600",
        success: "bg-white text-green-600 border-green-100 hover:bg-green-50 hover:border-green-500",
        danger: "bg-white text-red-600 border-red-100 hover:bg-red-50 hover:border-red-500",
        secondary: "bg-white text-text-strong border-neutral-300 hover:bg-neutral-50 hover:border-neutral-400",
        inverse: "bg-transparent text-white border-transparent hover:bg-white/14",
        ghost: "bg-transparent text-text-muted border-transparent hover:bg-neutral-100",
      },
      size: {
        xs: "w-control-xs h-control-xs",
        sm: "w-control-sm h-control-sm",
        md: "w-control-md h-control-md",
        lg: "w-control-lg h-control-lg",
      },
    },
    defaultVariants: { variant: "ghost", size: "sm" },
  },
);

export interface IconButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "size">,
  VariantProps<typeof iconButton> {
  icon: IconName;
  label: string;
  badge?: number | string;
}

export function IconButton({ icon, label, variant, size = "sm", badge, disabled, className, ...rest }: IconButtonProps) {
  const [bump, setBump] = useState(0);
  const prev = useRef(badge);

  useEffect(() => {
    if (prev.current !== badge) {
      prev.current = badge;
      setBump((n) => n + 1);
    }
  }, [badge]);

  const iconSize = size === "xs" ? 13 : size === "lg" ? 19 : 16;

  return (
    <button
      type="button"
      title={ label }
      aria-label={ label }
      disabled={ disabled }
      className={ cn(iconButton({ variant, size }), className) }
      { ...rest }
    >
      <Icon name={ icon } size={ iconSize } />
      { badge != null ? (
        <span
          key={ bump }
          className={ cn(
            "absolute -top-[5px] -right-[5px] min-w-[17px] h-[17px] px-1 rounded-full",
            "bg-brand text-white text-[10.5px] font-semibold flex items-center justify-center",
            "border-[1.5px] border-surface-card [font-variant-numeric:tabular-nums]",
            bump ? "animate-[elkaro-bump_var(--dur-slow)_var(--ease-out)]" : undefined,
          ) }
        >
          { badge }
        </span>
      ) : null }
    </button>
  );
}
