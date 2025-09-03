import { FinanceRecordTypeBase } from '@finance/interfaces/record/FinanceRecordTypeBase';
import { MyTickerDealType } from '@finance/types/MyTickerType';

export interface MyTickerRecordType extends FinanceRecordTypeBase {
  DataType: 'MyTicker';
  UserID: string;
  ExchangeID: string;
  TickerID: string;
  Deal: MyTickerDealType;
  Date: number;
  Price: number;
  Quantity: number;
}
