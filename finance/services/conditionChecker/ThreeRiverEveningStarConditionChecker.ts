import { BaseConditionChecker, Condition, ConditionCheckParams } from './BaseConditionChecker';
import { FINANCE_NOTIFICATION_CONDITION_TYPE } from '@finance/types/FinanceNotificationType';
import FinanceUtil from '@finance/utils/FinanceUtil';

export class ThreeRiverEveningStarConditionChecker extends BaseConditionChecker {
  readonly conditionType = FINANCE_NOTIFICATION_CONDITION_TYPE.THREE_RIVER_EVENING_STAR;

  async check(params: ConditionCheckParams): Promise<Condition> {
    const { target, exchangeKey, tickerKey, session } = params;
    
    try {
      const stockData = await FinanceUtil.getStockPriceData(exchangeKey, tickerKey, { count: 3, session });

      if (!stockData || !Array.isArray(stockData) || stockData.length < 3) {
        return this.createInsufficientDataCondition(target);
      }

      // Get the last 3 candles (most recent data)
      const candles = stockData.slice(-3);
      
      const firstCandle = candles[0];
      const secondCandle = candles[1];
      const thirdCandle = candles[2];

      // First candle should be a long bearish candle
      const firstIsBearish = firstCandle.data[1] < firstCandle.data[0]; // close < open
      const firstCandleSize = Math.abs(firstCandle.data[1] - firstCandle.data[0]);
      const firstIsLong = firstCandleSize > (firstCandle.data[3] - firstCandle.data[2]) * 0.6; // body is more than 60% of the range

      // Second candle should be a small bullish candle with a gap up
      const secondIsBullish = secondCandle.data[1] > secondCandle.data[0]; // close > open
      const secondCandleSize = Math.abs(secondCandle.data[1] - secondCandle.data[0]);
      const secondIsSmall = secondCandleSize < firstCandleSize * 0.5; // less than half the size of first candle
      const hasGapUp = secondCandle.data[2] > firstCandle.data[3]; // second candle's low > first candle's high

      // Third candle should be bullish
      const thirdIsBullish = thirdCandle.data[1] > thirdCandle.data[0]; // close > open

      if (firstIsBearish && firstIsLong && secondIsBullish && secondIsSmall && hasGapUp && thirdIsBullish) {
        return this.createSuccessCondition(target, 'Three River Evening Star - potential reversal signal');
      }

      return this.createFailureCondition();
    } catch (error) {
      console.error('Error checking Three River Evening Star pattern:', error);
      return this.createErrorCondition(target, error);
    }
  }
}