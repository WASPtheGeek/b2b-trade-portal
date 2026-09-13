"use client";

import { useEffect, useRef, useState, type ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";
import { Icon, type IconName } from "./Icon";

const iconButton = cva(
  [
    "group relative isolate inline-flex items-center justify-center rounded-control border",
    "transition-[background-color,border-color,color,box-shadow] duration-base ease-standard hover:shadow-md",
    "disabled:cursor-not-allowed disabled:bg-action-disabled-bg disabled:text-action-disabled-fg disabled:border-border-subtle disabled:hover:shadow-none",
  ],
  {
    variants: {
      variant: {
        primary: "bg-brand text-white border-transparent",
        success: "bg-white text-green-700 border-green-100 hover:border-green-600",
        danger: "bg-white text-red-700 border-red-100 hover:border-red-600",
        secondary: "bg-white text-text-strong border-neutral-300 hover:border-neutral-400",
        inverse: "bg-transparent text-white border-transparent",
        ghost: "bg-transparent text-text-muted border-transparent",
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

// The hover fill for each variant, revealed via a scaled overlay rather than a background-color
// transition - it grows in from the bottom edge on hover and recedes back down on hover-out,
// instead of fading or nudging the button out of place.
const OVERLAY_COLOR: Record<NonNullable<IconButtonProps["variant"]>, string> = {
  primary: "bg-orange-600",
  success: "bg-green-50",
  danger: "bg-red-50",
  secondary: "bg-neutral-50",
  inverse: "bg-white/14",
  ghost: "bg-neutral-100",
};

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

  const iconSize = size === "xs" ? 14 : size === "lg" ? 21 : 17;
  const overlayColor = OVERLAY_COLOR[variant ?? "ghost"];

  return (
    <button
      type="button"
      title={ label }
      aria-label={ label }
      disabled={ disabled }
      className={ cn(iconButton({ variant, size }), className) }
      { ...rest }
    >
      <span aria-hidden className="absolute inset-0 rounded-control overflow-hidden">
        <span aria-hidden className={ cn("absolute inset-0 origin-bottom scale-y-0 transition-transform duration-base ease-standard group-hover:scale-y-100", overlayColor) } />
      </span>
      <span className="relative">
        <Icon name={ icon } size={ iconSize } />
      </span>
      { badge != null ? (
        <span
          key={ bump }
          className={ cn(
            "absolute -top-[2px] -right-[2px] min-w-[19px] h-[19px] px-1 rounded-full",
            "bg-brand text-white text-[10px] leading-none font-semibold flex items-center justify-center",
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
