"use client";

import { useState, type HTMLAttributes, type MouseEventHandler, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";

export interface PromoTileProps extends Omit<HTMLAttributes<HTMLElement>, "onClick" | "title"> {
  kicker?: ReactNode;
  title: ReactNode;
  body?: ReactNode;
  cta?: ReactNode;
  tone?: "warm" | "dark" | "plain";
  onClick?: MouseEventHandler<HTMLElement>;
}

const TONES = {
  warm: { bg: "bg-orange-100", fg: "text-orange-900", sub: "text-orange-800", kick: "text-orange-700" },
  dark: { bg: "bg-nav-bar", fg: "text-white", sub: "text-white/66", kick: "text-orange-400" },
  plain: { bg: "bg-surface-card", fg: "text-text-strong", sub: "text-text-muted", kick: "text-orange-600" },
} as const;

export function PromoTile({ kicker, title, body, cta, tone = "warm", onClick, className, ...rest }: PromoTileProps) {
  const [hover, setHover] = useState(false);
  const t = TONES[tone];

  return (
    <article
      onClick={ onClick }
      onMouseEnter={ () => setHover(true) }
      onMouseLeave={ () => setHover(false) }
      className={ cn(
        "flex flex-col rounded-card py-4 px-[18px] border transition-shadow duration-base ease-out",
        t.bg,
        tone === "plain" ? "border-border-warm" : "border-transparent",
        onClick ? "cursor-pointer" : "cursor-default",
        hover && onClick ? "shadow-md" : "shadow-none",
        className,
      ) }
      { ...rest }
    >
      { kicker ? <span className={ cn("font-mono text-[10px] font-medium tracking-[.12em] uppercase", t.kick) }>{ kicker }</span> : null }
      <h3 className={ cn("text-[15.5px] font-semibold leading-[1.3] mt-[7px] text-balance", t.fg) }>{ title }</h3>
      { body ? <p className={ cn("text-[12.5px] leading-[1.5] mt-[5px] text-balance", t.sub) }>{ body }</p> : null }
      { cta ? (
        <span
          className={ cn(
            "flex items-center gap-1.5 mt-auto pt-3.5 text-[12.5px] font-semibold",
            tone === "dark" ? "text-orange-400" : "text-orange-700",
          ) }
        >
          { cta }
          <Icon name="arrow-right" size={ 13 } className={ cn("transition-transform duration-base ease-out", hover && "translate-x-[3px]") } />
        </span>
      ) : null }
    </article>
  );
}
