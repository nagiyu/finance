import React from 'react';

import { Select, MenuItem, FormControl, InputLabel, SelectChangeEvent } from '@mui/material';

import { SelectOptionType } from '@client-common/interfaces/SelectOptionType';

interface BasicSelectProps {
    label?: string;
    options: SelectOptionType[];
    value: string;
    defaultValue?: string;
    disabled?: boolean;
    onChange: (value: string) => void;
}

export default function BasicSelect({
    label,
    options,
    value,
    defaultValue,
    disabled = false,
    onChange,
}: BasicSelectProps) {
    const labelId = label ? `${label.replace(/\s+/g, '-').toLowerCase()}-label` : undefined;

    const handleChange = (event: SelectChangeEvent) => {
        onChange(event.target.value as string);
    };

    return (
        <FormControl fullWidth>
            {label && <InputLabel id={labelId}>{label}</InputLabel>}
            <Select
                labelId={label ? labelId : undefined}
                value={value}
                defaultValue={defaultValue}
                label={label}
                disabled={disabled}
                onChange={handleChange}
            >
                {options.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                        {option.label}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
}
