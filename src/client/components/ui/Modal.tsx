"use client";

import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "./Icon";

export interface ModalProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  title: ReactNode;
  description?: ReactNode;
  footer?: ReactNode;
  onClose?: () => void;
  width?: number;
  closeLabel?: string;
}

export function Modal({ title, description, children, footer, onClose, width = 480, closeLabel = "Close", className, ...rest }: ModalProps) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center animate-[elkaro-scrim-in_var(--dur-base)_var(--ease-standard)_both]"
      style={{ padding: "9vh 20px 20px", background: "var(--scrim)", backdropFilter: "var(--blur-overlay)" }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "w-full bg-surface-card rounded-lg shadow-overlay overflow-hidden animate-[elkaro-modal-in_var(--dur-slow)_var(--ease-out)_both]",
          className,
        )}
        style={{ maxWidth: width }}
        {...rest}
      >
        <header className="flex items-start gap-3 py-[17px] px-5 pb-[15px] border-b border-border-subtle">
          <div className="flex-1 min-w-0">
            <h2 className="text-h3 font-semibold text-text-strong">{title}</h2>
            {description ? <p className="text-[13px] text-text-subtle mt-1 leading-normal">{description}</p> : null}
          </div>
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              aria-label={closeLabel}
              className="flex flex-none border-none bg-transparent cursor-pointer text-text-subtle p-[3px] -mt-0.5"
            >
              <Icon name="x" size={17} />
            </button>
          ) : null}
        </header>
        <div className="py-[18px] px-5">{children}</div>
        {footer ? <footer className="flex justify-end gap-2 py-3.5 px-5 bg-surface-subtle border-t border-border-subtle">{footer}</footer> : null}
      </div>
    </div>
  );
}
