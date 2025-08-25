/* eslint-disable react-hooks/exhaustive-deps */

'use client';

import { useEffect, useState } from 'react';

import DateUtil from '@common/utils/DateUtil';
import ErrorUtil from '@common/utils/ErrorUtil';

import { MyTickerDataType } from '@finance/interfaces/data/MyTickerDataType';

import AuthFetchService from '@client-common/services/auth/AuthFetchService.client';
import BasicDatePicker from '@client-common/components/inputs/Dates/BasicDatePicker';
import BasicNumberField from '@client-common/components/inputs/TextFields/BasicNumberField';
import BasicSelect from '@client-common/components/inputs/Selects/BasicSelect';
import ControlledCheckbox from '@client-common/components/inputs/checkbox/ControlledCheckbox';

import ExchangeUtil from '@/utils/ExchangeUtil';
import MyTickerFetchService from '@/services/myticker/MyTickerFetchService.client';
import TickerUtil from '@/utils/TickerUtil';
import { ExchangeDataType } from '@/interfaces/data/ExchangeDataType';
import { TickerDataType } from '@/interfaces/data/TickerDataType';

import BaseEditDialog from '../common/BaseEditDialog';

interface TargetMyTicker extends Record<string, unknown> {
    exchangeId: string;
    tickerId: string;
    purchaseDate: number;
    purchasePrice: number;
    quantity: number;
    sellDate: number | null;
    sellPrice: number | null;
}

type MyTickerEditDialogProps = {
    open: boolean;
    onClose: () => void;
    isNew: boolean;
    myTicker: MyTickerDataType | null;
    exchanges: ExchangeDataType[];
    allTickers: TickerDataType[];
    createMyTicker: (data: MyTickerDataType) => void;
    updateMyTicker: (data: MyTickerDataType) => void;
}

