"use client";

import { useEffect, useState, type HTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { ProductMedia } from "@/components/ui/ProductMedia";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { WishlistButton } from "@/components/ui/WishlistButton";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { fmtEur } from "@/lib/money";
import type { Product } from "@/types/catalog";
import type { AddToCartPayload } from "./ProductTile";

export interface ProductRowLabels {
  maskedCta: string;
  wishlistSave: string;
  wishlistRemove: string;
  wishlistSaved: string;
  decreaseQty: string;
  increaseQty: string;
  add: string;
  total: string;
}

const DEFAULT_LABELS: ProductRowLabels = {
  maskedCta: "Sign in to see price",
  wishlistSave: "Save for later",
  wishlistRemove: "Remove from saved",
  wishlistSaved: "Saved",
  decreaseQty: "Decrease quantity",
  increaseQty: "Increase quantity",
  add: "Add",
  total: "Total",
};

export interface ProductRowProps extends Omit<HTMLAttributes<HTMLElement>, "onChange"> {
  product: Product;
  masked?: boolean;
  onAdd?: (payload: AddToCartPayload) => void;
  onWishlist?: (payload: { product: Product; saved: boolean }) => void;
  wishlisted?: boolean;
  layout?: "table" | "mobile";
  index?: number;
  labels?: Partial<ProductRowLabels>;
}

/* Row form of ProductTile for the category page's list view - `layout="table"` renders a
   <tr> (parent must be a <table>), `layout="mobile"` renders a stacked <article> card, both
   sharing the same unit/qty/wishlist state machine as ProductTile. */
export function ProductRow({
  product,
  masked = false,
  onAdd,
  onWishlist,
  wishlisted = false,
  layout = "table",
  index = 0,
  labels: labelsProp,
  className,
  style,
  ...rest
}: ProductRowProps) {
  const labels = { ...DEFAULT_LABELS, ...labelsProp };
  const units = product.units || [];
  const [unit, setUnit] = useState(units.find((u) => u.available !== false)?.value ?? units[0]?.value);
  const [qty, setQty] = useState(1);
  const [saved, setSaved] = useState(wishlisted);

  useEffect(() => setSaved(wishlisted), [wishlisted]);

  const active = units.find((u) => u.value === unit) ?? units[0];
  const unitPrice = active?.price ?? product.price;
  const total = unitPrice != null ? unitPrice * qty : null;
  const stacked = layout === "mobile";

  const wishlist = (size: number) => (
    <WishlistButton
      saved={ saved }
      size={ size }
      corner="top-left"
      style={ { top: -14, left: -19 } }
      labels={ { save: labels.wishlistSave, remove: labels.wishlistRemove, saved: labels.wishlistSaved } }
      onChange={ (next) => {
        setSaved(next);
        onWishlist?.({ product, saved: next });
      } }
    />
  );

  const identity = (
    <div className="flex items-center gap-[11px] min-w-0">
      <div className="relative flex-none">
        <ProductMedia src={ product.image } alt={ product.name } style={ { width: stacked ? 52 : 42 } } />
        { wishlist(stacked ? 26 : 24) }
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-1.5 text-[10.5px] text-text-disabled">
          <span className="font-semibold tracking-[.05em] uppercase text-text-subtle">{ product.brand }</span>
          <span className="font-mono">{ product.sku }</span>
          { product.ean ? <span className="font-mono">· { product.ean }</span> : null }
        </div>
        <div
          className={ cn(
            "text-[13.5px] font-semibold text-text-strong leading-[1.35] mt-0.5 overflow-hidden text-ellipsis",
            stacked ? "whitespace-normal" : "whitespace-nowrap",
          ) }
        >
          { product.name }
        </div>
      </div>
    </div>
  );

  const unitOptions = units.map((u) => ({ value: u.value, label: u.label, sub: u.qty, disabled: u.available === false }));
  const addToCart = () => onAdd?.({ product, unit: unit ?? "", qty, total: total ?? 0 });

  if (stacked) {
    return (
      <article
        className={ cn("py-3 px-3.5 border-b border-border-subtle bg-surface-card animate-[elkaro-row-in_var(--dur-base)_var(--ease-out)_both]", className) }
        style={ { animationDelay: `${Math.min(index, 14) * 28}ms`, ...style } }
        { ...rest }
      >
        { identity }
        <div className="flex items-center justify-between gap-2.5 mt-2.5">
          { masked ? <PriceDisplay price={ 0 } masked maskedText={ labels.maskedCta } size="sm" /> : <PriceDisplay price={ unitPrice } unit={ active?.short } size="sm" note={ undefined } /> }
          { !masked && total != null ? (
            <Badge tone="brand" size="sm">
              { labels.total } { fmtEur(total) }
            </Badge>
          ) : null }
        </div>
        { masked ? (
          <Button variant="secondary" pill size="md" fullWidth wrap icon="lock-open" className="mt-2.5">
            { labels.maskedCta }
          </Button>
        ) : (
          <>
            <SegmentedControl
              className="mt-2.5"
              fullWidth
              size="md"
              value={ unit }
              onChange={ (v) => {
                setUnit(v as typeof unit);
                setQty(1);
              } }
              options={ unitOptions }
            />
            <div className="flex gap-2 mt-2">
              <QuantityStepper
                size="lg"
                value={ qty }
                onChange={ setQty }
                unitLabel={ active?.short }
                decreaseLabel={ labels.decreaseQty }
                increaseLabel={ labels.increaseQty }
                className="flex-none"
              />
              <Button variant="primary" size="lg" icon="shopping-cart" className="flex-1" onClick={ addToCart }>
                { labels.add }
              </Button>
            </div>
          </>
        ) }
      </article>
    );
  }

  return (
    <tr
      className={ cn("border-b border-border-subtle animate-[elkaro-row-in_var(--dur-base)_var(--ease-out)_both]", className) }
      style={ { animationDelay: `${Math.min(index, 14) * 28}ms`, ...style } }
      { ...rest }
    >
      <td className="py-[9px] px-[var(--cell-pad-x)] min-w-[260px]">{ identity }</td>
      <td className="py-[9px] px-[var(--cell-pad-x)] whitespace-nowrap">
        { masked ? <PriceDisplay price={ 0 } masked maskedText={ labels.maskedCta } size="sm" /> : <PriceDisplay price={ unitPrice } unit={ active?.short } size="sm" note={ undefined } /> }
      </td>
      <td className="py-[9px] px-[var(--cell-pad-x)]">
        { masked ? (
          <span className="text-[12.5px] text-text-disabled">—</span>
        ) : (
          <SegmentedControl
            value={ unit }
            onChange={ (v) => {
              setUnit(v as typeof unit);
              setQty(1);
            } }
            options={ unitOptions }
          />
        ) }
      </td>
      <td className="py-[9px] px-[var(--cell-pad-x)]">
        { masked ? (
          <span className="text-[12.5px] text-text-disabled">—</span>
        ) : (
          <QuantityStepper value={ qty } onChange={ setQty } size="sm" decreaseLabel={ labels.decreaseQty } increaseLabel={ labels.increaseQty } />
        ) }
      </td>
      <td
        className={ cn(
          "py-[9px] px-[var(--cell-pad-x)] text-right whitespace-nowrap font-sans text-sm font-semibold [font-variant-numeric:tabular-nums]",
          masked ? "text-text-disabled" : "text-orange-700",
        ) }
      >
        { masked || total == null ? "—" : fmtEur(total) }
      </td>
      <td className="py-[9px] px-[var(--cell-pad-x)] text-right">
        { masked ? (
          <Button variant="secondary" pill size="sm" icon="lock-open">
            { labels.maskedCta }
          </Button>
        ) : (
          <Button variant="primary" size="sm" icon="shopping-cart" onClick={ addToCart }>
            { labels.add }
          </Button>
        ) }
      </td>
    </tr>
  );
}
