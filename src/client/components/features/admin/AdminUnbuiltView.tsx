"use client";

import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";

// TODO: this is temporary and will be replaced with the actual admin views once implemented.

export interface AdminUnbuiltViewProps {
  label: string;
  /** Composes the heading from the nav item's label - a render prop rather than a plain
   * string since word order isn't the same across languages. */
  renderTitle?: (label: string) => string;
  description?: string;
  usersActionLabel?: string;
  importActionLabel?: string;
}

// Shared Latvian copy for every AdminUnbuiltView stub page (dashboard/orders/products/
// brands/settings) - identical across all of them, so it's defined once here rather than
// duplicated per page.
export const ADMIN_UNBUILT_VIEW_LABELS = {
  renderTitle: (label: string) => `Skats "${label}" nav izstrādāts`,
  description: "Šis UI komplekts satur divus administratora skatus, kas bija aprakstīti darba uzdevumā. Pārējie ir apzināti atstāti tukši, nevis izdomāti.",
  usersActionLabel: "Lietotāju apstiprināšana",
  importActionLabel: "ERP imports",
};


/* Placeholder for every admin nav item the design brief didn't describe (dashboard, orders,
   products, brands, settings) - src/design/ui_kits/admin/README.md is explicit that these
   are empty by design, not an oversight, so this view says so rather than inventing a page. */
export function AdminUnbuiltView({
  label,
  renderTitle = ADMIN_UNBUILT_VIEW_LABELS.renderTitle,
  description = ADMIN_UNBUILT_VIEW_LABELS.description,
  usersActionLabel = ADMIN_UNBUILT_VIEW_LABELS.usersActionLabel,
  importActionLabel = ADMIN_UNBUILT_VIEW_LABELS.importActionLabel,
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
