import { Button } from "@/components/ui/Button";
import { NoticeBanner } from "@/components/ui/NoticeBanner";
import { UserStatus } from "@/types/server-enums";

export interface AccountStatusNoticeLabels {
  pendingTitle: string;
  pendingBody: string;
  rejectedTitle: string;
  rejectedReasonLabel: string;
  accountLinkLabel: string;
}

export interface AccountStatusNoticeProps {
  status: string;
  rejectionReason?: string | null;
  labels: AccountStatusNoticeLabels;
  onViewAccount?: () => void;
  compact?: boolean;
  className?: string;
}

/** Explains why a signed-in-but-not-yet-Approved account can't see prices or place orders -
 * shown wherever that restriction bites (product/category pages, cart) as well as on the
 * account page itself. Suspended accounts never reach the client (blocked at login), so this
 * only ever needs to distinguish Pending from Rejected. */
export function AccountStatusNotice({ status, rejectionReason, labels, onViewAccount, compact, className }: AccountStatusNoticeProps) {
  const action = onViewAccount ? (
    <Button size="sm" variant="secondary" onClick={ onViewAccount }>
      { labels.accountLinkLabel }
    </Button>
  ) : undefined;

  if (status === UserStatus.Rejected) {
    return (
      <NoticeBanner tone="danger" icon="circle-alert" compact={ compact } title={ labels.rejectedTitle } actions={ action } className={ className }>
        { rejectionReason ? `${labels.rejectedReasonLabel}: ${rejectionReason}` : labels.rejectedTitle }
      </NoticeBanner>
    );
  }

  return (
    <NoticeBanner tone="amber" icon="clock" compact={ compact } title={ labels.pendingTitle } actions={ action } className={ className }>
      { labels.pendingBody }
    </NoticeBanner>
  );
}
