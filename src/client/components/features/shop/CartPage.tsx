"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AccountStatusNotice, type AccountStatusNoticeLabels } from "@/components/features/shop/AccountStatusNotice";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { IconButton } from "@/components/ui/IconButton";
import { NoticeBanner } from "@/components/ui/NoticeBanner";
import { ProductMedia } from "@/components/ui/ProductMedia";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { TextArea } from "@/components/ui/TextArea";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { useCheckout } from "@/hooks/useCheckout";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { canSeePrices } from "@/lib/auth/canSeePrices";
import { Money } from "@/lib/money";
import type { CartLine } from "@/lib/cart/CartContextValue";

export interface CartPageLabels {
  title: string;
  itemCount: string;
  accountStatusNotice: AccountStatusNoticeLabels;
  clearCart: string;
  removeLabel: string;
  decreaseQty: string;
  increaseQty: string;
  emptyTitle: string;
  emptyBody: string;
  browseCta: string;
  wishlistCta: string;
  summaryTitle: string;
  subtotalLabel: string;
  totalLabel: string;
  priceNote: string;
  notesLabel: string;
  notesPlaceholder: string;
  submitLabel: string;
  submittingLabel: string;
  confirmationNotice: string;
  genericError: string;
}

export interface CartPageProps {
  labels: CartPageLabels;
}

/** Renders one cart line: media/identity, packaging-unit switch, quantity, line total, remove. */
function CartRow({
  line,
  labels,
  onOpen,
  onUnitChange,
  onQtyChange,
  onRemove,
}: {
  line: CartLine;
  labels: CartPageLabels;
  onOpen: () => void;
  onUnitChange: (unit: string) => void;
  onQtyChange: (qty: number) => void;
  onRemove: () => void;
}) {
  const active = line.product.units.find((u) => u.value === line.unit) ?? line.product.units[0];
  const unitPrice = active?.price ?? line.product.price;
  const total = unitPrice * line.qty;

  return (
    <div className="flex flex-wrap items-center gap-3 py-3 border-b border-border-subtle last:border-b-0">
      <button type="button" onClick={ onOpen } className="flex-none border-none bg-transparent p-0 cursor-pointer">
        <ProductMedia src={ line.product.image } alt={ line.product.name } style={ { width: 52 } } />
      </button>

      <div className="min-w-[160px] flex-1">
        <div className="flex items-center gap-1.5 text-[length:var(--font-size-base)] text-text-disabled">
          <span className="font-semibold tracking-[.05em] uppercase text-text-subtle">{ line.product.brand }</span>
          <span className="font-mono">{ line.product.sku }</span>
        </div>
        <button
          type="button"
          onClick={ onOpen }
          className="block border-none bg-transparent p-0 text-left text-[length:var(--font-size-base)] font-semibold text-text-strong cursor-pointer mt-0.5"
        >
          { line.product.name }
        </button>
      </div>

      { line.product.units.length > 1 ? (
        <SegmentedControl
          value={ line.unit }
          onChange={ onUnitChange }
          options={ line.product.units.map((u) => ({ value: u.value, label: u.label, sub: u.qty, disabled: u.available === false })) }
        />
      ) : null }

      <QuantityStepper
        size="sm"
        value={ line.qty }
        onChange={ onQtyChange }
        decreaseLabel={ labels.decreaseQty }
        increaseLabel={ labels.increaseQty }
        className="flex-none"
      />

      <div className="min-w-[90px] text-right">
        <div className="font-semibold text-text-strong [font-variant-numeric:tabular-nums]">{ Money.eur(total) }</div>
        <div className="text-[length:var(--font-size-base)] text-text-subtle font-mono [font-variant-numeric:tabular-nums]">
          { Money.eur(unitPrice) } / { active?.short }
        </div>
      </div>

      <IconButton icon="trash-2" label={ labels.removeLabel } variant="danger" onClick={ onRemove } />
    </div>
  );
}

/** The signed-in business's cart: line-item editing (unit/quantity/remove), an order summary,
 * and checkout - submitting converts the cart into a single `POST /api/orders` quote request. */
