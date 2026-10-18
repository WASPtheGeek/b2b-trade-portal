"use client";

import { useMemo, useState } from "react";
import { ProductForm, type ProductFormLabels } from "@/components/features/admin/products/ProductForm";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { DataTable, type DataTableColumn, type DataTableSort } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { IconButton } from "@/components/ui/IconButton";
import { Loader } from "@/components/ui/Loader";
import { Modal } from "@/components/ui/Modal";
import { NoticeBanner } from "@/components/ui/NoticeBanner";
import { SearchInput } from "@/components/ui/SearchInput";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useAdminProductList, type ProductStatusFilter } from "@/hooks/useAdminProductList";
import { useDelayedFlag } from "@/hooks/useDelayedFlag";
import { useProductDetail } from "@/hooks/useProductDetail";
import { useRowSelection } from "@/hooks/useRowSelection";
import { useStickyActionsColumn } from "@/hooks/useStickyActionsColumn";
import { Money } from "@/lib/money";
import { sortRows } from "@/lib/sortRows";
import type { ProductAdminListItem } from "@/types/product-admin";

export interface ProductListLabels {
  heading: string;
  addProductLabel: string;
  searchPlaceholder: string;
  columnName: string;
  columnSku: string;
  columnDescription: string;
  columnEan: string;
  columnBrand: string;
  columnVatRate: string;
  columnCategories: string;
  columnPrice: string;
  columnPiecesPerBox: string;
  columnPiecesPerPackage: string;
  columnSoldByPiece: string;
  columnStatus: string;
  columnActions: string;
  stickyActionsLabel: string;
  activeLabel: string;
  inactiveLabel: string;
  activateLabel: string;
  deactivateLabel: string;
  soldByPieceYesLabel: string;
  soldByPieceNoLabel: string;
  editLabel: string;
  emptyTitle: string;
  emptyDescription: string;
  genericErrorMessage: string;
  filterAllLabel: string;
  filterActiveLabel: string;
  filterInactiveLabel: string;
  /** Plain string (not a function) so the labels stay serializable from the Server Component page;
   * `{count}` is replaced with the number of selected rows. */
  selectedCountLabel: string;
  activateSelectedLabel: string;
  deactivateSelectedLabel: string;
  clearSelectionLabel: string;
  bulkStatusErrorMessage: string;
  deleteLabel: string;
  deleteConfirmTitle: string;
  deleteConfirmMessage: string;
  deleteCancelLabel: string;
  deleteErrorMessage: string;
  deleteSelectedLabel: string;
  /** `{count}` is replaced with the number of selected products. */
  bulkDeleteConfirmTitle: string;
  bulkDeleteWarningTitle: string;
  bulkDeleteConfirmMessage: string;
  /** `{count}` is replaced with the number of selected products. */
  bulkDeleteConfirmLabel: string;
  /** `{count}` is replaced with the number of deleted products. */
  bulkDeleteResultLabel: string;
  /** `{count}` is replaced with the number of products kept because they've been ordered. */
  bulkDeleteSkippedLabel: string;
  dismissLabel: string;
}

const DEFAULT_LABELS: ProductListLabels = {
  heading: "Products",
  addProductLabel: "Add product",
  searchPlaceholder: "Search by name or EAN…",
  columnName: "Name",
  columnSku: "SKU",
  columnDescription: "Description",
  columnEan: "EAN",
  columnBrand: "Brand",
  columnVatRate: "VAT rate",
  columnCategories: "Categories",
  columnPrice: "Price",
  columnPiecesPerBox: "Pcs/box",
  columnPiecesPerPackage: "Pcs/package",
  columnSoldByPiece: "Sold by piece",
  columnStatus: "Status",
  columnActions: "",
  stickyActionsLabel: "Pin actions column",
  activeLabel: "Active",
  inactiveLabel: "Inactive",
  activateLabel: "Activate",
  deactivateLabel: "Deactivate",
  soldByPieceYesLabel: "Yes",
  soldByPieceNoLabel: "No",
  editLabel: "Edit",
  emptyTitle: "No products yet",
  emptyDescription: "Products you add will show up here.",
  genericErrorMessage: "Failed to load products. Please try again.",
  filterAllLabel: "All",
  filterActiveLabel: "Active",
  filterInactiveLabel: "Inactive",
  selectedCountLabel: "{count} selected",
  activateSelectedLabel: "Activate selected",
  deactivateSelectedLabel: "Deactivate selected",
  clearSelectionLabel: "Clear selection",
  bulkStatusErrorMessage: "Failed to update the selected products. Please try again.",
  deleteLabel: "Delete",
  deleteConfirmTitle: "Delete this product?",
  deleteConfirmMessage: "The product, its images and category links are removed permanently. Products that have been ordered can't be deleted - deactivate them instead.",
  deleteCancelLabel: "Cancel",
  deleteErrorMessage: "Failed to delete the product. Please try again.",
  deleteSelectedLabel: "Delete selected",
  bulkDeleteConfirmTitle: "Delete {count} products?",
  bulkDeleteWarningTitle: "This can't be undone",
  bulkDeleteConfirmMessage: "The selected products, their images and category links will be removed permanently. Products that have been ordered are skipped - deactivate them instead.",
  bulkDeleteConfirmLabel: "Delete {count} products",
  bulkDeleteResultLabel: "Products deleted: {count}.",
  bulkDeleteSkippedLabel: "{count} were kept because they have been ordered - deactivate them instead.",
  dismissLabel: "Dismiss",
};

