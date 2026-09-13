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
import { useCategoryForm } from "@/hooks/useCategoryForm";
import type { Category } from "@/types/category";

export type CategoryFormMode = "create" | "edit";

export interface CategoryFormLabels {
  createHeading: string;
  editHeading: string;
  nameLabel: string;
  slugLabel: string;
  slugHint: string;
  parentLabel: string;
  parentPlaceholder: string;
  descriptionLabel: string;
  sortOrderLabel: string;
  isCustomLabel: string;
  showInMenuLabel: string;
  submitLabel: string;
  submittingLabel: string;
  cancelLabel: string;
  genericErrorMessage: string;
}

const DEFAULT_LABELS: CategoryFormLabels = {
  createHeading: "Add category",
  editHeading: "Edit category",
  nameLabel: "Name",
  slugLabel: "Slug",
  slugHint: "Used in the category's URL — generated from the name, but you can override it.",
  parentLabel: "Parent category",
  parentPlaceholder: "None (top-level category)",
  descriptionLabel: "Description",
  sortOrderLabel: "Sort order",
  isCustomLabel: "Custom navigation node (e.g. a temporary promotion)",
  showInMenuLabel: "Show in the storefront menu",
  submitLabel: "Save category",
  submittingLabel: "Saving…",
  cancelLabel: "Cancel",
  genericErrorMessage: "Failed to save the category. Please try again.",
};

export interface CategoryFormProps {
  mode: CategoryFormMode;
  /** The category being edited, or `null` when creating a new one. */
  category: Category | null;
  /** Every category, used to build the parent picker. */
  categories: Category[];
  labels?: Partial<CategoryFormLabels>;
  /** Called after a successful save. Defaults to redirecting to the category list. */
  onSuccess?: () => void;
  /** Renders the cancel action as a button calling this instead of a link back to the list — for use inside a modal. */
  onCancel?: () => void;
}

/**
 * Builds indented `{value, label}` parent options from a flat category list,
 * excluding `excludeId` and its entire subtree so a category can never be set
 * as its own (possibly indirect) parent.
 *
 * @param categories The flat list of categories, as returned by the API.
 * @param excludeId The category being edited, if any — it and its descendants are omitted.
 * @returns The eligible parent categories as select options, indented by depth.
 */
function buildParentOptions(categories: Category[], excludeId: number | null): SelectOption[] {
  const byParent = new Map<number | null, Category[]>();

  for (const category of categories) {
    const siblings = byParent.get(category.parentId) ?? [];

    siblings.push(category);
    byParent.set(category.parentId, siblings);
  }

  const options: SelectOption[] = [];

  const walk = (parentId: number | null, depth: number): void => {
    for (const category of byParent.get(parentId) ?? []) {
      if (category.id === excludeId) {
        continue;
      }

      options.push({ value: String(category.id), label: `${"—".repeat(depth)} ${category.name}`.trim() });
      walk(category.id, depth + 1);
    }
  };

  walk(null, 0);

  return options;
}

/** Create/edit form for an admin-managed category. */
export function CategoryForm({ mode, category, categories, labels: labelsProp, onSuccess, onCancel }: CategoryFormProps) {
  const labels = { ...DEFAULT_LABELS, ...labelsProp };
  const { fields, error, isSubmitting, setField, setName, handleSubmit } = useCategoryForm({
    category,
    genericErrorMessage: labels.genericErrorMessage,
    onSuccess,
  });

  const parentOptions = buildParentOptions(categories, category?.id ?? null);

  return (
    <form onSubmit={ handleSubmit } className="max-w-[640px]">
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
        <FormField label={ labels.nameLabel } htmlFor="category-name" required className="md:col-span-2">
          <Input id="category-name" required value={ fields.name } onChange={ (event) => setName(event.target.value) } />
        </FormField>

        <FormField label={ labels.slugLabel } htmlFor="category-slug" required hint={ labels.slugHint } className="md:col-span-2">
          <Input id="category-slug" mono required value={ fields.slug } onChange={ (event) => setField("slug", event.target.value) } />
        </FormField>

        <FormField label={ labels.parentLabel } htmlFor="category-parent" className="md:col-span-2">
          <Select
            id="category-parent"
            placeholder={ labels.parentPlaceholder }
            options={ parentOptions }
            value={ fields.parentId }
            onChange={ (event) => setField("parentId", event.target.value) }
          />
        </FormField>

        <FormField label={ labels.descriptionLabel } htmlFor="category-description" className="md:col-span-2">
          <TextArea
            id="category-description"
            value={ fields.description }
            onChange={ (event) => setField("description", event.target.value) }
          />
        </FormField>

        <FormField label={ labels.sortOrderLabel } htmlFor="category-sort-order">
          <Input
            id="category-sort-order"
            type="number"
            value={ fields.sortOrder }
            onChange={ (event) => setField("sortOrder", event.target.value) }
          />
        </FormField>

        <div className="md:col-span-2 flex flex-col gap-2.5">
          <Checkbox
            label={ labels.showInMenuLabel }
            checked={ fields.showInMenu }
            onChange={ (event) => setField("showInMenu", event.target.checked) }
          />
          <Checkbox
            label={ labels.isCustomLabel }
            checked={ fields.isCustom }
            onChange={ (event) => setField("isCustom", event.target.checked) }
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 mt-7">
        { onCancel ? (
          <Button type="button" pill variant="secondary" onClick={ onCancel }>
            { labels.cancelLabel }
          </Button>
        ) : (
          <Link href="/admin/categories">
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