export function CartPage({ labels }: CartPageProps) {
  const { isChecking } = useRequireAuth();
  const { user } = useAuth();
  const router = useRouter();
  const cart = useCart();
  const { isSubmitting, error, submit } = useCheckout({ genericErrorMessage: labels.genericError });
  const [notes, setNotes] = useState("");

  const handleSubmit = async (): Promise<void> => {
    const created = await submit(cart.lines, notes);

    if (created) {
      cart.clear();
      router.push("/orders");
    }
  };

  if (isChecking) {
    return (
      <main className="relative z-[1] max-w-layout-max mx-auto px-gutter pt-4 pb-section-gap-lg">
        <div className="h-[320px] rounded-card bg-surface-card border border-border-warm animate-pulse" />
      </main>
    );
  }

  // The backend rejects POST /api/orders for a non-Approved account anyway (see
  // OrdersController.Create), but that's a bad way for a Pending/Rejected user to find out -
  // show the restriction up front instead of letting them fill in notes just to hit a 403.
  if (!canSeePrices(user)) {
    return (
      <main className="relative z-[1] max-w-layout-max mx-auto px-gutter pt-4 pb-section-gap-lg">
        <h1 className="text-h1 font-semibold text-text-strong">{ labels.title }</h1>
        { user ? (
          <AccountStatusNotice
            status={ user.status }
            rejectionReason={ user.rejectionReason }
            labels={ labels.accountStatusNotice }
            onViewAccount={ () => router.push("/account") }
            className="mt-4"
          />
        ) : null }
      </main>
    );
  }

  return (
    <main className="relative z-[1] max-w-layout-max mx-auto px-gutter pt-4 pb-section-gap-lg">
      <div className="flex items-baseline justify-between gap-4 flex-wrap">
        <h1 className="text-h1 font-semibold text-text-strong">{ labels.title }</h1>
        { !cart.isLoading && cart.lines.length > 0 ? (
          <span className="text-[13px] text-text-muted [font-variant-numeric:tabular-nums]">
            <strong className="text-text-strong font-semibold">{ cart.lines.length }</strong> { labels.itemCount }
          </span>
        ) : null }
      </div>

      { cart.isLoading ? (
        <div className="mt-4 h-[320px] rounded-card bg-surface-card border border-border-warm animate-pulse" />
      ) : cart.lines.length === 0 ? (
        <Card padding={ 0 } className="mt-4">
          <EmptyState
            icon="shopping-cart"
            title={ labels.emptyTitle }
            actions={
              <>
                <Button onClick={ () => router.push("/") }>{ labels.browseCta }</Button>
                <Button variant="secondary" onClick={ () => router.push("/wishlist") }>{ labels.wishlistCta }</Button>
              </>
            }
          >
            { labels.emptyBody }
          </EmptyState>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_320px] items-start gap-6 mt-4">
          <Card
            padding={ 16 }
            actions={
              <Button variant="link" icon="trash-2" onClick={ cart.clear }>
                { labels.clearCart }
              </Button>
            }
          >
            { cart.lines.map((line) => (
              <CartRow
                key={ line.key }
                line={ line }
                labels={ labels }
                onOpen={ () => router.push(`/product/${line.product.id}`) }
                onUnitChange={ (unit) => cart.setUnit(line.key, unit) }
                onQtyChange={ (qty) => cart.setQuantity(line.key, qty) }
                onRemove={ () => cart.remove(line.key) }
              />
            )) }
          </Card>

          <Card title={ labels.summaryTitle } className="md:sticky" style={ { top: "calc(var(--store-header-h) + 12px)" } }>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-text-subtle">
                <span>{ labels.subtotalLabel }</span>
                <span className="font-mono [font-variant-numeric:tabular-nums]">{ Money.eur(cart.subtotal) }</span>
              </div>
              <div className="flex items-center justify-between text-text-strong font-semibold text-[15px] pt-2 border-t border-border-subtle">
                <span>{ labels.totalLabel }</span>
                <span className="font-mono [font-variant-numeric:tabular-nums]">{ Money.eur(cart.subtotal) }</span>
              </div>
              <p className="text-[length:var(--font-size-base)] text-text-disabled -mt-1">{ labels.priceNote }</p>
            </div>

            <label className="block mt-4">
              <span className="block text-[length:var(--font-size-base)] font-semibold text-text-subtle mb-1.5">{ labels.notesLabel }</span>
              <TextArea value={ notes } onChange={ (e) => setNotes(e.target.value) } placeholder={ labels.notesPlaceholder } rows={ 3 } maxLength={ 2000 } />
            </label>

            { error ? (
              <NoticeBanner tone="danger" compact className="mt-3">
                { error }
              </NoticeBanner>
            ) : null }

            <Button fullWidth pill size="lg" icon="check" className="mt-4" disabled={ isSubmitting } onClick={ handleSubmit }>
              { isSubmitting ? labels.submittingLabel : labels.submitLabel }
            </Button>

            <NoticeBanner tone="brand" compact icon="shield-check" className="mt-3">
              { labels.confirmationNotice }
            </NoticeBanner>
          </Card>
        </div>
      ) }
    </main>
  );
}
