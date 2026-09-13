"use client";

import { useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ScrollReveal } from "@/components/features/catalog/ScrollReveal";
import { ProductRow } from "@/components/features/catalog/ProductRow";
import { ProductTile, type ProductTileLabels } from "@/components/features/catalog/ProductTile";
import type { ProductRowLabels } from "@/components/features/catalog/ProductRow";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { CategoryPanelList, FilterPanel } from "@/components/ui/FilterPanel";
import { Icon } from "@/components/ui/Icon";
import { Pagination } from "@/components/ui/Pagination";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Select } from "@/components/ui/Select";
import { useAuth } from "@/hooks/useAuth";
import { useShopCategories } from "@/hooks/useShopCategories";
import { useShopCategoryProducts } from "@/hooks/useShopCategoryProducts";
import { useWishlist } from "@/hooks/useWishlist";
import { findCategoryTrail } from "@/lib/catalog/findCategoryTrail";
import { buildLoginUrl } from "@/lib/auth/returnTo";
import { mapProductListItem } from "@/lib/catalog/mapProductDto";

const PAGE_SIZE = 24;

type SortKey = "recommended" | "name-asc" | "name-desc";
type ViewMode = "grid" | "list";

export interface CategoryPageLabels {
  home: string;
  subcategoriesTitle: string;
  sortRecommended: string;
  sortNameAsc: string;
  sortNameDesc: string;
  gridView: string;
  listView: string;
  resultsShowing: string;
  resultsOf: string;
  resultsProducts: string;
  guestModeNote: string;
  emptyTitle: string;
  emptyBody: string;
  notFoundTitle: string;
  notFoundBody: string;
  backToShop: string;
  genericError: string;
  prevPage: string;
  nextPage: string;
  colProduct: string;
  colPrice: string;
  colPackaging: string;
  colQty: string;
  colTotal: string;
  colCart: string;
  productTile: ProductTileLabels;
  productRow: ProductRowLabels;
}

export interface CategoryPageProps {
  /** The category's slug - `CategoryTreeChild.id` throughout the storefront nav, and the
   * `/category/[id]` route param. */
  id: string;
  labels: CategoryPageLabels;
}

/** Real storefront category listing: fetches the category and its products from the API,
 * with server-backed pagination, a subcategory sidebar built from the same tree the header
 * nav uses, and client-side sort/grid-list view over the current page. */
