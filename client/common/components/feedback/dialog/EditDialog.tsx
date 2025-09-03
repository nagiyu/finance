/* eslint-disable react-hooks/exhaustive-deps */

'use client';

import { useEffect, useState } from 'react';

import ErrorUtil from '@common/utils/ErrorUtil';
import { DataTypeBase } from '@common/interfaces/data/DataTypeBase';

import BasicDialog from '@client-common/components/feedback/dialog/BasicDialog';
import BasicStack from '@client-common/components/Layout/Stacks/BasicStack';
import ErrorAlert from '@client-common/components/feedback/alert/ErrorAlert';

interface EditDialogProps<ItemType extends DataTypeBase, StateType extends Record<string, unknown> = Record<string, unknown>> {
    open: boolean;
    title: string;
    onClose: () => void;
    isNew: boolean;
    initItem: ItemType;
    initState?: StateType;
    defaultItem: ItemType;
    defaultState?: StateType;
    validateItem: (data: ItemType) => string | null;
    onCreate: (data: ItemType) => Promise<void>;
    onUpdate: (data: ItemType) => Promise<void>;
    children: (
        item: ItemType,
        state: StateType,
        onItemChange: (updates: ItemType) => void,
        onStateChange: (updates: StateType) => void,
        loading?: boolean,
        runWithLoading?: <T>(func: () => Promise<T>) => Promise<T>
    ) => React.ReactNode;
}

export default function EditDialog<ItemType extends DataTypeBase, StateType extends Record<string, unknown> = Record<string, unknown>>({
    open,
    title,
    onClose,
    isNew,
    initItem,
    initState = {} as StateType,
    defaultItem,
    defaultState = {} as StateType,
    validateItem,
    onCreate,
    onUpdate,
    children
}: EditDialogProps<ItemType, StateType>) {
    const [item, setItem] = useState<ItemType>(defaultItem);
    const [state, setState] = useState<StateType>(defaultState);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!open) return;

        const itemData = isNew ? { ...defaultItem } : { ...initItem };
        const stateData = isNew ? { ...defaultState } : { ...initState };

        setItem(itemData);
        setState(stateData);
        setError(null);
    }, [open]);

    const onItemChange = (updates: ItemType) => {
        setItem((prev) => ({ ...prev, ...updates }));
    };

    const onStateChange = (updates: Record<string, unknown>) => {
        setState((prev) => ({ ...prev, ...updates }));
    };

    const onConfirm = async () => {
        setError(null);

        try {
            const formError = validateItem(item);

            if (formError) {
                ErrorUtil.throwError(formError);
            }

            if (isNew) {
                await onCreate(item);
            } else {
                await onUpdate(item);
            }

            onClose();
        } catch (e: unknown) {
            if (e instanceof Error) {
                setError(e.message);
            } else {
                setError('不明なエラーが発生しました');
            }
        }
    };

    return (
        <BasicDialog
            open={open}
            title={title}
            onClose={onClose}
            onConfirm={onConfirm}
            confirmText={isNew ? 'Create' : 'Update'}
            closeText='Cancel'
        >
            {(loading, runWithLoading) => (
                <>
                    {error && <ErrorAlert message={error} />}
                    <BasicStack>
                        {children(item, state, onItemChange, onStateChange, loading, runWithLoading)}
                    </BasicStack>
                </>
            )}
        </BasicDialog>
    );
}
