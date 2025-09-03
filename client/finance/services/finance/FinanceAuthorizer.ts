import AuthService from '@common/services/auth/AuthService';

import AuthUtil from '@client-common/auth/AuthUtil';

import { FinanceAuthDataType } from '@/interfaces/data/FinanceAuthDataType';
import { FinanceAuthRecordType } from '@/interfaces/records/FinanceAuthRecordType';

class FinanceAuthService extends AuthService<FinanceAuthDataType, FinanceAuthRecordType> {
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

export default class FinanceAuthorizer {
  private static readonly feature = 'finance';

  public static async isAdmin(): Promise<boolean> {
    const service = new FinanceAuthService();
    const googleUserID = await AuthUtil.getGoogleUserIdFromSession();
    return service.isAuthorizedByGoogle(googleUserID, this.feature, ['Admin']);
  }

  public static async isUser(): Promise<boolean> {
    const service = new FinanceAuthService();
    const googleUserID = await AuthUtil.getGoogleUserIdFromSession();
    return service.isAuthorizedByGoogle(googleUserID, this.feature);
  }
}
