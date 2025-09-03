export const MY_TICKER_DEAL_TYPE = {
  PURCHASE: 'purchase',
  SELL: 'sell',
} as const;

export type MyTickerDealType = typeof MY_TICKER_DEAL_TYPE[keyof typeof MY_TICKER_DEAL_TYPE];
