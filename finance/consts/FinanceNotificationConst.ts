/**
 * Notification frequency control
 */
export const FINANCE_NOTIFICATION_FREQUENCY = {
  /**
   * Notify only once at the start of the exchange
   */
  EXCHANGE_START_ONLY: 'ExchangeStartOnly',

  /**
   * Notify at minute-level intervals
   */
  MINUTE_LEVEL: 'MinuteLevel',

  /**
   * Notify at ten-minute-level intervals
   */
  TEN_MINUTE_LEVEL: 'TenMinuteLevel',

  /**
   * Notify at hourly-level intervals
   */
  HOURLY_LEVEL: 'HourlyLevel',
} as const;

export const FINANCE_NOTIFICATION_CONDITION_MODE = {
  BUY: 'Buy',
  SELL: 'Sell',
} as const;

/**
 * Special condition name for simplified mode (all patterns grouped)
 */
export const SIMPLIFIED_CONDITION_NAME = 'SimplifiedAll' as const;
