import FinanceUtil from '@finance/utils/FinanceUtil';
import { BaseConditionChecker, Condition, ConditionCheckParams } from '@finance/services/conditionChecker/BaseConditionChecker';
import { FINANCE_NOTIFICATION_CONDITION_TYPE } from '@finance/types/FinanceNotificationType';

export class SansenYoinomyojoConditionChecker extends BaseConditionChecker {
  public readonly conditionType = FINANCE_NOTIFICATION_CONDITION_TYPE.SANSEN_YOINOMYOJO;

  private readonly patternName = '三川宵の明星';

  public async check(params: ConditionCheckParams): Promise<Condition> {
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

      // First candle should be a long bullish candle
      const firstIsBullish = firstCandle.data[1] > firstCandle.data[0]; // close > open
      const firstCandleSize = Math.abs(firstCandle.data[1] - firstCandle.data[0]);
      const firstIsLong = firstCandleSize > (firstCandle.data[3] - firstCandle.data[2]) * 0.6; // body is more than 60% of the range

      // Second candle should be a small bearish candle or doji with a gap up
      const secondIsBearish = secondCandle.data[1] < secondCandle.data[0]; // close < open
      const secondCandleSize = Math.abs(secondCandle.data[1] - secondCandle.data[0]);
      const secondIsSmall = secondCandleSize < firstCandleSize * 0.5; // less than half the size of first candle
      const hasGapUp = secondCandle.data[2] > firstCandle.data[3]; // second candle's low > first candle's high

      // Third candle should be a large bearish candle
      const thirdIsBearish = thirdCandle.data[1] < thirdCandle.data[0]; // close < open
      const thirdCandleSize = Math.abs(thirdCandle.data[1] - thirdCandle.data[0]);
      const thirdIsLarge = thirdCandleSize > secondCandleSize * 1.5; // significantly larger than second candle

      if (firstIsBullish && firstIsLong && secondIsBearish && secondIsSmall && hasGapUp && thirdIsBearish && thirdIsLarge) {
        return this.createSuccessCondition(target, this.patternName);
      }

      return this.createFailureCondition();
    } catch (error) {
      console.error(`Error checking ${this.patternName}:`, error);
      return this.createErrorCondition(target, error);
    }
  }
}