import { TimeType } from '@common/interfaces/TimeType';

export interface ExchangeDataType {
  id: string;
  name: string;
  key: string;
  start: TimeType;
  end: TimeType;
  create: number;
  update: number;
}
