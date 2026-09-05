import { type ButtonHTMLAttributes, type ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";
import { Icon, type IconName } from "./Icon";

const button = cva(
  [
    "inline-flex items-center justify-center gap-[7px] min-w-0 overflow-hidden text-center",
    "font-sans font-medium tracking-[-0.002em] whitespace-nowrap",
    "transition-[background-color,border-color,color,box-shadow,transform] duration-fast ease-standard",
    "disabled:cursor-not-allowed disabled:bg-action-disabled-bg disabled:text-action-disabled-fg disabled:border disabled:border-border-subtle disabled:hover:translate-y-0 disabled:hover:shadow-none",
  ],
  {
    variants: {
      variant: {
        primary: "bg-brand text-white border border-transparent hover:bg-orange-600 active:bg-orange-700",
        danger: "bg-red-500 text-white border border-transparent hover:bg-red-600 active:bg-red-700",
        success: "bg-green-500 text-white border border-transparent hover:bg-green-600 active:bg-green-700",
        secondary: "bg-white text-text-strong border border-neutral-300 hover:bg-neutral-50 hover:border-neutral-400",
        ghost: "bg-transparent text-text-body border border-transparent hover:bg-neutral-100",
        inverse: "bg-white/7 text-white border border-white/18 hover:bg-white/14",
        link: "bg-transparent text-orange-700 border border-transparent p-0! hover:text-orange-800 hover:underline underline-offset-2",
      },
      size: {
        xs: "h-control-xs min-h-control-xs px-[10px] text-[12px] gap-[5px]",
        sm: "h-control-sm min-h-control-sm px-[12px] text-[13px]",
        md: "h-control-md min-h-control-md px-4 text-[13.5px]",
        lg: "h-control-lg min-h-control-lg px-5 text-[15px]",
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
    compoundVariants: [
      {
        variant: ["primary", "danger", "success", "secondary"],
        class: "hover:-translate-y-[1.5px] hover:shadow-sm active:translate-y-0 active:scale-[0.985]",
      },
    ],
    defaultVariants: {
      variant: "primary",
      size: "md",
      pill: false,
    },
  },
);

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

  return (
    <button
      type={ type }
      disabled={ disabled }
      className={ cn(button({ variant, size, pill, fullWidth, wrap }), className) }
      { ...rest }
    >
      { icon ? <Icon name={ icon } size={ iconSize } /> : null }
      { children }
      { iconAfter ? <Icon name={ iconAfter } size={ iconSize } /> : null }
    </button>
  );
}
