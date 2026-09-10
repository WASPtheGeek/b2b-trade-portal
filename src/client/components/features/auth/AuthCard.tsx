"use client";

import { useRef, type ReactNode } from "react";
import { useAnimatedHeight } from "@/hooks/useAnimatedHeight";
import { cn } from "@/lib/cn";

export type AuthTab = "login" | "register";

export interface AuthCardLabels {
  loginTab: string;
  registerTab: string;
}

const DEFAULT_LABELS: AuthCardLabels = {
  loginTab: "Sign in",
  registerTab: "Register business",
};

export interface AuthCardProps {
  activeTab: AuthTab;
  children: ReactNode;
  /** Hides the tab switcher, for states that replace the form entirely (e.g. a post-registration confirmation). */
  hideTabs?: boolean;
  labels?: Partial<AuthCardLabels>;
  /**
   * Called when the visitor picks a tab.
   *
   * Left to the caller rather than navigating internally, so the card stays
   * mounted across a switch (a route navigation would remount it, which is
   * exactly the height snap this component's animation is meant to avoid).
   */
  onTabChange: (tab: AuthTab) => void;
}

const TABS: AuthTab[] = ["login", "register"];

/** Centered white card with a pill tab switcher between the login and register forms. */
export function AuthCard({ activeTab, children, hideTabs = false, labels: labelsProp, onTabChange }: AuthCardProps) {
  const labels = { ...DEFAULT_LABELS, ...labelsProp };
  const contentRef = useRef<HTMLDivElement>(null);

  // Switching tabs swaps in a form of a different height (register has far more fields
  // than login) - animate that instead of letting the card snap to its new size.
  useAnimatedHeight(contentRef, [activeTab, hideTabs]);

  const tabLabel = (tab: AuthTab): string => (tab === "login" ? labels.loginTab : labels.registerTab);

  return (
    <div className="bg-surface-card border border-border-warm rounded-xl shadow-sm pt-[18px] px-[18px] pb-[18px] md:pt-[26px] md:px-[30px] md:pb-[30px] animate-fade-up">
      { hideTabs ? null : (
        <div className="relative flex gap-1 p-1 bg-warm-100 rounded-pill">
          <div
            aria-hidden
            className={ cn(
              "absolute left-1 top-1 bottom-1 w-[calc(50%-6px)] rounded-pill bg-surface-card shadow-sm",
              "pointer-events-none transition-transform duration-base ease-standard",
              activeTab === "register" && "translate-x-[calc(100%+4px)]",
            ) }
          />
          { TABS.map((tab) => (
            <button
              key={ tab }
              type="button"
              onClick={ () => onTabChange(tab) }
              className={ cn(
                "relative z-10 flex-1 min-h-10 flex items-center justify-center px-1.5 py-1.5",
                "border-none rounded-pill bg-transparent font-sans text-[13px] sm:text-[length:var(--font-size-base)] text-center leading-tight cursor-pointer",
                "transition-colors duration-base ease-standard",
                tab === activeTab ? "text-text-strong font-semibold" : "text-text-subtle font-normal",
              ) }
            >
              { tabLabel(tab) }
            </button>
          )) }
        </div>
      ) }

      {/* `flow-root` establishes a block-formatting context so this wrapper's height always
          includes its form child's top margin, rather than that margin collapsing through it
          in the resting state and only counting once the animation's `overflow: hidden`
          (which also establishes one) kicks in - without this, that difference alone caused a
          small discontinuity right as each transition started. */}
      <div ref={ contentRef } className="flow-root">{ children }</div>
    </div>
  );
}
