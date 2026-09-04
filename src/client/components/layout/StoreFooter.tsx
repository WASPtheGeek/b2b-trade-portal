import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Logo } from "@/components/ui/Logo";
import type { FooterColumn } from "@/types/catalog";

export interface StoreFooterProps extends HTMLAttributes<HTMLElement> {
  logoSrc?: string;
  blurb?: ReactNode;
  columns?: FooterColumn[];
  legal?: ReactNode;
}

export function StoreFooter({ logoSrc, blurb, columns = [], legal, className, ...rest }: StoreFooterProps) {
  return (
    <footer className={ cn("bg-surface-card border-t border-border-warm mt-section-gap-lg", className) } { ...rest }>
      <div className="max-w-layout-max mx-auto px-gutter pt-9 pb-6 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:[grid-template-columns:minmax(220px,1.4fr)_repeat(auto-fit,minmax(150px,1fr))]">
        <div>
          <Logo height={ 24 } src={ logoSrc } />
          { blurb ? <p className="text-[12.5px] leading-[1.65] text-text-subtle mt-3.5 max-w-[300px] text-balance">{ blurb }</p> : null }
        </div>
        { columns.map((c) => (
          <nav key={ c.title }>
            <h4 className="font-mono text-[10.5px] font-medium tracking-[.12em] uppercase text-text-strong">{ c.title }</h4>
            <ul className="list-none m-0 mt-[13px] p-0 flex flex-col gap-2">
              { c.links.map((l) => (
                <li key={ l }>
                  <a href="#" className="text-[12.5px] text-text-subtle no-underline hover:text-text-body">
                    { l }
                  </a>
                </li>
              )) }
            </ul>
          </nav>
        )) }
      </div>
      <div className="border-t border-border-subtle">
        <div className="max-w-layout-max mx-auto px-gutter py-3.5 text-[11.5px] text-text-disabled">{ legal }</div>
      </div>
    </footer>
  );
}
