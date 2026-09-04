// Latvian display text and visual tone for the src/server enums (see types/server-enums.ts).
// Kept separate from the enums themselves: the enum is the wire contract, this is presentation
// - callers that need a different label (another locale, a shorter table-cell variant) pass
// their own via a prop rather than this module growing per-context overrides.
import type { IconName } from "@/components/ui/Icon";
import { ImportRecordStatus, ImportStatus, OrderStatus, UserStatus } from "@/types/server-enums";

export type StatusTone = "neutral" | "progress" | "done" | "stopped";

export const USER_STATUS_LABELS: Record<UserStatus, string> = {
  [UserStatus.Pending]: "Gaida apstiprinājumu",
  [UserStatus.Approved]: "Apstiprināts",
  [UserStatus.Rejected]: "Noraidīts",
  [UserStatus.Suspended]: "Apturēts",
};

export const USER_STATUS_TONES: Record<UserStatus, StatusTone> = {
  [UserStatus.Pending]: "progress",
  [UserStatus.Approved]: "done",
  [UserStatus.Rejected]: "stopped",
  [UserStatus.Suspended]: "neutral",
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  [OrderStatus.Pending]: "Gaida apstiprinājumu",
  [OrderStatus.Confirmed]: "Apstiprināts pasūtījums",
  [OrderStatus.Processing]: "Apstrādē",
  [OrderStatus.Shipped]: "Nosūtīts",
  [OrderStatus.Delivered]: "Piegādāts",
  [OrderStatus.Cancelled]: "Atcelts",
  [OrderStatus.Refunded]: "Atmaksāts",
};

export const ORDER_STATUS_TONES: Record<OrderStatus, StatusTone> = {
  [OrderStatus.Pending]: "progress",
  [OrderStatus.Confirmed]: "done",
  [OrderStatus.Processing]: "progress",
  [OrderStatus.Shipped]: "progress",
  [OrderStatus.Delivered]: "done",
  [OrderStatus.Cancelled]: "stopped",
  [OrderStatus.Refunded]: "neutral",
};

// Overrides StatusBadge's default per-tone glyph for statuses where a more specific icon
// reads better at a glance (a shipped order is a truck, not a generic clock).
export const ORDER_STATUS_ICONS: Partial<Record<OrderStatus, IconName>> = {
  [OrderStatus.Shipped]: "truck",
  [OrderStatus.Delivered]: "package-check",
};

export const IMPORT_STATUS_ICONS: Partial<Record<ImportStatus, IconName>> = {
  [ImportStatus.Partial]: "circle-dot",
  [ImportStatus.Failed]: "circle-alert",
};

export const IMPORT_STATUS_LABELS: Record<ImportStatus, string> = {
  [ImportStatus.Pending]: "Gaida",
  [ImportStatus.Running]: "Apstrādē",
  [ImportStatus.Success]: "Izpildīts",
  [ImportStatus.Failed]: "Neizdevās",
  [ImportStatus.Partial]: "Daļēji izpildīts",
};

export const IMPORT_STATUS_TONES: Record<ImportStatus, StatusTone> = {
  [ImportStatus.Pending]: "neutral",
  [ImportStatus.Running]: "progress",
  [ImportStatus.Success]: "done",
  [ImportStatus.Failed]: "stopped",
  [ImportStatus.Partial]: "progress",
};

export const IMPORT_RECORD_STATUS_LABELS: Record<ImportRecordStatus, string> = {
  [ImportRecordStatus.Success]: "Veiksmīgi",
  [ImportRecordStatus.Failed]: "Kļūda",
  [ImportRecordStatus.Skipped]: "Izlaists",
};
