import React from 'react';
import { Button } from '@mui/material';

import BasicNumberField from './BasicNumberField';
import DirectionStack from '@client-common/components/Layout/Stacks/DirectionStack';
import CurrencyUtil from '@common/utils/CurrencyUtil';

type CurrencyNumberFieldProps = {
    label?: string;
    value?: number;
    readonly?: boolean;
    disabled?: boolean;
    onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    onValueChange?: (value: number) => void;
};

export default function CurrencyNumberField({
    label = '',
    value = 0,
    readonly = false,
    disabled = false,
    onChange = () => { },
    onValueChange = () => { },
}: CurrencyNumberFieldProps) {
    const handleUsdToJpy = () => {
        const convertedValue = CurrencyUtil.convertUsdToJpy(value);
        onValueChange(convertedValue);
    };

    const handleJpyToUsd = () => {
        const convertedValue = CurrencyUtil.convertJpyToUsd(value);
        onValueChange(convertedValue);
    };

    return (
        <div>
            <BasicNumberField
                label={label}
                value={value}
                readonly={readonly}
                disabled={disabled}
                onChange={onChange}
            />
            {!readonly && !disabled && (
                <div style={{ marginTop: 8 }}>
                    <DirectionStack spacing={1} justifyContent="flex-start">
                        <Button
                            size="small"
                            variant="outlined"
                            onClick={handleUsdToJpy}
                            sx={{ fontSize: '0.75rem', minWidth: 'auto', px: 1 }}
                        >
                            USD→円
                        </Button>
                        <Button
                            size="small"
                            variant="outlined"
                            onClick={handleJpyToUsd}
                            sx={{ fontSize: '0.75rem', minWidth: 'auto', px: 1 }}
                        >
                            円→USD
                        </Button>
                    </DirectionStack>
                </div>
            )}
        </div>
    );
}