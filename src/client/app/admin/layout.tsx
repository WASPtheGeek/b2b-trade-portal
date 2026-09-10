import type { ReactNode } from "react";
import { buildAdminNavGroups } from "@/app/admin/adminNav";
import { dictionary } from "@/app/_i18n";
import { AdminGuard } from "@/components/features/admin/AdminGuard";
import { AdminSidebarFooter } from "@/components/features/admin/AdminSidebarFooter";
import { AdminSidebar } from "@/components/layout/AdminSidebar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminGuard>
      <div className="flex flex-col md:flex-row min-h-screen bg-white">
        <AdminSidebar items={ buildAdminNavGroups(dictionary.adminNav) } labels={ dictionary.adminSidebar } footer={ <AdminSidebarFooter /> } />
        <main className="flex-1 min-w-0 elk-scroll-y py-[18px] px-[10px] md:px-[22px]">{ children }</main>
      </div>
    </AdminGuard>
  );
}
