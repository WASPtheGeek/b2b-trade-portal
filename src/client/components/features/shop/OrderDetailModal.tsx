"use client";

import { useRouter } from "next/navigation";
import type { PackagingUnitLabels } from "@/lib/catalog/mapProductDto";
import { OrderItemsTable } from "@/components/features/orders/OrderItemsTable";
import { OrderTotals } from "@/components/features/orders/OrderTotals";
import { Button } from "@/components/ui/Button";
import { Loader } from "@/components/ui/Loader";
import { Modal } from "@/components/ui/Modal";
import { NoticeBanner } from "@/components/ui/NoticeBanner";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useDelayedFlag } from "@/hooks/useDelayedFlag";
import { useOrderDetail } from "@/hooks/useOrderDetail";
import { useReorderToCart } from "@/hooks/useReorderToCart";
import { ORDER_STATUS_ICONS, ORDER_STATUS_LABELS, ORDER_STATUS_TONES } from "@/lib/status-labels";
import { OrderStatus } from "@/types/server-enums";

export interface OrderDetailModalLabels {
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
  reorderLabel: string;
  closeLabel: string;
  genericErrorMessage: string;
}

export interface OrderDetailModalProps {
  orderId: number;
  labels: OrderDetailModalLabels;
  onClose(): void;
}

/** Read-only detail view of one of the signed-in business's own orders, plus the reorder
 * action. Cancelling an order is admin-only now (see Admin/OrdersController.UpdateStatus) -
 * this view has no cancel action. "Reorder" doesn't place a new order outright - it loads
 * the order's items into the cart (re-priced against the current catalog) so the user can
 * adjust quantities or add a note before actually submitting. */
export function OrderDetailModal({ orderId, labels, onClose }: OrderDetailModalProps) {
  const router = useRouter();
  const { order, isLoading, error } = useOrderDetail(orderId, { genericErrorMessage: labels.genericErrorMessage });
  const showLoader = useDelayedFlag(isLoading);
  const { isProcessing: isReordering, error: reorderError, addItemsToCart } = useReorderToCart({ genericErrorMessage: labels.genericErrorMessage });

  const handleReorder = async (): Promise<void> => {
    if (!order) {
      return;
    }

    const added = await addItemsToCart(order.items, labels.packagingUnits);

    if (added > 0) {
      onClose();
      router.push("/cart");
    }
  };

  return (
    <Modal
      title={ order ? order.orderNumber : "" }
      description={ order ? `${labels.placedOn} ${new Date(order.placedAt).toLocaleDateString("lv-LV")}` : undefined }
      onClose={ onClose }
      closeLabel={ labels.closeLabel }
      width={ 760 }
      footer={ order ? (
        <Button variant="secondary" icon="rotate-ccw" disabled={ isReordering } onClick={ handleReorder }>
          { labels.reorderLabel }
        </Button>
      ) : undefined }
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
          { reorderError ? <NoticeBanner tone="danger">{ reorderError }</NoticeBanner> : null }

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
        </div>
      ) }
    </Modal>
  );
}
