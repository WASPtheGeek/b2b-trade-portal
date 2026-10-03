"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AccountStatusNotice, type AccountStatusNoticeLabels } from "@/components/features/shop/AccountStatusNotice";
import { OrderDetailModal, type OrderDetailModalLabels } from "@/components/features/shop/OrderDetailModal";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { FormField } from "@/components/ui/FormField";
import { IconButton } from "@/components/ui/IconButton";
import { Input } from "@/components/ui/Input";
import { NoticeBanner } from "@/components/ui/NoticeBanner";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useAuth } from "@/hooks/useAuth";
import { useMyOrders } from "@/hooks/useMyOrders";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useUpdateProfile } from "@/hooks/useUpdateProfile";
import { Money } from "@/lib/money";
import { ORDER_STATUS_ICONS, ORDER_STATUS_LABELS, ORDER_STATUS_TONES, USER_STATUS_LABELS, USER_STATUS_TONES } from "@/lib/status-labels";
import { OrderStatus, UserStatus } from "@/types/server-enums";
import type { AuthUser } from "@/types/auth";
import type { OrderSummary } from "@/types/order";

const RECENT_ORDER_COUNT = 5;

export interface AccountOrderHistoryLabels {
  sectionTitle: string;
  columnOrderNumber: string;
  columnDate: string;
  columnStatus: string;
  columnTotal: string;
  viewLabel: string;
  emptyTitle: string;
  emptyBody: string;
  browseCta: string;
  viewAllCta: string;
  genericError: string;
  detail: OrderDetailModalLabels;
}

export interface AccountPageLabels {
  title: string;
  emailLabel: string;
  statusNotice: AccountStatusNoticeLabels;
  sectionTitle: string;
  businessNameLabel: string;
  registrationNumberLabel: string;
  vatNumberLabel: string;
  firstNameLabel: string;
  lastNameLabel: string;
  phoneLabel: string;
  saveLabel: string;
  savingLabel: string;
  saveSuccess: string;
  /** Shown on the submit button instead of `saveLabel` while the account is Rejected -
   * saving resubmits it for admin review (see `PUT /api/auth/me`), so the button should say so. */
  resubmitLabel: string;
  resubmittingLabel: string;
  resubmitSuccess: string;
  /** Shown above the button while Rejected, before the user submits - saving moves the
   * account back to Pending, so pricing/ordering stay unavailable until it's re-approved. */
  resubmitWarning: string;
  genericErrorMessage: string;
  orderHistory: AccountOrderHistoryLabels;
}

export interface AccountPageProps {
  labels: AccountPageLabels;
}

function toFields(user: AuthUser) {
  return {
    firstName: user.firstName,
    lastName: user.lastName,
    businessName: user.businessName ?? "",
    registrationNumber: user.registrationNumber ?? "",
    vatNumber: user.vatNumber ?? "",
    phone: user.phone ?? "",
  };
}

/** The signed-in business's own account: status (with rejection reason, if any), an editable
 * profile form, and a recent-order-history summary. Saving the profile while Rejected
 * resubmits the account for admin review (see `PUT /api/auth/me`'s resubmission behavior). */
