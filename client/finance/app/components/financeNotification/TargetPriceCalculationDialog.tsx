'use client';

import React, { useState } from 'react';

import { CURRENCY, CurrencyType } from '@finance/consts/CurrencyConst';
import TargetPriceService from '@finance/services/TargetPriceService';

import BasicDialog from '@client-common/components/feedback/dialog/BasicDialog';
import BasicNumberField from '@client-common/components/inputs/TextFields/BasicNumberField';
import BasicRadioGroup, { BasicRadioGroupOption } from '@client-common/components/inputs/RadioGroups/BasicRadioGroup';
import BasicStack from '@client-common/components/Layout/Stacks/BasicStack';

interface TargetPriceCalculationDialogProps {
    open: boolean;
    onClose: () => void;
    onApply: (targetPrice: number) => void;
}

export default function TargetPriceCalculationDialog({
    open,
    onClose,
    onApply,
}: TargetPriceCalculationDialogProps) {
    const [currentQuantity, setCurrentQuantity] = useState<number>(0);
    const [totalCost, setTotalCost] = useState<number>(0);
    const [buyTolerance, setBuyTolerance] = useState<number>(0.9);
    const [sellTolerance, setSellTolerance] = useState<number>(1.1);
    const [currency, setCurrency] = useState<CurrencyType>(CURRENCY.JPY);
    const [targetCurrency, setTargetCurrency] = useState<CurrencyType>(CURRENCY.JPY);

    const currencyOptions: BasicRadioGroupOption[] = [
        { label: '円 (JPY)', value: CURRENCY.JPY },
        { label: 'ドル (USD)', value: CURRENCY.USD },
    ];

    const handleApply = async () => {
        try {
            const result = TargetPriceService.calculateTargetPriceFromHoldings(
                currentQuantity,
                totalCost,
                buyTolerance,
                sellTolerance,
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
                    <BasicNumberField
                        label="買い許容範囲"
                        value={buyTolerance}
                        onChange={(e) => setBuyTolerance(Number(e.target.value))}
                    />
                    <BasicNumberField
                        label="売り許容範囲"
                        value={sellTolerance}
                        onChange={(e) => setSellTolerance(Number(e.target.value))}
                    />
                    <BasicRadioGroup
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
                    />
                </BasicStack>
            )}
        </BasicDialog>
    );
}
