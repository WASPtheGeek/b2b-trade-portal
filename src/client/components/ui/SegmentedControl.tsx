"use client";

import { useCallback, useEffect, useRef, useState, type HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface SegmentedOption {
  value: string;
  label: string;
  sub?: string;
  disabled?: boolean;
}

export interface SegmentedControlProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  options?: SegmentedOption[];
  value?: string;
  onChange?: (value: string) => void;
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

/* Unit / view switch. The white pill is a single absolutely-positioned layer that slides and
   resizes to the active option, so switching units reads as one movement instead of two
   background flips. Falls back to a static pill (each option's own background) before the
   first measurement. */
export function SegmentedControl({
  options = [],
  value,
  onChange,
  size = "sm",
  fullWidth = false,
  className,
  ...rest
}: SegmentedControlProps) {
  const h = size === "md" ? 34 : size === "lg" ? 40 : 30;
  const wrap = useRef<HTMLDivElement | null>(null);
  const refs = useRef<Record<string, HTMLButtonElement>>({});
  const [pill, setPill] = useState<{ left: number; width: number; top: number; height: number } | null>(null);

  const measure = useCallback(() => {
    const w = wrap.current;
    const el = value ? refs.current[value] : undefined;

    if (!w || !el) {
      setPill(null);
      return;
    }
    setPill({ left: el.offsetLeft, width: el.offsetWidth, top: el.offsetTop, height: el.offsetHeight });
  }, [value]);

  useEffect(() => {
    measure();
  }, [measure, options.length, size, fullWidth]);

  useEffect(() => {
    const w = wrap.current;
    if (!w || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(w);
    return () => ro.disconnect();
  }, [measure]);

  return (
    <div
      ref={ wrap }
      role="tablist"
      className={ cn(
        "relative inline-grid auto-cols-auto grid-flow-col min-w-0 gap-0.5 p-0.5 rounded-control border border-border-default bg-surface-sunken",
        fullWidth && "grid auto-cols-fr",
        className,
      ) }
      { ...rest }
    >
      { pill ? (
        <span
          aria-hidden
          className="absolute rounded-sm bg-white shadow-xs pointer-events-none transition-[left,width,top,height] duration-[260ms] ease-out"
          style={ { left: pill.left, top: pill.top, width: pill.width, height: pill.height } }
        />
      ) : null }
      { options.map((opt) => {
        const on = opt.value === value;

        return (
          <button
            key={ opt.value }
            type="button"
            role="tab"
            aria-selected={ on }
            disabled={ opt.disabled }
            ref={ (el) => {
              if (el) {
                refs.current[opt.value] = el;
              }
              else {
                delete refs.current[opt.value];
              }
            } }
            onClick={ () => onChange?.(opt.value) }
            className={ cn(
              "relative flex flex-col items-center justify-center gap-px min-w-0 rounded-sm overflow-hidden font-sans transition-colors duration-base ease-standard",
              fullWidth ? "px-1" : size === "lg" ? "px-3.5" : "px-2.5",
              size === "lg" ? "text-[13.5px]" : "text-[12.5px]",
              on ? "font-semibold" : "font-normal",
              opt.disabled ? "text-text-disabled cursor-not-allowed" : on ? "text-text-strong cursor-pointer" : "text-text-muted cursor-pointer",
              on && !pill && "bg-white shadow-xs",
            ) }
            style={ { minHeight: h - 4 } }
          >
            <span className="max-w-full overflow-hidden text-ellipsis whitespace-nowrap">{ opt.label }</span>
            { opt.sub ? (
              <span
                className={ cn(
                  "max-w-full overflow-hidden text-ellipsis whitespace-nowrap font-mono text-[10.5px] font-normal",
                  on ? "text-text-subtle" : "text-text-disabled",
                ) }
              >
                { opt.sub }
              </span>
            ) : null }
          </button>
        );
      }) }
    </div>
  );
}
