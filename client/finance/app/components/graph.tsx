/* eslint-disable react-hooks/exhaustive-deps */

'use client';

import React, { useEffect, useState } from 'react';

import CandleStick, { CandleStickData } from '@client-common/components/echarts/CandleStick';
import { useResponsiveGraphItems } from '@client-common/hooks/useResponsiveGraphItems';
import { GetStockPriceDataOptions, TimeFrame } from '@finance/utils/FinanceUtil';

type GraphProps = {
    exchange: string;
    ticker: string;
    timeframe: TimeFrame;
    session?: string;
};

export default function Graph({ exchange, ticker, timeframe, session }: GraphProps) {
    const [data, setData] = useState<CandleStickData[] | null>(null);
    const itemCount = useResponsiveGraphItems();

    useEffect(() => {
        (async () => {
            if (!exchange || !ticker) {
                setData(null);
                return;
            }

            const options: GetStockPriceDataOptions = { count: itemCount, timeframe };
            if (session) {
                options.session = session;
            }

            const response = await fetch('/api/candle-stick', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ exchange, ticker, options }),
            });

            if (!response.ok) throw new Error('Network response was not ok');

            const json = await response.json();

            setData(json);
        })();
    }, [ticker, itemCount, timeframe, session]);

    if (!data) {
        return <div>Loading...</div>;
    }

    return <CandleStick data={data} />;
}
