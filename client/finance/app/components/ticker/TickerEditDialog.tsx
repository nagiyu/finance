/* eslint-disable react-hooks/exhaustive-deps */

'use client';

import React, { useEffect } from 'react';

import BasicDialog from '@client-common/components/feedback/dialog/BasicDialog';
import BasicSelect from '@client-common/components/inputs/Selects/BasicSelect';
import BasicTextField from '@client-common/components/inputs/TextFields/BasicTextField';
import BasicStack from '@client-common/components/Layout/Stacks/BasicStack';
import ErrorAlert from '@client-common/components/feedback/alert/ErrorAlert';

import ErrorUtil from '@common/utils/ErrorUtil';
import ExchangeUtil from '@/utils/ExchangeUtil';
import { ExchangeDataType } from "@/interfaces/data/ExchangeDataType";
import { TickerDataType } from '@/interfaces/data/TickerDataType';

import TickerAPIUtil from '@/app/tickers/TickerAPIUtil';
import AdminEditDialog, { FieldConfig } from '../common/AdminEditDialog';

interface TargetTicker {
    name: string,
    key: string,
    exchange: string
}

type TickerEditDialogProps = {
    open: boolean;
    onClose: () => void;
    isNew: boolean;
    ticker: TickerDataType | null;
    exchanges: ExchangeDataType[];
    createTicker: (ticker: TickerDataType) => void;
    updateTicker: (ticker: TickerDataType) => void;
}

export default function TickerEditDialog({
    open,
    onClose,
    isNew,
    ticker,
    exchanges,
    createTicker,
    updateTicker
}: TickerEditDialogProps) {

    const fieldConfigs: FieldConfig[] = [
        {
            name: 'name',
            label: 'Name',
            type: 'text',
            required: true,
            validation: (value: string) => {
                if (!value || value.trim() === '') return 'Name is required';
                return null;
            }
        },
        {
            name: 'key',
            label: 'Key',
            type: 'text',
            required: true,
            validation: (value: string) => {
                if (!value || value.trim() === '') return 'Key is required';
                return null;
            }
        },
        {
            name: 'exchange',
            label: 'Exchange',
            type: 'select',
            required: true,
            options: ExchangeUtil.dataToSelectOptions(exchanges),
            validation: (value: string) => {
                if (!value || value.trim() === '') return 'Exchange is required';
                return null;
            }
        }
    ];

    const handleConfirm = async (formData: Record<string, any>) => {
        if (isNew) {
            const returnTicker = await TickerAPIUtil.create({
                name: formData.name,
                key: formData.key,
                exchange: formData.exchange
            });

            createTicker(returnTicker);
        } else {
            if (!ticker) {
                throw new Error('Ticker not found');
            }

            const returnTicker = await TickerAPIUtil.update(ticker.id, {
                name: formData.name,
                key: formData.key,
                exchange: formData.exchange,
                create: ticker.create || Date.now(),
            });

            updateTicker(returnTicker);
        }
    };

    return (
        <AdminEditDialog
            open={open}
            onClose={onClose}
            isNew={isNew}
            title="Ticker"
            data={ticker}
            fields={fieldConfigs}
            onConfirm={handleConfirm}
        />
    );
}
