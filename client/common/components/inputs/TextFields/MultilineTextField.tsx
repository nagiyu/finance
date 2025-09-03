import React from 'react';

import { TextField } from '@mui/material';

type MultilineTextFieldProps = {
    label?: string;
    value?: string;
    rows?: number;
    readonly?: boolean;
    onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
};

export default function MultilineTextField({
    label = '',
    value = '',
    rows = 10,
    readonly = false,
    onChange = () => { },
}: MultilineTextFieldProps) {
    return (
        <TextField
            multiline
            label={label}
            value={value}
            rows={rows}
            slotProps={{
                input: {
                    readOnly: readonly,
                }
            }}
            onChange={onChange}
        />
    );
}
