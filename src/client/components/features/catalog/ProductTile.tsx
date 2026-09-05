"use client";

import { useEffect, useRef, useState, type HTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { ProductMedia } from "@/components/ui/ProductMedia";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { WishlistButton } from "@/components/ui/WishlistButton";
import type { Product } from "@/types/catalog";

export interface AddToCartPayload {
  product: Product;
  unit: string;
  qty: number;
  total: number;
}

export interface ProductTileLabels {
  maskedCta: string;
  priceNote: string;
  wishlistSave: string;
  wishlistRemove: string;
  wishlistSaved: string;
  decreaseQty: string;
  increaseQty: string;
  addToCart: string;
  addedToCart: string;
  add: string;
  added: string;
}

const DEFAULT_LABELS: ProductTileLabels = {
  maskedCta: "Sign in to see price",
  priceNote: "excl. VAT",
  wishlistSave: "Save for later",
  wishlistRemove: "Remove from saved",
  wishlistSaved: "Saved",
  decreaseQty: "Decrease quantity",
  increaseQty: "Increase quantity",
  addToCart: "Add to cart",
  addedToCart: "Added to cart",
  add: "Add",
  added: "Added",
};

export interface ProductTileProps extends HTMLAttributes<HTMLElement> {
  product: Product;
  masked?: boolean;
  onAdd?: (payload: AddToCartPayload) => void;
  onOpen?: (product: Product) => void;
  onWishlist?: (payload: { product: Product; saved: boolean }) => void;
  wishlisted?: boolean;
  discount?: number;
  compact?: boolean;
  labels?: Partial<ProductTileLabels>;
}

/* Storefront tile: quieter than an admin/portal ProductCard. Media sits on a warm tinted
   panel, the category kicker is a mono label, and the whole tile is a link surface. Guests
   get a masked "sign in to see price" row; approved buyers get the unit + qty + add controls.
   All copy is a prop (English defaults) - real pages pass the Latvian text. */
export function ProductTile({
  product,
  masked = false,
  onAdd,
  onOpen,
  onWishlist,
  wishlisted = false,
  discount,
  compact = false,
  labels: labelsProp,
  className,
  style,
  ...rest
}: ProductTileProps) {
  const labels = { ...DEFAULT_LABELS, ...labelsProp };
  const units = product.units || [];
  const [unit, setUnit] = useState(units.find((u) => u.available !== false)?.value ?? units[0]?.value);
  const [qty, setQty] = useState(1);
  const [hover, setHover] = useState(false);
  const [added, setAdded] = useState(false);
  const [saved, setSaved] = useState(wishlisted);
  // Adjust local state during render when the prop changes from outside, rather than in an
  // effect - see "Adjusting state when a prop changes" in the React docs.
  const [prevWishlisted, setPrevWishlisted] = useState(wishlisted);

  if (wishlisted !== prevWishlisted) {
    setPrevWishlisted(wishlisted);
    setSaved(wishlisted);
  }

  const t = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(t.current), []);

  const active = units.find((u) => u.value === unit) ?? units[0];
  const unitPrice = active?.price ?? product.price;

  const soldAs = units
    .filter((u) => u.available !== false)
    .map((u) => (u.qty ? `${u.label} ${u.qty}` : u.label))
    .join(" · ");

  const open = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    onOpen?.(product);
  };

  const addToCart = () => {
    if (!active) return;
    onAdd?.({ product, unit: active.value, qty, total: unitPrice * qty });
    setAdded(true);
    clearTimeout(t.current);
    t.current = setTimeout(() => setAdded(false), 1300);
  };

  return (
    <article
      onMouseEnter={ () => setHover(true) }
      onMouseLeave={ () => setHover(false) }
      className={ cn(
        "relative flex flex-col h-full bg-surface-card rounded-card overflow-hidden border transition-[border-color,box-shadow] duration-base",
        hover ? "border-border-strong shadow-md" : "border-border-warm shadow-none",
        className,
      ) }
      style={ style }
      { ...rest }
    >
      <a href="#" onClick={ open } className="relative block flex-none bg-warm-100 no-underline">
        <ProductMedia
          src={ product.image }
          alt={ product.name }
          ratio="auto"
          radius="0"
          zoom={ hover }
          className="bg-transparent border-none"
          style={ { height: compact ? 116 : 152 } }
        />
        { discount ? (
          <span className="absolute top-2.5 right-2.5 bg-brand text-white text-[11px] font-semibold py-[3px] px-[9px] rounded-pill">
            −{ discount }%
          </span>
        ) : null }
      </a>
      <WishlistButton
        saved={ saved }
        corner="top-left"
        style={ { top: 2, left: 2 } }
        labels={ { save: labels.wishlistSave, remove: labels.wishlistRemove, saved: labels.wishlistSaved } }
        onChange={ (next) => {
          setSaved(next);
          onWishlist?.({ product, saved: next });
        } }
      />

      <div className={ cn("flex flex-col flex-1", compact ? "pt-[11px] px-[13px] pb-[13px]" : "pt-[13px] px-3.5 pb-3.5") }>
        <span className="font-mono text-[10px] font-medium tracking-[.11em] uppercase text-orange-600">
          { product.category || product.brand }
        </span>
        <a
          href="#"
          onClick={ open }
          className="text-[13.5px] font-semibold leading-[1.4] text-text-strong no-underline mt-[5px] text-balance line-clamp-2"
          style={ { minHeight: "calc(13.5px * 1.4 * 2)" } }
        >
          { product.name }
        </a>
        <p className="text-[11.5px] text-text-subtle mt-1.5 font-mono">{ soldAs }</p>

        <div className="mt-auto pt-[11px]">
          { masked ? (
            <a
              href="#/login"
              onClick={ open }
              className="flex items-start gap-1.5 min-w-0 text-[12.5px] font-semibold leading-[1.35] text-orange-700 no-underline whitespace-normal text-balance"
            >
              <Icon name="lock" size={ 13 } className="mt-0.5 flex-none" />
              { labels.maskedCta }
            </a>
          ) : (
            <>
              <PriceDisplay price={ unitPrice } unit={ active?.short } note={ labels.priceNote } />
              { !compact ? (
                <>
                  <SegmentedControl
                    className="mt-2.5"
                    fullWidth
                    value={ unit }
                    onChange={ (v) => {
                      setUnit(v as typeof unit);
                      setQty(1);
                    } }
                    options={ units.map((u) => ({ value: u.value, label: u.label, sub: u.qty, disabled: u.available === false })) }
                  />
                  <div className="flex items-center gap-[7px] mt-2">
                    <QuantityStepper
                      size="sm"
                      value={ qty }
                      onChange={ setQty }
                      decreaseLabel={ labels.decreaseQty }
                      increaseLabel={ labels.increaseQty }
                      className="flex-none"
                    />
                    <Button
                      fullWidth
                      size="sm"
                      aria-label={ added ? labels.addedToCart : labels.addToCart }
                      title={ labels.addToCart }
                      variant={ added ? "success" : "primary" }
                      icon={ added ? "check" : "plus" }
                      iconAfter={ added ? undefined : "shopping-cart" }
                      className="flex-1 min-w-11 p-0! gap-[3px]"
                      onClick={ addToCart }
                    />
                  </div>
                </>
              ) : (
                <div className="flex flex-col gap-1.5 mt-[9px]">
                  <QuantityStepper
                    size="lg"
                    value={ qty }
                    onChange={ setQty }
                    decreaseLabel={ labels.decreaseQty }
                    increaseLabel={ labels.increaseQty }
                    className="w-full"
                  />
                  <Button
                    size="lg"
                    fullWidth
                    variant={ added ? "success" : "primary" }
                    icon={ added ? "check" : "shopping-cart" }
                    aria-label={ added ? labels.addedToCart : labels.addToCart }
                    onClick={ addToCart }
                  >
                    { added ? labels.added : labels.add }
                  </Button>
                </div>
              ) }
            </>
          ) }
        </div>
      </div>
    </article>
  );
}
