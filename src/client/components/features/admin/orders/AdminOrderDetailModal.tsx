"use client";

import { useState } from "react";
import type { PackagingUnitLabels } from "@/lib/catalog/mapProductDto";
import { resolveErrorMessage } from "@/lib/http/resolveErrorMessage";
import { OrderItemsTable } from "@/components/features/orders/OrderItemsTable";
import { OrderTotals } from "@/components/features/orders/OrderTotals";
import { Button } from "@/components/ui/Button";
import { Loader } from "@/components/ui/Loader";
import { Modal } from "@/components/ui/Modal";
import { NoticeBanner } from "@/components/ui/NoticeBanner";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useAdminOrderDetail } from "@/hooks/useAdminOrderDetail";
import { useDelayedFlag } from "@/hooks/useDelayedFlag";
import { getAllowedNextStatuses } from "@/lib/orders/orderStatusTransitions";
import { ORDER_STATUS_ICONS, ORDER_STATUS_LABELS, ORDER_STATUS_TONES } from "@/lib/status-labels";
import { OrderStatus } from "@/types/server-enums";

export interface AdminOrderDetailModalLabels {
  customerLabel: string;
  placedOn: string;
  notesLabel: string;
  itemsTable: {
    columnProduct: string;
    columnSku: string;
    columnPackaging: string;
    columnQuantity: string;
    columnUnitPrice: string;
    columnTotal: string;
  };
  totals: {
    subtotal: string;
    vat: string;
    total: string;
  };
  packagingUnits: PackagingUnitLabels;
  statusSectionLabel: string;
  noTransitionsAvailable: string;
  renderTransitionLabel: (statusLabel: string) => string;
  closeLabel: string;
  genericErrorMessage: string;
  updateErrorMessage: string;
}

export interface AdminOrderDetailModalProps {
  orderId: number;
  businessName: string | null;
  labels: AdminOrderDetailModalLabels;
  onClose(): void;
  /** Called after a status change succeeds, so the caller's list can refresh. */
  onStatusChanged(): void;
}

const DANGER_STATUSES = new Set([OrderStatus.Cancelled, OrderStatus.Refunded]);

/** Admin review of a single order: the full line-item breakdown, plus buttons for every
 * status transition the server's own workflow currently allows from this order's status. */
export function AdminOrderDetailModal({ orderId, businessName, labels, onClose, onStatusChanged }: AdminOrderDetailModalProps) {
  const { order, isLoading, error, isUpdating, updateStatus } = useAdminOrderDetail(orderId, {
    genericErrorMessage: labels.genericErrorMessage,
  });
  const showLoader = useDelayedFlag(isLoading);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const handleTransition = async (status: OrderStatus): Promise<void> => {
    setUpdateError(null);

    try {
      await updateStatus({ status });
      onStatusChanged();
    }
    catch (caught) {
      setUpdateError(resolveErrorMessage(caught, labels.updateErrorMessage));
    }
  };

  const nextStatuses = order ? getAllowedNextStatuses(order.status) : [];

  return (
    <Modal
      title={ order ? order.orderNumber : "" }
      description={ order
        ? `${businessName ?? ""}${businessName ? " · " : ""}${labels.placedOn} ${new Date(order.placedAt).toLocaleDateString("lv-LV")}`
        : undefined }
      onClose={ onClose }
      closeLabel={ labels.closeLabel }
      width={ 760 }
    >
      { isLoading ? (
        showLoader ? (
          <div className="flex items-center justify-center py-[54px]">
            <Loader />
          </div>
        ) : (
          <div className="py-[54px]" />
        )
      ) : error || !order ? (
        <NoticeBanner tone="danger">{ error ?? labels.genericErrorMessage }</NoticeBanner>
      ) : (
        <div className="flex flex-col gap-4">
          { updateError ? <NoticeBanner tone="danger">{ updateError }</NoticeBanner> : null }

          <div>
            <StatusBadge
              tone={ ORDER_STATUS_TONES[order.status as OrderStatus] }
              label={ ORDER_STATUS_LABELS[order.status as OrderStatus] ?? order.status }
              icon={ ORDER_STATUS_ICONS[order.status as OrderStatus] }
            />
          </div>

          { order.notes ? (
            <div>
              <div className="text-[length:var(--font-size-base)] font-semibold uppercase tracking-[.055em] text-text-subtle mb-1">
                { labels.notesLabel }
              </div>
              <p className="text-[14px] text-text-body whitespace-pre-wrap">{ order.notes }</p>
            </div>
          ) : null }

          <div className="rounded-sm border border-border-subtle overflow-hidden">
            <OrderItemsTable
              items={ order.items }
              labels={ { ...labels.itemsTable, packagingUnits: labels.packagingUnits } }
            />
          </div>

          <OrderTotals
            subtotalAmount={ order.subtotalAmount }
            vatAmount={ order.vatAmount }
            totalAmount={ order.totalAmount }
            labels={ labels.totals }
          />

          <div className="pt-3 border-t border-border-subtle">
            <div className="text-[length:var(--font-size-base)] font-semibold uppercase tracking-[.055em] text-text-subtle mb-2">
              { labels.statusSectionLabel }
            </div>
            { nextStatuses.length === 0 ? (
              <p className="text-[14px] text-text-subtle">{ labels.noTransitionsAvailable }</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                { nextStatuses.map((status) => (
                  <Button
                    key={ status }
                    size="sm"
                    variant={ DANGER_STATUSES.has(status) ? "danger" : "primary" }
                    disabled={ isUpdating }
                    onClick={ () => handleTransition(status) }
                  >
                    { labels.renderTransitionLabel(ORDER_STATUS_LABELS[status]) }
                  </Button>
                )) }
              </div>
            ) }
          </div>
        </div>
      ) }
    </Modal>
  );
}
