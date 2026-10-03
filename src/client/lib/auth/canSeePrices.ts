import { UserStatus } from "@/types/server-enums";
import type { AuthUser } from "@/types/auth";

/** Whether a signed-in session (or lack of one) is allowed to see real prices and place
 * orders. Guests never can; a signed-in business account only can once Approved - Pending and
 * Rejected accounts can now log in (see AuthController.Login's policy) but stay restricted,
 * same as a guest, until an admin approves them. */
export function canSeePrices(user: AuthUser | null): boolean {
  return user?.status === UserStatus.Approved;
}
