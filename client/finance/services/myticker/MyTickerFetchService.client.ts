import FetchServiceBase from '@client-common/services/FetchServiceBase.client';
import ResponseValidator from '@client-common/utils/ResponseValidator';
import ErrorUtil from '@common/utils/ErrorUtil';

import { MyTickerDataType } from '@finance/interfaces/data/MyTickerDataType';

export default class MyTickerFetchService extends FetchServiceBase<MyTickerDataType> {
  public constructor() {
    super('/api/myticker');
  }

  public async get(): Promise<MyTickerDataType[]> {
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
