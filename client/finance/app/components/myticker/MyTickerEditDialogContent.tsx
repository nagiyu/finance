import React from 'react';

import { MyTickerDataType } from '@finance/interfaces/data/MyTickerDataType';

import BasicSelect from '@client-common/components/inputs/Selects/BasicSelect';
import BasicNumberField from '@client-common/components/inputs/TextFields/BasicNumberField';
import CurrencyNumberField from '@client-common/components/inputs/TextFields/CurrencyNumberField';

import ExchangeUtil from '@/utils/ExchangeUtil';
import TickerUtil from '@/utils/TickerUtil';
import { TickerDataType } from '@/interfaces/data/TickerDataType';
import { ExchangeDataType } from '@/interfaces/data/ExchangeDataType';
import { StateType } from '@/app/myticker/page';

interface MyTickerEditDialogContentProps {
    item: MyTickerDataType;
    state: StateType;
    onItemChange: (item: MyTickerDataType) => void;
    onStateChange: (state: StateType) => void;
    exchanges: ExchangeDataType[];
    tickers: TickerDataType[];
}

export default function MyTickerEditDialogContent({
    item,
    state,
    onItemChange,
    onStateChange,
    exchanges,
    tickers,
}: MyTickerEditDialogContentProps) {
    return (
        <>
            <BasicSelect
                label='Exchange'
                options={ExchangeUtil.dataToSelectOptions(exchanges)}
                value={item.exchangeId}
                onChange={(value) => {
                    const filteredTickers = tickers.filter(t => t.exchange === value);
                    onItemChange({ ...item, exchangeId: value, tickerId: filteredTickers.length > 0 ? filteredTickers[0].id : '' });
                    onStateChange({ ...state, filteredTickers });
                }}
            />
            <BasicSelect
                label='Ticker'
                options={TickerUtil.dataToSelectOptions(state.filteredTickers)}
                value={item.tickerId}
                onChange={(value) => onItemChange({ ...item, tickerId: value })}
            />
            <BasicNumberField
                label='Quantity'
                value={item.quantity}
                onChange={(e) => onItemChange({ ...item, quantity: Number(e.target.value) })}
            />
            <CurrencyNumberField
                label='Average Price per Share'
                value={item.averagePrice}
                onChange={(e) => onItemChange({ ...item, averagePrice: Number(e.target.value) })}
                onValueChange={(value) => onItemChange({ ...item, averagePrice: value })}
            />
        </>
    );
}
