'use client';

import React, { useState, useEffect } from 'react';

import { CURRENCY, CurrencyType } from '@finance/consts/CurrencyConst';
import TargetPriceService from '@finance/services/TargetPriceService';

import BasicDialog from '@client-common/components/feedback/dialog/BasicDialog';
import BasicNumberField from '@client-common/components/inputs/TextFields/BasicNumberField';
import BasicRadioGroup, { BasicRadioGroupOption } from '@client-common/components/inputs/RadioGroups/BasicRadioGroup';
import BasicStack from '@client-common/components/Layout/Stacks/BasicStack';

import MyTickerFetchService from '@/services/myticker/MyTickerFetchService.client';
import AuthFetchService from '@client-common/services/auth/AuthFetchService.client';

interface TargetPriceCalculationDialogProps {
    open: boolean;
    onClose: () => void;
    onApply: (targetPrice: number) => void;
    exchangeId: string;
    tickerId: string;
}

export default function TargetPriceCalculationDialog({
    open,
    onClose,
    onApply,
    exchangeId,
    tickerId,
}: TargetPriceCalculationDialogProps) {
    const [currentQuantity, setCurrentQuantity] = useState<number>(0);
    const [totalCost, setTotalCost] = useState<number>(0);
    const [tolerance, setTolerance] = useState<number>(0.05);
    const [currency] = useState<CurrencyType>(CURRENCY.JPY);
    const [targetCurrency] = useState<CurrencyType>(CURRENCY.JPY);

    const myTickerFetchService = new MyTickerFetchService();
    const authFetchService = new AuthFetchService();

    const toleranceOptions: BasicRadioGroupOption[] = [
        { label: '-15%', value: '-0.15' },
        { label: '-10%', value: '-0.1' },
        { label: '-5%', value: '-0.05' },
        { label: '+5%', value: '0.05' },
        { label: '+10%', value: '0.1' },
        { label: '+15%', value: '0.15' },
    ];

    // Load MyTicker data when dialog opens
    useEffect(() => {
        if (!open) {
            return;
        }

        (async () => {
            try {
                const user = await authFetchService.getUserByGoogle();
                const myTickers = await myTickerFetchService.get();
                
                // Find matching MyTicker for the current exchange and ticker
                const matchingTicker = myTickers.find(
                    mt => mt.userId === user.id && 
                          mt.exchangeId === exchangeId && 
                          mt.tickerId === tickerId
                );

                if (matchingTicker) {
                    setCurrentQuantity(matchingTicker.quantity);
                    setTotalCost(matchingTicker.quantity * matchingTicker.averagePrice);
                }
            } catch (error) {
                console.error('Failed to load MyTicker data:', error);
                // Continue with default values if loading fails
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, exchangeId, tickerId]);

    const handleApply = async () => {
        try {
            const result = TargetPriceService.calculateTargetPriceFromHoldings(
                currentQuantity,
                totalCost,
                Math.abs(tolerance), // Use absolute value of tolerance
                currency,
                targetCurrency !== currency ? targetCurrency : undefined
            );

            // Apply the sell target price to the condition
            onApply(result.sellTargetPrice);
            onClose();
        } catch (error) {
            console.error('TargetPrice calculation error:', error);
            alert('目標価格の算出に失敗しました。入力値を確認してください。');
        }
    };

    return (
        <BasicDialog
            open={open}
            title="目標価格算出ツール"
            onClose={onClose}
            onConfirm={handleApply}
            confirmText="適用"
            closeText="キャンセル"
        >
            {() => (
                <BasicStack>
                    <BasicNumberField
                        label="保有株数"
                        value={currentQuantity}
                        onChange={(e) => setCurrentQuantity(Number(e.target.value))}
                    />
                    <BasicNumberField
                        label="総コスト"
                        value={totalCost}
                        onChange={(e) => setTotalCost(Number(e.target.value))}
                    />
                    <BasicRadioGroup
                        label="許容範囲"
                        name="tolerance"
                        value={tolerance.toString()}
                        options={toleranceOptions}
                        row={true}
                        onChange={(e) => setTolerance(Number(e.target.value))}
                    />
                    {/* <BasicRadioGroup
                        label="入力通貨"
                        name="currency"
                        value={currency}
                        options={currencyOptions}
                        row={true}
                        onChange={(e) => setCurrency(e.target.value as CurrencyType)}
                    />
                    <BasicRadioGroup
                        label="目標通貨"
                        name="targetCurrency"
                        value={targetCurrency}
                        options={currencyOptions}
                        row={true}
                        onChange={(e) => setTargetCurrency(e.target.value as CurrencyType)}
                    /> */}
                </BasicStack>
            )}
        </BasicDialog>
    );
}
