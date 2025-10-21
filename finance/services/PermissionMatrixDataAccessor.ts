import FinanceDataAccessorBase from '@finance/services/FinanceDataAccessorBase';
import { FINANCE_RECORD_DATA_TYPE } from '@finance/types/FinanceRecordDataType';

import { PermissionMatrixRecordType } from '@/interfaces/records/PermissionMatrixRecordType';

/**
 * 権限マトリックスのデータアクセサー
 */
export default class PermissionMatrixDataAccessor extends FinanceDataAccessorBase<PermissionMatrixRecordType> {
  public constructor() {
    super(FINANCE_RECORD_DATA_TYPE.PERMISSION_MATRIX);
  }
}
