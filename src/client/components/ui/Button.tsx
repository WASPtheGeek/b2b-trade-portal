import { type ButtonHTMLAttributes, type ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";
import { Icon, type IconName } from "./Icon";

const button = cva(
  [
    "group relative isolate inline-flex items-center justify-center min-w-0 overflow-hidden text-center",
    "font-sans font-medium tracking-[-0.002em] whitespace-nowrap",
    "transition-[background-color,border-color,color,box-shadow] duration-fast ease-standard",
    "disabled:cursor-not-allowed disabled:bg-action-disabled-bg disabled:text-action-disabled-fg disabled:border disabled:border-border-subtle disabled:hover:shadow-none",
  ],
  {
    variants: {
      variant: {
        primary: "bg-brand text-white border border-transparent active:bg-orange-700",
        danger: "bg-red-500 text-white border border-transparent active:bg-red-700",
        success: "bg-green-500 text-white border border-transparent active:bg-green-700",
        secondary: "bg-white text-text-strong border border-neutral-300 hover:border-neutral-400",
        ghost: "bg-transparent text-text-body border border-transparent",
        inverse: "bg-white/7 text-white border border-white/18",
        link: "bg-transparent text-orange-700 border border-transparent p-0! hover:text-orange-800 hover:underline underline-offset-2",
      },
      size: {
        xs: "h-control-xs min-h-control-xs px-[12px] text-[length:var(--font-size-base)]",
        sm: "h-control-sm min-h-control-sm px-[16px] text-[length:var(--font-size-base)]",
        md: "h-control-md min-h-control-md px-5 text-[length:var(--font-size-base)]",
        lg: "h-control-lg min-h-control-lg px-6 text-[15px]",
      },
      pill: {
        true: "rounded-pill",
        false: "rounded-control",
      },
      fullWidth: {
        true: "flex w-full",
      },
      wrap: {
        true: "h-auto! py-[7px] leading-[1.3] text-balance whitespace-normal",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      pill: false,
    },
  },
);

// The hover fill for each variant, revealed via a scaled overlay rather than a background-color
// transition - it grows in from the bottom edge on hover and recedes back down on hover-out,
// instead of fading or nudging the button out of place. "link" has no fill to reveal (text-only).
const OVERLAY_COLOR: Partial<Record<NonNullable<ButtonProps["variant"]>, string>> = {
  primary: "bg-orange-600",
  danger: "bg-red-600",
  success: "bg-green-600",
  secondary: "bg-neutral-50",
  ghost: "bg-neutral-100",
  inverse: "bg-white/14",
};

export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "size">,
  VariantProps<typeof button> {
  icon?: IconName;
  iconAfter?: IconName;
  children?: ReactNode;
}

export function Button({
  className,
  variant,
  size = "md",
  pill,
  fullWidth,
  wrap,
  icon,
  iconAfter,
  disabled,
  type = "button",
  children,
  ...rest
}: ButtonProps) {
  const iconSize = size === "lg" ? 17 : size === "xs" ? 13 : 15;
  const overlayColor = OVERLAY_COLOR[variant ?? "primary"];

  return (
    <button
      type={ type }
      disabled={ disabled }
      className={ cn(button({ variant, size, pill, fullWidth, wrap }), overlayColor ? "hover:shadow-md" : undefined, className) }
      { ...rest }
    >
      { overlayColor ? (
        <span
          aria-hidden
          className={ cn(
            "absolute inset-0 origin-bottom scale-y-0 transition-transform duration-fast ease-standard group-hover:scale-y-100",
            overlayColor,
          ) }
        />
      ) : null }
      <span className={ cn("relative inline-flex items-center justify-center min-w-0", size === "xs" ? "gap-[5px]" : "gap-[7px]") }>
        { icon ? <Icon name={ icon } size={ iconSize } /> : null }
        { children }
        { iconAfter ? <Icon name={ iconAfter } size={ iconSize } /> : null }
      </span>
    </button>
  );
}
