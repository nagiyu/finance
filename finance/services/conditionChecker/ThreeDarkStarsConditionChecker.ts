import { BaseConditionChecker, Condition, ConditionCheckParams } from './BaseConditionChecker';
import { FINANCE_NOTIFICATION_CONDITION_TYPE } from '@finance/types/FinanceNotificationType';
import FinanceUtil from '@finance/utils/FinanceUtil';

export class ThreeDarkStarsConditionChecker extends BaseConditionChecker {
  readonly conditionType = FINANCE_NOTIFICATION_CONDITION_TYPE.THREE_DARK_STARS;

  async check(params: ConditionCheckParams): Promise<Condition> {
    const { target, exchangeKey, tickerKey, session } = params;
    
    try {
      const stockData = await FinanceUtil.getStockPriceData(exchangeKey, tickerKey, { count: 3, session });

      if (!stockData || !Array.isArray(stockData) || stockData.length < 3) {
        return this.createInsufficientDataCondition(target);
      }

      const candles = stockData.slice(-3);

      // All candles should be bearish with small bodies
      const allBearishAndSmall = candles.every(candle => {
        const isBearish = candle.data[1] < candle.data[0];
        const bodySize = Math.abs(candle.data[1] - candle.data[0]);
        const range = candle.data[3] - candle.data[2];
        const hasSmallBody = bodySize < range * 0.3;
        return isBearish && hasSmallBody;
      });

      if (allBearishAndSmall) {
        return this.createSuccessCondition(target, 'Three Dark Stars - bearish continuation signal');
      }

      return this.createFailureCondition();
    } catch (error) {
      console.error('Error checking Three Dark Stars pattern:', error);
      return this.createErrorCondition(target, error);
    }
  }
}