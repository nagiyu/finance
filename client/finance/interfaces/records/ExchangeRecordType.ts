import { FinanceRecordTypeBase } from '@/interfaces/records/FinanceRecordTypeBase';

export interface ExchangeRecordType extends FinanceRecordTypeBase {
  DataType: 'Exchange';
  Name: string;
  Key: string;
  Start: string;
  End: string;
}
