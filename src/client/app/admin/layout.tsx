import type { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-surface-page">
      <main className="flex-1 min-w-0">{ children }</main>
    </div>
  );
}
