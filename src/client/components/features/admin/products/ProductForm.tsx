"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { NoticeBanner } from "@/components/ui/NoticeBanner";
import { Select, type SelectOption } from "@/components/ui/Select";
import { TextArea } from "@/components/ui/TextArea";
import { useBrands } from "@/hooks/useBrands";
import { useCategories } from "@/hooks/useCategories";
import { useProductForm } from "@/hooks/useProductForm";
import { useVatRates } from "@/hooks/useVatRates";
import type { Category } from "@/types/category";
import type { ProductAdminDetail } from "@/types/product-admin";

export type ProductFormMode = "create" | "edit";

export interface ProductFormLabels {
  createHeading: string;
  editHeading: string;
  skuLabel: string;
  nameLabel: string;
  descriptionLabel: string;
  basePriceLabel: string;
  vatRateLabel: string;
  vatRatePlaceholder: string;
  brandLabel: string;
  brandPlaceholder: string;
  eanLabel: string;
  soldByPieceLabel: string;
  piecesPerBoxLabel: string;
  piecesPerPackageLabel: string;
  isActiveLabel: string;
  primaryCategoryLabel: string;
  primaryCategoryPlaceholder: string;
  additionalCategoriesLabel: string;
  submitLabel: string;
  submittingLabel: string;
  cancelLabel: string;
  genericErrorMessage: string;
}

const DEFAULT_LABELS: ProductFormLabels = {
  createHeading: "Add product",
  editHeading: "Edit product",
  skuLabel: "SKU",
  nameLabel: "Name",
  descriptionLabel: "Description",
  basePriceLabel: "Base price (excl. VAT)",
  vatRateLabel: "VAT rate",
  vatRatePlaceholder: "Select a VAT rate",
  brandLabel: "Brand",
  brandPlaceholder: "No brand",
  eanLabel: "EAN",
  soldByPieceLabel: "Sold by the piece",
  piecesPerBoxLabel: "Pieces per box",
  piecesPerPackageLabel: "Pieces per package",
  isActiveLabel: "Active (visible in the catalog)",
  primaryCategoryLabel: "Primary category",
  primaryCategoryPlaceholder: "Select a category",
  additionalCategoriesLabel: "Additional categories",
  submitLabel: "Save product",
  submittingLabel: "Saving…",
  cancelLabel: "Cancel",
  genericErrorMessage: "Failed to save the product. Please try again.",
};

export interface ProductFormProps {
  mode: ProductFormMode;
  /** The product being edited, or `null` when creating a new one. */
  product: ProductAdminDetail | null;
  labels?: Partial<ProductFormLabels>;
  /** Called after a successful save. Defaults to redirecting to the product list. */
  onSuccess?: () => void;
  /** Renders the cancel action as a button calling this instead of a link back to the list — for use inside a modal. */
  onCancel?: () => void;
}

/**
 * Builds indented `{value, label}` options from a flat category list, ordered so
 * each category appears after its parent (a simple depth-first walk of the tree).
 *
 * @param categories The flat list of categories, as returned by the API.
 * @returns The categories as select/checkbox options, indented by depth.
 */
function buildCategoryOptions(categories: Category[]): SelectOption[] {
  const byParent = new Map<number | null, Category[]>();

  for (const category of categories) {
    const siblings = byParent.get(category.parentId) ?? [];

    siblings.push(category);
    byParent.set(category.parentId, siblings);
  }

  const options: SelectOption[] = [];

  const walk = (parentId: number | null, depth: number): void => {
    for (const category of byParent.get(parentId) ?? []) {
      options.push({ value: String(category.id), label: `${"—".repeat(depth)} ${category.name}`.trim() });
      walk(category.id, depth + 1);
    }
  };

  walk(null, 0);

  return options;
}

