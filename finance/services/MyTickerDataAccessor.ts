import FinanceDataAccessorBase from '@finance/services/FinanceDataAccessorBase';
import { MyTickerRecordType } from '@finance/interfaces/record/MyTickerRecordType';

export default class MyTickerDataAccessor extends FinanceDataAccessorBase<MyTickerRecordType> {
  private static readonly dataType = 'MyTicker';

  public constructor() {
    super(MyTickerDataAccessor.dataType);
  }
}
