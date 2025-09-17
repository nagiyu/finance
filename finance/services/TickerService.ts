import CRUDServiceBase from '@common/services/CRUDServiceBase';

import TickerDataAccessor from '@finance/services/TickerDataAccessor';
import { TickerDataType } from '@finance/interfaces/data/TickerDataType';
import { TickerRecordType } from '@finance/interfaces/record/TickerRecordType';
import { FINANCE_RECORD_DATA_TYPE } from '@finance/types/FinanceRecordDataType';

export default class TickerService extends CRUDServiceBase<TickerDataType, TickerRecordType> {
  public constructor() {
    super(new TickerDataAccessor());
  }

  protected dataToRecord(data: Partial<TickerDataType>): Partial<TickerRecordType> {
    return {
      Name: data.name,
      Key: data.key,
      Exchange: data.exchange,
    };
  }

  protected recordToData(record: TickerRecordType): TickerDataType {
    return {
      id: record.ID,
      name: record.Name,
      key: record.Key,
      exchange: record.Exchange,
      create: record.Create,
      update: record.Update,
    };
  }
}