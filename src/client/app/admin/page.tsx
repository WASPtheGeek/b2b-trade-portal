"use client";

import { AdminUnbuiltView } from "@/components/features/admin/AdminUnbuiltView";

export interface AdminDashboardPageProps {
  label: string;
}

export default function AdminDashboardPage({ label }: AdminDashboardPageProps) {
  return <AdminUnbuiltView label={ label } />;
}
