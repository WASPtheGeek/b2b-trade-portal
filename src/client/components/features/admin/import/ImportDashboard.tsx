"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { Dropzone } from "@/components/ui/Dropzone";
import { EmptyState } from "@/components/ui/EmptyState";
import { IconButton } from "@/components/ui/IconButton";
import { NoticeBanner } from "@/components/ui/NoticeBanner";
import { Pagination } from "@/components/ui/Pagination";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { CurrentImportJobPanel, type CurrentImportJobPanelLabels } from "@/components/features/admin/import/CurrentImportJobPanel";
import { ImportJobDetailsModal, type ImportJobDetailsModalLabels } from "@/components/features/admin/import/ImportJobDetailsModal";
import { useAdminImportCancel } from "@/hooks/useAdminImportCancel";
import { useAdminImportHistory } from "@/hooks/useAdminImportHistory";
import { useAdminImportUpload } from "@/hooks/useAdminImportUpload";
import { useImportColumnSettings } from "@/hooks/useImportColumnSettings";
import { useStickyActionsColumn } from "@/hooks/useStickyActionsColumn";
import { Money } from "@/lib/money";
import { IMPORT_STATUS_ICONS, IMPORT_STATUS_LABELS, IMPORT_STATUS_TONES } from "@/lib/status-labels";
import { ImportStatus } from "@/types/server-enums";
import type { ImportJobStatus } from "@/types/import";
import { IMPORT_COLUMN_FIELDS } from "@/types/settings";

const ACTIVE_STATUSES: ReadonlySet<ImportStatus> = new Set([ImportStatus.Pending, ImportStatus.Running]);

