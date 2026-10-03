"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { DataTable, type DataTableColumn, type DataTableSort } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { FormField } from "@/components/ui/FormField";
import { IconButton } from "@/components/ui/IconButton";
import { Modal } from "@/components/ui/Modal";
import { NoticeBanner } from "@/components/ui/NoticeBanner";
import { Pagination } from "@/components/ui/Pagination";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Tabs, type TabItem } from "@/components/ui/Tabs";
import { TextArea } from "@/components/ui/TextArea";
import { useAdminUserList } from "@/hooks/useAdminUserList";
import { resolveErrorMessage } from "@/lib/http/resolveErrorMessage";
import { sortRows } from "@/lib/sortRows";
import { USER_STATUS_LABELS, USER_STATUS_TONES } from "@/lib/status-labels";
import { UserStatus } from "@/types/server-enums";
import type { AdminUser } from "@/types/user-admin";

const ALL_TAB = "all";
const TAB_STATUSES: UserStatus[] = [UserStatus.Pending, UserStatus.Approved, UserStatus.Rejected, UserStatus.Suspended];
const CANNED_REJECTION_REASONS = [
  "Nepareizs PVN maksātāja reģistrācijas numurs.",
  "Uzņēmums nav atrodams Uzņēmumu reģistrā.",
  "Nav apliecinātas pārstāvības tiesības.",
];

export interface UserListLabels {
  heading: string;
  tabAll: string;
  columnBusiness: string;
  columnContact: string;
  columnEmail: string;
  columnRegistrationNumber: string;
  columnVatNumber: string;
  columnPhone: string;
  columnDate: string;
  columnStatus: string;
  columnActions: string;
  stickyActionsLabel: string;
  approveLabel: string;
  rejectLabel: string;
  suspendLabel: string;
  reactivateLabel: string;
  emptyTitle: string;
  emptyDescription: string;
  genericErrorMessage: string;
  actionErrorMessage: string;
  rejectModalTitle: string;
  rejectModalReasonLabel: string;
  rejectModalReasonHint: string;
  rejectModalReasonPlaceholder: string;
  rejectModalCancel: string;
  rejectModalConfirm: string;
  cannedReasons: string[];
}

export interface UserListProps {
  labels?: Partial<UserListLabels>;
}

const DEFAULT_LABELS: UserListLabels = {
  heading: "Users & accounts",
  tabAll: "All",
  columnBusiness: "Business",
  columnContact: "Contact",
  columnEmail: "Email",
  columnRegistrationNumber: "Reg. no.",
  columnVatNumber: "VAT no.",
  columnPhone: "Phone",
  columnDate: "Submitted",
  columnStatus: "Status",
  columnActions: "",
  stickyActionsLabel: "Pin actions column",
  approveLabel: "Approve",
  rejectLabel: "Reject",
  suspendLabel: "Suspend",
  reactivateLabel: "Reactivate",
  emptyTitle: "No accounts in this status",
  emptyDescription: "Business account applications will show up here.",
  genericErrorMessage: "Failed to load users. Please try again.",
  actionErrorMessage: "Failed to update this account. Please try again.",
  rejectModalTitle: "Reject application",
  rejectModalReasonLabel: "Reason for rejection",
  rejectModalReasonHint: "This reason is emailed to the business and kept on the application's history.",
  rejectModalReasonPlaceholder: "e.g. invalid VAT registration number.",
  rejectModalCancel: "Cancel",
  rejectModalConfirm: "Reject application",
  cannedReasons: CANNED_REJECTION_REASONS,
};

/** Admin review of self-registered business accounts: status-tab filtering, server-side
 * paging, and the approve/reject/suspend/reactivate workflow (Admin/UsersController). */
