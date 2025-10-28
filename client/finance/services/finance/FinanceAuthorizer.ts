import AuthService from '@common/services/auth/AuthService';
import { PermissionLevel } from '@common/enums/PermissionLevel';
import { UserType } from '@common/enums/UserType';

import AuthUtil from '@client-common/auth/AuthUtil';

import { FinanceFeature } from '@finance/consts/FinanceConst';

import { FinanceAuthDataType } from '@/interfaces/data/FinanceAuthDataType';
import { FinanceAuthRecordType } from '@/interfaces/records/FinanceAuthRecordType';
import AuthorizationService from '@/services/auth/AuthorizationService';

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

/**
 * 既存のFinanceAuthorizerを互換レイヤーとして維持
 * 新しいAuthorizationServiceを内部で使用
 */
export default class FinanceAuthorizer {
  private static readonly feature = 'finance';

  /**
   * 管理者権限チェック
   * @deprecated 新しいコードでは AuthorizationService.authorize() を使用してください
   */
  public static async isAdmin(): Promise<boolean> {
    // 新しいAuthorizationServiceを使用して管理者権限をチェック
    return AuthorizationService.authorize(FinanceFeature.EXCHANGE, PermissionLevel.ADMIN);
  }

  /**
   * ユーザー権限チェック（認証済みユーザー）
   * @deprecated 新しいコードでは AuthorizationService.authorize() を使用してください
   */
  public static async isUser(): Promise<boolean> {
    const userType = await AuthorizationService.getUserType();
    return userType !== UserType.GUEST;
  }
}

