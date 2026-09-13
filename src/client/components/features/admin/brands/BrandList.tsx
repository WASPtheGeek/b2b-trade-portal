"use client";

import { useState } from "react";
import { BrandForm, type BrandFormLabels } from "@/components/features/admin/brands/BrandForm";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { DataTable, type DataTableColumn, type DataTableSort } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { IconButton } from "@/components/ui/IconButton";
import { Modal } from "@/components/ui/Modal";
import { NoticeBanner } from "@/components/ui/NoticeBanner";
import { useAdminBrandList } from "@/hooks/useAdminBrandList";
import { sortRows } from "@/lib/sortRows";
import type { Brand } from "@/types/brand";

export interface BrandListLabels {
  heading: string;
  addBrandLabel: string;
  columnName: string;
  columnActions: string;
  stickyActionsLabel: string;
  editLabel: string;
  deleteLabel: string;
  deleteConfirmTitle: string;
  deleteConfirmMessage: string;
  cancelLabel: string;
  emptyTitle: string;
  emptyDescription: string;
  genericErrorMessage: string;
}

const DEFAULT_LABELS: BrandListLabels = {
  heading: "Brands",
  addBrandLabel: "Add brand",
  columnName: "Name",
  columnActions: "",
  stickyActionsLabel: "Pin actions column",
  editLabel: "Edit",
  deleteLabel: "Delete",
  deleteConfirmTitle: "Delete brand?",
  deleteConfirmMessage: "Delete this brand? Products using it will keep their name but lose the brand link.",
  cancelLabel: "Cancel",
  emptyTitle: "No brands yet",
  emptyDescription: "Brands you add will show up here.",
  genericErrorMessage: "Failed to load brands. Please try again.",
};

export interface BrandListProps {
  labels?: Partial<BrandListLabels>;
  formLabels?: Partial<BrandFormLabels>;
}

type BrandFormTarget = "new" | Brand;

/** Admin brand list: delete, and create/edit through a modal form. */
export function BrandList({ labels: labelsProp, formLabels }: BrandListProps) {
  const labels = { ...DEFAULT_LABELS, ...labelsProp };
  const { brands, isLoading, error, deleteBrand, refresh } = useAdminBrandList({
    genericErrorMessage: labels.genericErrorMessage,
  });
  const [pendingDelete, setPendingDelete] = useState<Brand | null>(null);
  const [formTarget, setFormTarget] = useState<BrandFormTarget | null>(null);
  const [sort, setSort] = useState<DataTableSort | undefined>(undefined);
  const [stickyActions, setStickyActions] = useState(true);

  const confirmDelete = (): void => {
    if (pendingDelete) {
      void deleteBrand(pendingDelete.id);
      setPendingDelete(null);
    }
  };

  const handleSaved = (): void => {
    setFormTarget(null);
    refresh();
  };

  const columns: DataTableColumn<Brand>[] = [
    { key: "name", label: labels.columnName, render: (brand) => <span className="text-text-strong">{ brand.name }</span> },
    {
      key: "actions",
      label: labels.columnActions,
      align: "right",
      // With table-layout:auto, an explicit (tiny) width hint on an otherwise-auto column
      // makes the browser shrink it to its content's min-content width instead of stretching
      // to fill the table's leftover space - the actual rendered width still can't go below
      // what the row-action icons need, since their own content sets the real floor.
      width: 1,
      sticky: stickyActions ? "right" : undefined,
      sortable: false,
      render: (brand) => (
        <div className="flex items-center justify-end gap-1.5">
          <IconButton icon="pencil" label={ labels.editLabel } onClick={ () => setFormTarget(brand) } />
          <IconButton icon="trash-2" label={ labels.deleteLabel } variant="danger" onClick={ () => setPendingDelete(brand) } />
        </div>
      ),
    },
  ];

  const sortedBrands = sortRows(brands, sort);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h1 className="text-h1 font-semibold text-text-strong truncate">{ labels.heading }</h1>
        <Button pill icon="plus" className="shrink-0" onClick={ () => setFormTarget("new") }>
          { labels.addBrandLabel }
        </Button>
      </div>

      { error ? (
        <NoticeBanner tone="danger" className="mb-4">
          { error }
        </NoticeBanner>
      ) : null }

      <div className="flex justify-end mb-2">
        <Checkbox label={ labels.stickyActionsLabel } checked={ stickyActions } onChange={ (event) => setStickyActions(event.target.checked) } />
      </div>

      <Card padding={ 0 }>
        <DataTable
          columns={ columns }
          rows={ sortedBrands }
          sort={ sort }
          onSortChange={ setSort }
          loading={ isLoading }
          emptyState={ <EmptyState icon="tag" title={ labels.emptyTitle }>{ labels.emptyDescription }</EmptyState> }
        />
      </Card>

      <ConfirmDialog
        open={ pendingDelete != null }
        title={ labels.deleteConfirmTitle }
        description={ labels.deleteConfirmMessage }
        confirmLabel={ labels.deleteLabel }
        cancelLabel={ labels.cancelLabel }
        onConfirm={ confirmDelete }
        onCancel={ () => setPendingDelete(null) }
      />

      { formTarget ? (
        <Modal
          title={ formTarget === "new" ? (formLabels?.createHeading ?? "Add brand") : (formLabels?.editHeading ?? "Edit brand") }
          closeLabel={ formLabels?.cancelLabel ?? "Cancel" }
          onClose={ () => setFormTarget(null) }
        >
          <BrandForm
            mode={ formTarget === "new" ? "create" : "edit" }
            brand={ formTarget === "new" ? null : formTarget }
            labels={ formLabels }
            onSuccess={ handleSaved }
            onCancel={ () => setFormTarget(null) }
          />
        </Modal>
      ) : null }
    </>
  );
}
