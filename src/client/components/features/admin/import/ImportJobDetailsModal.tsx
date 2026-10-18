"use client";

import { useState } from "react";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { Loader } from "@/components/ui/Loader";
import { Modal } from "@/components/ui/Modal";
import { NoticeBanner } from "@/components/ui/NoticeBanner";
import { Pagination } from "@/components/ui/Pagination";
import { Tabs } from "@/components/ui/Tabs";
import { useAdminImportCategories } from "@/hooks/useAdminImportCategories";
import { useAdminImportRecords } from "@/hooks/useAdminImportRecords";
import { useDelayedFlag } from "@/hooks/useDelayedFlag";
import type { ImportCategoryRecord, ImportJobStatus, ImportRecord, ImportRecordOutcome } from "@/types/import";

export interface ImportJobDetailsModalLabels {
  /** `{id}` is replaced with the job number. */
  title: string;
  tabCreated: string;
  tabUpdated: string;
  tabFailed: string;
  tabCategories: string;
  /** Shown above the created categories. */
  categoriesHint: string;
  columnCategory: string;
  /** Link to the admin category list, opened in a new tab. */
  openCategoriesLabel: string;
  /** Shown above the created products - imported products start inactive. */
  createdHint: string;
  columnRow: string;
  columnEan: string;
  columnProduct: string;
  columnError: string;
  /** Accessible hint on a product link, which opens the product's edit form in a new tab. */
  openProductLabel: string;
  /** Shown instead of a name when the product has been deleted since the import. */
  deletedProductLabel: string;
  emptyLabel: string;
  closeLabel: string;
  genericErrorMessage: string;
}

export interface ImportJobDetailsModalProps {
  job: ImportJobStatus;
  labels: ImportJobDetailsModalLabels;
  onClose(): void;
}

type RecordRow = ImportRecord & { id: number };
type CategoryRow = ImportCategoryRecord & { id: number };

/** The modal's tabs: one per product row outcome, plus the categories the import created. */
type DetailsTab = ImportRecordOutcome | "Categories";

interface RecordListProps {
  jobId: number;
  outcome: ImportRecordOutcome;
  labels: ImportJobDetailsModalLabels;
}

/** Picks the tab to open first: created rows if any, then updated, then failed. */
function initialTab(job: ImportJobStatus): DetailsTab {
  if (job.createdCount > 0) {
    return "Created";
  }

  if (job.updatedCount > 0) {
    return "Updated";
  }

  return job.errorCount > 0 ? "Failed" : "Created";
}

/** The paged rows of one outcome. Keyed by outcome in the parent, so switching tabs starts at page 1. */
function RecordList({ jobId, outcome, labels }: RecordListProps) {
  const { records, total, isLoading, error, page, pageSize, setPage } = useAdminImportRecords(jobId, outcome, {
    genericErrorMessage: labels.genericErrorMessage,
  });
  const showLoader = useDelayedFlag(isLoading);

  const rowColumn: DataTableColumn<RecordRow> = { key: "rowNumber", label: labels.columnRow, mono: true, width: 74, align: "right" };
  const eanColumn: DataTableColumn<RecordRow> = {
    key: "ean",
    label: labels.columnEan,
    mono: true,
    width: 160,
    render: (row) => {
      // Only rows whose product still exists get a link (failed rows have no product at all).
      if (row.productId == null || row.productName == null || !row.ean) {
        return row.ean ?? "—";
      }

      return (
        <a
          href={ `/admin/products?edit=${row.productId}` }
          target="_blank"
          rel="noopener noreferrer"
          title={ labels.openProductLabel }
          className="inline-flex items-baseline gap-1 text-orange-700 hover:text-orange-800 hover:underline underline-offset-2"
        >
          { row.ean }
          <Icon name="external-link" size={ 12 } className="self-center" />
          <span className="sr-only">({ labels.openProductLabel })</span>
        </a>
      );
    },
  };
  const columns: DataTableColumn<RecordRow>[] = outcome === "Failed"
    ? [rowColumn, eanColumn, { key: "errorMessage", label: labels.columnError, wrap: true, sortable: false }]
    : [
      rowColumn,
      eanColumn,
      {
        key: "productName",
        label: labels.columnProduct,
        wrap: true,
        // No productId: a row logged before products were linked to import rows.
        render: (row) => row.productName
          ?? (row.productId != null ? <span className="text-text-subtle italic">{ labels.deletedProductLabel }</span> : "—"),
      },
    ];

  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const rows = records.map((row) => ({ ...row, id: row.rowNumber }));

  if (isLoading && !rows.length) {
    return showLoader ? (
      <div className="flex items-center justify-center py-[54px]">
        <Loader />
      </div>
    ) : (
      <div className="py-[54px]" />
    );
  }

  return (
    <>
      { error ? (
        <NoticeBanner tone="danger" className="mb-3">
          { error }
        </NoticeBanner>
      ) : null }

      <div className="rounded-sm border border-border-subtle overflow-hidden">
        <DataTable
          density="compact"
          columns={ columns }
          rows={ rows }
          loading={ isLoading }
          emptyState={ <EmptyState icon="inbox" title={ labels.emptyLabel } /> }
        />
      </div>

      { total > pageSize ? (
        <div className="mt-3">
          <Pagination page={ page } pageCount={ pageCount } total={ total } pageSize={ pageSize } onPageChange={ setPage } />
        </div>
      ) : null }
    </>
  );
}