function fillCount(template: string, count: number): string {
  return template.replace("{count}", String(count));
}

export interface ProductListProps {
  labels?: Partial<ProductListLabels>;
  formLabels?: Partial<ProductFormLabels>;
  /** Opens this product's edit form on load (the page's `?edit={id}` deep link). */
  initialEditProductId?: number;
}

interface EditProductModalProps {
  productId: number;
  labels?: Partial<ProductFormLabels>;
  onSuccess: () => void;
  onCancel: () => void;
}

/** Fetches the full editable detail for the product being edited, then renders the form. */
function EditProductModal({ productId, labels, onSuccess, onCancel }: EditProductModalProps) {
  const { product, isLoading, error } = useProductDetail(productId, { genericErrorMessage: labels?.genericErrorMessage });
  const showLoader = useDelayedFlag(isLoading);

  if (isLoading) {
    return showLoader ? (
      <div className="flex items-center justify-center py-[54px]">
        <Loader />
      </div>
    ) : (
      <div className="py-[54px]" />
    );
  }

  if (error || !product) {
    return <NoticeBanner tone="danger">{ error }</NoticeBanner>;
  }

  return <ProductForm mode="edit" product={ product } labels={ labels } onSuccess={ onSuccess } onCancel={ onCancel } />;
}

type ProductFormTarget = "new" | number;

/** Admin product list: search, status filter, single and bulk status toggle, and create/edit
 * through a modal form. */
