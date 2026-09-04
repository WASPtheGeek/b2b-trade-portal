import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { Icon, type IconName } from "@/components/ui/Icon";

export interface TrustStripItem {
  icon: IconName;
  title: string;
  body: string;
}

export interface TrustStripProps extends HTMLAttributes<HTMLDivElement> {
  items?: TrustStripItem[];
}

export function TrustStrip({ items = [], className, ...rest }: TrustStripProps) {
  return (
    <div
      className={ cn("grid gap-3", className) }
      style={ { gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))" } }
      { ...rest }
    >
      { items.map((it) => (
        <div key={ it.title } className="flex items-center gap-3 rounded-card border border-border-warm bg-surface-card py-3.5 px-4">
          <span className="flex items-center justify-center w-[34px] h-[34px] flex-none rounded-md bg-orange-50 text-orange-600">
            <Icon name={ it.icon } size={ 16 } />
          </span>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-text-strong">{ it.title }</p>
            <p className="text-xs text-text-subtle mt-0.5 text-balance">{ it.body }</p>
          </div>
        </div>
      )) }
    </div>
  );
}
