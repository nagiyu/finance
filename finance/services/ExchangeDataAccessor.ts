import FinanceDataAccessorBase from '@finance/services/FinanceDataAccessorBase';
import { ExchangeRecordType } from '@finance/interfaces/record/ExchangeRecordType';
import { FINANCE_RECORD_DATA_TYPE } from '@finance/types/FinanceRecordDataType';

export default class ExchangeDataAccessor extends FinanceDataAccessorBase<ExchangeRecordType> {
  public constructor() {
    super(FINANCE_RECORD_DATA_TYPE.EXCHANGE);
  }
}