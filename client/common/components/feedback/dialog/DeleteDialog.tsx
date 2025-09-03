'use client';

import React, { useState } from 'react';

import BasicDialog from '@client-common/components/feedback/dialog/BasicDialog';
import ErrorAlert from '@client-common/components/feedback/alert/ErrorAlert';

interface DeleteDialogProps {
    open: boolean;
    title: string;
    onClose: () => void;
    itemID: string | null;
    itemName: string;
    onDelete: (id: string) => Promise<void>;
};

export default function DeleteDialog({
    open,
    title,
    onClose,
    itemID,
    itemName,
    onDelete
}: DeleteDialogProps) {
    const [error, setError] = useState<string | null>(null);

    const handleConfirm = async () => {
        setError(null);

        if (!itemID) {
            setError('無効なIDです');
            return;
        }

        try {
            await onDelete(itemID);
            onClose();
        } catch (e: unknown) {
            if (e instanceof Error) {
                setError(e.message);
            } else {
                setError('不明なエラーが発生しました');
            }
        }
    }

    return (
        <BasicDialog
            open={open}
            title={title}
            onClose={onClose}
            onConfirm={handleConfirm}
            confirmText='Delete'
            closeText='Cancel'
        >
            {() => (
                <>
                    {error && <ErrorAlert message={error} />}
                    <div>{itemName}を削除しますか？</div>
                </>
            )}
        </BasicDialog>
    );
}
