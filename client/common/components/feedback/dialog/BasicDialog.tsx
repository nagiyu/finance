'use client';

import React from 'react';

import Button from '@mui/material/Button';
import Dialog, { DialogProps } from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

import LoadingContent from '@client-common/components/content/LoadingContent';

export interface BasicDialogProps {
  open: boolean;
  title?: string;
  children: (
    loading: boolean,
    runWithLoading: <T>(func: () => Promise<T>) => Promise<T>
  ) => React.ReactNode;
  onClose: () => void;
  onConfirm?: () => Promise<void>;
  confirmText?: string;
  closeText?: string;

  /**
   * If true, the close button will be disabled.
   */
  disableClose?: boolean;

  /**
   * If true, clicking outside the dialog will not close it.
   */
  disableBackdropClick?: boolean;
};

export default function BasicDialog({
  open,
  title,
  children,
  onClose,
  onConfirm,
  confirmText = 'OK',
  closeText = 'Cancel',
  disableClose = false,
  disableBackdropClick = false,
}: BasicDialogProps) {
  const handleClose: DialogProps['onClose'] = (_, reason) => {
    if (!disableBackdropClick) {
      onClose();
    }

    if (reason === "backdropClick") {
      return;
    }

    onClose();
  }

  return (
    <LoadingContent>
      {(loading, runWithLoading) => (
        <Dialog open={open} onClose={handleClose} aria-labelledby="basic-dialog-title">
          <DialogTitle id="basic-dialog-title">{title}</DialogTitle>
          <DialogContent dividers>{children(loading, runWithLoading)}</DialogContent>
          <DialogActions>
            {!disableClose && (
              <Button onClick={onClose} color="primary" disabled={loading}>
                {closeText}
              </Button>
            )}
            {onConfirm && (
              <Button onClick={() => runWithLoading(onConfirm)} color="primary" autoFocus disabled={loading}>
                {confirmText}
              </Button>
            )}
          </DialogActions>
        </Dialog>
      )}
    </LoadingContent>
  );
}
