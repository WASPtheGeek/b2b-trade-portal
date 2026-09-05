"use client";

import { useState, type ChangeEventHandler, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "./Icon";

export interface CheckboxProps {
  checked?: boolean;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  label?: ReactNode;
  count?: number | string;
  disabled?: boolean;
  indeterminate?: boolean;
  className?: string;
}

export function Checkbox({ checked = false, onChange, label, count, disabled = false, indeterminate = false, className }: CheckboxProps) {
  const [hover, setHover] = useState(false);
  const on = checked || indeterminate;

  return (
    <label
      onMouseEnter={ () => setHover(true) }
      onMouseLeave={ () => setHover(false) }
      className={ cn("flex items-center gap-[9px] select-none", disabled ? "cursor-not-allowed opacity-55" : "cursor-pointer", className) }
    >
      <input type="checkbox" checked={ checked } onChange={ onChange } disabled={ disabled } className="absolute opacity-0 w-0 h-0" />
      <span
        className={ cn(
          "flex flex-none items-center justify-center w-[17px] h-[17px] rounded-xs border transition-[background-color,border-color] duration-fast ease-standard",
          on ? "bg-brand border-orange-500" : hover && !disabled ? "border-neutral-400 bg-white" : "border-neutral-300 bg-white",
        ) }
      >
        { indeterminate ? <span className="w-2 h-[1.5px] bg-white" /> : checked ? <Icon name="check" size={ 12 } className="text-white" /> : null }
      </span>
      { label ? <span className="flex-1 min-w-0 text-[13.5px] text-text-body">{ label }</span> : null }
      { count != null ? <span className="flex-none font-mono text-[12px] text-text-disabled">{ count }</span> : null }
    </label>
  );
}
