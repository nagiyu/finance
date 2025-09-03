import React from 'react';
import BasicTextField from '@client-common/components/inputs/TextFields/BasicTextField';
import BasicNumberField from '@client-common/components/inputs/TextFields/BasicNumberField';
import DirectionStack from '@client-common/components/Layout/Stacks/DirectionStack';
import { ExchangeDataType } from '@/interfaces/data/ExchangeDataType';

interface ExchangeEditDialogContentProps {
    item: ExchangeDataType;
    onItemChange: (item: ExchangeDataType) => void;
}

export default function ExchangeEditDialogContent({
    item,
    onItemChange,
}: ExchangeEditDialogContentProps) {
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
                <BasicNumberField
                    label='Start Hour'
                    value={item.start.hour}
                    onChange={(e) => onItemChange({ ...item, start: { ...item.start, hour: Number(e.target.value) } })}
                />
                <BasicNumberField
                    label='Start Minute'
                    value={item.start.minute}
                    onChange={(e) => onItemChange({ ...item, start: { ...item.start, minute: Number(e.target.value) } })}
                />
            </DirectionStack>
            <DirectionStack>
                <BasicNumberField
                    label='End Hour'
                    value={item.end.hour}
                    onChange={(e) => onItemChange({ ...item, end: { ...item.end, hour: Number(e.target.value) } })}
                />
                <BasicNumberField
                    label='End Minute'
                    value={item.end.minute}
                    onChange={(e) => onItemChange({ ...item, end: { ...item.end, minute: Number(e.target.value) } })}
                />
            </DirectionStack>
        </>
    );
}
