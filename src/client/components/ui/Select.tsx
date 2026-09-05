"use client";

import { useState, type ChangeEventHandler, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "./Icon";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "size" | "onChange"> {
  value?: string;
  onChange?: ChangeEventHandler<HTMLSelectElement>;
  options?: SelectOption[];
  placeholder?: string;
  size?: "sm" | "md" | "lg";
  invalid?: boolean;
  fullWidth?: boolean;
  wrapperClassName?: string;
}

const H = { sm: 32, md: 38, lg: 44 };

export function Select({
  value,
  onChange,
  options = [],
  placeholder,
  size = "md",
  invalid = false,
  disabled = false,
  fullWidth = true,
  className,
  wrapperClassName,
  ...rest
}: SelectProps) {
  const [focus, setFocus] = useState(false);

  return (
    <div className={ cn("relative", fullWidth ? "block w-full" : "inline-block", wrapperClassName) }>
      <select
        value={ value }
        onChange={ onChange }
        disabled={ disabled }
        onFocus={ () => setFocus(true) }
        onBlur={ () => setFocus(false) }
        className={ cn(
          "w-full pl-3 pr-8 border rounded-control outline-hidden appearance-none bg-white font-sans text-[13.5px] transition-[border-color,box-shadow] duration-fast ease-standard",
          value ? "text-text-strong" : "text-text-subtle",
          disabled ? "bg-action-disabled-bg cursor-not-allowed" : "cursor-pointer",
          invalid ? "border-border-danger" : focus ? "border-orange-500 shadow-[var(--focus-ring-shadow)]" : "border-border-default",
          className,
        ) }
        style={ { height: H[size] } }
        { ...rest }
      >
        { placeholder ? <option value="">{ placeholder }</option> : null }
        { options.map((o) => (
          <option key={ o.value } value={ o.value }>
            { o.label }
          </option>
        )) }
      </select>
      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-text-subtle flex">
        <Icon name="chevron-down" size={ 15 } />
      </span>
    </div>
  );
}
