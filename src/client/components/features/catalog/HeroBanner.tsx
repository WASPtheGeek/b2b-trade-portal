"use client";

import { useRef, useState, type HTMLAttributes, type MouseEventHandler, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface HeroBannerProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  kicker?: ReactNode;
  title: ReactNode;
  body?: ReactNode;
  actions?: ReactNode;
  aside?: ReactNode;
}

const GLOW_SIZE = 420;

/* Dark hero. The orange glow is a pointer-tracked radial: it rests in the bottom-right
   corner and jumps to the cursor while the pointer is over the banner, so the surface reads
   as lit rather than printed. Position is written straight to the DOM via a ref instead of
   React state, and isn't transitioned - a state round-trip plus an eased left/top transition
   made the glow visibly lag behind the cursor. Falls back to the resting position on touch
   (no pointer events fire there). Only opacity (rare enter/leave toggles) goes through state. */
export function HeroBanner({ kicker, title, body, actions, aside, className, ...rest }: HeroBannerProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const glowRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(false);

  const onMove: MouseEventHandler<HTMLElement> = (e) => {
    const section = sectionRef.current;
    const glow = glowRef.current;

    if (!section || !glow) {
      return;
    }

    const r = section.getBoundingClientRect();
    glow.style.left = `${e.clientX - r.left - GLOW_SIZE / 2}px`;
    glow.style.top = `${e.clientY - r.top - GLOW_SIZE / 2}px`;

    if (!active) {
      setActive(true);
    }
  };

  const onLeave = () => {
    setActive(false);
    const glow = glowRef.current;

    if (glow) {
      glow.style.left = "";
      glow.style.top = "";
    }
  };

  return (
    <section
      ref={ sectionRef }
      onMouseMove={ onMove }
      onMouseLeave={ onLeave }
      className={ cn("relative bg-nav-bar rounded-lg overflow-hidden pt-6 px-5 pb-7 sm:pt-8 sm:px-8 sm:pb-9 lg:pt-10 lg:pr-11 lg:pb-11 lg:pl-11", className) }
      { ...rest }
    >
      <div
        ref={ glowRef }
        aria-hidden
        className={ cn("absolute rounded-full transition-opacity duration-slow ease-out", !active && "right-[-110px] bottom-[-190px]") }
        style={ {
          width: GLOW_SIZE,
          height: GLOW_SIZE,
          background: "radial-gradient(circle, rgba(245,130,10,.34) 0%, rgba(245,130,10,0) 68%)",
          opacity: active ? 1 : 0.82,
        } }
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={ { background: "linear-gradient(105deg, rgba(23,23,26,0) 55%, rgba(245,130,10,.07) 100%)" } }
      />
      <div className="relative max-w-[520px]">
        { kicker ? <span className="font-mono text-[11px] font-medium tracking-[.15em] uppercase text-orange-400">{ kicker }</span> : null }
        <h1 className="text-[28px] sm:text-[34px] lg:text-[40px] leading-[1.1] tracking-[-.024em] font-semibold text-white mt-[15px] text-balance">
          { title }
        </h1>
        { body ? <p className="text-[14.5px] leading-[1.65] text-white/68 mt-[15px] text-balance">{ body }</p> : null }
        { actions ? <div className="flex gap-2.5 mt-6 flex-wrap">{ actions }</div> : null }
      </div>
      { aside }
    </section>
  );
}
