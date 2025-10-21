import ErrorUtil from '@common/utils/ErrorUtil';

import FetchServiceBase from '@client-common/services/FetchServiceBase.client';

import { MyTickerDataType } from '@finance/interfaces/data/MyTickerDataType';

export default class MyTickerFetchService extends FetchServiceBase<MyTickerDataType> {
  public constructor() {
    super('/api/myticker');
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
