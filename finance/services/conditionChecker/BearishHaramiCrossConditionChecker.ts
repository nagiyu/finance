import { BaseConditionChecker, Condition, ConditionCheckParams } from './BaseConditionChecker';
import { FINANCE_NOTIFICATION_CONDITION_TYPE } from '@finance/types/FinanceNotificationType';
import FinanceUtil from '@finance/utils/FinanceUtil';

export class BearishHaramiCrossConditionChecker extends BaseConditionChecker {
  readonly conditionType = FINANCE_NOTIFICATION_CONDITION_TYPE.BEARISH_HARAMI_CROSS;

  async check(params: ConditionCheckParams): Promise<Condition> {
    const { target, exchangeKey, tickerKey, session } = params;
    
    try {
      const stockData = await FinanceUtil.getStockPriceData(exchangeKey, tickerKey, { count: 2, session });

      if (!stockData || !Array.isArray(stockData) || stockData.length < 2) {
        return this.createInsufficientDataCondition(target);
      }

      const candles = stockData.slice(-2);
      const [firstCandle, secondCandle] = candles;

      // First candle should be a large bearish candle (大陰線)
      const firstIsBearish = firstCandle.data[1] < firstCandle.data[0]; // close < open
      const firstBodySize = Math.abs(firstCandle.data[1] - firstCandle.data[0]);
      const firstRange = firstCandle.data[3] - firstCandle.data[2];
      const firstIsLarge = firstBodySize > firstRange * 0.6; // body is more than 60% of the range

      // Second candle should be a smaller bearish candle (陰線) contained within first candle's body
      const secondIsBearish = secondCandle.data[1] < secondCandle.data[0]; // close < open
      const firstBodyTop = Math.max(firstCandle.data[0], firstCandle.data[1]);
      const firstBodyBottom = Math.min(firstCandle.data[0], firstCandle.data[1]);
      const secondBodyTop = Math.max(secondCandle.data[0], secondCandle.data[1]);
      const secondBodyBottom = Math.min(secondCandle.data[0], secondCandle.data[1]);
      
      // Second candle's body should be completely contained within first candle's body
      const secondContained = secondBodyTop <= firstBodyTop && secondBodyBottom >= firstBodyBottom;
      
      // Second candle should be smaller than first candle
      const secondBodySize = Math.abs(secondCandle.data[1] - secondCandle.data[0]);
      const secondIsSmaller = secondBodySize < firstBodySize;

      if (firstIsBearish && firstIsLarge && secondIsBearish && secondContained && secondIsSmaller) {
        return this.createSuccessCondition(target, 'Bearish Harami - bearish reversal signal');
      }

      return this.createFailureCondition();
    } catch (error) {
      console.error('Error checking Bearish Harami pattern:', error);
      return this.createErrorCondition(target, error);
    }
  }
}