"use client";

import { useEffect, useRef, useState, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface ScrollRevealProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  delay?: number;
  distance?: number;
  from?: "bottom" | "left" | "right";
  once?: boolean;
}

/* Reveals children once they enter the viewport. `from` picks the entrance direction -
   'bottom' (default), 'left' or 'right' for banners that slide in toward the centre. Fires
   once, never reverses, and is a no-op under prefers-reduced-motion (the global media query
   flattens the transition duration in tokens/base.css). */
export function ScrollReveal({ children, delay = 0, distance = 16, from = "bottom", once = true, className, style, ...rest }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;

    if (!el || typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setShown(true);
            if (once) io.unobserve(e.target);
          } else if (!once) {
            setShown(false);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.06 },
    );
    io.observe(el);

    return () => io.disconnect();
  }, [once]);

  const off = from === "left" ? `translateX(-${distance}px)` : from === "right" ? `translateX(${distance}px)` : `translateY(${distance}px)`;
  const dur = from === "bottom" ? 620 : 780;

  return (
    <div
      ref={ ref }
      className={ cn("h-full", className) }
      style={ {
        opacity: shown ? 1 : 0,
        transform: shown ? "none" : off,
        transition: `opacity ${dur}ms var(--ease-out) ${delay}ms, transform ${dur}ms var(--ease-out) ${delay}ms`,
        willChange: "opacity, transform",
        ...style,
      } }
      { ...rest }
    >
      { children }
    </div>
  );
}
