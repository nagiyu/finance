import FinanceDataAccessorBase from '@finance/services/FinanceDataAccessorBase';
import { FinanceNotificationRecordType } from '@finance/interfaces/record/FinanceNotificationRecordType';
import { FINANCE_RECORD_DATA_TYPE } from '@finance/types/FinanceRecordDataType';

export default class FinanceNotificationDataAccessor extends FinanceDataAccessorBase<FinanceNotificationRecordType> {
  public constructor() {
    super(FINANCE_RECORD_DATA_TYPE.FINANCE_NOTIFICATION);
  }
}
