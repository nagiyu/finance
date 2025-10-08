import CRUDServiceBase from '@common/services/CRUDServiceBase';

import MyTickerDataAccessor from '@finance/services/MyTickerDataAccessor';
import { MyTickerDataType } from '@finance/interfaces/data/MyTickerDataType';
import { MyTickerRecordType } from '@finance/interfaces/record/MyTickerRecordType';

export default class MyTickerService extends CRUDServiceBase<MyTickerDataType, MyTickerRecordType> {
  public constructor() {
    super(new MyTickerDataAccessor());
  }

  protected dataToRecord(data: Partial<MyTickerDataType>): Partial<MyTickerRecordType> {
    return {
      UserID: data.userId,
      ExchangeID: data.exchangeId,
      TickerID: data.tickerId,
      Quantity: data.quantity,
      AveragePrice: data.averagePrice,
    };
  }

  protected recordToData(record: MyTickerRecordType): MyTickerDataType {
    return {
      id: record.ID,
      userId: record.UserID,
      exchangeId: record.ExchangeID,
      tickerId: record.TickerID,
      quantity: record.Quantity,
      averagePrice: record.AveragePrice,
      create: record.Create,
      update: record.Update,
    };
  }
}
