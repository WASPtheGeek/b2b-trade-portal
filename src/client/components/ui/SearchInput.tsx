"use client";

import { useState, type ChangeEventHandler, type HTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "./Icon";

export interface SearchInputProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  value?: string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  onClear?: () => void;
  placeholder?: string;
  clearLabel?: string;
  size?: "sm" | "md" | "lg";
  autoFocus?: boolean;
}

const H = { sm: 32, md: 38, lg: 44 };

export function SearchInput({
  value = "",
  onChange,
  onClear,
  placeholder = "Search products, EAN or code…",
  clearLabel = "Clear search",
  size = "md",
  autoFocus,
  className,
  ...rest
}: SearchInputProps) {
  const [focus, setFocus] = useState(false);

  return (
    <div
      className={ cn(
        "flex items-center w-full bg-white border rounded-control transition-[border-color,box-shadow] duration-fast ease-standard",
        focus ? "border-orange-500 shadow-[var(--focus-ring-shadow)]" : "border-border-default",
        className,
      ) }
      style={ { height: H[size] } }
      { ...rest }
    >
      <span className="pl-[11px] flex text-text-disabled">
        <Icon name="search" size={ 16 } />
      </span>
      <input
        value={ value }
        onChange={ onChange }
        placeholder={ placeholder }
        type="search"
        autoFocus={ autoFocus }
        onFocus={ () => setFocus(true) }
        onBlur={ () => setFocus(false) }
        className="flex-1 min-w-0 h-full px-2 border-none outline-hidden bg-transparent font-sans text-[13.5px] text-text-strong"
      />
      { value ? (
        <button
          type="button"
          onClick={ onClear }
          aria-label={ clearLabel }
          className="flex items-center bg-transparent border-none cursor-pointer px-2.5 text-text-subtle"
        >
          <Icon name="x" size={ 14 } />
        </button>
      ) : null }
    </div>
  );
}
