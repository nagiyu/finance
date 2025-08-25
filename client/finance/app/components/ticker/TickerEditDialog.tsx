'use client';

import React from 'react';

import BasicSelect from '@client-common/components/inputs/Selects/BasicSelect';
import BasicTextField from '@client-common/components/inputs/TextFields/BasicTextField';

import ErrorUtil from '@common/utils/ErrorUtil';
import ExchangeUtil from '@/utils/ExchangeUtil';
import { ExchangeDataType } from "@/interfaces/data/ExchangeDataType";
import { TickerDataType } from '@/interfaces/data/TickerDataType';

import TickerAPIUtil from '@/app/tickers/TickerAPIUtil';
import BaseEditDialog from '../common/BaseEditDialog';

interface TargetTicker extends Record<string, unknown> {
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

    const getInitialData = () => ({
        name: ticker?.name || '',
        key: ticker?.key || '',
        exchange: ticker?.exchange || ''
    });

    const validateForm = async (data: TargetTicker) => {
        if (data.name.trim() === '') {
            return 'Name is required';
        }

        if (data.key.trim() === '') {
            return 'Key is required';
        }

        if (data.exchange.trim() === '') {
            return 'Exchange is required';
        }

        return null;
    };

    const handleSubmit = async (data: TargetTicker, isNewRecord: boolean) => {
        if (isNewRecord) {
            const returnTicker = await TickerAPIUtil.create({
                name: data.name,
                key: data.key,
                exchange: data.exchange
            });

            createTicker(returnTicker);
        } else {
            if (!ticker) {
                ErrorUtil.throwError('Ticker not found');
            }

            const returnTicker = await TickerAPIUtil.update(ticker.id, {
                name: data.name,
                key: data.key,
                exchange: data.exchange,
                create: ticker.create || Date.now(),
            });

            updateTicker(returnTicker);
        }
    };

    return (
        <BaseEditDialog<TargetTicker>
            open={open}
            onClose={onClose}
            isNew={isNew}
            data={ticker ? getInitialData() : null}
            title="Ticker"
            initialData={getInitialData}
            validateForm={validateForm}
            onSubmit={handleSubmit}
        >
            {(formData, onChange) => (
                <>
                    <BasicTextField
                        label='Name'
                        value={formData.name as string || ''}
                        onChange={(e) => onChange({ name: e.target.value })}
                    />
                    <BasicTextField
                        label='Key'
                        value={formData.key as string || ''}
                        onChange={(e) => onChange({ key: e.target.value })}
                    />
                    <BasicSelect
                        label='Exchange'
                        options={ExchangeUtil.dataToSelectOptions(exchanges)}
                        value={formData.exchange as string || ''}
                        defaultValue={formData.exchange as string || ''}
                        onChange={(value) => onChange({ exchange: value })}
                    />
                </>
            )}
        </BaseEditDialog>
    )
}
