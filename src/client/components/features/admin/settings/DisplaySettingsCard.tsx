"use client";

import { Card } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { NoticeBanner } from "@/components/ui/NoticeBanner";
import { useDisplaySettings } from "@/hooks/useDisplaySettings";

export interface DisplaySettingsCardLabels {
  title: string;
  description: string;
  stickyActionsLabel: string;
  stickyActionsHint: string;
  savingLabel: string;
  savedMessage: string;
  saveErrorMessage: string;
}

export const DEFAULT_DISPLAY_SETTINGS_LABELS: DisplaySettingsCardLabels = {
  title: "Display",
  description: "Defaults for the admin tables, shared by every admin. Changes are saved right away.",
  stickyActionsLabel: "Pin the actions column by default",
  stickyActionsHint: "Keeps the row actions visible on the right while scrolling wide tables (products, categories, brands, users, ERP import history). Each table can still toggle it.",
  savingLabel: "Saving…",
  savedMessage: "Saved.",
  saveErrorMessage: "Failed to save the display settings. Please try again.",
};

export interface DisplaySettingsCardProps {
  labels?: Partial<DisplaySettingsCardLabels>;
}

/** Admin UI display preferences; each change is saved immediately. */
export function DisplaySettingsCard({ labels: labelsProp }: DisplaySettingsCardProps) {
  const labels = { ...DEFAULT_DISPLAY_SETTINGS_LABELS, ...labelsProp };
  const { settings, isLoading, isSaving, error, justSaved, update } = useDisplaySettings({
    saveErrorMessage: labels.saveErrorMessage,
  });

  return (
    <Card
      title={ labels.title }
      subtitle={ labels.description }
      actions={
        isSaving ? <span className="text-[13px] text-text-subtle">{ labels.savingLabel }</span>
          : justSaved ? <span className="text-[13px] text-green-700">{ labels.savedMessage }</span>
            : null
      }
    >
      { error ? (
        <NoticeBanner tone="danger" className="mb-3">
          { error }
        </NoticeBanner>
      ) : null }

      <Checkbox
        label={ labels.stickyActionsLabel }
        checked={ settings.stickyActionsColumn }
        disabled={ isLoading || isSaving }
        onChange={ (event) => void update({ stickyActionsColumn: event.target.checked }) }
      />
      <p className="text-[12.5px] text-text-subtle mt-1 ml-[27px]">{ labels.stickyActionsHint }</p>
    </Card>
  );
}
