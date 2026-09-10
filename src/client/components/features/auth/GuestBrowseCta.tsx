"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export interface GuestBrowseCtaLabels {
  prompt: string;
  browseAsGuestLabel: string;
}

const DEFAULT_LABELS: GuestBrowseCtaLabels = {
  prompt: "Just want to browse the catalog?",
  browseAsGuestLabel: "Browse as a guest",
};

export interface GuestBrowseCtaProps {
  labels?: Partial<GuestBrowseCtaLabels>;
}

/** Footer prompt on the auth screens offering to skip straight to guest browsing. */
export function GuestBrowseCta({ labels: labelsProp }: GuestBrowseCtaProps) {
  const labels = { ...DEFAULT_LABELS, ...labelsProp };
  const router = useRouter();

  return (
    <div className="flex flex-col items-center sm:flex-row sm:justify-center gap-2 sm:gap-2.5 mt-[22px]">
      <span className="text-[length:var(--font-size-base)] text-text-subtle text-center">{ labels.prompt }</span>
      <Button variant="secondary" pill size="sm" iconAfter="arrow-right" className="shrink-0" onClick={ () => router.push("/") }>
        { labels.browseAsGuestLabel }
      </Button>
    </div>
  );
}
