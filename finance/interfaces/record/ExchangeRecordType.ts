import { FinanceRecordTypeBase } from '@finance/interfaces/record/FinanceRecordTypeBase';

import { FINANCE_RECORD_DATA_TYPE } from '@finance/types/FinanceRecordDataType';

export interface ExchangeRecordType extends FinanceRecordTypeBase {
  DataType: typeof FINANCE_RECORD_DATA_TYPE.EXCHANGE;
  Name: string;
  Key: string;
  Start: string;
  End: string;
}
