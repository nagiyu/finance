import FetchServiceBase from '@client-common/services/FetchServiceBase.client';

import { FinanceNotificationDataType } from '@finance/interfaces/data/FinanceNotificationDataType';

export default class FinanceNotificationFetchService extends FetchServiceBase<FinanceNotificationDataType> {
  public constructor() {
    super('/api/finance-notification');
  }
}
