import CRUDServiceBase from '@common/services/CRUDServiceBase';

import TickerDataAccessor from '@finance/services/TickerDataAccessor';
import { TickerDataType } from '@finance/interfaces/data/TickerDataType';
import { TickerRecordType } from '@finance/interfaces/record/TickerRecordType';
import { FINANCE_RECORD_DATA_TYPE } from '@finance/types/FinanceRecordDataType';

export default class TickerService extends CRUDServiceBase<TickerDataType, TickerRecordType> {
  public constructor() {
    super(new TickerDataAccessor(), TickerService.dataToRecord, TickerService.recordToData);
  }

  private static dataToRecord(data: TickerDataType): TickerRecordType {
    return {
      ID: data.id,
      DataType: FINANCE_RECORD_DATA_TYPE.TICKER,
      Name: data.name,
      Key: data.key,
      Exchange: data.exchange,
      Create: data.create,
      Update: data.update,
    };
  }

  private static recordToData(record: TickerRecordType): TickerDataType {
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