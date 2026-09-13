import { USER_STATUS_LABELS } from "@/lib/status-labels";
import type { AuthUser } from "@/types/auth";

/**
 * Resolves the display name shown in the header for a signed-in user.
 *
 * @param user The signed-in user.
 * @returns The user's business name, falling back to their full name.
 */
export function getAccountDisplayName(user: AuthUser): string {
  if (user.businessName) {
    return user.businessName;
  }

  return `${user.firstName} ${user.lastName}`;
}

/**
 * Resolves the localized account-approval status label shown under the display name.
 *
 * @param user The signed-in user.
 * @returns The localized label for the user's current account status.
 */
export function getAccountStatusLabel(user: AuthUser): string {
  return USER_STATUS_LABELS[user.status];
}
