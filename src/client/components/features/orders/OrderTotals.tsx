import { Money } from "@/lib/money";

export interface OrderTotalsLabels {
  subtotal: string;
  vat: string;
  total: string;
}

export interface OrderTotalsProps {
  subtotalAmount: number;
  vatAmount: number;
  totalAmount: number;
  labels: OrderTotalsLabels;
}

/** Subtotal / VAT / total breakdown shown under an order's line items. */
export function OrderTotals({ subtotalAmount, vatAmount, totalAmount, labels }: OrderTotalsProps) {
  return (
    <div className="flex flex-col gap-1.5 ml-auto w-full max-w-[260px] text-[14px]">
      <div className="flex items-center justify-between text-text-subtle">
        <span>{ labels.subtotal }</span>
        <span className="font-mono [font-variant-numeric:tabular-nums]">{ Money.eur(subtotalAmount) }</span>
      </div>
      <div className="flex items-center justify-between text-text-subtle">
        <span>{ labels.vat }</span>
        <span className="font-mono [font-variant-numeric:tabular-nums]">{ Money.eur(vatAmount) }</span>
      </div>
      <div className="flex items-center justify-between text-text-strong font-semibold text-[15px] pt-1.5 border-t border-border-subtle">
        <span>{ labels.total }</span>
        <span className="font-mono [font-variant-numeric:tabular-nums]">{ Money.eur(totalAmount) }</span>
      </div>
    </div>
  );
}
