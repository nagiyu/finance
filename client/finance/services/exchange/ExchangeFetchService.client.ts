import FetchServiceBase from "@client-common/services/FetchServiceBase.client";
import ResponseValidator from "@client-common/utils/ResponseValidator";
import ErrorUtil from "@common/utils/ErrorUtil";

import { ExchangeDataType } from "@/interfaces/data/ExchangeDataType";

export default class ExchangeFetchService extends FetchServiceBase<ExchangeDataType> {
  public constructor() {
    super("/api/exchange");
  }

  public async get(): Promise<ExchangeDataType[]> {
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
