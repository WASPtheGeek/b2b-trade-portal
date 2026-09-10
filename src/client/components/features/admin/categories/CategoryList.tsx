"use client";

import { useState } from "react";
import { CategoryForm, type CategoryFormLabels } from "@/components/features/admin/categories/CategoryForm";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { IconButton } from "@/components/ui/IconButton";
import { Modal } from "@/components/ui/Modal";
import { NoticeBanner } from "@/components/ui/NoticeBanner";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useAdminCategoryList } from "@/hooks/useAdminCategoryList";
import type { Category } from "@/types/category";

export interface CategoryListLabels {
  heading: string;
  addCategoryLabel: string;
  columnName: string;
  columnSlug: string;
  columnParent: string;
  columnDescription: string;
  columnVisibility: string;
  columnActions: string;
  stickyActionsLabel: string;
  visibleLabel: string;
  hiddenLabel: string;
  editLabel: string;
  deleteLabel: string;
  deleteConfirmTitle: string;
  deleteConfirmMessage: string;
  cancelLabel: string;
  emptyTitle: string;
  emptyDescription: string;
  genericErrorMessage: string;
  moveRowLabel: string;
  reorderHint: string;
}

const DEFAULT_LABELS: CategoryListLabels = {
  heading: "Categories",
  addCategoryLabel: "Add category",
  columnName: "Name",
  columnSlug: "Slug",
  columnParent: "Parent category",
  columnDescription: "Description",
  columnVisibility: "Visibility",
  columnActions: "",
  stickyActionsLabel: "Keep actions column visible",
  visibleLabel: "In menu",
  hiddenLabel: "Hidden",
  editLabel: "Edit",
  deleteLabel: "Delete",
  deleteConfirmTitle: "Delete category?",
  deleteConfirmMessage:
    "Delete this category? Its subcategories will be deleted too, and any products in it will lose this category.",
  cancelLabel: "Cancel",
  emptyTitle: "No categories yet",
  emptyDescription: "Categories you add will show up here.",
  genericErrorMessage: "Failed to load categories. Please try again.",
  moveRowLabel: "Move row",
  reorderHint: "Drag to reorder (Alt + arrows)",
};

export interface CategoryListProps {
  labels?: Partial<CategoryListLabels>;
  formLabels?: Partial<CategoryFormLabels>;
}

interface CategoryRow extends Category {
  depth: number;
}

/**
 * Flattens the category tree into depth-first display order, each row tagged
 * with its nesting depth for indentation.
 *
 * @param categories The flat list of categories, as returned by the API.
 * @returns The categories in tree order, each with a `depth`.
 */
function flattenTree(categories: Category[]): CategoryRow[] {
  const byParent = new Map<number | null, Category[]>();

  for (const category of categories) {
    const siblings = byParent.get(category.parentId) ?? [];

    siblings.push(category);
    byParent.set(category.parentId, siblings);
  }

  const rows: CategoryRow[] = [];

  const walk = (parentId: number | null, depth: number): void => {
    for (const category of byParent.get(parentId) ?? []) {
      rows.push({ ...category, depth });
      walk(category.id, depth + 1);
    }
  };

  walk(null, 0);

  return rows;
}

/**
 * Computes the new `sortOrder` values for a category's siblings after it was dragged
 * from one row index to another in the flattened tree.
 *
 * A sibling's whole subtree is a contiguous block of rows right after its own row, so
 * counting how many *sibling* rows land before the drop point (ignoring rows that belong
 * to other parents entirely) gives the dragged category's new position among its siblings,
 * even when the drop point lands inside a sibling's expanded subtree.
 *
 * @param rows The flattened tree, in current display order.
 * @param from The dragged row's index in `rows`.
 * @param to The drop target index, already adjusted for the removal shift (`DataTable`'s convention).
 * @returns Only the `{ id, sortOrder }` pairs that actually changed.
 */
function computeSiblingReorder(rows: CategoryRow[], from: number, to: number): { id: number; sortOrder: number }[] {
  const draggedRow = rows[from];

  if (!draggedRow) {
    return [];
  }

  const rowsWithoutDragged = rows.filter((_, i) => i !== from);
  const clampedTo = Math.max(0, Math.min(to, rowsWithoutDragged.length));
  const siblingsBeforeCount = rowsWithoutDragged
    .slice(0, clampedTo)
    .filter((r) => r.parentId === draggedRow.parentId).length;

  const siblings = rows
    .filter((r) => r.parentId === draggedRow.parentId && r.id !== draggedRow.id)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  siblings.splice(siblingsBeforeCount, 0, draggedRow);

  return siblings
    .map((category, index) => ({ id: category.id, sortOrder: index }))
    .filter((update, index) => siblings[index]!.sortOrder !== update.sortOrder);
}

type CategoryFormTarget = "new" | Category;

