import { BaseConditionChecker, Condition, ConditionCheckParams } from './BaseConditionChecker';
import { FINANCE_NOTIFICATION_CONDITION_TYPE } from '@finance/types/FinanceNotificationType';
import FinanceUtil from '@finance/utils/FinanceUtil';

export class ShootingStarConditionChecker extends BaseConditionChecker {
  readonly conditionType = FINANCE_NOTIFICATION_CONDITION_TYPE.SHOOTING_STAR;

  async check(params: ConditionCheckParams): Promise<Condition> {
    const { target, exchangeKey, tickerKey, session } = params;
    
    try {
      const stockData = await FinanceUtil.getStockPriceData(exchangeKey, tickerKey, { count: 1, session });

      if (!stockData || !Array.isArray(stockData) || stockData.length < 1) {
        return this.createInsufficientDataCondition(target);
      }

      const candle = stockData[stockData.length - 1];
      const [open, close, low, high] = candle.data;

      // Calculate body and shadows
      const bodyTop = Math.max(open, close);
      const bodyBottom = Math.min(open, close);
      const bodySize = Math.abs(close - open);
      const upperShadow = high - bodyTop;
      const lowerShadow = bodyBottom - low;
      const range = high - low;

      // Long upper shadow, short body (usually bearish), small lower shadow
      const hasLongUpperShadow = upperShadow > bodySize * 2;
      const hasShortBody = bodySize < range * 0.3;
      const hasSmallLowerShadow = lowerShadow < bodySize;
      const isBearish = close < open;

      if (hasLongUpperShadow && hasShortBody && hasSmallLowerShadow && isBearish) {
        return this.createSuccessCondition(target, 'Shooting Star - bearish reversal signal');
      }

      return this.createFailureCondition();
    } catch (error) {
      console.error('Error checking Shooting Star pattern:', error);
      return this.createErrorCondition(target, error);
    }
  }
}