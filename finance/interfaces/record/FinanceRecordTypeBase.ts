import { RecordTypeBase } from '@common/aws/interfaces/DynamoDB/RecordTypeBase';
import { FinanceRecordDataType } from '@finance/types/FinanceRecordDataType';

export interface FinanceRecordTypeBase extends RecordTypeBase {
  DataType: FinanceRecordDataType;
}
