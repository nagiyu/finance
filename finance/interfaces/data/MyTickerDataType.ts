import { DataTypeBase } from '@common/interfaces/data/DataTypeBase';
import { MyTickerDealType } from '@finance/types/MyTickerType';

export interface MyTickerDataType extends DataTypeBase {
  userId: string;
  exchangeId: string;
  tickerId: string;
  deal: MyTickerDealType;
  date: number;
  price: number;
  quantity: number;
}
