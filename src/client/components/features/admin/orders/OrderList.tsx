"use client";

import { useState } from "react";
import { AdminOrderDetailModal, type AdminOrderDetailModalLabels } from "@/components/features/admin/orders/AdminOrderDetailModal";
import { Card } from "@/components/ui/Card";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { IconButton } from "@/components/ui/IconButton";
import { NoticeBanner } from "@/components/ui/NoticeBanner";
import { Pagination } from "@/components/ui/Pagination";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Tabs, type TabItem } from "@/components/ui/Tabs";
import { useAdminOrderList } from "@/hooks/useAdminOrderList";
import { Money } from "@/lib/money";
import { ORDER_STATUS_ICONS, ORDER_STATUS_LABELS, ORDER_STATUS_TONES } from "@/lib/status-labels";
import { OrderStatus } from "@/types/server-enums";
import type { OrderSummary } from "@/types/order";

const ALL_TAB = "all";
const TAB_STATUSES: OrderStatus[] = [
  OrderStatus.Pending,
  OrderStatus.Confirmed,
  OrderStatus.Processing,
  OrderStatus.Shipped,
  OrderStatus.Delivered,
  OrderStatus.Cancelled,
  OrderStatus.Refunded,
];

export interface OrderListLabels {
  heading: string;
  tabAll: string;
  columnOrderNumber: string;
  columnCustomer: string;
  columnDate: string;
  columnStatus: string;
  columnTotal: string;
  columnActions: string;
  viewLabel: string;
  emptyTitle: string;
  emptyDescription: string;
  genericErrorMessage: string;
  detail: AdminOrderDetailModalLabels;
}

export interface OrderListProps {
  labels?: Partial<OrderListLabels>;
}

const DEFAULT_LABELS: OrderListLabels = {
  heading: "Orders",
  tabAll: "All",
  columnOrderNumber: "Order",
  columnCustomer: "Customer",
  columnDate: "Date",
  columnStatus: "Status",
  columnTotal: "Total",
  columnActions: "",
  viewLabel: "View",
  emptyTitle: "No orders yet",
  emptyDescription: "Orders placed by business accounts will show up here.",
  genericErrorMessage: "Failed to load orders. Please try again.",
  detail: {
    customerLabel: "Customer",
    placedOn: "Placed on",
    notesLabel: "Notes",
    itemsTable: {
      columnProduct: "Product",
      columnSku: "SKU",
      columnPackaging: "Packaging",
      columnQuantity: "Qty",
      columnUnitPrice: "Unit price",
      columnTotal: "Total",
    },
    totals: { subtotal: "Subtotal", vat: "VAT", total: "Total" },
    packagingUnits: {
      piece: { label: "Piece", short: "pc" },
      package: { label: "Package", short: "pkg" },
      box: { label: "Box", short: "box" },
    },
    statusSectionLabel: "Change status",
    noTransitionsAvailable: "This order has reached a final status and can no longer be changed.",
    renderTransitionLabel: (status) => `Mark as ${status}`,
    closeLabel: "Close",
    genericErrorMessage: "Failed to load the order. Please try again.",
    updateErrorMessage: "Failed to update the order's status. Please try again.",
  },
};

/** Admin order review: status-tab filtering, server-side pagination, and a detail modal that
 * carries the status-transition workflow (Admin/OrdersController.UpdateStatus's own rules). */
export function OrderList({ labels: labelsProp }: OrderListProps) {
  const labels = { ...DEFAULT_LABELS, ...labelsProp };
  const { orders, total, isLoading, error, status, setStatus, page, pageSize, setPage, refresh } = useAdminOrderList({
    genericErrorMessage: labels.genericErrorMessage,
  });
  const [selected, setSelected] = useState<OrderSummary | null>(null);

  const tabs: TabItem[] = [
    { value: ALL_TAB, label: labels.tabAll },
    ...TAB_STATUSES.map((s) => ({ value: s, label: ORDER_STATUS_LABELS[s] })),
  ];

  const columns: DataTableColumn<OrderSummary>[] = [
    {
      key: "orderNumber",
      label: labels.columnOrderNumber,
      mono: true,
      render: (order) => (
        <button
          type="button"
          onClick={ () => setSelected(order) }
          className="border-none bg-transparent p-0 font-mono text-[length:var(--font-size-base)] text-orange-700 cursor-pointer hover:underline"
        >
          { order.orderNumber }
        </button>
      ),
    },
    { key: "businessName", label: labels.columnCustomer, render: (order) => order.businessName ?? "—" },
    {
      key: "placedAt",
      label: labels.columnDate,
      mono: true,
      render: (order) => new Date(order.placedAt).toLocaleString("lv-LV", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
    {
      key: "status",
      label: labels.columnStatus,
      render: (order) => (
        <StatusBadge
          tone={ ORDER_STATUS_TONES[order.status as OrderStatus] }
          label={ ORDER_STATUS_LABELS[order.status as OrderStatus] ?? order.status }
          icon={ ORDER_STATUS_ICONS[order.status as OrderStatus] }
        />
      ),
    },
    {
      key: "totalAmount",
      label: labels.columnTotal,
      align: "right",
      render: (order) => <span className="font-semibold text-text-strong [font-variant-numeric:tabular-nums]">{ Money.eur(order.totalAmount) }</span>,
    },
    {
      key: "actions",
      label: labels.columnActions,
      align: "right",
      sortable: false,
      width: 1,
      render: (order) => (
        <div className="flex items-center justify-end">
          <IconButton icon="eye" label={ labels.viewLabel } onClick={ () => setSelected(order) } />
        </div>
      ),
    },
  ];

  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h1 className="text-h1 font-semibold text-text-strong truncate">{ labels.heading }</h1>
      </div>

      { error ? (
        <NoticeBanner tone="danger" className="mb-4">
          { error }
        </NoticeBanner>
      ) : null }

      <Card padding={ 0 }>
        <div className="flex items-center gap-3 flex-wrap p-3 border-b border-border-subtle">
          <Tabs variant="pill" value={ status ?? ALL_TAB } onChange={ (v) => setStatus(v === ALL_TAB ? null : v) } tabs={ tabs } />
        </div>

        <DataTable
          columns={ columns }
          rows={ orders }
          loading={ isLoading }
          emptyState={ <EmptyState icon="receipt" title={ labels.emptyTitle }>{ labels.emptyDescription }</EmptyState> }
        />

        { total > 0 ? (
          <div className="p-3 border-t border-border-subtle">
            <Pagination page={ page } pageCount={ pageCount } total={ total } pageSize={ pageSize } onPageChange={ setPage } />
          </div>
        ) : null }
      </Card>

      { selected ? (
        <AdminOrderDetailModal
          orderId={ selected.id }
          businessName={ selected.businessName }
          labels={ labels.detail }
          onClose={ () => setSelected(null) }
          onStatusChanged={ () => {
            refresh();
            setSelected(null);
          } }
        />
      ) : null }
    </>
  );
}