function formatDateTime(iso: string | null): string {
  if (!iso) {
    return "—";
  }

  return new Date(iso).toLocaleString("lv-LV", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export interface ImportDashboardLabels extends CurrentImportJobPanelLabels {
  heading: string;
  subtitle: string;
  dropzoneTitle: string;
  dropzoneHint: string;
  browseLabel: string;
  columnsLabel: string;
  formatsLabel: string;
  uploadGenericErrorMessage: string;
  stopConfirmTitle: string;
  stopConfirmMessage: string;
  stopConfirmLabel: string;
  keepRunningLabel: string;
  stopGenericErrorMessage: string;
  historyCardTitle: string;
  stickyActionsLabel: string;
  columnJob: string;
  columnStarted: string;
  columnFinished: string;
  columnStatus: string;
  columnRows: string;
  columnCreated: string;
  columnUpdated: string;
  columnCategories: string;
  columnErrors: string;
  columnActions: string;
  emptyTitle: string;
  emptyDescription: string;
  genericErrorMessage: string;
  detailsModal: ImportJobDetailsModalLabels;
}

export interface ImportDashboardProps {
  labels?: Partial<ImportDashboardLabels>;
}

const DEFAULT_LABELS: ImportDashboardLabels = {
  heading: "ERP catalog import",
  subtitle: "Upload a CSV or XLSX export from the ERP. Existing products are matched and updated by EAN.",
  dropzoneTitle: "Drag a file here or choose from your computer",
  dropzoneHint: "CSV or XLSX",
  browseLabel: "Choose file",
  columnsLabel: "Required columns",
  formatsLabel: "Supported formats",
  uploadGenericErrorMessage: "Failed to upload the file. Please try again.",
  currentJobRunningTitle: "Import in progress",
  currentJobFinishedTitle: "Last import",
  metricCreated: "Created",
  metricUpdated: "Updated",
  metricCategories: "New categories",
  metricErrors: "Errors",
  renderProgressLabel: (processedRows, totalRows) => `Processing rows: ${Money.int(processedRows)} / ${Money.int(totalRows)}`,
  allSucceededMessage: "Every row was imported successfully.",
  someFailedMessage: "Some rows could not be imported. Fix them in the source file and upload it again - rows that already succeeded won't be duplicated.",
  failedMessage: "The import stopped before it finished - it was cancelled or hit an error. Rows processed before that were kept.",
  viewDetailsLabel: "View details",
  stopLabel: "Stop import",
  stoppingLabel: "Stopping…",
  stopConfirmTitle: "Stop this import?",
  stopConfirmMessage: "Processing stops before the next row. Rows already imported are kept - upload the file again to import the rest.",
  stopConfirmLabel: "Stop import",
  keepRunningLabel: "Keep running",
  stopGenericErrorMessage: "Failed to stop the import. Please try again.",
  historyCardTitle: "Previous imports",
  stickyActionsLabel: "Pin actions column",
  columnJob: "Job",
  columnStarted: "Started",
  columnFinished: "Finished",
  columnStatus: "Status",
  columnRows: "Rows",
  columnCreated: "Created",
  columnUpdated: "Updated",
  columnCategories: "New categories",
  columnErrors: "Errors",
  columnActions: "",
  emptyTitle: "No imports yet",
  emptyDescription: "Files you upload will show up here.",
  genericErrorMessage: "Failed to load the import history. Please try again.",
  detailsModal: {
    title: "Import #{id}",
    tabCreated: "Created",
    tabUpdated: "Updated",
    tabFailed: "Errors",
    tabCategories: "Categories",
    categoriesHint: "New categories are shown in the shop menu right away - check their names and placement.",
    columnCategory: "Category",
    openCategoriesLabel: "Open categories",
    createdHint: "New products are imported as inactive - review them and activate them on the Products page.",
    columnRow: "Row",
    columnEan: "EAN",
    columnProduct: "Product",
    columnError: "Error",
    openProductLabel: "Opens in a new tab",
    deletedProductLabel: "Deleted",
    emptyLabel: "No rows here",
    closeLabel: "Close",
    genericErrorMessage: "Failed to load the import rows. Please try again.",
  },

};


/** Admin ERP catalog import: upload a CSV/XLSX export, watch the resulting job's progress to
 * completion, and review past jobs (with a per-row error breakdown for any that failed rows). */
export function ImportDashboard({ labels: labelsProp }: ImportDashboardProps) {
  const labels = { ...DEFAULT_LABELS, ...labelsProp };
  const history = useAdminImportHistory({ genericErrorMessage: labels.genericErrorMessage });
  const { job, isUploading, error: uploadError, upload } = useAdminImportUpload({
    genericErrorMessage: labels.uploadGenericErrorMessage,
    onFinished: history.refresh,
  });
  const stopper = useAdminImportCancel({
    genericErrorMessage: labels.stopGenericErrorMessage,
    onCancelled: history.refresh,
  });
  // The headers the import expects, as configured in the admin settings.
  const { saved: importColumns } = useImportColumnSettings();
  const requiredColumns = IMPORT_COLUMN_FIELDS.map((field) => importColumns[field]);
  const { stickyActions, setStickyActions } = useStickyActionsColumn();
  const [detailsJob, setDetailsJob] = useState<ImportJobStatus | null>(null);
  const [pendingStopJobId, setPendingStopJobId] = useState<number | null>(null);

  const confirmStop = (): void => {
    if (pendingStopJobId != null) {
      void stopper.cancel(pendingStopJobId);
    }

    setPendingStopJobId(null);
  };

  const handleSelect = (files: FileList): void => {
    const file = files[0];

    if (file) {
      void upload(file);
    }
  };

  const isJobActive = !!job && ACTIVE_STATUSES.has(job.status);

  const columns: DataTableColumn<ImportJobStatus & { id: number }>[] = [
    { key: "jobId", label: labels.columnJob, mono: true, width: 70, render: (j) => `#${j.jobId}` },
    { key: "startedAt", label: labels.columnStarted, mono: true, render: (j) => formatDateTime(j.startedAt) },
    { key: "finishedAt", label: labels.columnFinished, mono: true, render: (j) => formatDateTime(j.finishedAt) },
    {
      key: "status",
      label: labels.columnStatus,
      render: (j) => (
        <StatusBadge
          size="sm"
          tone={ IMPORT_STATUS_TONES[j.status] }
          label={ IMPORT_STATUS_LABELS[j.status] ?? j.status }
          icon={ IMPORT_STATUS_ICONS[j.status] }
        />
      ),
    },
    { key: "rows", label: labels.columnRows, mono: true, align: "right", render: (j) => `${Money.int(j.processedRows)} / ${Money.int(j.totalRows)}` },
    { key: "createdCount", label: labels.columnCreated, mono: true, align: "right" },
    { key: "updatedCount", label: labels.columnUpdated, mono: true, align: "right" },
    { key: "createdCategoryCount", label: labels.columnCategories, mono: true, align: "right" },
    { key: "errorCount", label: labels.columnErrors, mono: true, align: "right" },
    {
      key: "actions",
      label: labels.columnActions,
      align: "right",
      sortable: false,
      width: 1,
      sticky: stickyActions ? "right" : undefined,
      render: (j) => (
        <div className="flex items-center justify-end">
          { ACTIVE_STATUSES.has(j.status) ? (
            <IconButton
              icon="square"
              variant="danger"
              label={ labels.stopLabel }
              disabled={ stopper.cancellingJobId === j.jobId }
              onClick={ () => setPendingStopJobId(j.jobId) }
            />
          ) : null }
          { !ACTIVE_STATUSES.has(j.status) && j.processedRows > 0 ? (
            <IconButton icon="eye" label={ labels.viewDetailsLabel } onClick={ () => setDetailsJob(j) } />
          ) : null }
        </div>
      ),
    },
  ];

  const pageCount = Math.max(1, Math.ceil(history.total / history.pageSize));
  const rows = history.jobs.map((j) => ({ ...j, id: j.jobId }));

  return (
    <>
      <div className="mb-4">
        <h1 className="text-h1 font-semibold text-text-strong">{ labels.heading }</h1>
        <p className="text-[13.5px] text-text-muted mt-[5px]">{ labels.subtitle }</p>
      </div>

      { uploadError ? (
        <NoticeBanner tone="danger" className="mb-3">
          { uploadError }
        </NoticeBanner>
      ) : null }

      <Dropzone
        size="sm"
        className="mb-3.5"
        title={ labels.dropzoneTitle }
        hint={ labels.dropzoneHint }
        accept=".csv,.xlsx"
        columns={ requiredColumns }
        browseLabel={ labels.browseLabel }
        columnsLabel={ labels.columnsLabel }
        formatsLabel={ labels.formatsLabel }
        disabled={ isUploading || isJobActive }
        onSelect={ handleSelect }
      />

      { job ? (
        <CurrentImportJobPanel
          job={ job }
          labels={ labels }
          isStopping={ stopper.cancellingJobId === job.jobId }
          stopError={ stopper.error }
          onStop={ () => setPendingStopJobId(job.jobId) }
          onViewDetails={ () => setDetailsJob(job) }
        />
      ) : null }

      <Card
        title={ labels.historyCardTitle }
        padding={ 0 }
        className={ job ? "mt-3.5" : undefined }
        actions={ <Checkbox label={ labels.stickyActionsLabel } checked={ stickyActions } onChange={ (event) => setStickyActions(event.target.checked) } /> }
      >
        { history.error ? (
          <NoticeBanner tone="danger" className="m-3">
            { history.error }
          </NoticeBanner>
        ) : null }

        <DataTable
          columns={ columns }
          rows={ rows }
          loading={ history.isLoading }
          emptyState={ <EmptyState icon="file-spreadsheet" title={ labels.emptyTitle }>{ labels.emptyDescription }</EmptyState> }
        />

        { history.total > history.pageSize ? (
          <div className="p-3 border-t border-border-subtle">
            <Pagination page={ history.page } pageCount={ pageCount } total={ history.total } pageSize={ history.pageSize } onPageChange={ history.setPage } />
          </div>
        ) : null }
      </Card>

      <ConfirmDialog
        open={ pendingStopJobId != null }
        title={ labels.stopConfirmTitle }
        description={ labels.stopConfirmMessage }
        confirmLabel={ labels.stopConfirmLabel }
        cancelLabel={ labels.keepRunningLabel }
        onConfirm={ confirmStop }
        onCancel={ () => setPendingStopJobId(null) }
      />

      { detailsJob ? (
        <ImportJobDetailsModal job={ detailsJob } labels={ labels.detailsModal } onClose={ () => setDetailsJob(null) } />
      ) : null }
    </>
  );
}
