import CRUDServiceBase from '@common/services/CRUDServiceBase';
import TimeUtil from '@common/utils/TimeUtil';

import ExchangeDataAccessor from '@finance/services/ExchangeDataAccessor';
import { ExchangeDataType } from '@finance/interfaces/data/ExchangeDataType';
import { ExchangeRecordType } from '@finance/interfaces/record/ExchangeRecordType';
import { FINANCE_RECORD_DATA_TYPE } from '@finance/types/FinanceRecordDataType';

export default class ExchangeService extends CRUDServiceBase<ExchangeDataType, ExchangeRecordType> {
  public constructor() {
    super(new ExchangeDataAccessor(), ExchangeService.dataToRecord, ExchangeService.recordToData);
  }

  private static dataToRecord(data: ExchangeDataType): ExchangeRecordType {
    return {
      ID: data.id,
      DataType: FINANCE_RECORD_DATA_TYPE.EXCHANGE,
      Name: data.name,
      Key: data.key,
      Start: TimeUtil.formatTime(data.start),
      End: TimeUtil.formatTime(data.end),
      Create: data.create,
      Update: data.update,
    };
  }

  private static recordToData(record: ExchangeRecordType): ExchangeDataType {
    return {
      id: record.ID,
      name: record.Name,
      key: record.Key,
      start: TimeUtil.parseTime(record.Start),
      end: TimeUtil.parseTime(record.End),
      create: record.Create,
      update: record.Update,
    };
  }
}