import CRUDServiceBase from '@common/services/CRUDServiceBase';
import TimeUtil from '@common/utils/TimeUtil';

import ExchangeDataAccessor from '@finance/services/ExchangeDataAccessor';
import { ExchangeDataType } from '@finance/interfaces/data/ExchangeDataType';
import { ExchangeRecordType } from '@finance/interfaces/record/ExchangeRecordType';

export default class ExchangeService extends CRUDServiceBase<ExchangeDataType, ExchangeRecordType> {
  public constructor() {
    super(new ExchangeDataAccessor());
  }

  protected dataToRecord(data: Partial<ExchangeDataType>): Partial<ExchangeRecordType> {
    return {
      Name: data.name,
      Key: data.key,
      Start: TimeUtil.formatTime(data.start || TimeUtil.parseTime('00:00')),
      End: TimeUtil.formatTime(data.end || TimeUtil.parseTime('00:00')),
    };
  }

  protected recordToData(record: ExchangeRecordType): ExchangeDataType {
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