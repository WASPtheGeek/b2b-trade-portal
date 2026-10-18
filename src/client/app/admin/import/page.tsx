"use client";

import { dictionary } from "@/app/_i18n";
import { ImportDashboard } from "@/components/features/admin/import/ImportDashboard";

export default function AdminImportPage() {
  return <ImportDashboard labels={ dictionary.adminImportDashboard } />;
}
