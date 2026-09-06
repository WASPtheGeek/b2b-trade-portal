"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { USER_STATUS_LABELS, USER_STATUS_TONES } from "@/lib/status-labels";
import type { RegisterResult } from "@/types/auth";

export interface RegisterConfirmationLabels {
  heading: string;
  browseCatalogLabel: string;
  backToLoginLabel: string;
}

const DEFAULT_LABELS: RegisterConfirmationLabels = {
  heading: "Application received",
  browseCatalogLabel: "Browse the catalog",
  backToLoginLabel: "Back to sign in",
};

export interface RegisterConfirmationProps {
  result: RegisterResult;
  labels?: Partial<RegisterConfirmationLabels>;
}

/** Shown in place of the register form once the account has been created. */
export function RegisterConfirmation({ result, labels: labelsProp }: RegisterConfirmationProps) {
  const labels = { ...DEFAULT_LABELS, ...labelsProp };
  const router = useRouter();

  return (
    <div className="mt-[26px]">
      <StatusBadge tone={ USER_STATUS_TONES[result.status] } label={ USER_STATUS_LABELS[result.status] } />

      <h1 className="mt-3.5 text-2xl font-semibold tracking-[-0.02em] text-text-strong">{ labels.heading }</h1>
      <p className="mt-[7px] text-[13.5px] leading-[1.55] text-text-muted text-pretty">{ result.message }</p>

      <div className="flex flex-wrap gap-2 mt-[18px]">
        <Button pill onClick={ () => router.push("/") }>
          { labels.browseCatalogLabel }
        </Button>
        <Button pill variant="secondary" onClick={ () => router.push("/login") }>
          { labels.backToLoginLabel }
        </Button>
      </div>
    </div>
  );
}
