import { PermissionMatrix } from '@common/interfaces/authorization/PermissionMatrix';

import { FinanceFeature } from '@finance/consts/FinanceConst';

/**
 * 権限マトリックスデータ型
 * クライアント・サーバー間でやり取りするデータ形式
 */
export interface PermissionMatrixDataType {
  id: string;
  matrix: PermissionMatrix<FinanceFeature>;
  create: number;
  update: number;
}
