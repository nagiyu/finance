import { DataTypeBase } from '@common/interfaces/data/DataTypeBase';

import { FinanceNotificationCondition } from '@finance/interfaces/FinanceNotificationType';

export interface FinanceNotificationDataType extends DataTypeBase {
  terminalId: string;
  subscriptionEndpoint: string;
  subscriptionKeysP256dh: string;
  subscriptionKeysAuth: string;
  exchangeId: string;
  tickerId: string;

  /**
   * List of conditions with frequency settings
   */
  conditionList: FinanceNotificationCondition[];
}
