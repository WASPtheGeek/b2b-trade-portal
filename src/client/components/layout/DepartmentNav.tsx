"use client";

import { useEffect, useRef, useState, type HTMLAttributes, type MouseEventHandler } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";
import type { DepartmentNavItem } from "@/types/catalog";

export interface DepartmentNavProps extends Omit<HTMLAttributes<HTMLDivElement>, "onSelect"> {
  items?: DepartmentNavItem[];
  active?: string;
  onSelect?: (id: string) => void;
  deptLabel?: string;
  onDeptClick?: MouseEventHandler<HTMLButtonElement>;
  onDeptHover?: MouseEventHandler<HTMLButtonElement>;
  deptOpen?: boolean;
  scrollLeftLabel?: string;
  scrollRightLabel?: string;
}

/* Dark department bar. The orange block on the left opens the full catalogue; the rest is a
   flat list of departments. Translucent once scrolled, matching StoreHeader. */
export function DepartmentNav({
  items = [],
  active,
  onSelect,
  deptLabel = "Catalog",
  onDeptClick,
  onDeptHover,
  deptOpen = false,
  scrollLeftLabel = "Scroll list left",
  scrollRightLabel = "Scroll list right",
  className,
  ...rest
}: DepartmentNavProps) {
  const [scrolled, setScrolled] = useState(false);
  const railRef = useRef<HTMLElement | null>(null);
  const [fade, setFade] = useState({ left: false, right: false });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Edge fades stand in for the (hidden) scrollbar as the only hint that the department
  // list overflows - recomputed on scroll and on resize, since narrowing the viewport can
  // start/stop the overflow without the list itself changing.
  useEffect(() => {
    const rail = railRef.current;

    if (!rail) {
      return;
    }

    const updateFade = () => {
      setFade({
        left: rail.scrollLeft > 1,
        right: rail.scrollLeft + rail.clientWidth < rail.scrollWidth - 1,
      });
    };
    updateFade();
    rail.addEventListener("scroll", updateFade, { passive: true });
    const ro = new ResizeObserver(updateFade);
    ro.observe(rail);

    return () => {
      rail.removeEventListener("scroll", updateFade);
      ro.disconnect();
    };
  }, [items]);

  const scrollByPage = (dir: -1 | 1) => {
    railRef.current?.scrollBy({ left: dir * railRef.current.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <div
      className={ cn(
        "sticky z-[44] transition-colors duration-base ease-standard",
        scrolled ? "bg-nav-bar-blur backdrop-blur-[14px]" : "bg-nav-bar",
        className,
      ) }
      style={ { top: "var(--store-header-h)" } }
      { ...rest }
    >
      <div className="max-w-layout-max mx-auto px-gutter flex items-stretch h-dept-nav">
        <button
          type="button"
          onClick={ onDeptClick }
          onMouseEnter={ onDeptHover }
          className="hidden md:flex flex-none items-center gap-[9px] px-[18px] border-none bg-brand text-white font-sans font-semibold cursor-pointer whitespace-nowrap"
        >
          <Icon name={ deptOpen ? "x" : "menu" } size={ 15 } />
          { deptLabel }
        </button>
        <div className="relative min-w-0 flex items-stretch md:ml-1.5">
          <nav ref={ railRef } className="elk-scroll-x flex items-stretch gap-0.5">
            { items.map((it) => {
              const on = it.id === active;

              return (
                <button
                  key={ it.id }
                  type="button"
                  onClick={ () => onSelect?.(it.id) }
                  className={ cn(
                    "group relative flex items-center px-3.5 border-none bg-transparent font-sans cursor-pointer whitespace-nowrap transition-colors duration-fast ease-standard",
                    on ? "text-white font-semibold" : "text-white/72 font-normal hover:text-white",
                  ) }
                >
                  { it.label }
                  <span
                    aria-hidden
                    className={ cn(
                      "absolute left-3.5 right-3.5 bottom-0 h-0.5 bg-brand origin-left transition-transform duration-base ease-out",
                      on ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100",
                    ) }
                  />
                </button>
              );
            }) }
          </nav>
          <div
            aria-hidden
            className={ cn(
              "pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r to-transparent transition-opacity duration-fast ease-standard",
              scrolled ? "from-nav-bar-blur" : "from-nav-bar",
              fade.left ? "opacity-100" : "opacity-0",
            ) }
          />
          <div
            aria-hidden
            className={ cn(
              "pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l to-transparent transition-opacity duration-fast ease-standard",
              scrolled ? "from-nav-bar-blur" : "from-nav-bar",
              fade.right ? "opacity-100" : "opacity-0",
            ) }
          />
          <button
            type="button"
            aria-label={ scrollLeftLabel }
            tabIndex={ fade.left ? 0 : -1 }
            onClick={ () => scrollByPage(-1) }
            className={ cn(
              "absolute inset-y-0 left-0 z-10 flex items-center justify-center w-7 border-none bg-transparent text-white cursor-pointer transition-opacity duration-fast ease-standard",
              fade.left ? "opacity-100" : "opacity-0 pointer-events-none",
            ) }
          >
            <Icon name="chevron-left" size={ 14 } />
          </button>
          <button
            type="button"
            aria-label={ scrollRightLabel }
            tabIndex={ fade.right ? 0 : -1 }
            onClick={ () => scrollByPage(1) }
            className={ cn(
              "absolute inset-y-0 right-0 z-10 flex items-center justify-center w-7 border-none bg-transparent text-white cursor-pointer transition-opacity duration-fast ease-standard",
              fade.right ? "opacity-100" : "opacity-0 pointer-events-none",
            ) }
          >
            <Icon name="chevron-right" size={ 14 } />
          </button>
        </div>
      </div>
    </div>
  );
}
