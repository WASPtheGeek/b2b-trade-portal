"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ScrollReveal } from "@/components/features/catalog/ScrollReveal";
import { ProductTile, type ProductTileLabels } from "@/components/features/catalog/ProductTile";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { NoticeBanner } from "@/components/ui/NoticeBanner";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import { ProductMedia } from "@/components/ui/ProductMedia";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { WishlistButton } from "@/components/ui/WishlistButton";
import { useAuth } from "@/hooks/useAuth";
import { useShopCategories } from "@/hooks/useShopCategories";
import { useShopProductDetail } from "@/hooks/useShopProductDetail";
import { useWishlist } from "@/hooks/useWishlist";
import { buildLoginUrl } from "@/lib/auth/returnTo";
import { cn } from "@/lib/cn";
import { findCategoryTrail } from "@/lib/catalog/findCategoryTrail";
import { mapProductDetail, mapProductListItem, type PackagingUnitLabels } from "@/lib/catalog/mapProductDto";
import type { ProductUnit } from "@/types/catalog";

export interface ProductPageLabels {
  home: string;
  sku: string;
  ean: string;
  signInTitle: string;
  signInBody: string;
  signInCta: string;
  registerCta: string;
  soldAsLabel: string;
  totalLabel: string;
  addToCart: string;
  addedToCart: string;
  wishlistSave: string;
  wishlistRemove: string;
  wishlistSaved: string;
  decreaseQty: string;
  increaseQty: string;
  orderNotice: string;
  descriptionTitle: string;
  specsTitle: string;
  relatedTitle: string;
  notFoundTitle: string;
  notFoundBody: string;
  backToShop: string;
  genericError: string;
  productTile: ProductTileLabels;
  packagingUnits: PackagingUnitLabels;
}

export interface ProductPageProps {
  /** The product's numeric id - unlike categories, products have no slug on the API, so this
   * is the literal `long Id` from the DTO, parsed out of the `/product/[id]` route param. */
  id: number;
  labels: ProductPageLabels;
}

/** Real storefront product detail: fetches the product and a handful of related products (from
 * its primary category) from the API, with guest pricing masked exactly the way the server
 * already enforces it (a `null` price in the payload, not a client-side flag). */
