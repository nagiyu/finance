import { BaseConditionChecker, Condition, ConditionCheckParams } from './BaseConditionChecker';
import { FINANCE_NOTIFICATION_CONDITION_TYPE } from '@finance/types/FinanceNotificationType';
import FinanceUtil from '@finance/utils/FinanceUtil';

export class GreaterThanConditionChecker extends BaseConditionChecker {
  readonly conditionType = FINANCE_NOTIFICATION_CONDITION_TYPE.GREATER_THAN;

  async check(params: ConditionCheckParams): Promise<Condition> {
    const { target, exchangeKey, tickerKey, conditionValue, session } = params;
    
    if (conditionValue === undefined) {
      return this.createErrorCondition(target);
    }

    const currentPrice = await FinanceUtil.getCurrentStockPrice(exchangeKey, tickerKey, session);

    if (currentPrice === null) {
      return this.createNoDataCondition(target);
    }

    console.log(`Current price for ${target}: ${currentPrice}, condition: ${this.conditionType} ${conditionValue}`);

    if (currentPrice > conditionValue) {
      return this.createCondition(true, `${target} price ${currentPrice} is greater than ${conditionValue}`);
    }

    return this.createFailureCondition();
  }
}