/** Admin category list: hierarchical view, delete, and create/edit through a modal form. */
export function CategoryList({ labels: labelsProp, formLabels }: CategoryListProps) {
  const labels = { ...DEFAULT_LABELS, ...labelsProp };
  const { categories, isLoading, error, deleteCategory, reorderCategories, refresh } = useAdminCategoryList({
    genericErrorMessage: labels.genericErrorMessage,
  });

  const rows = flattenTree(categories);
  const categoryNameById = new Map(categories.map((category) => [category.id, category.name]));
  const [pendingDelete, setPendingDelete] = useState<Category | null>(null);
  const [formTarget, setFormTarget] = useState<CategoryFormTarget | null>(null);
  const [stickyActions, setStickyActions] = useState(true);

  const confirmDelete = (): void => {
    if (pendingDelete) {
      void deleteCategory(pendingDelete.id);
      setPendingDelete(null);
    }
  };

  const handleReorder = (from: number, to: number): void => {
    const updates = computeSiblingReorder(rows, from, to);

    if (updates.length > 0) {
      void reorderCategories(updates);
    }
  };

  const handleSaved = (): void => {
    setFormTarget(null);
    refresh();
  };

  const columns: DataTableColumn<CategoryRow>[] = [
    {
      key: "name",
      label: labels.columnName,
      render: (category) => (
        <span className="text-text-strong" style={ { paddingLeft: category.depth * 18 } }>
          { category.name }
        </span>
      ),
    },
    { key: "slug", label: labels.columnSlug, mono: true },
    {
      key: "parentId",
      label: labels.columnParent,
      render: (category) => (category.parentId != null ? (categoryNameById.get(category.parentId) ?? "—") : "—"),
    },
    {
      key: "description",
      label: labels.columnDescription,
      render: (category) => (
        <span className="block max-w-[280px] truncate" title={ category.description ?? undefined }>
          { category.description ?? "—" }
        </span>
      ),
    },
    {
      key: "showInMenu",
      label: labels.columnVisibility,
      render: (category) => (
        <StatusBadge
          tone={ category.showInMenu ? "done" : "neutral" }
          label={ category.showInMenu ? labels.visibleLabel : labels.hiddenLabel }
        />
      ),
    },
    {
      key: "actions",
      label: labels.columnActions,
      align: "right",
      // With table-layout:auto, an explicit (tiny) width hint on an otherwise-auto column
      // makes the browser shrink it to its content's min-content width instead of stretching
      // to fill the table's leftover space - the actual rendered width still can't go below
      // what the row-action icons need, since their own content sets the real floor.
      width: 1,
      sticky: stickyActions ? "right" : undefined,
      render: (category) => (
        <div className="flex items-center justify-end gap-1.5">
          <IconButton icon="pencil" label={ labels.editLabel } onClick={ () => setFormTarget(category) } />
          <IconButton icon="trash-2" label={ labels.deleteLabel } variant="danger" onClick={ () => setPendingDelete(category) } />
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="flex items-center justify-between gap-3 mb-4">
        <h1 className="text-h1 font-semibold text-text-strong">{ labels.heading }</h1>
        <div className="flex items-center gap-4">
          <Checkbox label={ labels.stickyActionsLabel } checked={ stickyActions } onChange={ (event) => setStickyActions(event.target.checked) } />
          <Button pill icon="plus" onClick={ () => setFormTarget("new") }>
            { labels.addCategoryLabel }
          </Button>
        </div>
      </div>

      { error ? (
        <NoticeBanner tone="danger" className="mb-4">
          { error }
        </NoticeBanner>
      ) : null }

      <Card padding={ 0 }>
        <DataTable
          columns={ columns }
          rows={ rows }
          loading={ isLoading }
          reorderable
          onReorder={ handleReorder }
          moveRowLabel={ (position) => `${labels.moveRowLabel} ${position}` }
          reorderHint={ labels.reorderHint }
          emptyState={ <EmptyState icon="list-tree" title={ labels.emptyTitle }>{ labels.emptyDescription }</EmptyState> }
        />
      </Card>

      <ConfirmDialog
        open={ pendingDelete != null }
        title={ labels.deleteConfirmTitle }
        description={ labels.deleteConfirmMessage }
        confirmLabel={ labels.deleteLabel }
        cancelLabel={ labels.cancelLabel }
        onConfirm={ confirmDelete }
        onCancel={ () => setPendingDelete(null) }
      />

      { formTarget ? (
        <Modal
          title={ formTarget === "new" ? (formLabels?.createHeading ?? "Add category") : (formLabels?.editHeading ?? "Edit category") }
          closeLabel={ formLabels?.cancelLabel ?? "Cancel" }
          onClose={ () => setFormTarget(null) }
          width={ 640 }
        >
          <CategoryForm
            mode={ formTarget === "new" ? "create" : "edit" }
            category={ formTarget === "new" ? null : formTarget }
            categories={ categories }
            labels={ formLabels }
            onSuccess={ handleSaved }
            onCancel={ () => setFormTarget(null) }
          />
        </Modal>
      ) : null }
    </>
  );
}