/** Create/edit form for an admin-managed product. */
export function ProductForm({ mode, product, labels: labelsProp, onSuccess, onCancel }: ProductFormProps) {
  const labels = { ...DEFAULT_LABELS, ...labelsProp };
  const { fields, error, isSubmitting, setField, toggleAdditionalCategory, handleSubmit } = useProductForm({
    product,
    genericErrorMessage: labels.genericErrorMessage,
    onSuccess,
  });

  const { data: categories } = useCategories();
  const { data: brands } = useBrands();
  const { data: vatRates } = useVatRates();

  const categoryOptions = buildCategoryOptions(categories);
  const additionalCategoryOptions = categoryOptions.filter((option) => option.value !== fields.primaryCategoryId);
  const brandOptions: SelectOption[] = brands.map((brand) => ({ value: String(brand.id), label: brand.name }));
  const vatRateOptions: SelectOption[] = vatRates.map((rate) => ({ value: String(rate.id), label: rate.label }));

  return (
    <form onSubmit={ handleSubmit } className="max-w-[720px]">
      { onCancel ? null : (
        <h1 className="text-2xl font-semibold tracking-[-0.02em] text-text-strong">
          { mode === "create" ? labels.createHeading : labels.editHeading }
        </h1>
      ) }

      { error ? (
        <NoticeBanner tone="danger" className={ onCancel ? undefined : "mt-4" }>
          { error }
        </NoticeBanner>
      ) : null }

      <div className={ cn("grid grid-cols-1 md:grid-cols-2 gap-3.5", onCancel ? undefined : "mt-6") }>
        <FormField label={ labels.nameLabel } htmlFor="product-name" required className="md:col-span-2">
          <Input id="product-name" required value={ fields.name } onChange={ (event) => setField("name", event.target.value) } />
        </FormField>

        <FormField label={ labels.descriptionLabel } htmlFor="product-description" className="md:col-span-2">
          <TextArea
            id="product-description"
            value={ fields.description }
            onChange={ (event) => setField("description", event.target.value) }
          />
        </FormField>

        <FormField label={ labels.skuLabel } htmlFor="product-sku" required>
          <Input id="product-sku" mono required value={ fields.sku } onChange={ (event) => setField("sku", event.target.value) } />
        </FormField>

        <FormField label={ labels.eanLabel } htmlFor="product-ean">
          <Input id="product-ean" mono value={ fields.ean } onChange={ (event) => setField("ean", event.target.value) } />
        </FormField>

        <FormField label={ labels.basePriceLabel } htmlFor="product-base-price" required>
          <Input
            id="product-base-price"
            type="number"
            min={ 0 }
            step="0.01"
            required
            value={ fields.basePrice }
            onChange={ (event) => setField("basePrice", event.target.value) }
          />
        </FormField>

        <FormField label={ labels.vatRateLabel } htmlFor="product-vat-rate" required>
          <Select
            id="product-vat-rate"
            required
            placeholder={ labels.vatRatePlaceholder }
            options={ vatRateOptions }
            value={ fields.vatRateId }
            onChange={ (event) => setField("vatRateId", event.target.value) }
          />
        </FormField>

        <FormField label={ labels.brandLabel } htmlFor="product-brand" className="md:col-span-2">
          <Select
            id="product-brand"
            placeholder={ labels.brandPlaceholder }
            options={ brandOptions }
            value={ fields.brandId }
            onChange={ (event) => setField("brandId", event.target.value) }
          />
        </FormField>

        <FormField label={ labels.primaryCategoryLabel } htmlFor="product-primary-category" required className="md:col-span-2">
          <Select
            id="product-primary-category"
            required
            placeholder={ labels.primaryCategoryPlaceholder }
            options={ categoryOptions }
            value={ fields.primaryCategoryId }
            onChange={ (event) => setField("primaryCategoryId", event.target.value) }
          />
        </FormField>

        { additionalCategoryOptions.length > 0 ? (
          <FormField label={ labels.additionalCategoriesLabel } className="md:col-span-2">
            <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1">
              { additionalCategoryOptions.map((option) => (
                <Checkbox
                  key={ option.value }
                  label={ option.label }
                  checked={ fields.additionalCategoryIds.includes(option.value) }
                  onChange={ () => toggleAdditionalCategory(option.value) }
                />
              )) }
            </div>
          </FormField>
        ) : null }

        <FormField label={ labels.piecesPerBoxLabel } htmlFor="product-pieces-per-box">
          <Input
            id="product-pieces-per-box"
            type="number"
            min={ 0 }
            value={ fields.piecesPerBox }
            onChange={ (event) => setField("piecesPerBox", event.target.value) }
          />
        </FormField>

        <FormField label={ labels.piecesPerPackageLabel } htmlFor="product-pieces-per-package">
          <Input
            id="product-pieces-per-package"
            type="number"
            min={ 0 }
            value={ fields.piecesPerPackage }
            onChange={ (event) => setField("piecesPerPackage", event.target.value) }
          />
        </FormField>

        <div className="md:col-span-2 flex flex-col gap-2.5">
          <Checkbox
            label={ labels.soldByPieceLabel }
            checked={ fields.soldByPiece }
            onChange={ (event) => setField("soldByPiece", event.target.checked) }
          />
          <Checkbox
            label={ labels.isActiveLabel }
            checked={ fields.isActive }
            onChange={ (event) => setField("isActive", event.target.checked) }
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 mt-7">
        { onCancel ? (
          <Button type="button" pill variant="secondary" onClick={ onCancel }>
            { labels.cancelLabel }
          </Button>
        ) : (
          <Link href="/admin/products">
            <Button type="button" pill variant="secondary">
              { labels.cancelLabel }
            </Button>
          </Link>
        ) }
        <Button type="submit" pill disabled={ isSubmitting }>
          { isSubmitting ? labels.submittingLabel : labels.submitLabel }
        </Button>
      </div>
    </form>
  );
}
