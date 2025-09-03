import { RecordTypeBase } from '@common/aws/interfaces/DynamoDB/RecordTypeBase';

export interface FinanceRecordTypeBase extends RecordTypeBase {
  DataType: 'Exchange' | 'Ticker';
}
