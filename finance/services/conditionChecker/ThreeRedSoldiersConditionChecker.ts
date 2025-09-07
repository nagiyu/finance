import { BaseConditionChecker, Condition, ConditionCheckParams } from './BaseConditionChecker';
import { FINANCE_NOTIFICATION_CONDITION_TYPE } from '@finance/types/FinanceNotificationType';
import FinanceUtil from '@finance/utils/FinanceUtil';

export class ThreeRedSoldiersConditionChecker extends BaseConditionChecker {
  readonly conditionType = FINANCE_NOTIFICATION_CONDITION_TYPE.THREE_RED_SOLDIERS;

  async check(params: ConditionCheckParams): Promise<Condition> {
    const { target, exchangeKey, tickerKey, session } = params;
    
    try {
      const stockData = await FinanceUtil.getStockPriceData(exchangeKey, tickerKey, { count: 3, session });

      if (!stockData || !Array.isArray(stockData) || stockData.length < 3) {
        return this.createInsufficientDataCondition(target);
      }

      // Get the last 3 candles (most recent data)
      const candles = stockData.slice(-3);
      
      // Check if all 3 candles are bullish (close > open)
      const allBullish = candles.every(candle => candle.data[1] > candle.data[0]); // close > open

      if (!allBullish) {
        return this.createFailureCondition();
      }

      // Check if 2nd and 3rd candles start within the range of the previous candle
      const firstCandle = candles[0];
      const secondCandle = candles[1];
      const thirdCandle = candles[2];

      const firstLow = firstCandle.data[2];
      const firstHigh = firstCandle.data[3];
      const secondOpen = secondCandle.data[0];
      const secondLow = secondCandle.data[2];
      const secondHigh = secondCandle.data[3];
      const thirdOpen = thirdCandle.data[0];

      // Second candle should start within first candle's range
      const secondStartsInRange = secondOpen >= firstLow && secondOpen <= firstHigh;
      
      // Third candle should start within second candle's range
      const thirdStartsInRange = thirdOpen >= secondLow && thirdOpen <= secondHigh;

      if (secondStartsInRange && thirdStartsInRange) {
        return this.createCondition(true, `${target} shows Three Red Soldiers pattern - strong bullish signal detected`);
      }

      return this.createFailureCondition();
    } catch (error) {
      console.error('Error checking Three Red Soldiers pattern:', error);
      return this.createErrorCondition(target, error);
    }
  }
}