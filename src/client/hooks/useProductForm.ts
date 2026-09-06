"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { tokenStorage } from "@/lib/auth/tokenStorageInstance";
import { resolveErrorMessage } from "@/lib/http/resolveErrorMessage";
import { productService } from "@/services/productServiceInstance";
import type { ProductAdminDetail, ProductUpsertPayload } from "@/types/product-admin";

const DEFAULT_GENERIC_ERROR = "Failed to save the product. Please try again.";

export interface ProductFormFields {
  sku: string;
  name: string;
  description: string;
  basePrice: string;
  vatRateId: string;
  brandId: string;
  ean: string;
  soldByPiece: boolean;
  piecesPerBox: string;
  piecesPerPackage: string;
  isActive: boolean;
  primaryCategoryId: string;
  additionalCategoryIds: string[];
}

const EMPTY_FIELDS: ProductFormFields = {
  sku: "",
  name: "",
  description: "",
  basePrice: "",
  vatRateId: "",
  brandId: "",
  ean: "",
  soldByPiece: true,
  piecesPerBox: "",
  piecesPerPackage: "",
  isActive: true,
  primaryCategoryId: "",
  additionalCategoryIds: [],
};

export interface UseProductFormOptions {
  /** The product being edited, or `null` when creating a new one. */
  product: ProductAdminDetail | null;
  genericErrorMessage?: string;
}

export interface ProductFormState {
  fields: ProductFormFields;
  error: string | null;
  isSubmitting: boolean;
  setField<K extends keyof ProductFormFields>(key: K, value: ProductFormFields[K]): void;
  toggleAdditionalCategory(id: string): void;
  handleSubmit(event: FormEvent<HTMLFormElement>): void;
}

/** Owns the product create/edit form's field state, submission, and error handling. */
export function useProductForm({
  product,
  genericErrorMessage = DEFAULT_GENERIC_ERROR,
}: UseProductFormOptions): ProductFormState {
  const router = useRouter();
  const [fields, setFields] = useState<ProductFormFields>(product ? toFields(product) : EMPTY_FIELDS);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setField = <K extends keyof ProductFormFields>(key: K, value: ProductFormFields[K]): void => {
    setFields((current) => ({ ...current, [key]: value }));
  };

  const toggleAdditionalCategory = (id: string): void => {
    setFields((current) => ({
      ...current,
      additionalCategoryIds: current.additionalCategoryIds.includes(id)
        ? current.additionalCategoryIds.filter((existing) => existing !== id)
        : [...current.additionalCategoryIds, id],
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
    const request = product
      ? productService.update(product.id, payload, token)
      : productService.create(payload, token);

    request
      .then(() => {
        router.push("/admin/products");
      })
      .catch((caught: unknown) => {
        setError(resolveErrorMessage(caught, genericErrorMessage));
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return { fields, error, isSubmitting, setField, toggleAdditionalCategory, handleSubmit };
}

/**
 * Maps a fetched product's detail shape to the form's flat, string-based field state.
 *
 * @param product The product being edited.
 * @returns The initial form field values.
 */
function toFields(product: ProductAdminDetail): ProductFormFields {
  const [primaryCategoryId, ...additionalCategoryIds] = product.categoryIds;

  return {
    sku: product.sku,
    name: product.name,
    description: product.description ?? "",
    basePrice: String(product.basePrice),
    vatRateId: String(product.vatRateId),
    brandId: product.brandId !== null ? String(product.brandId) : "",
    ean: product.ean ?? "",
    soldByPiece: product.soldByPiece,
    piecesPerBox: product.piecesPerBox !== null ? String(product.piecesPerBox) : "",
    piecesPerPackage: product.piecesPerPackage !== null ? String(product.piecesPerPackage) : "",
    isActive: product.isActive,
    primaryCategoryId: primaryCategoryId !== undefined ? String(primaryCategoryId) : "",
    additionalCategoryIds: additionalCategoryIds.map(String),
  };
}

/**
 * Maps the form's flat, string-based field state to the API's upsert payload.
 *
 * @param fields The current form field values.
 * @returns The payload to send to the create/update endpoint.
 */
function toPayload(fields: ProductFormFields): ProductUpsertPayload {
  return {
    sku: fields.sku,
    name: fields.name,
    description: fields.description || undefined,
    basePrice: Number(fields.basePrice),
    vatRateId: Number(fields.vatRateId),
    brandId: fields.brandId ? Number(fields.brandId) : undefined,
    ean: fields.ean || undefined,
    soldByPiece: fields.soldByPiece,
    piecesPerBox: fields.piecesPerBox ? Number(fields.piecesPerBox) : undefined,
    piecesPerPackage: fields.piecesPerPackage ? Number(fields.piecesPerPackage) : undefined,
    isActive: fields.isActive,
    categoryIds: [fields.primaryCategoryId, ...fields.additionalCategoryIds].filter(Boolean).map(Number),
  };
}
