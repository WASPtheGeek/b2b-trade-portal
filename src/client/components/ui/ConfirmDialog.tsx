"use client";

import type { ReactNode } from "react";
import { Button } from "./Button";
import { Modal } from "./Modal";

export interface ConfirmDialogProps {
  open: boolean;
  title: ReactNode;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Modal confirmation prompt for destructive or otherwise consequential actions, replacing the browser's built-in `confirm()`. */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = true,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) {
    return null;
  }

  return (
    <Modal
      title={ title }
      onClose={ onCancel }
      closeLabel={ cancelLabel }
      footer={
        <>
          <Button variant="secondary" onClick={ onCancel }>
            { cancelLabel }
          </Button>
          <Button variant={ danger ? "danger" : "primary" } onClick={ onConfirm }>
            { confirmLabel }
          </Button>
        </>
      }
    >
      { description }
    </Modal>
  );
}
