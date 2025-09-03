'use client';

import React, { useEffect, useState } from 'react';

import { AuthDataType } from '@common/interfaces/data/AuthDataType';

import AccountFetchService from '@client-common/services/auth/AccountFetchService.client';
import BasicDialog from '@client-common/components/feedback/dialog/BasicDialog';
import BasicStack from '@client-common/components/Layout/Stacks/BasicStack';
import BasicTextField from '@client-common/components/inputs/TextFields/BasicTextField';
import ErrorAlert from '@client-common/components/feedback/alert/ErrorAlert';

interface AccountSettingDialogProps {
    open: boolean;
    onClose: () => void;
}

const defaultAccount: AuthDataType = {
    id: '',
    name: '',
    googleUserId: '',
    create: Date.now(),
    update: Date.now(),
}

export default function AccountSettingDialog({
    open,
    onClose,
}: AccountSettingDialogProps) {
    const [account, setAccount] = useState<AuthDataType>(defaultAccount);
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState<'create' | 'edit' | 'ready'>('ready');

    const service = new AccountFetchService();

    const fixItem = (isNew: boolean): void => {
        const item = { ...account };

        const now = Date.now();

        if (isNew) {
            item.create = now;
        }

        item.update = now;

        setAccount(item);
    };

    const fetchItem = async (): Promise<void> => {
        const items = await service.get();

        if (items.length === 0) {
            setStatus('create');
            return;
        }

        setStatus('edit');
        setAccount(items[0]);
    }

    const onCreate = async (): Promise<void> => {
        fixItem(true);
        await service.create(account);
    };

    const onUpdate = async (): Promise<void> => {
        fixItem(false);
        await service.update(account);
    };

    // const onDelete = async (id: string): Promise<void> => {
    //     await service.delete(id);
    // };

    const validateItem = (): string | null => {
        if (account.name.trim() === '') {
            return 'Name is required';
        }

        return null;
    };

    const onConfirm = async (): Promise<void> => {
        if (status === 'ready') {
            return;
        }

        setError(null);

        const formError = validateItem();

        if (formError !== null) {
            setError(formError);
            return;
        }

        try {
            if (status === 'create') {
                await onCreate();
            } else {
                await onUpdate();
            }
        } catch (error) {
            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError('Unknown error occurred');
            }

            return;
        }

        onClose();

        window.location.reload();
    }

    useEffect(() => {
        (async () => {
            if (open) {
                await fetchItem();
            }
        })();
    }, [open]);

    return (
        <BasicDialog
            open={open}
            title='Account Settings'
            onClose={onClose}
            onConfirm={onConfirm}
            confirmText={status === 'edit' ? 'Update' : 'Create'}
            disableClose={status !== 'edit'}
            disableBackdropClick={status !== 'edit'}
        >
            {(loading) => (
                <>
                    {error && (
                        <ErrorAlert message={error} />
                    )}

                    <BasicStack>
                        <BasicTextField
                            label='User ID'
                            value={account.id}
                            readonly={true}
                            disabled={true}
                        />

                        <BasicTextField
                            label='Name'
                            value={account.name}
                            disabled={loading}
                            onChange={(e) => setAccount({ ...account, name: e.target.value })}
                        />
                    </BasicStack>
                </>
            )}
        </BasicDialog>
    )
}
