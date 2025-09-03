import React from 'react';

import BasicTextField from '@client-common/components/inputs/TextFields/BasicTextField';
import BasicSelect from '@client-common/components/inputs/Selects/BasicSelect';

import { TickerDataType } from '@/interfaces/data/TickerDataType';
import { ExchangeDataType } from '@/interfaces/data/ExchangeDataType';
import ExchangeUtil from '@/utils/ExchangeUtil';

interface TickerEditDialogContentProps {
    item: TickerDataType;
    onItemChange: (item: TickerDataType) => void;
    exchanges: ExchangeDataType[];
}

export default function TickerEditDialogContent({
    item,
    onItemChange,
    exchanges,
}: TickerEditDialogContentProps) {
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
            <BasicSelect
                label='Exchange'
                options={ExchangeUtil.dataToSelectOptions(exchanges)}
                value={item.exchange}
                onChange={(value) => onItemChange({ ...item, exchange: value })}
            />
        </>
    );
}
