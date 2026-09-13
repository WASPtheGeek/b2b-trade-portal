import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { Logo } from "@/components/ui/Logo";
import type { FooterColumn } from "@/types/catalog";

/** The footer's own free-text copy - kept distinct from `columns` (structural nav data, not
 * prose) so callers sourcing real localized text (see `app/_i18n`) have a single shape to
 * spread onto `blurb`/`legal`. */
export interface StoreFooterLabels {
  blurb: string;
  legal: string;
}

const DEFAULT_LABELS: StoreFooterLabels = {
  blurb: "",
  legal: "",
};

export interface StoreFooterProps extends HTMLAttributes<HTMLElement> {
  logoSrc?: string;
  columns?: FooterColumn[];
  labels?: Partial<StoreFooterLabels>;
}

export function StoreFooter({ logoSrc, columns = [], labels: labelsProp, className, ...rest }: StoreFooterProps) {
  const { blurb, legal } = { ...DEFAULT_LABELS, ...labelsProp };
  return (
    <footer className={ cn("bg-surface-card border-t border-border-warm mt-section-gap-lg", className) } { ...rest }>
      <div className="max-w-layout-max mx-auto px-gutter pt-9 pb-6 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:[grid-template-columns:minmax(220px,1.4fr)_repeat(auto-fit,minmax(150px,1fr))]">
        <div>
          <Logo height={ 24 } src={ logoSrc } />
          { blurb ? <p className="text-[length:var(--font-size-base)] leading-[1.65] text-text-subtle mt-3.5 max-w-[300px] text-balance">{ blurb }</p> : null }
        </div>
        { columns.map((c) => (
          <nav key={ c.title }>
            <h4 className="font-mono text-[length:var(--font-size-base)] font-medium tracking-[.12em] uppercase text-text-strong">{ c.title }</h4>
            <ul className="list-none m-0 mt-[13px] p-0 flex flex-col gap-2">
              { c.links.map((l) => (
                <li key={ l }>
                  <a href="#" className="text-[length:var(--font-size-base)] text-text-subtle no-underline hover:text-text-body">
                    { l }
                  </a>
                </li>
              )) }
            </ul>
          </nav>
        )) }
      </div>
      <div className="border-t border-border-subtle">
        <div className="max-w-layout-max mx-auto px-gutter py-3.5 text-[length:var(--font-size-base)] text-text-disabled">{ legal }</div>
      </div>
    </footer>
  );
}
