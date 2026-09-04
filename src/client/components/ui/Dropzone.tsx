"use client";

import { useState, type DragEventHandler, type HTMLAttributes } from "react";
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
  className,
  ...rest
}: DropzoneProps) {
  const [over, setOver] = useState(false);

  const onDragOver: DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    setOver(true);
  };
  const onDrop: DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    setOver(false);
    onSelect?.(e.dataTransfer.files);
  };

  return (
    <div
      onDragOver={ onDragOver }
      onDragLeave={ () => setOver(false) }
      onDrop={ onDrop }
      className={ cn(
        "text-center py-[30px] px-6 rounded-lg border-[1.5px] border-dashed transition-[border-color,background-color] duration-fast ease-standard",
        over ? "border-orange-500 bg-orange-50" : "border-border-strong bg-surface-subtle",
        className,
      ) }
      { ...rest }
    >
      <span
        className={ cn(
          "inline-flex items-center justify-center w-11 h-11 rounded-full mb-[13px]",
          over ? "bg-orange-100 text-orange-600" : "bg-neutral-100 text-text-subtle",
        ) }
      >
        <Icon name="file-spreadsheet" size={ 21 } />
      </span>
      <p className="text-sm font-semibold text-text-strong">{ title }</p>
      { hint ? <p className="text-[12.5px] text-text-subtle mt-[5px]">{ hint }</p> : null }
      <Button variant="secondary" size="sm" icon="upload" className="mt-3.5">
        { browseLabel }
      </Button>
      { columns.length ? (
        <div className="mt-5 pt-4 border-t border-border-default">
          <p className="text-[10.5px] font-semibold tracking-[.06em] uppercase text-text-subtle mb-[9px]">{ columnsLabel }</p>
          <div className="flex gap-[5px] flex-wrap justify-center">
            { columns.map((c) => (
              <code key={ c } className="font-mono text-[11.5px] py-[3px] px-2 bg-white border border-border-default rounded-sm text-text-body">
                { c }
              </code>
            )) }
          </div>
        </div>
      ) : null }
      <p className="text-[11.5px] text-text-disabled mt-3.5">
        { formatsLabel }: { accept }
      </p>
    </div>
  );
}
