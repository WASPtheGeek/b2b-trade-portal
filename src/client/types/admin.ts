import type { IconName } from "@/components/ui/Icon";
import type { ImportStatus, UserStatus } from "@/types/server-enums";

export interface AdminNavItem {
  id: string;
  label: string;
  icon: IconName;
  href: string;
  badge?: number;
}

export interface AdminNavGroup {
  title?: string;
  items: AdminNavItem[];
}

export interface Company {
  id: string;
  company: string;
  reg: string;
  contact: string;
  email: string;
  date: string;
  status: UserStatus;
}

export interface ImportErrorRow {
  row: number;
  ean: string | null;
  msg: string;
}

export interface PreviousImportRow {
  id: number;
  file: string;
  when: string;
  status: ImportStatus;
}
