"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FINANCE_NOTIFICATION_CONDITION_MODE = exports.FINANCE_NOTIFICATION_FREQUENCY = void 0;
/**
 * Notification frequency control
 */
exports.FINANCE_NOTIFICATION_FREQUENCY = {
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
};
exports.FINANCE_NOTIFICATION_CONDITION_MODE = {
    BUY: 'Buy',
    SELL: 'Sell',
};
