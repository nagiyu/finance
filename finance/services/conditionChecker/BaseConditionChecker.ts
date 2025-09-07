import { FinanceNotificationConditionType } from '@finance/types/FinanceNotificationType';

export interface Condition {
  met: boolean;
  message: string;
}

export interface ConditionCheckParams {
  target: string;
  exchangeKey: string;
  tickerKey: string;
  conditionValue?: number;
  session?: string;
}

export abstract class BaseConditionChecker {
  abstract readonly conditionType: FinanceNotificationConditionType;

  abstract check(params: ConditionCheckParams): Promise<Condition>;

  protected createCondition(met: boolean, message: string): Condition {
    return { met, message };
  }

  protected createSuccessCondition(target: string, patternName: string): Condition {
    return this.createCondition(true, `${target} shows ${patternName} pattern - signal detected`);
  }

  protected createFailureCondition(): Condition {
    return this.createCondition(false, '');
  }

  protected createErrorCondition(target: string, error?: any): Condition {
    return this.createCondition(false, `Error checking pattern for ${target}`);
  }

  protected createInsufficientDataCondition(target: string): Condition {
    return this.createCondition(false, `Insufficient data for ${target}`);
  }

  protected createNoDataCondition(target: string): Condition {
    return this.createCondition(false, `No stock data available for ${target}`);
  }
}