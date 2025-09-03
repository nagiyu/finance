import FinanceDataAccessorBase from '@finance/services/FinanceDataAccessorBase';
import { TickerRecordType } from '@finance/interfaces/record/TickerRecordType';
import { FINANCE_RECORD_DATA_TYPE } from '@finance/types/FinanceRecordDataType';

export default class TickerDataAccessor extends FinanceDataAccessorBase<TickerRecordType> {
  public constructor() {
    super(FINANCE_RECORD_DATA_TYPE.TICKER);
  }
}