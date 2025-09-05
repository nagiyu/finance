/* eslint-disable react-hooks/exhaustive-deps */

'use client';

import React, { useEffect, useState } from 'react';

import { TimeFrame } from '@finance/utils/FinanceUtil';

import BasicSelect from '@client-common/components/inputs/Selects/BasicSelect';
import BasicStack from '@client-common/components/Layout/Stacks/BasicStack';
import DirectionStack from '@client-common/components/Layout/Stacks/DirectionStack';
import { SelectOptionType } from '@client-common/interfaces/SelectOptionType';

import ExchangeUtil from '@/utils/ExchangeUtil';
import TickerUtil from '@/utils/TickerUtil';
import { ExchangeDataType } from '@/interfaces/data/ExchangeDataType';
import { TickerDataType } from '@/interfaces/data/TickerDataType';

import Auth from '@/app/components/Auth';
import AuthAPIUtil from '@/app/utils/AuthAPIUtil';
import ExchangeFetchService from '@/services/exchange/ExchangeFetchService.client';
import Graph from '@/app/components/graph';
import TickerFetchService from '@/services/ticker/TickerFetchService.client';

interface SessionOption {
  value: string;
  label: string;
}

class SessionUtil {
  // Available session options with user-friendly labels
  private static readonly SESSION_OPTIONS: SessionOption[] = [
    { value: "regular", label: "通常時間" },
    { value: "extended", label: "時間外取引含む" },
  ];

  /**
   * Convert session options to SelectOption format for use with BasicSelect component
   */
  public static toSelectOptions(): SelectOptionType[] {
    return this.SESSION_OPTIONS.map(option => ({
      label: option.label,
      value: option.value
    }));
  }

  /**
   * Get the default session
   */
  public static getDefaultSession(): string {
    return "regular";
  }

  /**
   * Validate if a string is a valid session
   */
  public static isValidSession(value: string): boolean {
    return this.SESSION_OPTIONS.some(option => option.value === value);
  }
}

interface TimeFrameOption {
  value: TimeFrame;
  label: string;
}

class TimeFrameUtil {
  // Available timeframes with user-friendly labels
  private static readonly TIMEFRAME_OPTIONS: TimeFrameOption[] = [
    { value: "1", label: "1分" },
    { value: "3", label: "3分" },
    { value: "5", label: "5分" },
    { value: "15", label: "15分" },
    { value: "30", label: "30分" },
    { value: "45", label: "45分" },
    { value: "60", label: "1時間" },
    { value: "120", label: "2時間" },
    { value: "180", label: "3時間" },
    { value: "240", label: "4時間" },
    { value: "D", label: "日足" },
    { value: "W", label: "週足" },
    { value: "M", label: "月足" },
  ];

  /**
   * Convert timeframe options to SelectOption format for use with BasicSelect component
   */
  public static toSelectOptions(): SelectOptionType[] {
    return this.TIMEFRAME_OPTIONS.map(option => ({
      label: option.label,
      value: option.value
    }));
  }

  /**
   * Get the default timeframe
   */
  public static getDefaultTimeFrame(): TimeFrame {
    return "1";
  }

  /**
   * Validate if a string is a valid timeframe
   */
  public static isValidTimeFrame(value: string): value is TimeFrame {
    return this.TIMEFRAME_OPTIONS.some(option => option.value === value);
  }
}

export default function Home() {
  const [exchanges, setExchanges] = useState<ExchangeDataType[]>([]);
  const [tickers, setTickers] = useState<TickerDataType[]>([]);
  const [exchangeOptions, setExchangeOptions] = useState<SelectOptionType[]>([]);
  const [tickerOptions, setTickerOptions] = useState<SelectOptionType[]>([]);
  const [exchange, setExchange] = useState('');
  const [ticker, setTicker] = useState('');
  const [timeframe, setTimeframe] = useState<TimeFrame>(TimeFrameUtil.getDefaultTimeFrame());
  const [session, setSession] = useState<string>(SessionUtil.getDefaultSession());

  const exchangeFetchService = new ExchangeFetchService();
  const tickerFetchService = new TickerFetchService();

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
    if (exchangeOptions.length > 0) {
      setExchange(exchangeOptions[0].value);
    }
  }, [exchangeOptions]);

  useEffect(() => {
    if (tickerOptions.length > 0) {
      setTicker(tickerOptions[0].value);
    }
  }, [tickerOptions]);

  return (
    <Auth
      userContent={
        <BasicStack>
          <DirectionStack>
            <BasicSelect label='Exchange' options={exchangeOptions} value={exchange} onChange={(value) => setExchange(value)} />
            <BasicSelect label='Ticker' options={tickerOptions} value={ticker} onChange={(value) => setTicker(value)} />
          </DirectionStack>
          <Graph exchange={getExchangeKey(exchange)} ticker={getTickerKey(ticker)} timeframe={timeframe} session={session} />
          <DirectionStack>
            <BasicSelect label='時間軸' options={TimeFrameUtil.toSelectOptions()} value={timeframe} onChange={(value) => {
              if (TimeFrameUtil.isValidTimeFrame(value)) {
                setTimeframe(value);
              }
            }} />
            <BasicSelect label='取引時間' options={SessionUtil.toSelectOptions()} value={session} onChange={(value) => setSession(value)} />
          </DirectionStack>
        </BasicStack>
      }
    />
  );
}
