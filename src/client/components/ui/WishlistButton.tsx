"use client";

import { useState, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "./Icon";

export interface WishlistButtonLabels {
  save: string;
  remove: string;
  saved: string;
}

const DEFAULT_LABELS: WishlistButtonLabels = {
  save: "Save for later",
  remove: "Remove from saved",
  saved: "Saved",
};

export interface WishlistButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  saved?: boolean;
  onChange?: (saved: boolean) => void;
  size?: number;
  corner?: "top-left" | "top-right";
  floating?: boolean;
  labels?: Partial<WishlistButtonLabels>;
}

/* Heart overlay for product media. 44px hit area with a 28-30px visual pill inside, so it
   meets the touch target while staying quiet in the corner of a photo. The glyph pops and
   throws a single ring on save; nothing animates on un-save. */
export function WishlistButton({
  saved: savedProp = false,
  onChange,
  size = 30,
  corner = "top-left",
  floating = true,
  labels: labelsProp,
  className,
  style,
  ...rest
}: WishlistButtonProps) {
  const labels = { ...DEFAULT_LABELS, ...labelsProp };
  const [saved, setSaved] = useState(savedProp);
  const [beat, setBeat] = useState(0);
  // Adjust local state during render when the prop changes from outside, rather than in an
  // effect (which would cause an extra render pass) - see "Adjusting state when a prop
  // changes" in the React docs.
  const [prevSavedProp, setPrevSavedProp] = useState(savedProp);

  if (savedProp !== prevSavedProp) {
    setPrevSavedProp(savedProp);
    setSaved(savedProp);
  }

  return (
    <button
      type="button"
      aria-pressed={ saved }
      aria-label={ saved ? labels.remove : labels.save }
      title={ saved ? labels.saved : labels.save }
      onClick={ (e) => {
        e.preventDefault();
        e.stopPropagation();
        const next = !saved;
        setSaved(next);

        if (next) {
          setBeat((n) => n + 1);
        }

        onChange?.(next);
      } }
      className={ cn(
        "z-2 flex items-center justify-center w-11 h-11 p-0 border-none bg-transparent cursor-pointer rounded-pill group",
        floating && (corner === "top-right" ? "absolute top-0 right-0" : "absolute top-0 left-0"),
        !floating && "relative",
        className,
      ) }
      style={ style }
      { ...rest }
    >
      <span
        key={ beat }
        className={ cn(
          "relative flex items-center justify-center rounded-pill border transition-[background-color,border-color,color,box-shadow] duration-fast ease-standard",
          "focus-visible:shadow-[var(--focus-ring-shadow)]",
          saved
            ? "border-orange-500 bg-orange-500 text-white"
            : "border-border-warm bg-white/94 text-text-muted group-hover:border-border-strong group-hover:text-orange-600 group-hover:shadow-sm",
          beat ? "animate-[elkaro-heart_420ms_var(--ease-out)]" : undefined,
        ) }
        style={ { width: size, height: size } }
      >
        <Icon name="heart" size={ Math.round(size * 0.47) } />
        { saved && beat ? (
          <span
            aria-hidden
            className="absolute -inset-0.5 rounded-pill border-2 border-orange-500 pointer-events-none animate-[elkaro-heart-burst_520ms_var(--ease-out)_both]"
          />
        ) : null }
      </span>
    </button>
  );
}
