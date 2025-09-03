import FetchServiceBase from '@client-common/services/FetchServiceBase.client';

import { TickerDataType } from '@/interfaces/data/TickerDataType';

export default class TickerFetchService extends FetchServiceBase<TickerDataType> {
  public constructor() {
    super('/api/ticker');
  }
}
