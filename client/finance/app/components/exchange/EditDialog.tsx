/* eslint-disable react-hooks/exhaustive-deps */

'use client';

import React from 'react';

import ErrorUtil from '@common/utils/ErrorUtil';
import { TimeType } from '@common/interfaces/TimeType';
import TimeUtil from '@common/utils/TimeUtil';

import BasicNumberField from '@client-common/components/inputs/TextFields/BasicNumberField';
import BasicTextField from '@client-common/components/inputs/TextFields/BasicTextField';
import DirectionStack from '@client-common/components/Layout/Stacks/DirectionStack';

import { CreateExchangeRequestType, UpdateExchangeRequestType } from "@/interfaces/requests/ExchangeRequestType";
import { ExchangeDataType } from '@/interfaces/data/ExchangeDataType';

import BaseEditDialog from '../common/BaseEditDialog';

interface TargetExchange extends Record<string, unknown> {
    name: string;
    key: string;
    start: TimeType;
    end: TimeType;
}

type EditDialogProps = {
    open: boolean;
    onClose: () => void;
    isNew: boolean;
    exchange: ExchangeDataType | null;
    setExchange: React.Dispatch<React.SetStateAction<ExchangeDataType | null>>;
    createExchange: (request: CreateExchangeRequestType) => Promise<void>;
    updateExchange: (id: string, request: UpdateExchangeRequestType) => Promise<void>;
};

function getDefaultTime(): TimeType {
    return TimeUtil.parseTime('0:00');
}

export default function EditDialog({
    open,
    onClose,
    isNew,
    exchange,
    setExchange,
    createExchange,
    updateExchange
}: EditDialogProps) {

    const getInitialData = () => ({
        name: exchange?.name || '',
        key: exchange?.key || '',
        start: exchange?.start || getDefaultTime(),
        end: exchange?.end || getDefaultTime()
    });

    const validateForm = async (data: TargetExchange) => {
        if (!data.name.trim()) {
            return 'Name is required';
        }

        if (!data.key.trim()) {
            return 'Key is required';
        }

        return null;
    };

    const handleSubmit = async (data: TargetExchange, isNewRecord: boolean) => {
        if (isNewRecord) {
            await createExchange({
                name: data.name,
                key: data.key,
                start: data.start,
                end: data.end
            });
        } else {
            if (!exchange) {
                ErrorUtil.throwError("Exchange data is missing");
            }

            await updateExchange(exchange.id, {
                name: data.name,
                key: data.key,
                start: data.start,
                end: data.end,
                create: exchange.create
            });
        }
    };

    return (
        <BaseEditDialog<TargetExchange>
            open={open}
            onClose={onClose}
            isNew={isNew}
            data={exchange ? getInitialData() : null}
            title="Exchange"
            initialData={getInitialData}
            validateForm={validateForm}
            onSubmit={handleSubmit}
        >
            {(formData, onChange) => {
                // Update parent exchange state when form data changes (using useEffect would cause hooks issue)
                // Instead we'll update the state on each onChange
                const updateParentState = () => {
                    setExchange({
                        id: exchange?.id || '',
                        name: formData.name as string || '',
                        key: formData.key as string || '',
                        start: formData.start as TimeType || getDefaultTime(),
                        end: formData.end as TimeType || getDefaultTime(),
                        create: exchange?.create || Date.now(),
                        update: Date.now(),
                    });
                };

                return (
                    <>
                        <BasicTextField
                            label="Name"
                            value={formData.name as string || ''}
                            onChange={(e) => {
                                onChange({ name: e.target.value });
                                updateParentState();
                            }}
                        />
                        <BasicTextField
                            label="Key"
                            value={formData.key as string || ''}
                            onChange={(e) => {
                                onChange({ key: e.target.value });
                                updateParentState();
                            }}
                        />
                        <DirectionStack>
                            <BasicNumberField
                                label="Start Hour"
                                value={(formData.start as TimeType)?.hour || 0}
                                onChange={(e) => {
                                    onChange({ 
                                        start: { 
                                            hour: Number(e.target.value), 
                                            minute: (formData.start as TimeType)?.minute || 0 
                                        } 
                                    });
                                    updateParentState();
                                }}
                            />
                            <BasicNumberField
                                label="Start Minute"
                                value={(formData.start as TimeType)?.minute || 0}
                                onChange={(e) => {
                                    onChange({ 
                                        start: { 
                                            hour: (formData.start as TimeType)?.hour || 0, 
                                            minute: Number(e.target.value) 
                                        } 
                                    });
                                    updateParentState();
                                }}
                            />
                        </DirectionStack>
                        <DirectionStack>
                            <BasicNumberField
                                label="End Hour"
                                value={(formData.end as TimeType)?.hour || 0}
                                onChange={(e) => {
                                    onChange({ 
                                        end: { 
                                            hour: Number(e.target.value), 
                                            minute: (formData.end as TimeType)?.minute || 0 
                                        } 
                                    });
                                    updateParentState();
                                }}
                            />
                            <BasicNumberField
                                label="End Minute"
                                value={(formData.end as TimeType)?.minute || 0}
                                onChange={(e) => {
                                    onChange({ 
                                        end: { 
                                            hour: (formData.end as TimeType)?.hour || 0, 
                                            minute: Number(e.target.value) 
                                        } 
                                    });
                                    updateParentState();
                                }}
                            />
                        </DirectionStack>
                    </>
                );
            }}
        </BaseEditDialog>
    );
}
