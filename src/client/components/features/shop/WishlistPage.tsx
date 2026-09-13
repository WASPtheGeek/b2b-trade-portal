"use client";

import { useRouter } from "next/navigation";
import { ScrollReveal } from "@/components/features/catalog/ScrollReveal";
import { ProductTile, type ProductTileLabels } from "@/components/features/catalog/ProductTile";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useWishlist } from "@/hooks/useWishlist";
import { useWishlistProducts } from "@/hooks/useWishlistProducts";
import { mapProductListItem, type PackagingUnitLabels } from "@/lib/catalog/mapProductDto";

export interface WishlistPageLabels {
  title: string;
  itemCount: string;
  emptyTitle: string;
  emptyBody: string;
  browseCta: string;
  genericError: string;
  productTile: ProductTileLabels;
  packagingUnits: PackagingUnitLabels;
}

export interface WishlistPageProps {
  labels: WishlistPageLabels;
}

/** Real storefront wishlist: the signed-in user's saved products, each rendered as the same
 * tile used everywhere else in the catalog, so un-saving one here works exactly like un-saving
 * it from a category grid - it just also drops the card immediately, since a de-listed
 * product has no reason to still be shown on this particular page. */
export function WishlistPage({ labels }: WishlistPageProps) {
  const { isChecking } = useRequireAuth();
  const router = useRouter();
  const { toggle: toggleWishlist } = useWishlist();
  const { products, isLoading, error, removeLocal } = useWishlistProducts({ genericErrorMessage: labels.genericError });

  if (isChecking) {
    return (
      <main className="relative z-[1] max-w-layout-max mx-auto px-gutter pt-4 pb-section-gap-lg">
        <div className="grid mt-3.5" style={ { gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: "14px" } }>
          { Array.from({ length: 4 }, (_, i) => (
            <div key={ i } className="h-[320px] rounded-card bg-surface-card border border-border-warm animate-pulse" />
          )) }
        </div>
      </main>
    );
  }

  const mappedProducts = products.map((dto) => mapProductListItem(dto, labels.packagingUnits));

  return (
    <main className="relative z-[1] max-w-layout-max mx-auto px-gutter pt-4 pb-section-gap-lg">
      <div className="flex items-baseline justify-between gap-4 flex-wrap">
        <h1 className="text-h1 font-semibold text-text-strong">{ labels.title }</h1>
        { !isLoading && mappedProducts.length > 0 ? (
          <span className="text-[13px] text-text-muted [font-variant-numeric:tabular-nums]">
            <strong className="text-text-strong font-semibold">{ mappedProducts.length }</strong> { labels.itemCount }
          </span>
        ) : null }
      </div>

      { error ? (
        <Card padding={ 0 } className="mt-4">
          <EmptyState icon="circle-alert" tone="danger" title={ labels.genericError } compact />
        </Card>
      ) : isLoading ? (
        <div className="grid mt-4" style={ { gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: "14px" } }>
          { Array.from({ length: 4 }, (_, i) => (
            <div key={ i } className="h-[320px] rounded-card bg-surface-card border border-border-warm animate-pulse" />
          )) }
        </div>
      ) : mappedProducts.length === 0 ? (
        <Card padding={ 0 } className="mt-4">
          <EmptyState icon="heart" title={ labels.emptyTitle } actions={ <Button onClick={ () => router.push("/") }>{ labels.browseCta }</Button> }>
            { labels.emptyBody }
          </EmptyState>
        </Card>
      ) : (
        <div className="grid mt-4" style={ { gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: "14px" } }>
          { mappedProducts.map((p, i) => (
            <ScrollReveal key={ p.id } delay={ Math.min(i, 8) * 50 } distance={ 12 }>
              <ProductTile
                product={ p }
                labels={ labels.productTile }
                onOpen={ (prod) => router.push(`/product/${ prod.id }`) }
                wishlisted
                onWishlist={ ({ product }) => {
                  removeLocal(Number(product.id));
                  toggleWishlist(product.id);
                } }
                className="h-full"
              />
            </ScrollReveal>
          )) }
        </div>
      ) }
    </main>
  );
}
