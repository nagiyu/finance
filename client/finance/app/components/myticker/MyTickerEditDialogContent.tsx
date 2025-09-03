import React from 'react';

import DateUtil from '@common/utils/DateUtil';

import { MyTickerDataType } from '@finance/interfaces/data/MyTickerDataType';
import { MyTickerDealType, MY_TICKER_DEAL_TYPE } from '@finance/types/MyTickerType';

import BasicSelect from '@client-common/components/inputs/Selects/BasicSelect';
import BasicDatePicker from '@client-common/components/inputs/Dates/BasicDatePicker';
import BasicNumberField from '@client-common/components/inputs/TextFields/BasicNumberField';
import { SelectOptionType } from '@client-common/interfaces/SelectOptionType';

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

const dealOptions: SelectOptionType[] = [
    { value: MY_TICKER_DEAL_TYPE.PURCHASE, label: 'Purchase' },
    { value: MY_TICKER_DEAL_TYPE.SELL, label: 'Sell' },
];

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
            <BasicSelect
                label='Deal'
                options={dealOptions}
                value={item.deal}
                onChange={(value) => onItemChange({ ...item, deal: value as MyTickerDealType })}
            />
            <BasicDatePicker
                label='Date'
                value={new Date(item.date)}
                onChange={(date) => onItemChange({ ...item, date: date ? DateUtil.toStartOfDay(date) : DateUtil.getTodayStartTimestamp() })}
            />
            <BasicNumberField
                label='Price'
                value={item.price}
                onChange={(e) => onItemChange({ ...item, price: Number(e.target.value) })}
            />
            <BasicNumberField
                label='Quantity'
                value={item.quantity}
                onChange={(e) => onItemChange({ ...item, quantity: Number(e.target.value) })}
            />
        </>
    );
}
