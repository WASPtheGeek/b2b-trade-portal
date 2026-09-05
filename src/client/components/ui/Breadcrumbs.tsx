"use client";

import Link from "next/link";
import { Fragment, type HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbsProps extends HTMLAttributes<HTMLElement> {
  items: BreadcrumbItem[];
  onNavigate?: (item: BreadcrumbItem, index: number) => void;
  ariaLabel?: string;
}

export function Breadcrumbs({ items, onNavigate, ariaLabel = "Breadcrumb", className, ...rest }: BreadcrumbsProps) {
  return (
    <nav aria-label={ ariaLabel } className={ cn("flex items-center gap-[7px] flex-wrap text-xs", className) } { ...rest }>
      { items.map((it, i) => {
        const last = i === items.length - 1;

        return (
          <Fragment key={ it.label }>
            { last ? (
              <span aria-current="page" className="text-text-strong font-medium">
                { it.label }
              </span>
            ) : (
              <Link
                href={ it.href ?? "#" }
                onClick={ (e) => {
                  if (!it.href) e.preventDefault();
                  onNavigate?.(it, i);
                } }
                className="text-text-subtle no-underline hover:text-text-strong"
              >
                { it.label }
              </Link>
            ) }
            { !last ? <span className="text-text-disabled">/</span> : null }
          </Fragment>
        );
      }) }
    </nav>
  );
}
