import ConditionBase, { ConditionInfo } from '@finance/conditions/ConditionBase';

export const LessThanConditionInfo: ConditionInfo = {
  name: '指定価格を下回る',
  description: '株価が指定した価格を下回った時に通知します。',
  isBuyCondition: true,
  isSellCondition: true,
  enableTargetPrice: true,
};

export default class LessThanCondition extends ConditionBase {
  public async checkCondition(
    exchangeId: string,
    tickerId: string,
    session?: string,
    targetPrice?: number | null
  ): Promise<boolean> {
    if (targetPrice === null || targetPrice === undefined) {
      throw new Error('Target price is required for LessThanCondition');
    }

    const currentPrice = await this.getCurrentStockPrice(exchangeId, tickerId, session);
    if (currentPrice === null) {
      throw new Error('Failed to retrieve current stock price');
    }

    if (currentPrice < targetPrice) {
      return true;
    }

    return false;
  }
}

