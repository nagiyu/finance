import React from 'react';

import { TextField } from '@mui/material';

type BasicNumberFieldProps = {
    label?: string;
    value?: number;
    readonly?: boolean;
    disabled?: boolean;
    onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
};

export default function BasicNumberField({
    label = '',
    value = 0,
    readonly = false,
    disabled = false,
    onChange = () => { },
}: BasicNumberFieldProps) {
    return (
        <TextField
            label={label}
            value={value}
            type='number'
            disabled={disabled}
            slotProps={{
                input: {
                    readOnly: readonly,
                }
            }}
            onChange={onChange}
        />
    );
}