export function ProductList({ labels: labelsProp, formLabels, initialEditProductId }: ProductListProps) {
  const labels = { ...DEFAULT_LABELS, ...labelsProp };
  const {
    products,
    isLoading,
    error,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    setProductStatus,
    setProductsStatus,
    deleteProduct,
    deleteProducts,
    bulkDeleteResult,
    dismissBulkDeleteResult,
    isBulkUpdating,
    refresh,
  } = useAdminProductList({
    genericErrorMessage: labels.genericErrorMessage,
    bulkStatusErrorMessage: labels.bulkStatusErrorMessage,
    deleteErrorMessage: labels.deleteErrorMessage,
  });
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [isBulkDeletePending, setIsBulkDeletePending] = useState(false);

  const confirmDelete = (): void => {
    if (pendingDeleteId != null) {
      void deleteProduct(pendingDeleteId);
    }

    setPendingDeleteId(null);
  };
  const [formTarget, setFormTarget] = useState<ProductFormTarget | null>(initialEditProductId ?? null);
  const [sort, setSort] = useState<DataTableSort | undefined>(undefined);
  const { stickyActions, setStickyActions } = useStickyActionsColumn();

  // Also drops a `?edit=` deep link from the URL, so a reload doesn't reopen the form.
  const closeForm = (): void => {
    setFormTarget(null);

    if (new URLSearchParams(window.location.search).has("edit")) {
      window.history.replaceState(null, "", window.location.pathname);
    }
  };

  const handleSaved = (): void => {
    closeForm();
    refresh();
  };

  const columns: DataTableColumn<ProductAdminListItem>[] = [
    {
      key: "name",
      label: labels.columnName,
      render: (product) => <span className="font-medium text-text-strong truncate">{ product.name }</span>,
    },
    {
      key: "isActive",
      label: labels.columnStatus,
      render: (product) => (
        <StatusBadge
          tone={ product.isActive ? "done" : "neutral" }
          label={ product.isActive ? labels.activeLabel : labels.inactiveLabel }
        />
      ),
    },
    { key: "sku", label: labels.columnSku, mono: true },
    { key: "ean", label: labels.columnEan, mono: true, render: (product) => product.ean ?? "—" },
    // {
    //   key: "description",
    //   label: labels.columnDescription,
    //   render: (product) => <span className="block max-w-[280px] truncate" title={ product.description ?? undefined }>{ product.description ?? "—" }</span>,
    // },
    { key: "brandName", label: labels.columnBrand, render: (product) => product.brandName ?? "—" },
    { key: "vatRatePercent", label: labels.columnVatRate, align: "right", render: (product) => `${product.vatRatePercent}%` },
    {
      key: "categoryNames",
      label: labels.columnCategories,
      sortable: false,
      render: (product) => (
        <span className="block max-w-[220px] truncate" title={ product.categoryNames.join(", ") || undefined }>
          { product.categoryNames.length > 0 ? product.categoryNames.join(", ") : "—" }
        </span>
      ),
    },
    { key: "basePrice", label: labels.columnPrice, align: "right", render: (product) => Money.eur(product.basePrice) },
    {
      key: "soldByPiece",
      label: labels.columnSoldByPiece,
      render: (product) => (
        <StatusBadge
          tone={ product.soldByPiece ? "done" : "neutral" }
          label={ product.soldByPiece ? labels.soldByPieceYesLabel : labels.soldByPieceNoLabel }
        />
      ),
    },
    { key: "piecesPerBox", label: labels.columnPiecesPerBox, align: "right", render: (product) => product.piecesPerBox ?? "—" },
    {
      key: "piecesPerPackage",
      label: labels.columnPiecesPerPackage,
      align: "right",
      render: (product) => product.piecesPerPackage ?? "—",
    },
    {
      key: "actions",
      label: labels.columnActions,
      align: "right",
      sortable: false,
      // With table-layout:auto, an explicit (tiny) width hint on an otherwise-auto column
      // makes the browser shrink it to its content's min-content width instead of stretching
      // to fill the table's leftover space - the actual rendered width still can't go below
      // what the row-action icons need, since their own content sets the real floor.
      width: 1,
      sticky: stickyActions ? "right" : undefined,
      render: (product) => (
        <div className="flex items-center justify-end gap-1.5">
          <IconButton icon="pencil" label={ labels.editLabel } onClick={ () => setFormTarget(product.id) } />
          <IconButton
            icon={ product.isActive ? "circle-slash" : "circle-check" }
            label={ product.isActive ? labels.deactivateLabel : labels.activateLabel }
            variant={ product.isActive ? "danger" : "success" }
            onClick={ () => setProductStatus(product.id, !product.isActive) }
          />
          <IconButton icon="trash-2" label={ labels.deleteLabel } variant="danger" onClick={ () => setPendingDeleteId(product.id) } />
        </div>
      ),
    },
  ];

  const sortedProducts = sortRows(products, sort);
  const selection = useRowSelection(useMemo(() => products.map((p) => p.id), [products]));

  const applyBulkStatus = async (isActive: boolean): Promise<void> => {
    await setProductsStatus(selection.selectedIds, isActive);
    selection.clear();
  };

  const confirmBulkDelete = (): void => {
    setIsBulkDeletePending(false);
    void deleteProducts(selection.selectedIds).then(selection.clear);
  };

  const statusOptions: { value: ProductStatusFilter; label: string }[] = [
    { value: "all", label: labels.filterAllLabel },
    { value: "active", label: labels.filterActiveLabel },
    { value: "inactive", label: labels.filterInactiveLabel },
  ];

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h1 className="text-h1 font-semibold text-text-strong truncate">{ labels.heading }</h1>
        <Button pill icon="plus" className="shrink-0" onClick={ () => setFormTarget("new") }>
          { labels.addProductLabel }
        </Button>
      </div>

      { error ? (
        <NoticeBanner tone="danger" className="mb-4">
          { error }
        </NoticeBanner>
      ) : null }

      { bulkDeleteResult ? (
        <NoticeBanner
          tone={ bulkDeleteResult.skippedIds.length > 0 ? "amber" : "success" }
          className="mb-4"
          onDismiss={ dismissBulkDeleteResult }
          dismissLabel={ labels.dismissLabel }
        >
          { fillCount(labels.bulkDeleteResultLabel, bulkDeleteResult.deletedCount) }
          { bulkDeleteResult.skippedIds.length > 0 ? ` ${fillCount(labels.bulkDeleteSkippedLabel, bulkDeleteResult.skippedIds.length)}` : null }
        </NoticeBanner>
      ) : null }

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="w-full max-w-[360px]">
          <SearchInput value={ search } onChange={ (event) => setSearch(event.target.value) } onClear={ () => setSearch("") } placeholder={ labels.searchPlaceholder } />
        </div>
        <SegmentedControl
          options={ statusOptions }
          value={ statusFilter }
          onChange={ (value) => setStatusFilter(value as ProductStatusFilter) }
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-2 min-h-control-sm">
        { selection.selectedIds.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[13px] font-medium text-text-strong">{ fillCount(labels.selectedCountLabel, selection.selectedIds.length) }</span>
            <Button size="sm" variant="success" icon="circle-check" disabled={ isBulkUpdating } onClick={ () => void applyBulkStatus(true) }>
              { labels.activateSelectedLabel }
            </Button>
            <Button size="sm" variant="secondary" icon="circle-slash" disabled={ isBulkUpdating } onClick={ () => void applyBulkStatus(false) }>
              { labels.deactivateSelectedLabel }
            </Button>
            <Button size="sm" variant="danger" icon="trash-2" disabled={ isBulkUpdating } onClick={ () => setIsBulkDeletePending(true) }>
              { labels.deleteSelectedLabel }
            </Button>
            <Button size="sm" variant="ghost" disabled={ isBulkUpdating } onClick={ selection.clear }>
              { labels.clearSelectionLabel }
            </Button>
          </div>
        ) : <span /> }
        <Checkbox label={ labels.stickyActionsLabel } checked={ stickyActions } onChange={ (event) => setStickyActions(event.target.checked) } />
      </div>

      <Card padding={ 0 }>
        <DataTable
          columns={ columns }
          rows={ sortedProducts }
          sort={ sort }
          onSortChange={ setSort }
          selectable
          renderSelectAll={ () => (
            <Checkbox checked={ selection.allSelected } indeterminate={ selection.someSelected } onChange={ selection.toggleAll } />
          ) }
          renderSelect={ (product) => (
            <Checkbox checked={ selection.isSelected(product.id) } onChange={ (event) => selection.toggle(product.id, event.target.checked) } />
          ) }
          loading={ isLoading }
          emptyState={ <EmptyState icon="package" title={ labels.emptyTitle }>{ labels.emptyDescription }</EmptyState> }
        />
      </Card>

      <ConfirmDialog
        open={ pendingDeleteId != null }
        title={ labels.deleteConfirmTitle }
        description={ labels.deleteConfirmMessage }
        confirmLabel={ labels.deleteLabel }
        cancelLabel={ labels.deleteCancelLabel }
        onConfirm={ confirmDelete }
        onCancel={ () => setPendingDeleteId(null) }
      />

      <ConfirmDialog
        open={ isBulkDeletePending }
        title={ fillCount(labels.bulkDeleteConfirmTitle, selection.selectedIds.length) }
        description={
          <NoticeBanner tone="danger" title={ labels.bulkDeleteWarningTitle }>
            { labels.bulkDeleteConfirmMessage }
          </NoticeBanner>
        }
        confirmLabel={ fillCount(labels.bulkDeleteConfirmLabel, selection.selectedIds.length) }
        cancelLabel={ labels.deleteCancelLabel }
        onConfirm={ confirmBulkDelete }
        onCancel={ () => setIsBulkDeletePending(false) }
      />

      { formTarget != null ? (
        <Modal
          title={ formTarget === "new" ? (formLabels?.createHeading ?? "Add product") : (formLabels?.editHeading ?? "Edit product") }
          closeLabel={ formLabels?.cancelLabel ?? "Cancel" }
          onClose={ () => closeForm() }
          width={ 720 }
        >
          { formTarget === "new" ? (
            <ProductForm mode="create" product={ null } labels={ formLabels } onSuccess={ handleSaved } onCancel={ () => closeForm() } />
          ) : (
            <EditProductModal
              productId={ formTarget }
              labels={ formLabels }
              onSuccess={ handleSaved }
              onCancel={ () => closeForm() }
            />
          ) }
        </Modal>
      ) : null }
    </>
  );
}
