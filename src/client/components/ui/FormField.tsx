import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface FormFieldProps extends HTMLAttributes<HTMLDivElement> {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  htmlFor?: string;
}

export function FormField({ label, children, hint, error, required = false, htmlFor, className, ...rest }: FormFieldProps) {
  return (
    <div className={ cn("flex flex-col gap-1.5 min-w-0", className) } { ...rest }>
      { label ? (
        <label htmlFor={ htmlFor } className="flex gap-[3px] text-[12.5px] font-medium text-text-body">
          { label }
          { required ? <span className="text-orange-600">*</span> : null }
        </label>
      ) : null }
      { children }
      { error ? (
        <p className="flex items-start gap-[5px] text-xs leading-[1.4] text-text-danger">
          <span className="font-semibold">·</span>
          { error }
        </p>
      ) : hint ? (
        <p className="text-xs leading-[1.4] text-text-subtle">{ hint }</p>
      ) : null }
    </div>
  );
}
