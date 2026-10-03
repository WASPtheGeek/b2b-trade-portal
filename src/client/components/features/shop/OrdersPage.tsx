"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { OrderDetailModal, type OrderDetailModalLabels } from "@/components/features/shop/OrderDetailModal";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { IconButton } from "@/components/ui/IconButton";
import { NoticeBanner } from "@/components/ui/NoticeBanner";
import { SearchInput } from "@/components/ui/SearchInput";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Tabs, type TabItem } from "@/components/ui/Tabs";
import { useMyOrders } from "@/hooks/useMyOrders";
import { useReorderToCart } from "@/hooks/useReorderToCart";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { Money } from "@/lib/money";
import { ORDER_STATUS_ICONS, ORDER_STATUS_LABELS, ORDER_STATUS_TONES } from "@/lib/status-labels";
import { OrderStatus } from "@/types/server-enums";
import type { OrderSummary } from "@/types/order";

const ALL_TAB = "all";

export interface OrdersPageLabels {
  title: string;
  itemCount: string;
  searchPlaceholder: string;
  tabAll: string;
  columnOrderNumber: string;
  columnDate: string;
  columnStatus: string;
  columnTotal: string;
  columnActions: string;
  viewLabel: string;
  reorderLabel: string;
  emptyTitle: string;
  emptyDescription: string;
  emptyFilteredTitle: string;
  browseCta: string;
  clearFiltersCta: string;
  genericError: string;
  detail: OrderDetailModalLabels;
}

export interface OrdersPageProps {
  labels: OrdersPageLabels;
}

/** The signed-in business's own order history: status tabs, order-number search, and a
 * per-row reorder action, with a detail modal for the full line-item breakdown. Cancelling an
 * order is admin-only (see Admin/OrdersController.UpdateStatus) - there's no cancel action here. */
export function OrdersPage({ labels }: OrdersPageProps) {
  const { isChecking } = useRequireAuth();
  const router = useRouter();
  const { orders, isLoading, error } = useMyOrders({ genericErrorMessage: labels.genericError });
  const { isProcessing: isReordering, error: reorderError, reorderToCart } = useReorderToCart({ genericErrorMessage: labels.genericError });

  const [tab, setTab] = useState<string>(ALL_TAB);
  const [search, setSearch] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  const counts = useMemo(() => {
    const acc: Record<string, number> = {};
    orders.forEach((o) => {
      acc[o.status] = (acc[o.status] ?? 0) + 1;
    });
    return acc;
  }, [orders]);

  const tabs: TabItem[] = [
    { value: ALL_TAB, label: labels.tabAll, count: orders.length },
    ...Object.keys(counts)
      .sort()
      .map((status) => ({ value: status, label: ORDER_STATUS_LABELS[status as OrderStatus] ?? status, count: counts[status] })),
  ];

  const filtered = orders.filter((o) => {
    if (tab !== ALL_TAB && o.status !== tab) {
      return false;
    }

    if (search && !o.orderNumber.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }

    return true;
  });

  const handleReorder = async (id: number): Promise<void> => {
    const added = await reorderToCart(id, labels.detail.packagingUnits);

    if (added > 0) {
      router.push("/cart");
    }
  };

  const columns: DataTableColumn<OrderSummary>[] = [
    {
      key: "orderNumber",
      label: labels.columnOrderNumber,
      mono: true,
      render: (order) => (
        <button
          type="button"
          onClick={ () => setSelectedOrderId(order.id) }
          className="border-none bg-transparent p-0 font-mono text-[length:var(--font-size-base)] text-orange-700 cursor-pointer hover:underline"
        >
          { order.orderNumber }
        </button>
      ),
    },
    {
      key: "placedAt",
      label: labels.columnDate,
      mono: true,
      render: (order) => new Date(order.placedAt).toLocaleDateString("lv-LV"),
    },
    {
      key: "status",
      label: labels.columnStatus,
      render: (order) => (
        <StatusBadge
          size="sm"
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
        <div className="flex items-center justify-end gap-1.5">
          <IconButton icon="eye" label={ labels.viewLabel } onClick={ () => setSelectedOrderId(order.id) } />
          <IconButton icon="rotate-ccw" label={ labels.reorderLabel } disabled={ isReordering } onClick={ () => handleReorder(order.id) } />
        </div>
      ),
    },
  ];

  if (isChecking) {
    return (
      <main className="relative z-[1] max-w-layout-max mx-auto px-gutter pt-4 pb-section-gap-lg">
        <div className="h-[320px] rounded-card bg-surface-card border border-border-warm animate-pulse" />
      </main>
    );
  }

  return (
    <main className="relative z-[1] max-w-layout-max mx-auto px-gutter pt-4 pb-section-gap-lg">
      <div className="flex items-baseline justify-between gap-4 flex-wrap">
        <h1 className="text-h1 font-semibold text-text-strong">{ labels.title }</h1>
        { !isLoading && orders.length > 0 ? (
          <span className="text-[13px] text-text-muted [font-variant-numeric:tabular-nums]">
            <strong className="text-text-strong font-semibold">{ orders.length }</strong> { labels.itemCount }
          </span>
        ) : null }
      </div>

      { reorderError ? (
        <NoticeBanner tone="danger" className="mt-4">
          { reorderError }
        </NoticeBanner>
      ) : null }

      { error ? (
        <Card padding={ 0 } className="mt-4">
          <EmptyState icon="circle-alert" tone="danger" title={ labels.genericError } compact />
        </Card>
      ) : isLoading ? (
        <div className="mt-4 h-[320px] rounded-card bg-surface-card border border-border-warm animate-pulse" />
      ) : orders.length === 0 ? (
        <Card padding={ 0 } className="mt-4">
          <EmptyState icon="package" title={ labels.emptyTitle } actions={ <Button onClick={ () => router.push("/") }>{ labels.browseCta }</Button> }>
            { labels.emptyDescription }
          </EmptyState>
        </Card>
      ) : (
        <Card padding={ 0 } className="mt-4">
          <div className="flex items-center gap-3 flex-wrap p-3 border-b border-border-subtle">
            <Tabs variant="pill" value={ tab } onChange={ setTab } tabs={ tabs } />
            <div className="ml-auto w-full sm:w-[260px]">
              <SearchInput size="sm" value={ search } onChange={ (e) => setSearch(e.target.value) } onClear={ () => setSearch("") } placeholder={ labels.searchPlaceholder } />
            </div>
          </div>

          <DataTable
            columns={ columns }
            rows={ filtered }
            emptyState={
              <EmptyState
                icon="search-x"
                title={ labels.emptyFilteredTitle }
                compact
                actions={ <Button size="sm" variant="secondary" onClick={ () => { setTab(ALL_TAB); setSearch(""); } }>{ labels.clearFiltersCta }</Button> }
              />
            }
          />
        </Card>
      ) }

      { selectedOrderId != null ? (
        <OrderDetailModal
          orderId={ selectedOrderId }
          labels={ labels.detail }
          onClose={ () => setSelectedOrderId(null) }
        />
      ) : null }
    </main>
  );
}
