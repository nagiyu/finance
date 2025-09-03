import React from 'react';

import dayjs, { Dayjs } from 'dayjs';

import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

type BasicDatePickerProps = {
    label?: string;
    value: Date | null;
    onChange: (date: Date | null) => void;
};

export default function BasicDatePicker({
    label = '',
    value,
    onChange
}: BasicDatePickerProps) {
    // Date → dayjs 変換
    const dayjsValue = value ? dayjs(value) : null;

    // onChange: dayjs → Date 変換
    const handleChange = (newValue: Dayjs | null) => {
        onChange(newValue ? newValue.toDate() : null);
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
                label={label}
                format='YYYY/MM/DD'
                value={dayjsValue}
                onChange={handleChange}
            />
        </LocalizationProvider>
    );
}
