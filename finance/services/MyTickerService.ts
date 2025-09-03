import CRUDServiceBase from '@common/services/CRUDServiceBase';

import MyTickerDataAccessor from '@finance/services/MyTickerDataAccessor';
import { MyTickerDataType } from '@finance/interfaces/data/MyTickerDataType';
import { MyTickerRecordType } from '@finance/interfaces/record/MyTickerRecordType';

export default class MyTickerService extends CRUDServiceBase<MyTickerDataType, MyTickerRecordType> {
  public constructor() {
    super(new MyTickerDataAccessor(), MyTickerService.dataToRecord, MyTickerService.recordToData);
  }

  private static dataToRecord(data: MyTickerDataType): MyTickerRecordType {
    return {
      ID: data.id,
      DataType: 'MyTicker',
      UserID: data.userId,
      ExchangeID: data.exchangeId,
      TickerID: data.tickerId,
      Deal: data.deal,
      Date: data.date,
      Price: data.price,
      Quantity: data.quantity,
      Create: data.create,
      Update: data.update,
    };
  }

  private static recordToData(record: MyTickerRecordType): MyTickerDataType {
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
