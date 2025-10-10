import FetchServiceBase from '@client-common/services/FetchServiceBase.client';
import ResponseValidator from '@client-common/utils/ResponseValidator';
import ErrorUtil from '@common/utils/ErrorUtil';

import { TickerDataType } from '@/interfaces/data/TickerDataType';

export default class TickerFetchService extends FetchServiceBase<TickerDataType> {
  public constructor() {
    super('/api/ticker');
  }

  public async get(): Promise<TickerDataType[]> {
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
