import { PermissionMatrix } from '@common/interfaces/authorization/PermissionMatrix';

import { FinanceFeature } from '@finance/consts/FinanceConst';

import { FinanceRecordTypeBase } from '@/interfaces/records/FinanceRecordTypeBase';

/**
 * 権限マトリックスレコード型
 * DynamoDBに保存される形式
 */
export interface PermissionMatrixRecordType extends FinanceRecordTypeBase {
  DataType: 'PermissionMatrix';
  Matrix: PermissionMatrix<FinanceFeature>;
}
