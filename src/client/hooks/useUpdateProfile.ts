"use client";

import { useCallback, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { tokenStorage } from "@/lib/auth/tokenStorageInstance";
import { resolveErrorMessage } from "@/lib/http/resolveErrorMessage";
import { authService } from "@/services/authServiceInstance";
import type { AuthUser, UpdateProfilePayload } from "@/types/auth";

const DEFAULT_GENERIC_ERROR = "Failed to save your profile. Please try again.";

export interface UseUpdateProfileOptions {
  genericErrorMessage?: string;
}

export interface UpdateProfileState {
  isSubmitting: boolean;
  error: string | null;
  /** Saves the profile and, on success, updates the shared session user in place. */
  save(payload: UpdateProfilePayload): Promise<AuthUser | null>;
}

/** Owns the account page's profile-edit submission, updating the shared `useAuth` session
 * user afterward so the header and every other consumer reflect the change immediately. */
export function useUpdateProfile({
  genericErrorMessage = DEFAULT_GENERIC_ERROR,
}: UseUpdateProfileOptions = {}): UpdateProfileState {
  const { setUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = useCallback(async (payload: UpdateProfilePayload): Promise<AuthUser | null> => {
    const token = tokenStorage.getToken();

    if (!token) {
      return null;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const updated = await authService.updateProfile(payload, token);
      setUser(updated);

      return updated;
    }
    catch (caught) {
      setError(resolveErrorMessage(caught, genericErrorMessage));

      return null;
    }
    finally {
      setIsSubmitting(false);
    }
  }, [genericErrorMessage, setUser]);

  return { isSubmitting, error, save };
}
