import FetchServiceBase from '@client-common/services/FetchServiceBase.client';
import ResponseValidator from '@client-common/utils/ResponseValidator';
import ErrorUtil from '@common/utils/ErrorUtil';

import { FinanceNotificationDataType } from '@finance/interfaces/data/FinanceNotificationDataType';

export default class FinanceNotificationFetchService extends FetchServiceBase<FinanceNotificationDataType> {
  public constructor() {
    super('/api/finance-notification');
  }

  public async get(): Promise<FinanceNotificationDataType[]> {
    try {
      const response = await fetch(this.endpoint, {
        method: 'GET',
        cache: 'no-store'
      });

      this.validateResponse(response);
      return await response.json();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      ErrorUtil.throwError(`Error getting data from ${this.endpoint}: ${errorMessage}`);
    }
  }
}
