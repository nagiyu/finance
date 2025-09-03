import { RecordTypeBase } from '@common/aws/interfaces/DynamoDB/RecordTypeBase';

export interface FinanceTypeBase extends RecordTypeBase {
  DataType: 'Exchange' | 'Ticker';
}
