import { AuthDataAccessor } from '@common/services/auth/AuthDataAccessor.v2';
import { AuthService } from '@common/services/auth/AuthService.v2';

import { FinanceAuthDataType } from '@finance/interfaces/data/FinanceAuthDataType';
import { FinanceAuthRecordType } from '@finance/interfaces/record/FinanceAuthRecordType';

/**
 * Finance用の認証サービス
 */
export default class FinanceAuthService extends AuthService<FinanceAuthDataType, FinanceAuthRecordType> {
  public constructor(
    dataAccessor?: AuthDataAccessor<FinanceAuthRecordType>
  ) {
    if (!dataAccessor) {
      dataAccessor = new AuthDataAccessor<FinanceAuthRecordType>();
    }

    super(dataAccessor);
  }

  protected override dataToRecord(data: Partial<FinanceAuthDataType>): Partial<FinanceAuthRecordType> {
    const baseRecord = super.dataToRecord(data);

    return {
      ...baseRecord,
      Finance: data.finance,
    };
  }

  protected override recordToData(record: FinanceAuthRecordType): FinanceAuthDataType {
    const baseData = super.recordToData(record);

    return {
      ...baseData,
      finance: record.Finance,
    };
  }
}
