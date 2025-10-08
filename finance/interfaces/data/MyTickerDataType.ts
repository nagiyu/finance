import { DataTypeBase } from '@common/interfaces/data/DataTypeBase';

export interface MyTickerDataType extends DataTypeBase {
  userId: string;
  exchangeId: string;
  tickerId: string;
  quantity: number;
  averagePrice: number;
}
