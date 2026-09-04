"use client";

import { useState, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface TextAreaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "value"> {
  value?: string;
  invalid?: boolean;
  showCount?: boolean;
}

export function TextArea({ value, invalid = false, showCount = false, maxLength, rows = 4, className, ...rest }: TextAreaProps) {
  const [focus, setFocus] = useState(false);

  return (
    <div className="relative">
      <textarea
        value={ value }
        rows={ rows }
        maxLength={ maxLength }
        onFocus={ (e) => {
          setFocus(true);
          rest.onFocus?.(e);
        } }
        onBlur={ (e) => {
          setFocus(false);
          rest.onBlur?.(e);
        } }
        className={ cn(
          "w-full py-2.5 px-3 rounded-control border outline-hidden resize-y bg-white font-sans text-[13.5px] leading-normal text-text-strong",
          "transition-[border-color,box-shadow] duration-fast ease-standard",
          "disabled:bg-action-disabled-bg",
          invalid ? "border-border-danger shadow-[0_0_0_3px_rgba(220,38,38,.16)]" : focus ? "border-orange-500 shadow-[var(--focus-ring-shadow)]" : "border-border-default",
          className,
        ) }
        { ...rest }
      />
      { showCount && maxLength ? (
        <span className="absolute right-2.5 bottom-2 font-mono text-[11px] text-text-disabled">
          { String(value ?? "").length }/{ maxLength }
        </span>
      ) : null }
    </div>
  );
}
