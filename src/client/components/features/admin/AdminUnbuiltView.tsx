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
  description?: string;
  usersActionLabel?: string;
  productsActionLabel?: string;
  renderTitle?: (label: string) => string;
}

// Shared Latvian copy for every AdminUnbuiltView stub page (dashboard/orders/products/
// brands/settings) - identical across all of them, so it's defined once here rather than
// duplicated per page.
export const ADMIN_UNBUILT_VIEW_LABELS = {
  description: "Šī sadaļa vēl nav izstrādāta. Lūdzu, kontaktējieties ar administratoru.",
  usersActionLabel: "Lietotāju apstiprināšana",
  productsActionLabel: "Produkti",
  renderTitle: (label: string) => `Skats "${label}" nav izstrādāts`,
};


/* Placeholder for every admin nav item the design brief didn't describe (dashboard, orders,
   products, brands, settings) - src/design/ui_kits/admin/README.md is explicit that these
   are empty by design, not an oversight, so this view says so rather than inventing a page. */
export function AdminUnbuiltView({
  label,
  description = ADMIN_UNBUILT_VIEW_LABELS.description,
  usersActionLabel = ADMIN_UNBUILT_VIEW_LABELS.usersActionLabel,
  productsActionLabel = ADMIN_UNBUILT_VIEW_LABELS.productsActionLabel,
  renderTitle = ADMIN_UNBUILT_VIEW_LABELS.renderTitle,
}: AdminUnbuiltViewProps) {
  const router = useRouter();

  return (
    <Card padding={ 0 }>
      <EmptyState
        icon="construction"
        title={ renderTitle(label) }
        actions={
          <>
            <Button size="sm" onClick={ () => router.push("/admin/users") }>
              { usersActionLabel }
            </Button>
            <Button size="sm" variant="secondary" onClick={ () => router.push("/admin/products") }>
              { productsActionLabel }
            </Button>
          </>
        }
      >
        { description }
      </EmptyState>
    </Card>
  );
}