interface CategoryListProps {
  jobId: number;
  labels: ImportJobDetailsModalLabels;
}

/** The paged categories the import created, parents before their children. */
function CategoryList({ jobId, labels }: CategoryListProps) {
  const { categories, total, isLoading, error, page, pageSize, setPage } = useAdminImportCategories(jobId, {
    genericErrorMessage: labels.genericErrorMessage,
  });
  const showLoader = useDelayedFlag(isLoading);

  const columns: DataTableColumn<CategoryRow>[] = [
    { key: "rowNumber", label: labels.columnRow, mono: true, width: 74, align: "right" },
    {
      key: "path",
      label: labels.columnCategory,
      wrap: true,
      render: (row) => (
        <span>
          { row.path }
          { row.currentName == null ? <span className="text-text-subtle italic">{ ` (${labels.deletedProductLabel})` }</span> : null }
        </span>
      ),
    },
  ];

  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const rows = categories.map((row, index) => ({ ...row, id: row.categoryId ?? -(index + 1) }));

  if (isLoading && !rows.length) {
    return showLoader ? (
      <div className="flex items-center justify-center py-[54px]">
        <Loader />
      </div>
    ) : (
      <div className="py-[54px]" />
    );
  }

  return (
    <>
      { error ? (
        <NoticeBanner tone="danger" className="mb-3">
          { error }
        </NoticeBanner>
      ) : null }

      <div className="rounded-sm border border-border-subtle overflow-hidden">
        <DataTable
          density="compact"
          columns={ columns }
          rows={ rows }
          loading={ isLoading }
          emptyState={ <EmptyState icon="inbox" title={ labels.emptyLabel } /> }
        />
      </div>

      { total > pageSize ? (
        <div className="mt-3">
          <Pagination page={ page } pageCount={ pageCount } total={ total } pageSize={ pageSize } onPageChange={ setPage } />
        </div>
      ) : null }
    </>
  );
}

/** What an import job did, row by row: the products it created, the ones it updated, the rows
 * that failed, and the categories it created - each on its own tab with its count. */
export function ImportJobDetailsModal({ job, labels, onClose }: ImportJobDetailsModalProps) {
  const [tab, setTab] = useState<DetailsTab>(() => initialTab(job));

  const tabs = [
    { value: "Created", label: labels.tabCreated, count: job.createdCount },
    { value: "Updated", label: labels.tabUpdated, count: job.updatedCount },
    { value: "Failed", label: labels.tabFailed, count: job.errorCount },
    { value: "Categories", label: labels.tabCategories, count: job.createdCategoryCount },
  ];

  return (
    <Modal title={ labels.title.replace("{id}", String(job.jobId)) } onClose={ onClose } closeLabel={ labels.closeLabel } width={ 720 }>
      <Tabs tabs={ tabs } value={ tab } onChange={ (value) => setTab(value as DetailsTab) } className="mb-3.5" />

      { tab === "Created" && job.createdCount > 0 ? (
        <NoticeBanner tone="info" compact className="mb-3">
          { labels.createdHint }
        </NoticeBanner>
      ) : null }

      { tab === "Categories" && job.createdCategoryCount > 0 ? (
        <NoticeBanner tone="info" compact className="mb-3">
          { labels.categoriesHint }
          { " " }
          <a
            href="/admin/categories"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-baseline gap-1 font-medium text-orange-700 hover:text-orange-800 hover:underline underline-offset-2"
          >
            { labels.openCategoriesLabel }
            <Icon name="external-link" size={ 12 } className="self-center" />
          </a>
        </NoticeBanner>
      ) : null }

      { tab === "Categories"
        ? <CategoryList jobId={ job.jobId } labels={ labels } />
        : <RecordList key={ tab } jobId={ job.jobId } outcome={ tab } labels={ labels } /> }
    </Modal>
  );
}
