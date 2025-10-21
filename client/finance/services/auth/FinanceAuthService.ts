import AuthService from '@common/services/auth/AuthService';

import { FinanceAuthDataType } from '@/interfaces/data/FinanceAuthDataType';
import { FinanceAuthRecordType } from '@/interfaces/records/FinanceAuthRecordType';

/**
 * Finance用の認証サービス
 */
export default class FinanceAuthService extends AuthService<FinanceAuthDataType, FinanceAuthRecordType> {
  public constructor() {
    super(FinanceAuthService.dataToRecord, FinanceAuthService.recordToData);
  }

  private static dataToRecord(data: FinanceAuthDataType): FinanceAuthRecordType {
    return {
      ...AuthService.dataToRecordBase(data),
      Finance: data.finance
    };
  }

  private static recordToData(record: FinanceAuthRecordType): FinanceAuthDataType {
    return {
      ...AuthService.recordToDataBase(record),
      finance: record.Finance
    };
  }
}
