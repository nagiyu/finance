import { FinanceRecordTypeBase } from '@finance/interfaces/record/FinanceRecordTypeBase';

export interface MyTickerRecordType extends FinanceRecordTypeBase {
  DataType: 'MyTicker';
  UserID: string;
  ExchangeID: string;
  TickerID: string;
  Quantity: number;
  AveragePrice: number;
}
