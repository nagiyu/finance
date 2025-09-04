import React from 'react';
import BasicTextField from '@client-common/components/inputs/TextFields/BasicTextField';
import BasicSelect from '@client-common/components/inputs/Selects/BasicSelect';
import DirectionStack from '@client-common/components/Layout/Stacks/DirectionStack';
import { ExchangeDataType } from '@/interfaces/data/ExchangeDataType';
import { SelectOptionType } from '@client-common/interfaces/SelectOptionType';

interface ExchangeEditDialogContentProps {
    item: ExchangeDataType;
    onItemChange: (item: ExchangeDataType) => void;
}

// Helper function to generate hour options (0-23)
const generateHourOptions = (): SelectOptionType[] => {
    const options: SelectOptionType[] = [];
    for (let i = 0; i <= 23; i++) {
        options.push({
            value: i.toString(),
            label: i.toString().padStart(2, '0')
        });
    }
    return options;
};

// Helper function to generate minute options (0, 10, 20, 30, 40, 50)
const generateMinuteOptions = (): SelectOptionType[] => {
    const options: SelectOptionType[] = [];
    for (let i = 0; i <= 50; i += 10) {
        options.push({
            value: i.toString(),
            label: i.toString().padStart(2, '0')
        });
    }
    return options;
};

export default function ExchangeEditDialogContent({
    item,
    onItemChange,
}: ExchangeEditDialogContentProps) {
    const hourOptions = generateHourOptions();
    const minuteOptions = generateMinuteOptions();

    return (
        <>
            <BasicTextField
                label='Name'
                value={item.name}
                onChange={(e) => onItemChange({ ...item, name: e.target.value })}
            />
            <BasicTextField
                label='Key'
                value={item.key}
                onChange={(e) => onItemChange({ ...item, key: e.target.value })}
            />
            <DirectionStack>
                <BasicSelect
                    label='Start Hour'
                    options={hourOptions}
                    value={item.start.hour.toString()}
                    onChange={(value) => onItemChange({ ...item, start: { ...item.start, hour: Number(value) } })}
                />
                <BasicSelect
                    label='Start Minute'
                    options={minuteOptions}
                    value={item.start.minute.toString()}
                    onChange={(value) => onItemChange({ ...item, start: { ...item.start, minute: Number(value) } })}
                />
            </DirectionStack>
            <DirectionStack>
                <BasicSelect
                    label='End Hour'
                    options={hourOptions}
                    value={item.end.hour.toString()}
                    onChange={(value) => onItemChange({ ...item, end: { ...item.end, hour: Number(value) } })}
                />
                <BasicSelect
                    label='End Minute'
                    options={minuteOptions}
                    value={item.end.minute.toString()}
                    onChange={(value) => onItemChange({ ...item, end: { ...item.end, minute: Number(value) } })}
                />
            </DirectionStack>
        </>
    );
}
