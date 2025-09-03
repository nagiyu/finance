import { FinanceTypeBase } from '@/interfaces/records/FinanceTypeBase';

export interface ExchangeType extends FinanceTypeBase {
  DataType: 'Exchange';
  Name: string;
  Start: string;
  End: string;
}
