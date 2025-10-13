import ErrorUtil from '@common/utils/ErrorUtil';

import FetchServiceBase from "@client-common/services/FetchServiceBase.client";

import { ExchangeDataType } from "@/interfaces/data/ExchangeDataType";

export default class ExchangeFetchService extends FetchServiceBase<ExchangeDataType> {
  public constructor() {
    super("/api/exchange");
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
