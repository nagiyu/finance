import { BaseConditionChecker, Condition, ConditionCheckParams } from './BaseConditionChecker';
import { FINANCE_NOTIFICATION_CONDITION_TYPE } from '@finance/types/FinanceNotificationType';
import FinanceUtil from '@finance/utils/FinanceUtil';

export class FireworksConditionChecker extends BaseConditionChecker {
  readonly conditionType = FINANCE_NOTIFICATION_CONDITION_TYPE.FIREWORKS;

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

      // Long upper shadow, short body, almost no lower shadow
      const hasLongUpperShadow = upperShadow > bodySize * 2;
      const hasShortBody = bodySize < (high - low) * 0.3;
      const hasMinimalLowerShadow = lowerShadow < bodySize * 0.1;

      if (hasLongUpperShadow && hasShortBody && hasMinimalLowerShadow) {
        return this.createSuccessCondition(target, 'Fireworks - bearish reversal signal');
      }

      return this.createFailureCondition();
    } catch (error) {
      console.error('Error checking Fireworks pattern:', error);
      return this.createErrorCondition(target, error);
    }
  }
}