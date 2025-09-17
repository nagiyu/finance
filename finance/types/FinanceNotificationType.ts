import {
  FINANCE_NOTIFICATION_CONDITION_MODE,
  FINANCE_NOTIFICATION_FREQUENCY,
} from '@finance/consts/FinanceNotificationConst';

/**
 * Notification frequency control
 */
export type FinanceNotificationFrequencyType = typeof FINANCE_NOTIFICATION_FREQUENCY[keyof typeof FINANCE_NOTIFICATION_FREQUENCY];

/**
 * Notification condition mode (Buy/Sell)
 */
export type FinanceNotificationConditionModeType = typeof FINANCE_NOTIFICATION_CONDITION_MODE[keyof typeof FINANCE_NOTIFICATION_CONDITION_MODE];
