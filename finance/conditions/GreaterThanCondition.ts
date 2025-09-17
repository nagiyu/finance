import ErrorUtil from '@common/utils/ErrorUtil';
import ConditionBase from '@finance/conditions/ConditionBase';

export const GreaterThanConditionInfo = {
  name: '指定価格を上回る',
  description: '株価が指定した価格を上回った時に通知します。',
  isBuyCondition: true,
  isSellCondition: true,
  enableTargetPrice: true,
};

export default class GreaterThanCondition extends ConditionBase {
  public async checkCondition(
    exchangeId: string,
    tickerId: string,
    session?: string,
    targetPrice?: number | null
  ): Promise<boolean> {
    if (targetPrice === null || targetPrice === undefined) {
      ErrorUtil.throwError('Target price is required for GreaterThanCondition');
    }

    const currentPrice = await this.getCurrentStockPrice(exchangeId, tickerId, session);
    if (currentPrice === null) {
      ErrorUtil.throwError('Failed to retrieve current stock price');
    }

    if (currentPrice > targetPrice) {
      return true;
    }

    return false;
  }
}
