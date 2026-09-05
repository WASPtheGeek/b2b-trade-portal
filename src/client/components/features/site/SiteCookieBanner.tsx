"use client";

import { CookieBanner, type CookieBannerLabels, type CookieCategory } from "@/components/ui/CookieBanner";

export interface SiteCookieBannerProps {
  policyHref?: string;
  categories?: CookieCategory[];
  labels?: Partial<CookieBannerLabels>;
  bodyBeforeLink?: string;
  bodyAfterLink?: string;
}

// Wraps CookieBanner and exposes its own props (rather than reading them from app/layout.tsx
// directly) because layout.tsx exports `metadata`, so it must stay a Server Component, and a
// Server Component can't pass a function prop (renderBody) across to a "use client" component.
// `bodyBeforeLink`/`bodyAfterLink` are plain strings so the surrounding sentence can still be
// passed in from the server; they're assembled into CookieBanner's renderBody here instead.
export function SiteCookieBanner({
  policyHref = "/privacy-policy",
  categories,
  labels,
  bodyBeforeLink = "We use cookies to run the store and to understand how it's used. Read more in our ",
  bodyAfterLink = ".",
}: SiteCookieBannerProps) {
  return (
    <CookieBanner
      policyHref={ policyHref }
      categories={ categories }
      labels={ labels }
      renderBody={ (policyLink) => (
        <>{ bodyBeforeLink }{ policyLink }{ bodyAfterLink }</>
      ) }
    />
  );
}
