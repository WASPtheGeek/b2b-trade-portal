"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { tokenStorage } from "@/lib/auth/tokenStorageInstance";
import { resolveErrorMessage } from "@/lib/http/resolveErrorMessage";
import { categoryService } from "@/services/categoryServiceInstance";
import type { Category, CategoryUpsertPayload } from "@/types/category";

const DEFAULT_GENERIC_ERROR = "Failed to save the category. Please try again.";

export interface CategoryFormFields {
  parentId: string;
  name: string;
  slug: string;
  description: string;
  sortOrder: string;
  isCustom: boolean;
  showInMenu: boolean;
}

const EMPTY_FIELDS: CategoryFormFields = {
  parentId: "",
  name: "",
  slug: "",
  description: "",
  sortOrder: "0",
  isCustom: false,
  showInMenu: true,
};

export interface UseCategoryFormOptions {
  /** The category being edited, or `null` when creating a new one. */
  category: Category | null;
  genericErrorMessage?: string;
}

export interface CategoryFormState {
  fields: CategoryFormFields;
  error: string | null;
  isSubmitting: boolean;
  setField<K extends keyof CategoryFormFields>(key: K, value: CategoryFormFields[K]): void;
  /** Sets the name field, and also fills the slug from it as long as the slug hasn't been hand-edited. */
  setName(value: string): void;
  handleSubmit(event: FormEvent<HTMLFormElement>): void;
}

/** Owns the category create/edit form's field state, submission, and error handling. */
export function useCategoryForm({
  category,
  genericErrorMessage = DEFAULT_GENERIC_ERROR,
}: UseCategoryFormOptions): CategoryFormState {
  const router = useRouter();
  const [fields, setFields] = useState<CategoryFormFields>(category ? toFields(category) : EMPTY_FIELDS);
  const [slugTouched, setSlugTouched] = useState(category !== null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setField = <K extends keyof CategoryFormFields>(key: K, value: CategoryFormFields[K]): void => {
    setFields((current) => ({ ...current, [key]: value }));

    if (key === "slug") {
      setSlugTouched(true);
    }
  };

  const setName = (value: string): void => {
    setFields((current) => ({
      ...current,
      name: value,
      slug: slugTouched ? current.slug : slugify(value),
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    setError(null);

    const token = tokenStorage.getToken();

    if (!token) {
      return;
    }

    setIsSubmitting(true);

    const payload = toPayload(fields);
    const request = category
      ? categoryService.update(category.id, payload, token)
      : categoryService.create(payload, token);

    request
      .then(() => {
        router.push("/admin/categories");
      })
      .catch((caught: unknown) => {
        setError(resolveErrorMessage(caught, genericErrorMessage));
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return { fields, error, isSubmitting, setField, setName, handleSubmit };
}

/**
 * Turns a category name into a URL-friendly slug (lowercase, ASCII, hyphen-separated).
 *
 * @param name The category name to slugify.
 * @returns The generated slug.
 */
function slugify(name: string): string {
  return name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Maps a fetched category to the form's flat, string-based field state.
 *
 * @param category The category being edited.
 * @returns The initial form field values.
 */
function toFields(category: Category): CategoryFormFields {
  return {
    parentId: category.parentId !== null ? String(category.parentId) : "",
    name: category.name,
    slug: category.slug,
    description: category.description ?? "",
    sortOrder: String(category.sortOrder),
    isCustom: category.isCustom,
    showInMenu: category.showInMenu,
  };
}

/**
 * Maps the form's flat, string-based field state to the API's upsert payload.
 *
 * @param fields The current form field values.
 * @returns The payload to send to the create/update endpoint.
 */
function toPayload(fields: CategoryFormFields): CategoryUpsertPayload {
  return {
    parentId: fields.parentId ? Number(fields.parentId) : undefined,
    name: fields.name,
    slug: fields.slug,
    description: fields.description || undefined,
    sortOrder: Number(fields.sortOrder) || 0,
    isCustom: fields.isCustom,
    showInMenu: fields.showInMenu,
  };
}
