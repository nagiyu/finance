import React from 'react';

import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

// プラグインを有効化
dayjs.extend(utc);
dayjs.extend(timezone);

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
    // 日本時間のタイムゾーンを設定
    const JST_TIMEZONE = 'Asia/Tokyo';
    
    // Date → dayjs 変換（JSTで解釈）
    const dayjsValue = value ? dayjs(value).tz(JST_TIMEZONE) : null;

    // onChange: dayjs → Date 変換（JSTで作成）
    const handleChange = (newValue: Dayjs | null) => {
        if (newValue) {
            // JST タイムゾーンで解釈してDateオブジェクトに変換
            const jstDate = newValue.tz(JST_TIMEZONE);
            onChange(jstDate.toDate());
        } else {
            onChange(null);
        }
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
                label={label}
                format='YYYY/MM/DD'
                value={dayjsValue}
                onChange={handleChange}
                timezone={JST_TIMEZONE}
            />
        </LocalizationProvider>
    );
}
