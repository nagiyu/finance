import { BaseConditionChecker, Condition, ConditionCheckParams } from './BaseConditionChecker';
import { FINANCE_NOTIFICATION_CONDITION_TYPE } from '@finance/types/FinanceNotificationType';
import FinanceUtil from '@finance/utils/FinanceUtil';

export class FallingStonesConditionChecker extends BaseConditionChecker {
  readonly conditionType = FINANCE_NOTIFICATION_CONDITION_TYPE.FALLING_STONES;

  async check(params: ConditionCheckParams): Promise<Condition> {
    const { target, exchangeKey, tickerKey, session } = params;
    
    try {
      const stockData = await FinanceUtil.getStockPriceData(exchangeKey, tickerKey, { count: 5, session });

      if (!stockData || !Array.isArray(stockData) || stockData.length < 5) {
        return this.createInsufficientDataCondition(target);
      }

      const candles = stockData.slice(-5);
      const [bigBullCandle, ...smallCandles] = candles;

      // First candle should be a large bullish candle
      const firstIsBullish = bigBullCandle.data[1] > bigBullCandle.data[0];
      const firstBodySize = Math.abs(bigBullCandle.data[1] - bigBullCandle.data[0]);
      const firstRange = bigBullCandle.data[3] - bigBullCandle.data[2];
      const firstIsLarge = firstBodySize > firstRange * 0.7;

      // Following candles show gradual decline with lower lows
      let hasLowerLows = true;
      let previousLow = bigBullCandle.data[2];
      
      for (const candle of smallCandles) {
        if (candle.data[2] >= previousLow) {
          hasLowerLows = false;
          break;
        }
        previousLow = candle.data[2];
      }

      // Most of the following candles should be small
      const hasSmallCandles = smallCandles.every(candle => {
        const bodySize = Math.abs(candle.data[1] - candle.data[0]);
        return bodySize < firstBodySize * 0.5;
      });

      if (firstIsBullish && firstIsLarge && hasLowerLows && hasSmallCandles) {
        return this.createSuccessCondition(target, 'Falling Stones - descending wedge bearish signal');
      }

      return this.createFailureCondition();
    } catch (error) {
      console.error('Error checking Falling Stones pattern:', error);
      return this.createErrorCondition(target, error);
    }
  }
}