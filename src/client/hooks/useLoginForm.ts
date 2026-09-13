"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { isSafeReturnPath } from "@/lib/auth/returnTo";
import { resolveErrorMessage } from "@/lib/http/resolveErrorMessage";

const DEFAULT_GENERIC_ERROR = "Failed to sign in. Please try again.";

export interface LoginFormState {
  email: string;
  password: string;
  error: string | null;
  isSubmitting: boolean;
  setEmail(value: string): void;
  setPassword(value: string): void;
  handleSubmit(event: FormEvent<HTMLFormElement>): void;
}

export interface UseLoginFormOptions {
  /** Shown when a request fails without an API-provided detail message. */
  genericErrorMessage?: string;
}

/** Owns the login form's field state, submission, and error handling. */
export function useLoginForm({ genericErrorMessage = DEFAULT_GENERIC_ERROR }: UseLoginFormOptions = {}): LoginFormState {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const returnTo = searchParams.get("returnTo");

    login({ email, password })
      .then(() => {
        router.push(isSafeReturnPath(returnTo) ? returnTo : "/");
      })
      .catch((caught: unknown) => {
        setError(resolveErrorMessage(caught, genericErrorMessage));
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return { email, password, error, isSubmitting, setEmail, setPassword, handleSubmit };
}
