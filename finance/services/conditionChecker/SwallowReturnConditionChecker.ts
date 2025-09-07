import { BaseConditionChecker, Condition, ConditionCheckParams } from './BaseConditionChecker';
import { FINANCE_NOTIFICATION_CONDITION_TYPE } from '@finance/types/FinanceNotificationType';
import FinanceUtil from '@finance/utils/FinanceUtil';

export class SwallowReturnConditionChecker extends BaseConditionChecker {
  readonly conditionType = FINANCE_NOTIFICATION_CONDITION_TYPE.SWALLOW_RETURN;

  async check(params: ConditionCheckParams): Promise<Condition> {
    const { target, exchangeKey, tickerKey, session } = params;
    
    try {
      const stockData = await FinanceUtil.getStockPriceData(exchangeKey, tickerKey, { count: 4, session });

      if (!stockData || !Array.isArray(stockData) || stockData.length < 4) {
        return this.createInsufficientDataCondition(target);
      }

      const candles = stockData.slice(-4);
      const [baseCandle, firstCandle, secondCandle, thirdCandle] = candles;

      // First and second candles should open higher than previous close but end bearish
      const firstGapsUp = firstCandle.data[0] > baseCandle.data[1];
      const firstIsBearish = firstCandle.data[1] < firstCandle.data[0];
      
      const secondGapsUp = secondCandle.data[0] > firstCandle.data[1];
      const secondIsBearish = secondCandle.data[1] < secondCandle.data[0];

      // Third candle should be bullish
      const thirdIsBullish = thirdCandle.data[1] > thirdCandle.data[0];

      if (firstGapsUp && firstIsBearish && secondGapsUp && secondIsBearish && thirdIsBullish) {
        return this.createSuccessCondition(target, 'Swallow Return - bullish reversal signal');
      }

      return this.createFailureCondition();
    } catch (error) {
      console.error('Error checking Swallow Return pattern:', error);
      return this.createErrorCondition(target, error);
    }
  }
}