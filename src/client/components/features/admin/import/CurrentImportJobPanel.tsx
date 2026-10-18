"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { NoticeBanner } from "@/components/ui/NoticeBanner";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { cn } from "@/lib/cn";
import { Money } from "@/lib/money";
import { IMPORT_STATUS_ICONS, IMPORT_STATUS_LABELS, IMPORT_STATUS_TONES } from "@/lib/status-labels";
import { ImportStatus } from "@/types/server-enums";
import type { ImportJobStatus } from "@/types/import";

const ACTIVE_STATUSES: ReadonlySet<ImportStatus> = new Set([ImportStatus.Pending, ImportStatus.Running]);

export interface CurrentImportJobPanelLabels {
  currentJobRunningTitle: string;
  currentJobFinishedTitle: string;
  metricCreated: string;
  metricUpdated: string;
  metricCategories: string;
  metricErrors: string;
  renderProgressLabel: (processedRows: number, totalRows: number) => string;
  allSucceededMessage: string;
  someFailedMessage: string;
  failedMessage: string;
  viewDetailsLabel: string;
  stopLabel: string;
  stoppingLabel: string;
}

export interface CurrentImportJobPanelProps {
  job: ImportJobStatus;
  labels: CurrentImportJobPanelLabels;
  isStopping: boolean;
  stopError: string | null;
  onStop: () => void;
  onViewDetails: () => void;
}

function MetricChip({ label, value, tone }: { label: string; value: number; tone: "success" | "danger" | "neutral" }) {
  const TONE: Record<"success" | "danger" | "neutral", string> = {
    success: "bg-green-50 text-green-700",
    danger: "bg-red-50 text-red-700",
    neutral: "bg-surface-sunken text-text-muted",
  };

  return (
    <span className={ cn("inline-flex items-baseline gap-1.5 rounded-sm px-2.5 py-1 text-[12.5px]", TONE[tone]) }>
      { label }
      <strong className="font-semibold [font-variant-numeric:tabular-nums]">{ Money.int(value) }</strong>
    </span>
  );
}

/** Slim strip showing the most recently uploaded job: live progress and a stop button while it
 * runs, then its outcome and a link to the row-by-row details once it has finished. */
export function CurrentImportJobPanel({ job, labels, isStopping, stopError, onStop, onViewDetails }: CurrentImportJobPanelProps) {
  const isActive = ACTIVE_STATUSES.has(job.status);
  const isFailed = job.status === ImportStatus.Failed;
  const outcomeTone = isFailed ? "danger" : job.errorCount > 0 ? "amber" : "success";
  const outcomeMessage = isFailed ? labels.failedMessage : job.errorCount > 0 ? labels.someFailedMessage : labels.allSucceededMessage;

  return (
    <Card padding={ 14 }>
      { stopError ? (
        <NoticeBanner tone="danger" compact className="mb-3">
          { stopError }
        </NoticeBanner>
      ) : null }

      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        <div className="flex items-center gap-2.5 shrink-0">
          <span className="text-[length:var(--font-size-base)] font-semibold text-text-strong">
            { isActive ? labels.currentJobRunningTitle : labels.currentJobFinishedTitle }
          </span>
          <span className="font-mono text-[12px] text-text-subtle">#{ job.jobId }</span>
          <StatusBadge size="sm" tone={ IMPORT_STATUS_TONES[job.status] } label={ IMPORT_STATUS_LABELS[job.status] ?? job.status } icon={ IMPORT_STATUS_ICONS[job.status] } />
        </div>

        <div className="flex-1 min-w-[200px]">
          { isActive ? (
            <ProgressBar
              size="sm"
              value={ job.processedRows }
              max={ Math.max(job.totalRows, 1) }
              label={ labels.renderProgressLabel(job.processedRows, job.totalRows) }
            />
          ) : (
            <NoticeBanner tone={ outcomeTone } compact>
              { outcomeMessage }
            </NoticeBanner>
          ) }
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <MetricChip label={ labels.metricCreated } value={ job.createdCount } tone="success" />
          <MetricChip label={ labels.metricUpdated } value={ job.updatedCount } tone="neutral" />
          { job.createdCategoryCount > 0 ? (
            <MetricChip label={ labels.metricCategories } value={ job.createdCategoryCount } tone="neutral" />
          ) : null }
          <MetricChip label={ labels.metricErrors } value={ job.errorCount } tone={ job.errorCount > 0 ? "danger" : "neutral" } />
          { isActive ? (
            <Button size="sm" variant="secondary" icon="square" disabled={ isStopping } onClick={ onStop }>
              { isStopping ? labels.stoppingLabel : labels.stopLabel }
            </Button>
          ) : job.processedRows > 0 ? (
            <Button size="sm" variant="secondary" icon="eye" onClick={ onViewDetails }>
              { labels.viewDetailsLabel }
            </Button>
          ) : null }
        </div>
      </div>
    </Card>
  );
}
