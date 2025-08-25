/* eslint-disable react-hooks/exhaustive-deps */

'use client';

import React, { useEffect, useState } from 'react';

import ErrorUtil from '@common/utils/ErrorUtil';
import { TimeType } from '@common/interfaces/TimeType';
import TimeUtil from '@common/utils/TimeUtil';

import BasicDialog from '@client-common/components/feedback/dialog/BasicDialog';
import BasicNumberField from '@client-common/components/inputs/TextFields/BasicNumberField';
import BasicTextField from '@client-common/components/inputs/TextFields/BasicTextField';
import BasicStack from '@client-common/components/Layout/Stacks/BasicStack';
import DirectionStack from '@client-common/components/Layout/Stacks/DirectionStack';
import ErrorAlert from '@client-common/components/feedback/alert/ErrorAlert';

import { CreateExchangeRequestType, UpdateExchangeRequestType } from "@/interfaces/requests/ExchangeRequestType";
import { ExchangeDataType } from '@/interfaces/data/ExchangeDataType';
import AdminEditDialog, { FieldConfig } from '../common/AdminEditDialog';

type EditDialogProps = {
    open: boolean;
    onClose: () => void;
    isNew: boolean;
    exchange: ExchangeDataType | null;
    setExchange: React.Dispatch<React.SetStateAction<ExchangeDataType | null>>;
    createExchange: (request: CreateExchangeRequestType) => Promise<void>;
    updateExchange: (id: string, request: UpdateExchangeRequestType) => Promise<void>;
};

export default function EditDialog({
    open,
    onClose,
    isNew,
    exchange,
    setExchange,
    createExchange,
    updateExchange
}: EditDialogProps) {

    const fieldConfigs: FieldConfig[] = [
        {
            name: 'name',
            label: 'Name',
            type: 'text',
            required: true
        },
        {
            name: 'key',
            label: 'Key',
            type: 'text',
            required: true
        },
        {
            name: 'start',
            label: 'Start Time',
            type: 'time-range'
        },
        {
            name: 'end',
            label: 'End Time',
            type: 'time-range'
        }
    ];

    const handleConfirm = async (formData: Record<string, any>) => {
        // Update the exchange state for parent component
        const updatedExchange: ExchangeDataType = {
            id: exchange?.id || '',
            name: formData.name,
            key: formData.key,
            start: formData.start,
            end: formData.end,
            create: exchange?.create || Date.now(),
            update: Date.now(),
        };
        
        setExchange(updatedExchange);

        if (isNew) {
            await createExchange({
                name: updatedExchange.name,
                key: updatedExchange.key,
                start: updatedExchange.start,
                end: updatedExchange.end
            });
        } else {
            await updateExchange(updatedExchange.id, {
                name: updatedExchange.name,
                key: updatedExchange.key,
                start: updatedExchange.start,
                end: updatedExchange.end,
                create: updatedExchange.create
            });
        }
    };

    return (
        <AdminEditDialog
            open={open}
            onClose={onClose}
            isNew={isNew}
            title="Exchange"
            data={exchange}
            fields={fieldConfigs}
            onConfirm={handleConfirm}
        />
    );
}
