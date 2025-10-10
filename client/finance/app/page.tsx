/* eslint-disable react-hooks/exhaustive-deps */

'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import { TimeFrame } from '@finance/utils/FinanceUtil';

import BasicSelect from '@client-common/components/inputs/Selects/BasicSelect';
import BasicStack from '@client-common/components/Layout/Stacks/BasicStack';
import DirectionStack from '@client-common/components/Layout/Stacks/DirectionStack';
import ContainedButton from '@client-common/components/inputs/Buttons/ContainedButton';

import { SelectOptionType } from '@client-common/interfaces/SelectOptionType';

import ExchangeUtil from '@/utils/ExchangeUtil';
import TickerUtil from '@/utils/TickerUtil';
import TimeFrameUtil from '@/utils/TimeFrameUtil';
import SessionUtil from '@/utils/SessionUtil';
import CandleCountUtil from '@/utils/CandleCountUtil';
import { ExchangeDataType } from '@/interfaces/data/ExchangeDataType';
import { TickerDataType } from '@/interfaces/data/TickerDataType';

import Auth from '@/app/components/Auth';
import AuthAPIUtil from '@/app/utils/AuthAPIUtil';
import AllConditionDisplay from '@/app/components/AllConditionDisplay';
import ExchangeFetchService from '@/services/exchange/ExchangeFetchService.client';
import Graph from '@/app/components/graph';
import TickerFetchService from '@/services/ticker/TickerFetchService.client';

export default function Home() {
  const searchParams = useSearchParams();
  const [exchanges, setExchanges] = useState<ExchangeDataType[]>([]);
  const [tickers, setTickers] = useState<TickerDataType[]>([]);
  const [exchangeOptions, setExchangeOptions] = useState<SelectOptionType[]>([]);
  const [tickerOptions, setTickerOptions] = useState<SelectOptionType[]>([]);
  const [exchange, setExchange] = useState('');
  const [ticker, setTicker] = useState('');
  const [timeframe, setTimeframe] = useState<TimeFrame>(TimeFrameUtil.getDefaultTimeFrame());
  const [session, setSession] = useState<string>(SessionUtil.getDefaultSession());
  const [candleCount, setCandleCount] = useState<string>(CandleCountUtil.getDefaultCandleCount());
  const [urlParamsProcessed, setUrlParamsProcessed] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const [conditionRefreshTrigger, setConditionRefreshTrigger] = useState<number>(0);

  const exchangeFetchService = new ExchangeFetchService();
  const tickerFetchService = new TickerFetchService();

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
    setConditionRefreshTrigger(prev => prev + 1);
  };

  // 10秒毎のローソク足自動更新
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshTrigger(prev => prev + 1);
    }, 10000); // 10秒 = 10000ミリ秒

    return () => clearInterval(interval);
  }, []);

  // 1分毎の条件自動更新
  useEffect(() => {
    const interval = setInterval(() => {
      setConditionRefreshTrigger(prev => prev + 1);
    }, 60000); // 60秒 = 60000ミリ秒

    return () => clearInterval(interval);
  }, []);

  const getExchangeKey = (id: string): string => {
    return exchanges.find(exchange => exchange.id === id)?.key || '';
  }

  const getTickerKey = (id: string): string => {
    return tickers.find(ticker => ticker.id === id)?.key || '';
  }

  useEffect(() => {
    (async () => {
      if (await AuthAPIUtil.isAuthorized('user')) {
        setExchanges(await exchangeFetchService.get());
        setTickers(await tickerFetchService.get());
      }
    })();
  }, []);

  useEffect(() => {
    setExchangeOptions(ExchangeUtil.dataToSelectOptions(exchanges));
  }, [exchanges]);

  useEffect(() => {
    const filteredTickers = tickers.filter(t => t.exchange === exchange);
    setTickerOptions(TickerUtil.dataToSelectOptions(filteredTickers));
  }, [tickers, exchange])

  useEffect(() => {
    if (exchangeOptions.length > 0 && !urlParamsProcessed) {
      // Check for Exchange URL parameter
      const exchangeIdFromUrl = searchParams.get('exchangeId');
      
      if (exchangeIdFromUrl && exchangeOptions.some(opt => opt.value === exchangeIdFromUrl)) {
        setExchange(exchangeIdFromUrl);
      } else {
        setExchange(exchangeOptions[0].value);
      }
      
      setUrlParamsProcessed(true);
    }
  }, [exchangeOptions, searchParams, urlParamsProcessed]);

  useEffect(() => {
    if (urlParamsProcessed) {
      // Check for TimeFrame URL parameter
      const timeframeFromUrl = searchParams.get('timeframe');
      
      if (timeframeFromUrl && TimeFrameUtil.isValidTimeFrame(timeframeFromUrl)) {
        setTimeframe(timeframeFromUrl);
      }
    }
  }, [searchParams, urlParamsProcessed]);

  useEffect(() => {
    if (tickerOptions.length > 0 && urlParamsProcessed) {
      // Check for URL parameters first
      const tickerIdFromUrl = searchParams.get('tickerId');
      if (tickerIdFromUrl && tickerOptions.some(opt => opt.value === tickerIdFromUrl)) {
        setTicker(tickerIdFromUrl);
      } else {
        setTicker(tickerOptions[0].value);
      }
    }
  }, [tickerOptions, searchParams, urlParamsProcessed]);

  return (
    <Auth
      userContent={
        <BasicStack>
          <DirectionStack>
            <BasicSelect label='Exchange' options={exchangeOptions} value={exchange} onChange={(value) => setExchange(value)} />
            <BasicSelect label='Ticker' options={tickerOptions} value={ticker} onChange={(value) => setTicker(value)} />
          </DirectionStack>
          <ContainedButton label='ローディング' onClick={handleRefresh} />
          <Graph exchange={getExchangeKey(exchange)} ticker={getTickerKey(ticker)} timeframe={timeframe} session={session} candleCount={CandleCountUtil.toNumber(candleCount)} refreshTrigger={refreshTrigger} />
          <DirectionStack>
            <BasicSelect label='時間軸' options={TimeFrameUtil.toSelectOptions()} value={timeframe} onChange={(value) => {
              if (TimeFrameUtil.isValidTimeFrame(value)) {
                setTimeframe(value);
              }
            }} />
            <BasicSelect label='取引時間' options={SessionUtil.toSelectOptions()} value={session} onChange={(value) => setSession(value)} />
            <BasicSelect label='表示本数' options={CandleCountUtil.toSelectOptions()} value={candleCount} onChange={(value) => setCandleCount(value)} />
          </DirectionStack>
          <AllConditionDisplay 
            exchangeId={exchange}
            tickerId={ticker}
            timeframe={timeframe}
            session={session}
            refreshTrigger={conditionRefreshTrigger}
          />
        </BasicStack>
      }
    />
  );
}
