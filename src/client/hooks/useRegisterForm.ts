"use client";

import { useState, type FormEvent } from "react";
import { useAuth } from "@/hooks/useAuth";
import { resolveErrorMessage } from "@/lib/http/resolveErrorMessage";
import type { RegisterPayload, RegisterResult } from "@/types/auth";

const DEFAULT_GENERIC_ERROR = "Failed to create the account. Please try again.";

export interface RegisterFormFields {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  businessName: string;
  registrationNumber: string;
  vatNumber: string;
  phone: string;
}

const INITIAL_FIELDS: RegisterFormFields = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  businessName: "",
  registrationNumber: "",
  vatNumber: "",
  phone: "",
};

export interface RegisterFormState {
  fields: RegisterFormFields;
  error: string | null;
  isSubmitting: boolean;
  setField<K extends keyof RegisterFormFields>(key: K, value: RegisterFormFields[K]): void;
  handleSubmit(event: FormEvent<HTMLFormElement>): void;
}

export interface UseRegisterFormOptions {
  /** Invoked once the account is created, with the server's response. */
  onSuccess(result: RegisterResult): void;
  /** Shown when a request fails without an API-provided detail message. */
  genericErrorMessage?: string;
}

/** Owns the registration form's field state, submission, and error handling. */
export function useRegisterForm({
  onSuccess,
  genericErrorMessage = DEFAULT_GENERIC_ERROR,
}: UseRegisterFormOptions): RegisterFormState {
  const { register } = useAuth();

  const [fields, setFields] = useState<RegisterFormFields>(INITIAL_FIELDS);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setField = <K extends keyof RegisterFormFields>(key: K, value: RegisterFormFields[K]): void => {
    setFields((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const payload = toRegisterPayload(fields);

    register(payload)
      .then(onSuccess)
      .catch((caught: unknown) => {
        setError(resolveErrorMessage(caught, genericErrorMessage));
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return { fields, error, isSubmitting, setField, handleSubmit };
}

/**
 * Maps the form's flat field state to the API's register request body.
 *
 * @param fields The current form field values.
 * @returns The payload to send to `POST /api/auth/register`.
 */
function toRegisterPayload(fields: RegisterFormFields): RegisterPayload {
  return {
    firstName: fields.firstName,
    lastName: fields.lastName,
    email: fields.email,
    password: fields.password,
    businessName: fields.businessName,
    registrationNumber: fields.registrationNumber,
    vatNumber: fields.vatNumber,
    phone: fields.phone || undefined,
  };
}
