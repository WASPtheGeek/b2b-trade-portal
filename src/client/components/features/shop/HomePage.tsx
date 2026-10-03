"use client";

import { useRouter } from "next/navigation";
import { AccountStatusNotice, type AccountStatusNoticeLabels } from "@/components/features/shop/AccountStatusNotice";
import { useAuth } from "@/hooks/useAuth";
import { canSeePrices } from "@/lib/auth/canSeePrices";

export interface HomePageLabels {
  accountStatusNotice: AccountStatusNoticeLabels;
}

export interface HomePageProps {
  labels: HomePageLabels;
}

/** Storefront home page. Still otherwise a placeholder (see project-plan.md's Phase 8 -
 * homepage content hasn't been built yet), but a signed-in restricted account should see its
 * status/rejection reason here too, since this is the first page they land on after login. */
export function HomePage({ labels }: HomePageProps) {
  const router = useRouter();
  const { user } = useAuth();
  const restricted = !!user && !canSeePrices(user);

  return (
    <div className="relative flex-1 bg-white">
      { restricted ? (
        <div className="max-w-layout-max mx-auto px-gutter pt-4">
          <AccountStatusNotice
            status={ user.status }
            rejectionReason={ user.rejectionReason }
            labels={ labels.accountStatusNotice }
            onViewAccount={ () => router.push("/account") }
          />
        </div>
      ) : null }
    </div>
  );
}
