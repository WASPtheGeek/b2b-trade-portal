import type { PackagingUnitLabels } from "@/lib/catalog/mapProductDto";
import { Money } from "@/lib/money";
import type { OrderItem } from "@/types/order";

export interface OrderItemsTableLabels {
  columnProduct: string;
  columnSku: string;
  columnPackaging: string;
  columnQuantity: string;
  columnUnitPrice: string;
  columnTotal: string;
  packagingUnits: PackagingUnitLabels;
}

export interface OrderItemsTableProps {
  items: OrderItem[];
  labels: OrderItemsTableLabels;
}

/** Read-only line-item breakdown for an order's detail view - shared between the storefront's
 * own-order detail and the admin order review, since both show the same frozen snapshot data. */
export function OrderItemsTable({ items, labels }: OrderItemsTableProps) {
  return (
    <table className="w-full border-separate border-spacing-0 font-sans text-[14px]">
      <thead>
        <tr>
          <th className="h-[34px] px-2.5 text-left text-[length:var(--font-size-base)] font-semibold uppercase tracking-[.055em] text-text-subtle bg-surface-subtle border-b border-border-default first:rounded-tl-sm">
            { labels.columnProduct }
          </th>
          <th className="h-[34px] px-2.5 text-left text-[length:var(--font-size-base)] font-semibold uppercase tracking-[.055em] text-text-subtle bg-surface-subtle border-b border-border-default">
            { labels.columnSku }
          </th>
          <th className="h-[34px] px-2.5 text-left text-[length:var(--font-size-base)] font-semibold uppercase tracking-[.055em] text-text-subtle bg-surface-subtle border-b border-border-default">
            { labels.columnPackaging }
          </th>
          <th className="h-[34px] px-2.5 text-right text-[length:var(--font-size-base)] font-semibold uppercase tracking-[.055em] text-text-subtle bg-surface-subtle border-b border-border-default">
            { labels.columnQuantity }
          </th>
          <th className="h-[34px] px-2.5 text-right text-[length:var(--font-size-base)] font-semibold uppercase tracking-[.055em] text-text-subtle bg-surface-subtle border-b border-border-default">
            { labels.columnUnitPrice }
          </th>
          <th className="h-[34px] px-2.5 text-right text-[length:var(--font-size-base)] font-semibold uppercase tracking-[.055em] text-text-subtle bg-surface-subtle border-b border-border-default last:rounded-tr-sm">
            { labels.columnTotal }
          </th>
        </tr>
      </thead>
      <tbody>
        { items.map((item) => {
          const unit = labels.packagingUnits[item.packagingUnit as keyof PackagingUnitLabels];

          return (
            <tr key={ item.id }>
              <td className="h-[42px] px-2.5 text-text-body border-b border-border-subtle">
                <span className="font-medium text-text-strong">{ item.productName }</span>
                { item.brand ? <span className="block text-[length:var(--font-size-base)] text-text-subtle">{ item.brand }</span> : null }
              </td>
              <td className="h-[42px] px-2.5 font-mono text-[length:var(--font-size-base)] text-text-body border-b border-border-subtle whitespace-nowrap">
                { item.sku }
              </td>
              <td className="h-[42px] px-2.5 text-text-body border-b border-border-subtle whitespace-nowrap">
                { unit?.label ?? item.packagingUnit }
              </td>
              <td className="h-[42px] px-2.5 text-right font-mono text-[length:var(--font-size-base)] text-text-body border-b border-border-subtle [font-variant-numeric:tabular-nums]">
                { item.quantity }
              </td>
              <td className="h-[42px] px-2.5 text-right font-mono text-[length:var(--font-size-base)] text-text-body border-b border-border-subtle [font-variant-numeric:tabular-nums]">
                { Money.eur(item.unitPrice) }
              </td>
              <td className="h-[42px] px-2.5 text-right font-mono text-[length:var(--font-size-base)] font-semibold text-text-strong border-b border-border-subtle [font-variant-numeric:tabular-nums]">
                { Money.eur(item.lineTotal) }
              </td>
            </tr>
          );
        }) }
      </tbody>
    </table>
  );
}
