import FetchServiceBase from "@client-common/services/FetchServiceBase.client";

import { ExchangeDataType } from "@/interfaces/data/ExchangeDataType";

export default class ExchangeFetchService extends FetchServiceBase<ExchangeDataType> {
  public constructor() {
    super("/api/exchange");
  }
}
