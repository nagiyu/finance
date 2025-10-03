/* eslint-disable react-hooks/exhaustive-deps */

'use client';

import React, { useEffect, useState, useCallback, useImperativeHandle, forwardRef } from 'react';

import CandleStick, { CandleStickData } from '@client-common/components/echarts/CandleStick';
import { useResponsiveGraphItems } from '@client-common/hooks/useResponsiveGraphItems';
import { GetStockPriceDataOptions, TimeFrame } from '@finance/utils/FinanceUtil';

type GraphProps = {
    exchange: string;
    ticker: string;
    timeframe: TimeFrame;
    session?: string;
};

export type GraphRef = {
    refresh: () => Promise<void>;
};

const Graph = forwardRef<GraphRef, GraphProps>(({ exchange, ticker, timeframe, session }, ref) => {
    const [data, setData] = useState<CandleStickData[] | null>(null);
    const itemCount = useResponsiveGraphItems();

    const fetchData = useCallback(async () => {
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
    }, [exchange, ticker, itemCount, timeframe, session]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Auto-refresh every 10 seconds
    useEffect(() => {
        const intervalId = setInterval(() => {
            fetchData();
        }, 10000);

        return () => clearInterval(intervalId);
    }, [fetchData]);

    // Expose refresh function to parent
    useImperativeHandle(ref, () => ({
        refresh: fetchData
    }));

    if (!data) {
        return <div>Loading...</div>;
    }

    return <CandleStick data={data} />;
});

Graph.displayName = 'Graph';

export default Graph;
