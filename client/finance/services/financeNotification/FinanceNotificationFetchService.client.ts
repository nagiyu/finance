import ErrorUtil from '@common/utils/ErrorUtil';

import FetchServiceBase from '@client-common/services/FetchServiceBase.client';

import { FinanceNotificationDataType } from '@finance/interfaces/data/FinanceNotificationDataType';

export default class FinanceNotificationFetchService extends FetchServiceBase<FinanceNotificationDataType> {
  public constructor() {
    super('/api/finance-notification');
  }

  public async syncCache(): Promise<void> {
    try {
      const response = await fetch(`${this.endpoint}/sync-cache`, {
        method: 'POST'
      });

      this.validateResponse(response);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      ErrorUtil.throwError(`Error syncing cache at ${this.endpoint}: ${errorMessage}`);
    }
  }
}
