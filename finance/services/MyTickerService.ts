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
      Deal: data.deal,
      Date: data.date,
      Price: data.price,
      Quantity: data.quantity,
    };
  }

  protected recordToData(record: MyTickerRecordType): MyTickerDataType {
    return {
      id: record.ID,
      userId: record.UserID,
      exchangeId: record.ExchangeID,
      tickerId: record.TickerID,
      deal: record.Deal,
      date: record.Date,
      price: record.Price,
      quantity: record.Quantity,
      create: record.Create,
      update: record.Update,
    };
  }
}
