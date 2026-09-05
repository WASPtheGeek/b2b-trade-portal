"use client";

import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";

export interface AdminUnbuiltViewProps {
  label: string;
  /** Composes the heading from the nav item's label - a render prop rather than a plain
   * string since word order isn't the same across languages. */
  renderTitle?: (label: string) => string;
  description?: string;
  usersActionLabel?: string;
  importActionLabel?: string;
}

/* Placeholder for every admin nav item the design brief didn't describe (dashboard, orders,
   products, brands, settings) - src/design/ui_kits/admin/README.md is explicit that these
   are empty by design, not an oversight, so this view says so rather than inventing a page. */
export function AdminUnbuiltView({
  label,
  renderTitle = (l) => `"${l}" view isn't built`,
  description = "This UI kit contains the two admin views described in the brief. The rest are deliberately left empty, not invented.",
  usersActionLabel = "User approvals",
  importActionLabel = "ERP import",
}: AdminUnbuiltViewProps) {
  const router = useRouter();
  return (
    <div className="py-[18px] px-[22px]">
      <Card padding={ 0 }>
        <EmptyState
          icon="construction"
          title={ renderTitle(label) }
          actions={
            <>
              <Button size="sm" onClick={ () => router.push("/admin/users") }>
                { usersActionLabel }
              </Button>
              <Button size="sm" variant="secondary" onClick={ () => router.push("/admin/import") }>
                { importActionLabel }
              </Button>
            </>
          }
        >
          { description }
        </EmptyState>
      </Card>
    </div>
  );
}
