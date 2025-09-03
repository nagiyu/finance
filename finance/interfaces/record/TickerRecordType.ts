import { FinanceRecordTypeBase } from '@finance/interfaces/record/FinanceRecordTypeBase';
import { FINANCE_RECORD_DATA_TYPE } from '@finance/types/FinanceRecordDataType';

export interface TickerRecordType extends FinanceRecordTypeBase {
  DataType: typeof FINANCE_RECORD_DATA_TYPE.TICKER;
  Name: string;
  Key: string;
  Exchange: string;
}
