"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { tokenStorage } from "@/lib/auth/tokenStorageInstance";
import { resolveErrorMessage } from "@/lib/http/resolveErrorMessage";
import { brandService } from "@/services/brandServiceInstance";
import type { Brand } from "@/types/brand";

const DEFAULT_GENERIC_ERROR = "Failed to save the brand. Please try again.";

export interface UseBrandFormOptions {
  /** The brand being edited, or `null` when creating a new one. */
  brand: Brand | null;
  genericErrorMessage?: string;
}

export interface BrandFormState {
  name: string;
  error: string | null;
  isSubmitting: boolean;
  setName(value: string): void;
  handleSubmit(event: FormEvent<HTMLFormElement>): void;
}

/** Owns the brand create/edit form's field state, submission, and error handling. */
export function useBrandForm({ brand, genericErrorMessage = DEFAULT_GENERIC_ERROR }: UseBrandFormOptions): BrandFormState {
  const router = useRouter();
  const [name, setName] = useState(brand?.name ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    setError(null);

    const token = tokenStorage.getToken();

    if (!token) {
      return;
    }

    setIsSubmitting(true);

    const request = brand
      ? brandService.update(brand.id, { name }, token)
      : brandService.create({ name }, token);

    request
      .then(() => {
        router.push("/admin/brands");
      })
      .catch((caught: unknown) => {
        setError(resolveErrorMessage(caught, genericErrorMessage));
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return { name, error, isSubmitting, setName, handleSubmit };
}
