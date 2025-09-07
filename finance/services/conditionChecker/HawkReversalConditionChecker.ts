import { BaseConditionChecker, Condition, ConditionCheckParams } from './BaseConditionChecker';
import { FINANCE_NOTIFICATION_CONDITION_TYPE } from '@finance/types/FinanceNotificationType';
import FinanceUtil from '@finance/utils/FinanceUtil';

export class HawkReversalConditionChecker extends BaseConditionChecker {
  readonly conditionType = FINANCE_NOTIFICATION_CONDITION_TYPE.HAWK_REVERSAL;

  async check(params: ConditionCheckParams): Promise<Condition> {
    const { target, exchangeKey, tickerKey, session } = params;
    
    try {
      const stockData = await FinanceUtil.getStockPriceData(exchangeKey, tickerKey, { count: 2, session });

      if (!stockData || !Array.isArray(stockData) || stockData.length < 2) {
        return this.createInsufficientDataCondition(target);
      }

      const candles = stockData.slice(-2);
      const [firstCandle, secondCandle] = candles;

      // Second candle should be bearish and engulf the first candle
      const secondIsBearish = secondCandle.data[1] < secondCandle.data[0];
      
      // Engulfing pattern: second candle's body completely contains first candle's body
      const firstBodyTop = Math.max(firstCandle.data[0], firstCandle.data[1]);
      const firstBodyBottom = Math.min(firstCandle.data[0], firstCandle.data[1]);
      const secondBodyTop = Math.max(secondCandle.data[0], secondCandle.data[1]);
      const secondBodyBottom = Math.min(secondCandle.data[0], secondCandle.data[1]);

      const isEngulfing = secondBodyTop > firstBodyTop && secondBodyBottom < firstBodyBottom;

      if (secondIsBearish && isEngulfing) {
        return this.createSuccessCondition(target, 'Hawk Reversal - bearish engulfing signal');
      }

      return this.createFailureCondition();
    } catch (error) {
      console.error('Error checking Hawk Reversal pattern:', error);
      return this.createErrorCondition(target, error);
    }
  }
}