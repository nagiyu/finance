import FinanceDataAccessorBase from '@finance/services/FinanceDataAccessorBase';
import { FINANCE_RECORD_DATA_TYPE } from '@finance/types/FinanceRecordDataType';

import { PermissionMatrixRecord } from '@/types/AuthorizationTypes';

/**
 * 権限マトリックスのデータアクセサー
 */
export default class PermissionMatrixDataAccessor extends FinanceDataAccessorBase<PermissionMatrixRecord> {
  public constructor() {
    super(FINANCE_RECORD_DATA_TYPE.PERMISSION_MATRIX);
  }
}