export function AccountPage({ labels }: AccountPageProps) {
  const { isChecking } = useRequireAuth();
  const router = useRouter();
  const { user } = useAuth();
  const { isSubmitting, error, save } = useUpdateProfile({ genericErrorMessage: labels.genericErrorMessage });
  const { orders, isLoading: isLoadingOrders, error: ordersError } = useMyOrders({
    genericErrorMessage: labels.orderHistory.genericError,
  });
  const [fields, setFields] = useState(() => (user ? toFields(user) : null));
  const [saved, setSaved] = useState(false);
  const [resubmitted, setResubmitted] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  // Adjust the form fields during render when the signed-in user identity/data changes,
  // rather than in an effect - same pattern as ProductTile's wishlisted prop.
  const [prevUser, setPrevUser] = useState(user);

  if (user !== prevUser) {
    setPrevUser(user);
    setFields(user ? toFields(user) : null);
  }

  if (isChecking || !user || !fields) {
    return (
      <main className="relative z-[1] max-w-layout-max mx-auto px-gutter pt-4 pb-section-gap-lg">
        <div className="h-[320px] rounded-card bg-surface-card border border-border-warm animate-pulse" />
      </main>
    );
  }

  const isRejected = user.status === UserStatus.Rejected;

  const setField = <K extends keyof typeof fields>(key: K, value: (typeof fields)[K]): void => {
    setFields((current) => (current ? { ...current, [key]: value } : current));
    setSaved(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setSaved(false);

    const wasRejected = isRejected;
    const updated = await save(fields);

    if (updated) {
      setResubmitted(wasRejected);
      setSaved(true);
    }
  };

  const recentOrders = orders.slice(0, RECENT_ORDER_COUNT);

  const orderColumns: DataTableColumn<OrderSummary>[] = [
    {
      key: "orderNumber",
      label: labels.orderHistory.columnOrderNumber,
      mono: true,
      render: (order) => (
        <button
          type="button"
          onClick={ () => setSelectedOrderId(order.id) }
          className="border-none bg-transparent p-0 font-mono text-[length:var(--font-size-base)] text-orange-700 cursor-pointer hover:underline"
        >
          { order.orderNumber }
        </button>
      ),
    },
    {
      key: "placedAt",
      label: labels.orderHistory.columnDate,
      mono: true,
      render: (order) => new Date(order.placedAt).toLocaleDateString("lv-LV"),
    },
    {
      key: "status",
      label: labels.orderHistory.columnStatus,
      render: (order) => (
        <StatusBadge
          size="sm"
          tone={ ORDER_STATUS_TONES[order.status as OrderStatus] }
          label={ ORDER_STATUS_LABELS[order.status as OrderStatus] ?? order.status }
          icon={ ORDER_STATUS_ICONS[order.status as OrderStatus] }
        />
      ),
    },
    {
      key: "totalAmount",
      label: labels.orderHistory.columnTotal,
      align: "right",
      render: (order) => <span className="font-semibold text-text-strong [font-variant-numeric:tabular-nums]">{ Money.eur(order.totalAmount) }</span>,
    },
    {
      key: "actions",
      label: "",
      align: "right",
      sortable: false,
      width: 1,
      render: (order) => (
        <IconButton icon="eye" label={ labels.orderHistory.viewLabel } onClick={ () => setSelectedOrderId(order.id) } />
      ),
    },
  ];

  return (
    <main className="relative z-[1] max-w-layout-max mx-auto px-gutter pt-4 pb-section-gap-lg">
      <div className="max-w-[860px]">
        <div className="max-w-[640px]">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-h1 font-semibold text-text-strong">{ labels.title }</h1>
            <StatusBadge tone={ USER_STATUS_TONES[user.status] } label={ USER_STATUS_LABELS[user.status] } />
          </div>
          <p className="mt-1.5 text-[length:var(--font-size-base)] text-text-subtle">
            { labels.emailLabel } <span className="font-mono text-text-body">{ user.email }</span>
          </p>

          { user.status !== UserStatus.Approved ? (
            <AccountStatusNotice
              status={ user.status }
              rejectionReason={ user.rejectionReason }
              labels={ labels.statusNotice }
              className="mt-4"
            />
          ) : null }

          <Card title={ labels.sectionTitle } className="mt-5">
            <form onSubmit={ handleSubmit }>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <FormField label={ labels.businessNameLabel } htmlFor="account-business-name" required className="md:col-span-2">
                  <Input
                    id="account-business-name"
                    required
                    value={ fields.businessName }
                    onChange={ (event) => setField("businessName", event.target.value) }
                  />
                </FormField>
                <FormField label={ labels.registrationNumberLabel } htmlFor="account-registration-number" required className="md:col-span-2">
                  <Input
                    id="account-registration-number"
                    mono
                    required
                    value={ fields.registrationNumber }
                    onChange={ (event) => setField("registrationNumber", event.target.value) }
                  />
                </FormField>
                <FormField label={ labels.firstNameLabel } htmlFor="account-first-name" required>
                  <Input
                    id="account-first-name"
                    required
                    value={ fields.firstName }
                    onChange={ (event) => setField("firstName", event.target.value) }
                  />
                </FormField>
                <FormField label={ labels.lastNameLabel } htmlFor="account-last-name" required>
                  <Input
                    id="account-last-name"
                    required
                    value={ fields.lastName }
                    onChange={ (event) => setField("lastName", event.target.value) }
                  />
                </FormField>
                <FormField label={ labels.vatNumberLabel } htmlFor="account-vat-number">
                  <Input
                    id="account-vat-number"
                    mono
                    value={ fields.vatNumber }
                    onChange={ (event) => setField("vatNumber", event.target.value) }
                  />
                </FormField>
                <FormField label={ labels.phoneLabel } htmlFor="account-phone">
                  <Input
                    id="account-phone"
                    mono
                    value={ fields.phone }
                    onChange={ (event) => setField("phone", event.target.value) }
                  />
                </FormField>
              </div>

              { error ? (
                <NoticeBanner tone="danger" className="mt-4">
                  { error }
                </NoticeBanner>
              ) : null }
              { saved ? (
                <NoticeBanner tone="success" className="mt-4" onDismiss={ () => setSaved(false) }>
                  { resubmitted ? labels.resubmitSuccess : labels.saveSuccess }
                </NoticeBanner>
              ) : null }

              { isRejected && !saved ? (
                <NoticeBanner tone="amber" icon="clock" className="mt-4">
                  { labels.resubmitWarning }
                </NoticeBanner>
              ) : null }

              <Button type="submit" pill className="mt-4" disabled={ isSubmitting }>
                { isRejected
                  ? (isSubmitting ? labels.resubmittingLabel : labels.resubmitLabel)
                  : (isSubmitting ? labels.savingLabel : labels.saveLabel) }
              </Button>
            </form>
          </Card>
        </div>

        <Card
          title={ labels.orderHistory.sectionTitle }
          padding={ 0 }
          className="mt-5"
          actions={
            orders.length > 0 ? (
              <Button size="sm" variant="secondary" onClick={ () => router.push("/orders") }>
                { labels.orderHistory.viewAllCta }
              </Button>
            ) : undefined
          }
        >
          { ordersError ? (
            <EmptyState icon="circle-alert" tone="danger" title={ ordersError } compact />
          ) : isLoadingOrders ? (
            <div className="h-[180px] animate-pulse" />
          ) : recentOrders.length === 0 ? (
            <EmptyState
              icon="package"
              title={ labels.orderHistory.emptyTitle }
              compact
              actions={ <Button size="sm" onClick={ () => router.push("/") }>{ labels.orderHistory.browseCta }</Button> }
            >
              { labels.orderHistory.emptyBody }
            </EmptyState>
          ) : (
            <DataTable columns={ orderColumns } rows={ recentOrders } />
          ) }
        </Card>
      </div>

      { selectedOrderId != null ? (
        <OrderDetailModal
          orderId={ selectedOrderId }
          labels={ labels.orderHistory.detail }
          onClose={ () => setSelectedOrderId(null) }
        />
      ) : null }
    </main>
  );
}