export function UserList({ labels: labelsProp }: UserListProps) {
  const labels = { ...DEFAULT_LABELS, ...labelsProp };
  const { users, total, isLoading, error, status, setStatus, page, pageSize, setPage, approve, reject, suspend, reactivate } = useAdminUserList({
    genericErrorMessage: labels.genericErrorMessage,
  });
  const [sort, setSort] = useState<DataTableSort | undefined>(undefined);
  const [stickyActions, setStickyActions] = useState(true);
  const [rejectTarget, setRejectTarget] = useState<AdminUser | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const tabs: TabItem[] = [
    { value: ALL_TAB, label: labels.tabAll },
    ...TAB_STATUSES.map((s) => ({ value: s, label: USER_STATUS_LABELS[s] })),
  ];

  const runAction = async (id: number, action: () => Promise<void>): Promise<void> => {
    setActionError(null);
    setBusyId(id);

    try {
      await action();
    }
    catch (caught) {
      setActionError(resolveErrorMessage(caught, labels.actionErrorMessage));
    }
    finally {
      setBusyId(null);
    }
  };

  const handleConfirmReject = async (): Promise<void> => {
    if (!rejectTarget) {
      return;
    }

    const target = rejectTarget;

    await runAction(target.id, () => reject(target.id, rejectReason));
    setRejectTarget(null);
    setRejectReason("");
  };

  const columns: DataTableColumn<AdminUser>[] = [
    { key: "businessName", label: labels.columnBusiness, render: (u) => u.businessName ?? "—" },
    { key: "lastName", label: labels.columnContact, render: (u) => `${u.firstName} ${u.lastName}` },
    { key: "email", label: labels.columnEmail, render: (u) => <a href={ `mailto:${u.email}` }>{ u.email }</a> },
    { key: "registrationNumber", label: labels.columnRegistrationNumber, mono: true, render: (u) => u.registrationNumber ?? "—" },
    { key: "vatNumber", label: labels.columnVatNumber, mono: true, render: (u) => u.vatNumber ?? "—" },
    { key: "phone", label: labels.columnPhone, mono: true, render: (u) => u.phone ?? "—" },
    {
      key: "createdAt",
      label: labels.columnDate,
      mono: true,
      render: (u) => new Date(u.createdAt).toLocaleDateString("lv-LV"),
    },
    {
      key: "status",
      label: labels.columnStatus,
      render: (u) => (
        <StatusBadge tone={ USER_STATUS_TONES[u.status as UserStatus] } label={ USER_STATUS_LABELS[u.status as UserStatus] ?? u.status } />
      ),
    },
    {
      key: "actions",
      label: labels.columnActions,
      align: "right",
      sortable: false,
      width: 1,
      sticky: stickyActions ? "right" : undefined,
      render: (u) => {
        const disabled = busyId === u.id;

        return (
          <div className="flex items-center justify-end gap-1.5">
            { u.status === UserStatus.Pending ? (
              <>
                <IconButton
                  icon="check"
                  label={ labels.approveLabel }
                  variant="success"
                  disabled={ disabled }
                  onClick={ () => runAction(u.id, () => approve(u.id)) }
                />
                <IconButton
                  icon="x"
                  label={ labels.rejectLabel }
                  variant="danger"
                  disabled={ disabled }
                  onClick={ () => setRejectTarget(u) }
                />
              </>
            ) : null }
            { u.status === UserStatus.Approved ? (
              <IconButton
                icon="circle-slash"
                label={ labels.suspendLabel }
                variant="danger"
                disabled={ disabled }
                onClick={ () => runAction(u.id, () => suspend(u.id)) }
              />
            ) : null }
            { u.status === UserStatus.Rejected ? (
              <IconButton
                icon="check"
                label={ labels.approveLabel }
                variant="success"
                disabled={ disabled }
                onClick={ () => runAction(u.id, () => approve(u.id)) }
              />
            ) : null }
            { u.status === UserStatus.Suspended ? (
              <IconButton
                icon="undo-2"
                label={ labels.reactivateLabel }
                variant="success"
                disabled={ disabled }
                onClick={ () => runAction(u.id, () => reactivate(u.id)) }
              />
            ) : null }
          </div>
        );
      },
    },
  ];

  const sortedUsers = sortRows(users, sort);
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h1 className="text-h1 font-semibold text-text-strong truncate">{ labels.heading }</h1>
      </div>

      { error ? (
        <NoticeBanner tone="danger" className="mb-4">
          { error }
        </NoticeBanner>
      ) : null }
      { actionError ? (
        <NoticeBanner tone="danger" className="mb-4" onDismiss={ () => setActionError(null) }>
          { actionError }
        </NoticeBanner>
      ) : null }

      <Card padding={ 0 }>
        <div className="flex items-center gap-3 flex-wrap p-3 border-b border-border-subtle">
          <Tabs variant="pill" value={ status ?? ALL_TAB } onChange={ (v) => setStatus(v === ALL_TAB ? null : v) } tabs={ tabs } />
        </div>

        <div className="flex justify-end px-3 pt-2.5">
          <Checkbox label={ labels.stickyActionsLabel } checked={ stickyActions } onChange={ (event) => setStickyActions(event.target.checked) } />
        </div>

        <DataTable
          columns={ columns }
          rows={ sortedUsers }
          sort={ sort }
          onSortChange={ setSort }
          loading={ isLoading }
          emptyState={ <EmptyState icon="inbox" title={ labels.emptyTitle }>{ labels.emptyDescription }</EmptyState> }
        />

        { total > 0 ? (
          <div className="p-3 border-t border-border-subtle">
            <Pagination page={ page } pageCount={ pageCount } total={ total } pageSize={ pageSize } onPageChange={ setPage } />
          </div>
        ) : null }
      </Card>

      { rejectTarget ? (
        <Modal
          title={ labels.rejectModalTitle }
          description={ rejectTarget.businessName ?? undefined }
          onClose={ () => { setRejectTarget(null); setRejectReason(""); } }
          closeLabel={ labels.rejectModalCancel }
          footer={
            <>
              <Button variant="secondary" onClick={ () => { setRejectTarget(null); setRejectReason(""); } }>
                { labels.rejectModalCancel }
              </Button>
              <Button variant="danger" disabled={ !rejectReason.trim() || busyId === rejectTarget.id } onClick={ handleConfirmReject }>
                { labels.rejectModalConfirm }
              </Button>
            </>
          }
        >
          <FormField label={ labels.rejectModalReasonLabel } htmlFor="reject-reason" required hint={ labels.rejectModalReasonHint }>
            <TextArea
              id="reject-reason"
              rows={ 4 }
              maxLength={ 500 }
              showCount
              value={ rejectReason }
              onChange={ (event) => setRejectReason(event.target.value) }
              placeholder={ labels.rejectModalReasonPlaceholder }
            />
          </FormField>
          <div className="flex flex-wrap gap-1.5 mt-3">
            { labels.cannedReasons.map((reason) => (
              <button
                key={ reason }
                type="button"
                onClick={ () => setRejectReason(reason) }
                className="h-[26px] px-2.5 rounded-pill border border-border-default bg-white text-text-muted font-sans text-[11.5px] cursor-pointer hover:border-neutral-400"
              >
                { reason }
              </button>
            )) }
          </div>
        </Modal>
      ) : null }
    </>
  );
}
