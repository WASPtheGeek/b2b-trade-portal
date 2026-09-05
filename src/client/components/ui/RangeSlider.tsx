"use client";

import type { HTMLAttributes } from "react";

export interface RangeSliderProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  min?: number;
  max?: number;
  value?: [number, number];
  onChange?: (value: [number, number]) => void;
  prefix?: string;
  minLabel?: string;
  maxLabel?: string;
}

export function RangeSlider({
  min = 0,
  max = 100,
  value = [0, 100],
  onChange,
  prefix = "€",
  minLabel = "Minimum price",
  maxLabel = "Maximum price",
  className,
  ...rest
}: RangeSliderProps) {
  const [lo, hi] = value;
  const pct = (n: number) => ((n - min) / (max - min)) * 100;
  const setLo = (v: string) => onChange?.([Math.min(Number(v), hi), hi]);
  const setHi = (v: string) => onChange?.([lo, Math.max(Number(v), lo)]);

  return (
    <div className={ className } { ...rest }>
      <div className="relative h-5 flex items-center">
        <div className="absolute left-0 right-0 h-[3px] rounded-[2px] bg-neutral-200" />
        <div
          className="absolute h-[3px] rounded-[2px] bg-orange-500"
          style={ { left: `${pct(lo)}%`, right: `${100 - pct(hi)}%` } }
        />
        <input
          type="range"
          min={ min }
          max={ max }
          value={ lo }
          onChange={ (e) => setLo(e.target.value) }
          aria-label={ minLabel }
          className="elk-range absolute inset-0 w-full bg-transparent pointer-events-none m-0"
        />
        <input
          type="range"
          min={ min }
          max={ max }
          value={ hi }
          onChange={ (e) => setHi(e.target.value) }
          aria-label={ maxLabel }
          className="elk-range absolute inset-0 w-full bg-transparent pointer-events-none m-0"
        />
        { [lo, hi].map((v, i) => (
          <span
            key={ i }
            aria-hidden
            className="absolute w-3.5 h-3.5 rounded-full bg-white border-2 border-orange-500 shadow-xs pointer-events-none"
            style={ { left: `calc(${pct(v)}% - 7px)` } }
          />
        )) }
      </div>
      <div className="flex justify-between mt-2 font-mono text-xs text-text-muted [font-variant-numeric:tabular-nums]">
        <span>
          { prefix }
          { lo }
        </span>
        <span>
          { prefix }
          { hi }
        </span>
      </div>
    </div>
  );
}
