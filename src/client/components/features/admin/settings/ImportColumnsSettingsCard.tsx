"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Input } from "@/components/ui/Input";
import { Loader } from "@/components/ui/Loader";
import { NoticeBanner } from "@/components/ui/NoticeBanner";
import { useDelayedFlag } from "@/hooks/useDelayedFlag";
import { useImportColumnSettings } from "@/hooks/useImportColumnSettings";
import { cn } from "@/lib/cn";
import { DEFAULT_IMPORT_COLUMNS, IMPORT_COLUMN_FIELDS, type ImportColumnField } from "@/types/settings";

export interface ImportColumnFieldLabels {
  label: string;
  hint?: string;
}

export interface ImportColumnsSettingsCardLabels {
  title: string;
  description: string;
  fields: Record<ImportColumnField, ImportColumnFieldLabels>;
  /** `{value}` is replaced with the field's default header. */
  defaultValueLabel: string;
  saveLabel: string;
  savingLabel: string;
  discardLabel: string;
  savedMessage: string;
  resetLabel: string;
  resetConfirmTitle: string;
  resetConfirmMessage: string;
  resetConfirmLabel: string;
  cancelLabel: string;
  emptyErrorMessage: string;
  duplicateErrorMessage: string;
  loadErrorMessage: string;
  saveErrorMessage: string;
}

export const DEFAULT_IMPORT_COLUMNS_LABELS: ImportColumnsSettingsCardLabels = {
  title: "ERP import columns",
  description: "The column headers the import looks for in the ERP file. Letter case and surrounding spaces don't matter. Changes apply to the next upload.",
  fields: {
    ean: { label: "EAN", hint: "Barcode. Matches existing products, and marks the file's header row." },
    name: { label: "Product name" },
    brand: { label: "Brand" },
    price: { label: "Price", hint: "Price per piece, without VAT." },
    soldByPiece: { label: "Sold by piece", hint: "1 = can be bought as a single piece, 0 = only by package or box." },
    piecesPerPackage: { label: "Pieces per package" },
    piecesPerBox: { label: "Pieces per box" },
    description: { label: "Description" },
    catalog: { label: "Catalog", hint: "Top-level category." },
    group: { label: "Group", hint: "Second-level category, under the catalog." },
    subgroup: { label: "Subgroup", hint: "Third-level category - the product's own category." },
  },
  defaultValueLabel: "Default: {value}",
  saveLabel: "Save columns",
  savingLabel: "Saving…",
  discardLabel: "Discard changes",
  savedMessage: "Import columns saved.",
  resetLabel: "Reset to defaults",
  resetConfirmTitle: "Reset the import columns?",
  resetConfirmMessage: "Every column header goes back to the default ERP export names. The next upload will use them.",
  resetConfirmLabel: "Reset",
  cancelLabel: "Cancel",
  emptyErrorMessage: "Enter a column name.",
  duplicateErrorMessage: "Another field already uses this column name.",
  loadErrorMessage: "Failed to load the import columns. Please try again.",
  saveErrorMessage: "Failed to save the import columns. Please try again.",
};

export interface ImportColumnsSettingsCardProps {
  labels?: Partial<ImportColumnsSettingsCardLabels>;
}

/** Edits which ERP file header each imported product field is read from. */
export function ImportColumnsSettingsCard({ labels: labelsProp }: ImportColumnsSettingsCardProps) {
  const labels = { ...DEFAULT_IMPORT_COLUMNS_LABELS, ...labelsProp };
  const columns = useImportColumnSettings({
    loadErrorMessage: labels.loadErrorMessage,
    saveErrorMessage: labels.saveErrorMessage,
    emptyErrorMessage: labels.emptyErrorMessage,
    duplicateErrorMessage: labels.duplicateErrorMessage,
  });
  const showLoader = useDelayedFlag(columns.isLoading);
  const [isResetPending, setIsResetPending] = useState(false);
  const hasErrors = Object.keys(columns.fieldErrors).length > 0;

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    void columns.save();
  };

  const confirmReset = (): void => {
    setIsResetPending(false);
    void columns.reset();
  };

  return (
    <Card title={ labels.title } subtitle={ labels.description }>
      { columns.isLoading ? (
        <div className="flex items-center justify-center py-10">{ showLoader ? <Loader /> : null }</div>
      ) : (
        <form onSubmit={ handleSubmit }>
          { columns.error ? (
            <NoticeBanner tone="danger" className="mb-4">
              { columns.error }
            </NoticeBanner>
          ) : null }

          <div className="divide-y divide-border-subtle border-y border-border-subtle">
            { IMPORT_COLUMN_FIELDS.map((field) => {
              const fieldLabels = labels.fields[field];
              const fieldError = columns.fieldErrors[field];
              const isDefault = columns.draft[field].trim() === DEFAULT_IMPORT_COLUMNS[field];
              const inputId = `import-column-${field}`;

              return (
                <div key={ field } className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,280px)] gap-x-6 gap-y-1.5 py-3">
                  <label htmlFor={ inputId } className="min-w-0">
                    <span className="block text-[length:var(--font-size-base)] font-medium text-text-strong">{ fieldLabels.label }</span>
                    { fieldLabels.hint ? <span className="block text-[12.5px] text-text-subtle mt-0.5">{ fieldLabels.hint }</span> : null }
                  </label>
                  <div className="min-w-0">
                    <Input
                      id={ inputId }
                      mono
                      size="sm"
                      maxLength={ 100 }
                      invalid={ !!fieldError }
                      value={ columns.draft[field] }
                      placeholder={ DEFAULT_IMPORT_COLUMNS[field] }
                      onChange={ (event) => columns.setColumn(field, event.target.value) }
                    />
                    <p className={ cn("text-[12px] mt-1", fieldError ? "text-red-700" : "text-text-subtle") }>
                      { fieldError ?? (isDefault ? " " : labels.defaultValueLabel.replace("{value}", DEFAULT_IMPORT_COLUMNS[field])) }
                    </p>
                  </div>
                </div>
              );
            }) }
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
            <Button type="button" variant="ghost" size="sm" icon="rotate-ccw" disabled={ columns.isSaving } onClick={ () => setIsResetPending(true) }>
              { labels.resetLabel }
            </Button>
            <div className="flex flex-wrap items-center gap-2">
              { columns.justSaved && !columns.isDirty ? (
                <span className="inline-flex items-center gap-1 text-[13px] text-green-700">{ labels.savedMessage }</span>
              ) : null }
              { columns.isDirty ? (
                <Button type="button" variant="secondary" size="sm" disabled={ columns.isSaving } onClick={ columns.discard }>
                  { labels.discardLabel }
                </Button>
              ) : null }
              <Button type="submit" size="sm" icon="save" disabled={ !columns.isDirty || hasErrors || columns.isSaving }>
                { columns.isSaving ? labels.savingLabel : labels.saveLabel }
              </Button>
            </div>
          </div>
        </form>
      ) }

      <ConfirmDialog
        open={ isResetPending }
        title={ labels.resetConfirmTitle }
        description={ labels.resetConfirmMessage }
        confirmLabel={ labels.resetConfirmLabel }
        cancelLabel={ labels.cancelLabel }
        onConfirm={ confirmReset }
        onCancel={ () => setIsResetPending(false) }
      />
    </Card>
  );
}
