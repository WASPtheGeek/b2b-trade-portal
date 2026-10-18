"use client";

import { DisplaySettingsCard, type DisplaySettingsCardLabels } from "@/components/features/admin/settings/DisplaySettingsCard";
import { ImportColumnsSettingsCard, type ImportColumnsSettingsCardLabels } from "@/components/features/admin/settings/ImportColumnsSettingsCard";

export interface SettingsPageLabels {
  heading: string;
  subtitle: string;
  importColumns: ImportColumnsSettingsCardLabels;
  display: DisplaySettingsCardLabels;
}

export interface SettingsPageProps {
  labels?: Partial<SettingsPageLabels>;
}

const DEFAULT_LABELS: Pick<SettingsPageLabels, "heading" | "subtitle"> = {
  heading: "Settings",
  subtitle: "Shop-wide settings, shared by every admin.",
};

/** Admin settings: one card per settings group. Add a new group as another card here. */
export function SettingsPage({ labels: labelsProp }: SettingsPageProps) {
  const labels = { ...DEFAULT_LABELS, ...labelsProp };

  return (
    <div className="max-w-[880px]">
      <div className="mb-4">
        <h1 className="text-h1 font-semibold text-text-strong">{ labels.heading }</h1>
        <p className="text-[13.5px] text-text-muted mt-[5px]">{ labels.subtitle }</p>
      </div>

      <div className="flex flex-col gap-3.5">
        <ImportColumnsSettingsCard labels={ labels.importColumns } />
        <DisplaySettingsCard labels={ labels.display } />
      </div>
    </div>
  );
}
