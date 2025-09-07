import { BaseConditionChecker, Condition, ConditionCheckParams } from './BaseConditionChecker';
import { FINANCE_NOTIFICATION_CONDITION_TYPE } from '@finance/types/FinanceNotificationType';
import FinanceUtil from '@finance/utils/FinanceUtil';

export class OkajiThreeCrowsConditionChecker extends BaseConditionChecker {
  readonly conditionType = FINANCE_NOTIFICATION_CONDITION_TYPE.OKAJI_THREE_CROWS;

  async check(params: ConditionCheckParams): Promise<Condition> {
    const { target, exchangeKey, tickerKey, session } = params;
    
    try {
      const stockData = await FinanceUtil.getStockPriceData(exchangeKey, tickerKey, { count: 3, session });

      if (!stockData || !Array.isArray(stockData) || stockData.length < 3) {
        return this.createInsufficientDataCondition(target);
      }

      const candles = stockData.slice(-3);
      const [firstCandle, secondCandle, thirdCandle] = candles;

      // All candles should be bearish
      const allBearish = candles.every(candle => candle.data[1] < candle.data[0]);

      // Check gap patterns: first close = second open, second close = third open
      const firstCloseEqualsSecondOpen = Math.abs(firstCandle.data[1] - secondCandle.data[0]) < firstCandle.data[1] * 0.001;
      const secondCloseEqualsThirdOpen = Math.abs(secondCandle.data[1] - thirdCandle.data[0]) < secondCandle.data[1] * 0.001;

      if (allBearish && firstCloseEqualsSecondOpen && secondCloseEqualsThirdOpen) {
        return this.createSuccessCondition(target, 'Okaji Three Crows - strong bearish signal');
      }

      return this.createFailureCondition();
    } catch (error) {
      console.error('Error checking Okaji Three Crows pattern:', error);
      return this.createErrorCondition(target, error);
    }
  }
}