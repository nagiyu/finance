import ErrorUtil from '@common/utils/ErrorUtil';
import ConditionBase from '@finance/conditions/ConditionBase';
import { ExchangeSessionType } from '@finance/types/ExchangeTypes';
import { TimeFrame } from '@finance/utils/FinanceUtil';

export const GreaterThanConditionInfo = {
  name: '指定価格を上回る',
  description: '株価が指定した価格を上回った時に通知します。',
  isBuyCondition: true,
  isSellCondition: true,
  enableTargetPrice: true,
  enableTimeFrame: false,
  enableSimplifiedMode: false,
};

export default class GreaterThanCondition extends ConditionBase {
  public async checkCondition(
    exchangeId: string,
    tickerId: string,
    session?: ExchangeSessionType,
    targetPrice?: number | null,
    timeframe?: TimeFrame | null
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
