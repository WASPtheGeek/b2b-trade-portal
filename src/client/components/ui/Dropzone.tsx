"use client";

import { useRef, useState, type ChangeEventHandler, type DragEventHandler, type HTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "./Icon";
import { Button } from "./Button";

export interface DropzoneProps extends Omit<HTMLAttributes<HTMLDivElement>, "onSelect"> {
  title?: string;
  hint?: string;
  accept?: string;
  columns?: string[];
  onSelect?: (files: FileList) => void;
  browseLabel?: string;
  columnsLabel?: string;
  formatsLabel?: string;
  disabled?: boolean;
  /** `md` is the stacked, centered drop area; `sm` is a single compact row for pages where the
   * dropzone is a secondary element (e.g. above a main data table). */
  size?: "sm" | "md";
}

export function Dropzone({
  title = "Drag a file here or choose from your computer",
  hint,
  accept = ".csv, .xlsx",
  columns = [],
  onSelect,
  browseLabel = "Choose file",
  columnsLabel = "Required columns",
  formatsLabel = "Supported formats",
  disabled = false,
  size = "md",
  className,
  ...rest
}: DropzoneProps) {
  const [over, setOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const onDragOver: DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    if (!disabled) {
      setOver(true);
    }
  };
  const onDrop: DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    setOver(false);

    if (!disabled) {
      onSelect?.(e.dataTransfer.files);
    }
  };
  // Resets the input's value afterwards - otherwise re-selecting the same file name a second time
  // (e.g. re-uploading a corrected export under its original name) wouldn't fire `onChange`.
  // `e.target.files` is live, so the reset must happen after `onSelect` has read it.
  const onInputChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const files = e.target.files;

    if (files?.length) {
      onSelect?.(files);
    }

    e.target.value = "";
  };

  const dropHandlers = {
    onDragOver,
    onDragLeave: () => setOver(false),
    onDrop,
  };
  const frameClassName = cn(
    "rounded-lg border-[1.5px] border-dashed transition-[border-color,background-color] duration-fast ease-standard",
    over ? "border-orange-500 bg-orange-50" : "border-border-strong bg-surface-subtle",
    disabled && "opacity-60",
  );
  const input = <input ref={ inputRef } type="file" accept={ accept } className="hidden" disabled={ disabled } onChange={ onInputChange } />;
  const browseButton = (
    <Button variant="secondary" size="sm" icon="upload" className={ size === "md" ? "mt-3.5" : "shrink-0" } disabled={ disabled } onClick={ () => inputRef.current?.click() }>
      { browseLabel }
    </Button>
  );
  const iconBadge = (iconSize: number, boxClassName: string) => (
    <span
      className={ cn(
        "inline-flex items-center justify-center rounded-full shrink-0",
        boxClassName,
        over ? "bg-orange-100 text-orange-600" : "bg-neutral-100 text-text-subtle",
      ) }
    >
      <Icon name="file-spreadsheet" size={ iconSize } />
    </span>
  );

  if (size === "sm") {
    return (
      <div { ...dropHandlers } aria-disabled={ disabled } className={ cn(frameClassName, "flex flex-wrap items-center gap-x-4 gap-y-2.5 py-3 px-4", className) } { ...rest }>
        { input }
        { iconBadge(18, "w-9 h-9") }
        <div className="flex-1 min-w-[220px]">
          <p className="text-[length:var(--font-size-base)] font-semibold text-text-strong">
            { title }
            <span className="font-normal text-text-subtle">
              { " · " }{ hint ?? `${formatsLabel}: ${accept}` }
            </span>
          </p>
          { columns.length ? (
            <div className="flex flex-wrap items-center gap-1 mt-1.5">
              <span className="text-[length:var(--font-size-base)] text-text-subtle mr-1">{ columnsLabel }:</span>
              { columns.map((c) => (
                <code key={ c } className="font-mono text-[11px] py-px px-1.5 bg-white border border-border-default rounded-sm text-text-body">
                  { c }
                </code>
              )) }
            </div>
          ) : null }
        </div>
        { browseButton }
      </div>
    );
  }

  return (
    <div { ...dropHandlers } aria-disabled={ disabled } className={ cn(frameClassName, "text-center py-[30px] px-6", className) } { ...rest }>
      { input }
      { iconBadge(21, "w-11 h-11 mb-[13px]") }
      <p className="text-[length:var(--font-size-base)] font-semibold text-text-strong">{ title }</p>
      { hint ? <p className="text-[length:var(--font-size-base)] text-text-subtle mt-[5px]">{ hint }</p> : null }
      { browseButton }
      { columns.length ? (
        <div className="mt-5 pt-4 border-t border-border-default">
          <p className="text-[length:var(--font-size-base)] font-semibold tracking-[.06em] uppercase text-text-subtle mb-[9px]">{ columnsLabel }</p>
          <div className="flex gap-[5px] flex-wrap justify-center">
            { columns.map((c) => (
              <code key={ c } className="font-mono text-[length:var(--font-size-base)] py-[3px] px-2 bg-white border border-border-default rounded-sm text-text-body">
                { c }
              </code>
            )) }
          </div>
        </div>
      ) : null }
      <p className="text-[length:var(--font-size-base)] text-text-disabled mt-3.5">
        { formatsLabel }: { accept }
      </p>
    </div>
  );
}
