"use client";

import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "./Icon";
import { Button } from "./Button";
import { Checkbox } from "./Checkbox";

export interface CookieCategory {
  id: string;
  label: string;
  description: string;
  locked?: boolean;
  defaultChecked?: boolean;
}

export type CookieConsent = Record<string, boolean>;

const DEFAULT_CATEGORIES: CookieCategory[] = [
  { id: "necessary", label: "Necessary", locked: true, defaultChecked: true, description: "Session, cart contents and security. The store doesn't work without these." },
  { id: "analytics", label: "Analytics", defaultChecked: true, description: "Anonymous statistics about how the catalog is used." },
  { id: "marketing", label: "Marketing", defaultChecked: false, description: "Offer personalization and remarketing." },
];

export interface CookieBannerLabels {
  regionLabel: string;
  title: string;
  policyLinkLabel: string;
  lockedSuffix: string;
  settingsLabel: string;
  saveLabel: string;
  necessaryOnlyLabel: string;
  acceptAllLabel: string;
}

const DEFAULT_LABELS: CookieBannerLabels = {
  regionLabel: "Cookie notice",
  title: "Cookies on this site",
  policyLinkLabel: "privacy policy",
  lockedSuffix: " · always on",
  settingsLabel: "Settings",
  saveLabel: "Save choices",
  necessaryOnlyLabel: "Necessary only",
  acceptAllLabel: "Accept all",
};

export interface CookieBannerProps {
  storageKey?: string;
  policyHref?: string;
  onDecision?: (consent: CookieConsent) => void;
  categories?: CookieCategory[];
  labels?: Partial<CookieBannerLabels>;
  /** Renders the intro paragraph around the policy link - a render prop rather than a plain
   * string since the link's position in the sentence isn't the same across languages. */
  renderBody?: (policyLink: ReactNode) => ReactNode;
  className?: string;
}

const defaultRenderBody = (policyLink: ReactNode): ReactNode => (
  <>We use cookies to run the store and to understand how it's used. Read more in our { policyLink }.</>
);

/* Bottom-corner cookie consent, not a modal: no scrim, no scroll lock, nothing behind it is
   blocked (see src/design/components/feedback/CookieBanner.jsx). The decision is written to
   localStorage under `storageKey`, so a returning visitor never sees it again; "Settings"
   expands per-category switches in place instead of routing away. */
export function CookieBanner({
  storageKey = "elkaro-cookie-consent",
  policyHref = "#",
  onDecision,
  categories = DEFAULT_CATEGORIES,
  labels: labelsProp,
  renderBody = defaultRenderBody,
  className,
}: CookieBannerProps) {
  const labels = { ...DEFAULT_LABELS, ...labelsProp };
  const [state, setState] = useState<"hidden" | "banner" | "prefs">("hidden");
  const [prefs, setPrefs] = useState<CookieConsent>(() =>
    Object.fromEntries(categories.map((c) => [c.id, c.locked ? true : (c.defaultChecked ?? false)])),
  );

  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = window.localStorage.getItem(storageKey);
    } catch {
      saved = null;
    }
    if (saved) return;
    const t = setTimeout(() => setState("banner"), 600);
    return () => clearTimeout(t);
  }, [storageKey]);

  const decide = (value: CookieConsent) => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify({ ...value, at: new Date().toISOString() }));
    } catch {
      // private browsing mode - decision just won't be remembered next visit
    }
    onDecision?.(value);
    setState("hidden");
  };

  const open = state !== "hidden";
  const prefsOpen = state === "prefs";
  const allOn = Object.fromEntries(categories.map((c) => [c.id, true]));
  const necessaryOnly = Object.fromEntries(categories.map((c) => [c.id, !!c.locked]));
  const lockedOn = Object.fromEntries(categories.filter((c) => c.locked).map((c) => [c.id, true]));

  return (
    <div
      aria-live="polite"
      role="region"
      aria-label={ labels.regionLabel }
      inert={ !open }
      className={ cn("fixed inset-x-0 bottom-0 z-[120] flex justify-start p-[clamp(12px,2vw,22px)] pointer-events-none", className) }
    >
      <div
        style={ { transition: "transform 420ms var(--ease-out), opacity var(--dur-slow) var(--ease-standard)" } }
        className={ cn(
          "w-[min(452px,100%)] bg-surface-card border border-border-warm rounded-lg shadow-overlay",
          open ? "translate-y-0 opacity-100 pointer-events-auto" : "translate-y-[calc(100%+32px)] opacity-0 pointer-events-none",
        ) }
      >
        <div className="flex items-start gap-[11px] pt-[15px] px-[15px]">
          <span className="flex flex-none items-center justify-center w-[30px] h-[30px] rounded-sm bg-orange-50 text-orange-600">
            <Icon name="cookie" size={ 15 } />
          </span>
          <div className="min-w-0 flex-1">
            <strong className="text-[13.5px] font-semibold text-text-strong">{ labels.title }</strong>
            <p className="text-[12.5px] leading-[1.55] text-text-muted mt-[5px] text-balance">
              { renderBody(<a href={ policyHref }>{ labels.policyLinkLabel }</a>) }
            </p>
          </div>
        </div>

        <div className="grid transition-[grid-template-rows] duration-slow ease-out" style={ { gridTemplateRows: prefsOpen ? "1fr" : "0fr" } }>
          <div className="overflow-hidden">
            <div className="flex flex-col gap-[9px] pt-[13px] px-[15px] pb-0.5 mt-[11px] border-t border-border-subtle">
              { categories.map((c) => (
                <div key={ c.id } className="flex items-start gap-[9px]">
                  <Checkbox
                    checked={ c.locked ? true : !!prefs[c.id] }
                    disabled={ c.locked }
                    onChange={ () => setPrefs((p) => ({ ...p, [c.id]: !p[c.id] })) }
                    className="mt-px"
                  />
                  <div className="min-w-0">
                    <div className="text-[12.5px] font-semibold text-text-strong">
                      { c.label }
                      { c.locked ? <span className="font-normal text-text-disabled">{ labels.lockedSuffix }</span> : null }
                    </div>
                    <div className="text-[11.5px] leading-[1.5] text-text-subtle text-balance">{ c.description }</div>
                  </div>
                </div>
              )) }
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-[13px] px-[15px] pb-[15px] flex-wrap">
          { prefsOpen ? (
            <Button size="sm" variant="secondary" onClick={ () => decide({ ...prefs, ...lockedOn }) }>
              { labels.saveLabel }
            </Button>
          ) : (
            <Button size="sm" variant="link" onClick={ () => setState("prefs") }>
              { labels.settingsLabel }
            </Button>
          ) }
          <div className="flex gap-2 ml-auto">
            <Button size="sm" variant="secondary" onClick={ () => decide(necessaryOnly) }>
              { labels.necessaryOnlyLabel }
            </Button>
            <Button size="sm" onClick={ () => decide(allOn) }>
              { labels.acceptAllLabel }
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