export function CategoryPage({ id, labels }: CategoryPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const masked = !user;
  const { tree } = useShopCategories();
  const { isWishlisted, toggle: toggleWishlist } = useWishlist();
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<SortKey>("recommended");
  const [view, setView] = useState<ViewMode>("grid");

  const { category, products, total, isLoading, error, notFound } = useShopCategoryProducts(id, {
    page,
    pageSize: PAGE_SIZE,
    genericErrorMessage: labels.genericError,
  });

  const trail = useMemo(() => findCategoryTrail(tree, id), [tree, id]);
  const categoryLabel = category?.name ?? trail[trail.length - 1]?.label ?? "";

  const sortedProducts = useMemo(() => {
    const copy = [...products];

    if (sort === "name-asc") {
      copy.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === "name-desc") {
      copy.sort((a, b) => b.name.localeCompare(a.name));
    }

    return copy;
  }, [products, sort]);

  const mappedProducts = useMemo(
    () => sortedProducts.map((dto) => mapProductListItem(dto, categoryLabel)),
    [sortedProducts, categoryLabel],
  );

  const openProduct = (productId: string): void => router.push(`/product/${productId}`);
  const signIn = (): void => router.push(buildLoginUrl(pathname));
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  if (notFound) {
    return (
      <main className="relative z-[1] max-w-layout-max mx-auto px-gutter py-[54px]">
        <EmptyState icon="search-x" title={ labels.notFoundTitle } actions={ <Button onClick={ () => router.push("/") }>{ labels.backToShop }</Button> }>
          { labels.notFoundBody }
        </EmptyState>
      </main>
    );
  }

  return (
    <main className="relative z-[1] max-w-layout-max mx-auto px-gutter pt-4 pb-section-gap-lg">
      <Breadcrumbs
        ariaLabel={ labels.home }
        items={ [
          { label: labels.home, href: "/" },
          ...trail.map((t, i) => ({ label: t.label, href: i < trail.length - 1 ? `/category/${ t.id }` : undefined })),
        ] }
      />

      <div className="flex items-baseline justify-between gap-4 mt-2.5 flex-wrap">
        <h1 className="text-h1 font-semibold text-text-strong">{ categoryLabel }</h1>
        { masked ? (
          <span className="flex items-center gap-1.5 text-[12.5px] text-orange-700">
            <Icon name="eye" size={ 13 } />
            { labels.guestModeNote }
          </span>
        ) : null }
      </div>

      <div className="flex flex-col md:flex-row items-start gap-4 mt-4">
        <aside className="w-full md:w-[248px] flex-none flex flex-col gap-3 md:sticky" style={ { top: "calc(var(--store-header-h) + var(--dept-nav-h) + 12px)" } }>
          <FilterPanel title={ labels.subcategoriesTitle } collapsible={ false }>
            <CategoryPanelList nodes={ tree } selected={ id } onSelect={ (nextId) => router.push(`/category/${ nextId }`) } />
          </FilterPanel>
        </aside>

        <div className="w-full flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap bg-surface-card border border-border-warm rounded-card py-2.5 px-3.5">
            <span className="text-[13px] text-text-muted [font-variant-numeric:tabular-nums]">
              { labels.resultsShowing } <strong className="text-text-strong font-semibold">{ products.length }</strong> { labels.resultsOf } { total } { labels.resultsProducts }
            </span>
            <div className="flex items-center gap-2 ml-auto">
              <Select
                value={ sort }
                onChange={ (e) => setSort(e.target.value as SortKey) }
                options={ [
                  { value: "recommended", label: labels.sortRecommended },
                  { value: "name-asc", label: labels.sortNameAsc },
                  { value: "name-desc", label: labels.sortNameDesc },
                ] }
                fullWidth={ false }
              />
              <SegmentedControl
                value={ view }
                onChange={ (v) => setView(v as ViewMode) }
                options={ [
                  { value: "grid", label: labels.gridView },
                  { value: "list", label: labels.listView },
                ] }
              />
            </div>
          </div>

          { error ? (
            <Card padding={ 0 } className="mt-3">
              <EmptyState icon="circle-alert" tone="danger" title={ labels.genericError } compact />
            </Card>
          ) : isLoading ? (
            <div className="grid grid-cols-2 gap-2.5 mt-3.5 sm:gap-3.5 sm:[grid-template-columns:repeat(auto-fill,minmax(220px,1fr))]">
              { Array.from({ length: 8 }, (_, i) => (
                <div key={ i } className="h-[320px] rounded-card bg-surface-card border border-border-warm animate-pulse" />
              )) }
            </div>
          ) : mappedProducts.length === 0 ? (
            <Card padding={ 0 } className="mt-3">
              <EmptyState icon="search-x" title={ labels.emptyTitle }>
                { labels.emptyBody }
              </EmptyState>
            </Card>
          ) : view === "grid" ? (
            <div className="grid grid-cols-2 gap-2.5 mt-3.5 sm:gap-3.5 sm:[grid-template-columns:repeat(auto-fill,minmax(220px,1fr))]">
              { mappedProducts.map((p, i) => (
                <ScrollReveal key={ p.id } delay={ Math.min(i, 8) * 50 } distance={ 12 }>
                  <ProductTile
                    product={ p }
                    masked={ masked }
                    labels={ labels.productTile }
                    onOpen={ (prod) => openProduct(prod.id) }
                    wishlisted={ isWishlisted(p.id) }
                    onWishlist={ ({ product }) => toggleWishlist(product.id) }
                    className="h-full"
                  />
                </ScrollReveal>
              )) }
            </div>
          ) : (
            <Card padding={ 0 } className="mt-3.5">
              <DataTable
                columns={ [
                  { key: "p", label: labels.colProduct },
                  { key: "c", label: labels.colPrice, sortable: false },
                  { key: "i", label: labels.colPackaging, sortable: false },
                  { key: "d", label: labels.colQty, sortable: false },
                  { key: "k", label: labels.colTotal, align: "right", sortable: false },
                  { key: "g", label: labels.colCart, align: "right", sortable: false },
                ] }
                rows={ mappedProducts }
                renderRow={ (p, i) => (
                  <ProductRow
                    key={ p.id }
                    index={ i }
                    product={ p }
                    masked={ masked }
                    labels={ labels.productRow }
                    onOpen={ (prod) => openProduct(prod.id) }
                    onSignIn={ signIn }
                    wishlisted={ isWishlisted(p.id) }
                    onWishlist={ ({ product }) => toggleWishlist(product.id) }
                  />
                ) }
              />
            </Card>
          ) }

          { total > PAGE_SIZE ? (
            <Pagination
              className="mt-[18px]"
              page={ page }
              pageCount={ pageCount }
              total={ total }
              pageSize={ PAGE_SIZE }
              onPageChange={ setPage }
              prevLabel={ labels.prevPage }
              nextLabel={ labels.nextPage }
              renderSummary={ (from, to, t) => (
                <>
                  { labels.resultsShowing } { from }–{ to } { labels.resultsOf } { t }
                </>
              ) }
            />
          ) : null }
        </div>
      </div>
    </main>
  );
}
