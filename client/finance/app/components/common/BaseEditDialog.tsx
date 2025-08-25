/* eslint-disable react-hooks/exhaustive-deps */

'use client';

import React, { ReactNode, useEffect, useState } from 'react';

import BasicDialog from '@client-common/components/feedback/dialog/BasicDialog';
import BasicStack from '@client-common/components/Layout/Stacks/BasicStack';
import ErrorAlert from '@client-common/components/feedback/alert/ErrorAlert';

import ErrorUtil from '@common/utils/ErrorUtil';

export interface BaseEditDialogProps<T> {
    open: boolean;
    onClose: () => void;
    isNew: boolean;
    data: T | null;
    title?: string;
    initialData: () => Partial<T>;
    validateForm?: (data: T) => Promise<string | null> | string | null;
    onSubmit: (data: T, isNew: boolean) => Promise<void>;
    onSuccess?: (data: T) => void;
    children: (data: Partial<T>, onChange: (updates: Partial<T>) => void) => ReactNode;
}

export default function BaseEditDialog<T extends Record<string, unknown>>({
    open,
    onClose,
    isNew,
    data,
    title,
    initialData,
    validateForm,
    onSubmit,
    onSuccess,
    children,
}: BaseEditDialogProps<T>) {
    const [formData, setFormData] = useState<Partial<T>>(initialData());
    const [error, setError] = useState<string | null>(null);

    // Reset form when dialog opens
    useEffect(() => {
        if (open) {
            const initial = data ? { ...data } : initialData();
            setFormData(initial);
            setError(null);
        }
    }, [open, data]);

    // Handle form data changes
    const handleChange = (updates: Partial<T>) => {
        setFormData(prev => ({
            ...prev,
            ...updates
        }));
    };

    // Handle form submission
    const handleConfirm = async () => {
        setError(null);
        
        try {
            // Run custom form validation if provided
            if (validateForm) {
                const formError = await validateForm(formData as T);
                if (formError) {
                    ErrorUtil.throwError(formError);
                }
            }

            // Submit the form
            await onSubmit(formData as T, isNew);

            // Call success callback if provided
            if (onSuccess) {
                onSuccess(formData as T);
            }

            onClose();
        } catch (e: unknown) {
            if (e instanceof Error) {
                setError(e.message);
            } else {
                setError("不明なエラーが発生しました");
            }
        }
    };

    // Get dialog title
    const getTitle = () => {
        if (title) {
            return isNew ? `Create ${title}` : `Edit ${title}`;
        }
        return isNew ? 'Create' : 'Edit';
    };

    return (
        <BasicDialog
            open={open}
            title={getTitle()}
            onClose={onClose}
            onConfirm={handleConfirm}
            confirmText={isNew ? 'Create' : 'Update'}
            closeText="Cancel"
        >
            {error && <ErrorAlert message={error} />}
            <BasicStack>
                {children(formData, handleChange)}
            </BasicStack>
        </BasicDialog>
    );
}