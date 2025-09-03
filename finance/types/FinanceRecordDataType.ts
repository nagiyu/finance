export const FINANCE_RECORD_DATA_TYPE = {
  EXCHANGE: 'Exchange',
  TICKER: 'Ticker',
  MY_TICKER: 'MyTicker',
  FINANCE_NOTIFICATION: 'FinanceNotification',
} as const;

export type FinanceRecordDataType = typeof FINANCE_RECORD_DATA_TYPE[keyof typeof FINANCE_RECORD_DATA_TYPE];
