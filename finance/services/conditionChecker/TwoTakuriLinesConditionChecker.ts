import { BaseConditionChecker, Condition, ConditionCheckParams } from './BaseConditionChecker';
import { FINANCE_NOTIFICATION_CONDITION_TYPE } from '@finance/types/FinanceNotificationType';
import FinanceUtil from '@finance/utils/FinanceUtil';

export class TwoTakuriLinesConditionChecker extends BaseConditionChecker {
  readonly conditionType = FINANCE_NOTIFICATION_CONDITION_TYPE.TWO_TAKURI_LINES;

  async check(params: ConditionCheckParams): Promise<Condition> {
    const { target, exchangeKey, tickerKey, session } = params;
    
    try {
      const stockData = await FinanceUtil.getStockPriceData(exchangeKey, tickerKey, { count: 2, session });

      if (!stockData || !Array.isArray(stockData) || stockData.length < 2) {
        return this.createInsufficientDataCondition(target);
      }

      const candles = stockData.slice(-2);

      // Check for Two Takuri Lines pattern
      const hasPattern = candles.every(candle => {
        const [open, close, low, high] = candle.data;
        const bodyBottom = Math.min(open, close);
        const lowerShadow = bodyBottom - low;
        const upperShadow = high - Math.max(open, close);
        const bodySize = Math.abs(close - open);
        
        // Small body and long lower shadow characteristic of takuri line
        return lowerShadow > bodySize * 2 && upperShadow < bodySize;
      });

      if (hasPattern) {
        return this.createSuccessCondition(target, 'Two Takuri Lines - bullish reversal');
      }

      return this.createFailureCondition();
    } catch (error) {
      console.error('Error checking Two Takuri Lines pattern:', error);
      return this.createErrorCondition(target, error);
    }
  }
}