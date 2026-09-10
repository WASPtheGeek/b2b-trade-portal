"use client";

import { useState } from "react";
import { ProductForm, type ProductFormLabels } from "@/components/features/admin/products/ProductForm";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { DataTable, type DataTableColumn, type DataTableSort } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { IconButton } from "@/components/ui/IconButton";
import { Loader } from "@/components/ui/Loader";
import { Modal } from "@/components/ui/Modal";
import { NoticeBanner } from "@/components/ui/NoticeBanner";
import { SearchInput } from "@/components/ui/SearchInput";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useAdminProductList } from "@/hooks/useAdminProductList";
import { useDelayedFlag } from "@/hooks/useDelayedFlag";
import { useProductDetail } from "@/hooks/useProductDetail";
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
  stickyActionsLabel: "Keep actions column visible",
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
};

export interface ProductListProps {
  labels?: Partial<ProductListLabels>;
  formLabels?: Partial<ProductFormLabels>;
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

/** Admin product list: search, status toggle, and create/edit through a modal form. */
export function ProductList({ labels: labelsProp, formLabels }: ProductListProps) {
  const labels = { ...DEFAULT_LABELS, ...labelsProp };
  const { products, isLoading, error, search, setSearch, setProductStatus, refresh } = useAdminProductList({
    genericErrorMessage: labels.genericErrorMessage,
  });
  const [formTarget, setFormTarget] = useState<ProductFormTarget | null>(null);
  const [sort, setSort] = useState<DataTableSort | undefined>(undefined);
  const [stickyActions, setStickyActions] = useState(true);

  const handleSaved = (): void => {
    setFormTarget(null);
    refresh();
  };

  const columns: DataTableColumn<ProductAdminListItem>[] = [
    {
      key: "name",
      label: labels.columnName,
      render: (product) => <span className="font-medium text-text-strong truncate">{ product.name }</span>,
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
      key: "isActive",
      label: labels.columnStatus,
      render: (product) => (
        <StatusBadge
          tone={ product.isActive ? "done" : "neutral" }
          label={ product.isActive ? labels.activeLabel : labels.inactiveLabel }
        />
      ),
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
        </div>
      ),
    },
  ];

  const sortedProducts = sortRows(products, sort);

  return (
    <>
      <div className="flex items-center justify-between gap-3 mb-4">
        <h1 className="text-h1 font-semibold text-text-strong">{ labels.heading }</h1>
        <Button pill icon="plus" onClick={ () => setFormTarget("new") }>
          { labels.addProductLabel }
        </Button>
      </div>

      { error ? (
        <NoticeBanner tone="danger" className="mb-4">
          { error }
        </NoticeBanner>
      ) : null }

      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="max-w-[360px] flex-1">
          <SearchInput value={ search } onChange={ (event) => setSearch(event.target.value) } onClear={ () => setSearch("") } placeholder={ labels.searchPlaceholder } />
        </div>
        <Checkbox label={ labels.stickyActionsLabel } checked={ stickyActions } onChange={ (event) => setStickyActions(event.target.checked) } />
      </div>

      <Card padding={ 0 }>
        <DataTable
          columns={ columns }
          rows={ sortedProducts }
          sort={ sort }
          onSortChange={ setSort }
          loading={ isLoading }
          emptyState={ <EmptyState icon="package" title={ labels.emptyTitle }>{ labels.emptyDescription }</EmptyState> }
        />
      </Card>

      { formTarget != null ? (
        <Modal
          title={ formTarget === "new" ? (formLabels?.createHeading ?? "Add product") : (formLabels?.editHeading ?? "Edit product") }
          closeLabel={ formLabels?.cancelLabel ?? "Cancel" }
          onClose={ () => setFormTarget(null) }
          width={ 720 }
        >
          { formTarget === "new" ? (
            <ProductForm mode="create" product={ null } labels={ formLabels } onSuccess={ handleSaved } onCancel={ () => setFormTarget(null) } />
          ) : (
            <EditProductModal
              productId={ formTarget }
              labels={ formLabels }
              onSuccess={ handleSaved }
              onCancel={ () => setFormTarget(null) }
            />
          ) }
        </Modal>
      ) : null }
    </>
  );
}