export function ProductPage({ id, labels }: ProductPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const masked = !user;
  const { tree } = useShopCategories();
  const { isWishlisted, toggle: toggleWishlist } = useWishlist();

  const { product: dto, related, isLoading, error, notFound } = useShopProductDetail(id, { genericErrorMessage: labels.genericError });

  const product = useMemo(() => (dto ? mapProductDetail(dto, labels.packagingUnits) : null), [dto, labels.packagingUnits]);
  const primaryCategorySlug = dto?.categories[0]?.slug;
  const trail = useMemo(() => findCategoryTrail(tree, primaryCategorySlug), [tree, primaryCategorySlug]);

  const units = product?.units ?? [];
  const [unit, setUnit] = useState<ProductUnit["value"] | undefined>(units[0]?.value);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const addTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Adjust the unit/qty selection during render when the product identity changes, rather
  // than in an effect - see "Adjusting state when a prop changes" in the React docs (the same
  // pattern ProductTile.tsx uses for its wishlisted prop).
  const [prevProductId, setPrevProductId] = useState(product?.id);

  if (product?.id !== prevProductId) {
    setPrevProductId(product?.id);
    setUnit(units[0]?.value);
    setQty(1);
  }

  useEffect(() => () => clearTimeout(addTimer.current), []);

  if (notFound) {
    return (
      <main className="relative z-[1] max-w-layout-max mx-auto px-gutter py-[54px]">
        <EmptyState icon="search-x" title={ labels.notFoundTitle } actions={ <Button onClick={ () => router.push("/") }>{ labels.backToShop }</Button> }>
          { labels.notFoundBody }
        </EmptyState>
      </main>
    );
  }

  if (error) {
    return (
      <main className="relative z-[1] max-w-layout-max mx-auto px-gutter py-[54px]">
        <EmptyState icon="circle-alert" tone="danger" title={ labels.genericError } />
      </main>
    );
  }

  if (isLoading || !product || !dto) {
    return (
      <main className="relative z-[1] max-w-layout-max mx-auto px-gutter pt-4 pb-section-gap-lg">
        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] items-start gap-8 mt-[18px]">
          <div className="h-[392px] rounded-lg bg-surface-card border border-border-warm animate-pulse" />
          <div className="h-[392px] rounded-lg bg-surface-card border border-border-warm animate-pulse" />
        </div>
      </main>
    );
  }

  const active = units.find((u) => u.value === unit) ?? units[0];
  const unitPrice = active?.price ?? product.price;

  const addToCart = (): void => {
    setAdded(true);
    clearTimeout(addTimer.current);
    addTimer.current = setTimeout(() => setAdded(false), 1300);
  };

  return (
    <main className="relative z-[1] max-w-layout-max mx-auto px-gutter pt-4 pb-section-gap-lg">
      <Breadcrumbs
        ariaLabel={ labels.home }
        items={ [
          { label: labels.home, href: "/" },
          ...trail.map((t) => ({ label: t.label, href: `/category/${ t.id }` })),
          { label: product.name.split(",")[0]! },
        ] }
      />

      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] items-start gap-8 mt-[18px]">
        <div>
          <div className="relative bg-surface-card border border-border-warm rounded-lg overflow-hidden">
            <ProductMedia src={ product.image } alt={ product.name } ratio="auto" radius="0" style={ { height: 392, background: "transparent", border: "none" } } />
          </div>
        </div>

        <div>
          { product.category ? (
            <span className="font-mono text-[10.5px] font-medium tracking-[.13em] uppercase text-orange-600">{ product.category }</span>
          ) : null }
          <h1 className="text-[30px] leading-[1.18] tracking-[-.022em] font-semibold text-text-strong mt-[11px] text-balance">{ product.name }</h1>
          <div className="flex items-center gap-[18px] mt-3 flex-wrap text-[12.5px]">
            <span className="text-text-subtle">
              { labels.sku } <span className="font-mono text-text-body">{ product.sku }</span>
            </span>
            { product.ean ? (
              <span className="text-text-subtle">
                { labels.ean } <span className="font-mono text-text-body">{ product.ean }</span>
              </span>
            ) : null }
          </div>

          <div className="mt-5 py-[18px] px-[18px] bg-surface-card border border-border-warm rounded-lg">
            { masked ? (
              <>
                <div className="flex gap-3 items-start">
                  <span className="flex flex-none items-center justify-center w-[38px] h-[38px] rounded-md bg-orange-50 text-orange-600">
                    <Icon name="lock" size={ 17 } />
                  </span>
                  <div>
                    <p className="text-[14.5px] font-semibold text-text-strong">{ labels.signInTitle }</p>
                    <p className="text-[13px] text-text-muted mt-1 leading-normal text-balance">{ labels.signInBody }</p>
                  </div>
                </div>
                <div className="flex gap-2.5 mt-4 flex-wrap">
                  <Button variant="primary" pill size="lg" onClick={ () => router.push(buildLoginUrl(pathname)) }>
                    { labels.signInCta }
                  </Button>
                  <Button variant="secondary" pill size="lg" onClick={ () => router.push("/register") }>
                    { labels.registerCta }
                  </Button>
                </div>
              </>
            ) : (
              <>
                <PriceDisplay price={ unitPrice } unit={ active?.short } total={ unitPrice * qty } size="lg" note={ labels.productTile.priceNote } totalLabel={ labels.totalLabel } />
                { units.length ? (
                  <>
                    <p className="text-[11.5px] font-mono text-text-subtle mt-2.5 tracking-[.05em] uppercase font-semibold">{ labels.soldAsLabel }</p>
                    <SegmentedControl
                      className="mt-2"
                      size="lg"
                      fullWidth
                      value={ unit }
                      onChange={ (v) => {
                        setUnit(v as typeof unit);
                        setQty(1);
                      } }
                      options={ units.map((u) => ({ value: u.value, label: u.label, sub: u.qty })) }
                    />
                  </>
                ) : null }
                <div className="flex gap-2.5 mt-3 items-stretch flex-wrap">
                  <QuantityStepper
                    size="lg"
                    value={ qty }
                    onChange={ setQty }
                    unitLabel={ active?.short }
                    decreaseLabel={ labels.decreaseQty }
                    increaseLabel={ labels.increaseQty }
                    className="flex-none"
                  />
                  <Button
                    variant={ added ? "success" : "primary" }
                    pill
                    size="lg"
                    icon={ added ? "check" : "shopping-cart" }
                    className="flex-1 min-w-[180px]"
                    onClick={ addToCart }
                  >
                    { added ? labels.addedToCart : labels.addToCart }
                  </Button>
                  <div className="relative flex-none w-11 h-11">
                    <WishlistButton
                      saved={ isWishlisted(product.id) }
                      onChange={ () => toggleWishlist(product.id) }
                      floating={ false }
                      labels={ { save: labels.wishlistSave, remove: labels.wishlistRemove, saved: labels.wishlistSaved } }
                    />
                  </div>
                </div>
              </>
            ) }
            <NoticeBanner tone="brand" compact icon="shield-check" className="mt-4">
              { labels.orderNotice }
            </NoticeBanner>
          </div>
        </div>
      </div>

      <ScrollReveal className="mt-section-gap">
        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)] items-start gap-8">
          <div>
            <SectionLabel align="left" tone="muted">{ labels.descriptionTitle }</SectionLabel>
            { product.description ? <p className="text-[14.5px] leading-[1.75] text-text-muted mt-4 text-balance">{ product.description }</p> : null }
          </div>
          { product.specs?.length ? (
            <Card title={ labels.specsTitle } padding={ 0 }>
              <dl className="m-0">
                { product.specs.map((s, i) => (
                  <div key={ s.label } className={ cn("flex justify-between gap-3.5 py-[11px] px-4", i > 0 && "border-t border-border-subtle") }>
                    <dt className="text-[12.5px] text-text-subtle">{ s.label }</dt>
                    <dd className="m-0 text-[12.5px] font-medium text-text-strong font-mono">{ s.value }</dd>
                  </div>
                )) }
              </dl>
            </Card>
          ) : null }
        </div>
      </ScrollReveal>

      { related.length ? (
        <section className="mt-section-gap-lg">
          <ScrollReveal>
            <SectionLabel>{ labels.relatedTitle }</SectionLabel>
          </ScrollReveal>
          <div className="grid mt-6" style={ { gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: "14px" } }>
            { related.map((r, i) => {
              const relatedProduct = mapProductListItem(r, labels.packagingUnits, product.category);

              return (
                <ScrollReveal key={ relatedProduct.id } delay={ i * 55 } distance={ 12 }>
                  <ProductTile
                    compact
                    product={ relatedProduct }
                    masked={ masked }
                    labels={ labels.productTile }
                    onOpen={ (prod) => router.push(`/product/${ prod.id }`) }
                    wishlisted={ isWishlisted(relatedProduct.id) }
                    onWishlist={ ({ product: p }) => toggleWishlist(p.id) }
                  />
                </ScrollReveal>
              );
            }) }
          </div>
        </section>
      ) : null }
    </main>
  );
}
