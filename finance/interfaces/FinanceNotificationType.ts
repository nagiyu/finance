import { ExchangeSessionType } from '@finance/types/ExchangeTypes';
import {
  FinanceNotificationConditionModeType,
  FinanceNotificationFrequencyType,
} from '@finance/types/FinanceNotificationType';
import { TimeFrame } from '@finance/utils/FinanceUtil';

/**
 * Condition with frequency configuration
 */
export interface FinanceNotificationCondition {
  /**
   * Unique identifier for the condition
   */
  id: string | null;

  /**
   * Condition mode (Buy/Sell)
   */
  mode: FinanceNotificationConditionModeType;

  /**
   * Condition name
   */
  conditionName: string;

  /**
   * Frequency setting for the condition
   */
  frequency: FinanceNotificationFrequencyType;

  /**
   * Session type for price data
   */
  session: ExchangeSessionType;

  /**
   * Timeframe for candlestick data used in condition checking
   */
  timeframe?: TimeFrame | null;

  /**
   * Target price for conditions that require it (e.g., GreaterThan, LessThan)
   */
  targetPrice?: number | null;

  /**
   * Indicates if the first notification has been sent
   */
  firstNotificationSent: boolean;
}

/**
 * Simplified notification configuration with mode-based condition selection
 */
export interface FinanceNotificationSimplifiedConfig {
  /**
   * Notification mode (Buy/Sell) - determines which conditions to apply
   */
  mode: FinanceNotificationConditionModeType;

  /**
   * Frequency setting applied to all applicable conditions
   */
  frequency: FinanceNotificationFrequencyType;

  /**
   * Session type for price data
   */
  session: ExchangeSessionType;

  /**
   * Timeframe for candlestick data used in condition checking
   */
  timeframe?: TimeFrame | null;

  /**
   * Target price - conditions that don't require it will be internally excluded
   */
  targetPrice?: number | null;
}
