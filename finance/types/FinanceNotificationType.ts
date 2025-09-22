import {
  FINANCE_NOTIFICATION_CONDITION_MODE,
  FINANCE_NOTIFICATION_FREQUENCY,
} from '@finance/consts/FinanceNotificationConst';

/**
 * Notification condition types for pattern recognition
 */
export const FINANCE_NOTIFICATION_CONDITION_TYPE = {
  GREATER_THAN: 'GreaterThan',
  LESS_THAN: 'LessThan',
  THREE_RED_SOLDIERS: 'ThreeRedSoldiers',
  TWO_TAKURI_LINES: 'TwoTakuriLines',
  THREE_RIVER_EVENING_STAR: 'ThreeRiverEveningStar',
  SWALLOW_RETURN: 'SwallowReturn',
  FIREWORKS: 'Fireworks',
  OKAJI_THREE_CROWS: 'OkajiThreeCrows',
  FALLING_STONES: 'FallingStones',
  BULLISH_HARAMI_CROSS: 'BullishHaramiCross',
  BEARISH_HARAMI_CROSS: 'BearishHaramiCross',
  HAWK_REVERSAL: 'HawkReversal',
  THREE_DARK_STARS: 'ThreeDarkStars',
  SHOOTING_STAR: 'ShootingStar',
  SANSEN_AKENOMYOJO: 'SansenAkenomyojo',
  SANSEN_YOINOMYOJO: 'SansenYoinomyojo',
} as const;

/**
 * Notification condition type
 */
export type FinanceNotificationConditionType = typeof FINANCE_NOTIFICATION_CONDITION_TYPE[keyof typeof FINANCE_NOTIFICATION_CONDITION_TYPE];

/**
 * Notification frequency control
 */
export type FinanceNotificationFrequencyType = typeof FINANCE_NOTIFICATION_FREQUENCY[keyof typeof FINANCE_NOTIFICATION_FREQUENCY];

/**
 * Notification condition mode (Buy/Sell)
 */
export type FinanceNotificationConditionModeType = typeof FINANCE_NOTIFICATION_CONDITION_MODE[keyof typeof FINANCE_NOTIFICATION_CONDITION_MODE];
