import type { HTMLAttributes } from "react";
import Image from "next/image";
import { cn } from "@/lib/cn";
import { Icon } from "./Icon";

export interface ProductMediaProps extends HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  ratio?: string;
  radius?: string;
  zoom?: boolean;
}

/* Placeholder tile. No product photography existed in the supplied sources; swap `src` in
   for the real bitmap once the ERP feed provides image URLs. */
export function ProductMedia({
  src,
  alt = "",
  ratio = "1 / 1",
  radius,
  zoom = false,
  className,
  style,
  ...rest
}: ProductMediaProps) {
  return (
    <div
      className={ cn(
        "relative w-full flex items-center justify-center overflow-hidden bg-surface-media border border-border-subtle",
        !radius && "rounded-media",
        className,
      ) }
      style={ { aspectRatio: ratio, borderRadius: radius, ...style } }
      { ...rest }
    >
      { src ? (
        <Image
          src={ src }
          alt={ alt }
          fill
          className={ cn("object-contain transition-transform duration-slow ease-out", zoom && "scale-105") }
        />
      ) : (
        <Icon name="package" size={ 26 } className="text-neutral-300" />
      ) }
    </div>
  );
}
