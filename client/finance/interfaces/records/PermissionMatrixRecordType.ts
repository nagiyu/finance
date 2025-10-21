import { FinanceRecordTypeBase } from '@/interfaces/records/FinanceRecordTypeBase';
import { PermissionMatrix } from '@/types/AuthorizationTypes';

/**
 * 権限マトリックスレコード型
 * DynamoDBに保存される形式
 */
export interface PermissionMatrixRecordType extends FinanceRecordTypeBase {
  DataType: 'PermissionMatrix';
  Matrix: PermissionMatrix;
}