export default function MyTickerEditDialog({
    open,
    onClose,
    isNew,
    myTicker,
    exchanges,
    allTickers,
    createMyTicker,
    updateMyTicker
}: MyTickerEditDialogProps) {
    const [tickers, setTickers] = useState<TickerDataType[]>([]);
    const [isSell, setIsSell] = useState<boolean>(false);
    const [formData, setFormData] = useState<Partial<TargetMyTicker>>({});

    // Update tickers when exchange changes or dialog opens
    useEffect(() => {
        if (open) {
            // sellDateまたはsellPriceが設定されていればisSellをtrueにする
            if (myTicker && (myTicker.sellDate || myTicker.sellPrice)) {
                setIsSell(true);
            } else {
                setIsSell(false);
            }
        }
    }, [open, myTicker]);

    // Update tickers when exchangeId changes
    useEffect(() => {
        if (formData.exchangeId) {
            const filteredTickers = allTickers.filter(t => t.exchange === formData.exchangeId);
            setTickers(filteredTickers);

            if (filteredTickers.length > 0 && !formData.tickerId) {
                setFormData(prev => ({ ...prev, tickerId: filteredTickers[0].id }));
            }
        }
    }, [formData.exchangeId, allTickers]);

    const getInitialData = () => ({
        exchangeId: myTicker?.exchangeId || exchanges[0]?.id || '',
        tickerId: myTicker?.tickerId || '',
        purchaseDate: myTicker?.purchaseDate || DateUtil.getTodayStartTimestamp(),
        purchasePrice: myTicker?.purchasePrice || 0,
        quantity: myTicker?.quantity || 0,
        sellDate: myTicker?.sellDate || null,
        sellPrice: myTicker?.sellPrice || null
    });

    const validateForm = async (data: TargetMyTicker) => {
        if (!data.exchangeId) {
            return 'Exchange is required';
        }

        if (!data.tickerId) {
            return 'Ticker is required';
        }

        if (data.purchasePrice < 0) {
            return 'Purchase price must be non-negative';
        }

        if (data.quantity <= 0) {
            return 'Quantity must be greater than zero';
        }

        return null;
    };

    const handleSubmit = async (data: TargetMyTicker, isNewRecord: boolean) => {
        // isSellがオフの場合は売却情報をクリア
        const fixedData = !isSell
            ? { ...data, sellDate: null, sellPrice: null }
            : data;

        const fetchService = new MyTickerFetchService();
        const authFetchService = new AuthFetchService();
        const user = await authFetchService.getUserByGoogle();
        const userId = user.id;
        const now = Date.now();

        if (isNewRecord) {
            const fetchRequest: MyTickerDataType = {
                ...fixedData,
                id: '',
                userId,
                create: now,
                update: now
            };

            const returnMyTicker = await fetchService.create(fetchRequest);
            createMyTicker(returnMyTicker);
        } else {
            if (!myTicker) {
                ErrorUtil.throwError('MyTicker not found');
            }

            const fetchRequest: MyTickerDataType = {
                ...fixedData,
                id: myTicker.id,
                userId,
                create: myTicker.create,
                update: now
            };

            const returnMyTicker = await fetchService.update(fetchRequest);
            updateMyTicker(returnMyTicker);
        }
    };

    const handleFormChange = (updates: Partial<TargetMyTicker>) => {
        setFormData(prev => ({ ...prev, ...updates }));
    };

    return (
        <BaseEditDialog<TargetMyTicker>
            open={open}
            onClose={onClose}
            isNew={isNew}
            data={myTicker ? getInitialData() : null}
            title="My Ticker"
            initialData={getInitialData}
            validateForm={validateForm}
            onSubmit={handleSubmit}
        >
            {(data, onChange) => {
                // Update local formData when BaseEditDialog data changes
                if (data !== formData) {
                    setFormData(data);
                }

                return (
                    <>
                        <BasicSelect
                            label='Exchange'
                            options={ExchangeUtil.dataToSelectOptions(exchanges)}
                            value={data.exchangeId as string || ''}
                            defaultValue={data.exchangeId as string || ''}
                            onChange={(value) => {
                                onChange({ exchangeId: value });
                                handleFormChange({ exchangeId: value });
                            }}
                        />
                        <BasicSelect
                            label='Ticker'
                            options={TickerUtil.dataToSelectOptions(tickers)}
                            value={data.tickerId as string || ''}
                            defaultValue={data.tickerId as string || ''}
                            onChange={(value) => onChange({ tickerId: value })}
                        />
                        <BasicDatePicker
                            label='Purchase Date'
                            value={new Date(data.purchaseDate as number || DateUtil.getTodayStartTimestamp())}
                            onChange={(date) => onChange({ purchaseDate: date ? DateUtil.toStartOfDay(date) : DateUtil.getTodayStartTimestamp() })}
                        />
                        <BasicNumberField
                            label='Purchase Price'
                            value={data.purchasePrice as number || 0}
                            onChange={(e) => onChange({ purchasePrice: Number(e.target.value) })}
                        />
                        <BasicNumberField
                            label='Quantity'
                            value={data.quantity as number || 0}
                            onChange={(e) => onChange({ quantity: Number(e.target.value) })}
                        />
                        <ControlledCheckbox
                            label='Sell'
                            checked={isSell}
                            onChange={(e) => {
                                setIsSell(e.target.checked);
                                if (!e.target.checked) {
                                    onChange({ sellDate: null, sellPrice: null });
                                }
                            }}
                        />
                        {isSell && (
                            <>
                                <BasicDatePicker
                                    label='Sell Date'
                                    value={data.sellDate ? new Date(data.sellDate as number) : null}
                                    onChange={(date) => onChange({ sellDate: date ? DateUtil.toStartOfDay(date) : null })}
                                />
                                <BasicNumberField
                                    label='Sell Price'
                                    value={data.sellPrice as number || 0}
                                    onChange={(e) => onChange({ sellPrice: Number(e.target.value) })}
                                />
                            </>
                        )}
                    </>
                );
            }}
        </BaseEditDialog>
    );
}
