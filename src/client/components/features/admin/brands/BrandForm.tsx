"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { NoticeBanner } from "@/components/ui/NoticeBanner";
import { useBrandForm } from "@/hooks/useBrandForm";
import type { Brand } from "@/types/brand";

export type BrandFormMode = "create" | "edit";

export interface BrandFormLabels {
  createHeading: string;
  editHeading: string;
  nameLabel: string;
  submitLabel: string;
  submittingLabel: string;
  cancelLabel: string;
  genericErrorMessage: string;
}

const DEFAULT_LABELS: BrandFormLabels = {
  createHeading: "Add brand",
  editHeading: "Edit brand",
  nameLabel: "Name",
  submitLabel: "Save brand",
  submittingLabel: "Saving…",
  cancelLabel: "Cancel",
  genericErrorMessage: "Failed to save the brand. Please try again.",
};

export interface BrandFormProps {
  mode: BrandFormMode;
  /** The brand being edited, or `null` when creating a new one. */
  brand: Brand | null;
  labels?: Partial<BrandFormLabels>;
  /** Called after a successful save. Defaults to redirecting to the brand list. */
  onSuccess?: () => void;
  /** Renders the cancel action as a button calling this instead of a link back to the list — for use inside a modal. */
  onCancel?: () => void;
}

/** Create/edit form for an admin-managed brand. */
export function BrandForm({ mode, brand, labels: labelsProp, onSuccess, onCancel }: BrandFormProps) {
  const labels = { ...DEFAULT_LABELS, ...labelsProp };
  const { name, error, isSubmitting, setName, handleSubmit } = useBrandForm({
    brand,
    genericErrorMessage: labels.genericErrorMessage,
    onSuccess,
  });

  return (
    <form onSubmit={ handleSubmit } className="max-w-[480px]">
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

      <FormField label={ labels.nameLabel } htmlFor="brand-name" required className={ onCancel ? undefined : "mt-6" }>
        <Input id="brand-name" required value={ name } onChange={ (event) => setName(event.target.value) } />
      </FormField>

      <div className="flex items-center justify-end gap-3 mt-7">
        { onCancel ? (
          <Button type="button" pill variant="secondary" onClick={ onCancel }>
            { labels.cancelLabel }
          </Button>
        ) : (
          <Link href="/admin/brands">
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
