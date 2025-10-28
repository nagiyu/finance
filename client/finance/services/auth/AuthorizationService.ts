import { PermissionLevel } from '@common/enums/PermissionLevel';
import { PermissionMatrix } from '@common/interfaces/authorization/PermissionMatrix';
import { UserType } from '@common/enums/UserType';

import AuthUtil from '@client-common/auth/AuthUtil';

import { FinanceAuthorizationService } from '@finance/services/FinanceAuthorizationService';
import { FinanceFeature } from '@finance/consts/FinanceConst';

import PermissionMatrixService from '@/services/auth/PermissionMatrixService';
import FinanceAuthService from '@/services/auth/FinanceAuthService';

/**
 * Finance用の認可サービス（クライアント側実装）
 * FinanceAuthorizationService を継承して、クライアント固有の実装を提供
 */
class FinanceClientAuthorizationService extends FinanceAuthorizationService {
  /**
   * 権限マトリックスを取得
   * データベースから権限マトリックスを取得
   */
  protected async getPermissionMatrix(): Promise<PermissionMatrix<FinanceFeature>> {
    return await PermissionMatrixService.getPermissionMatrix();
  }

  /**
   * セッションからユーザータイプを取得
   */
  protected async getUserType(): Promise<UserType> {
    try {
      // AuthUtil経由でGoogleUserIDを取得
      const googleUserID = await AuthUtil.getGoogleUserIdFromSession();
      
      if (!googleUserID) {
        return UserType.GUEST;
      }

      // AuthService経由で認証情報をチェック
      const authService = new FinanceAuthService();
      
      // isAuthorizedByGoogleで管理者権限をチェック
      const isAdmin = await authService.isAuthorizedByGoogle(googleUserID, 'finance', ['Admin']);
      if (isAdmin) {
        return UserType.ADMIN;
      }

      // 認証済みユーザーかチェック
      const isAuthenticated = await authService.isAuthorizedByGoogle(googleUserID, 'finance');
      if (isAuthenticated) {
        return UserType.AUTHENTICATED;
      }

      return UserType.GUEST;
    } catch (error) {
      console.error('Error getting user type:', error);
      return UserType.GUEST;
    }
  }

  /**
   * ユーザーIDを取得
   * カスタム権限チェックには使用しないため、undefinedを返す
   */
  protected async getUserId(): Promise<string | undefined> {
    return undefined;
  }

  /**
   * Public wrapper for getUserType
   */
  public async getUserTypePublic(): Promise<UserType> {
    return this.getUserType();
  }
}

// シングルトンインスタンス
const authorizationServiceInstance = new FinanceClientAuthorizationService();

/**
 * 汎用認可サービス
 * 既存のコードとの互換性を保つための静的メソッドを提供
 */
export default class AuthorizationService {
  /**
   * セッションからユーザータイプを取得
   */
  public static async getUserType(): Promise<UserType> {
    return await authorizationServiceInstance.getUserTypePublic();
  }

  /**
   * ユーザーが指定された機能に対して指定レベルの権限を持つかチェック
   */
  public static async hasPermission(
    userType: UserType,
    feature: FinanceFeature,
    requiredLevel: PermissionLevel
  ): Promise<boolean> {
    return await authorizationServiceInstance.hasPermission(userType, feature, requiredLevel);
  }

  /**
   * 現在のユーザーが指定機能へのアクセス権限を持つかチェック
   */
  public static async authorize(
    feature: FinanceFeature,
    requiredLevel: PermissionLevel
  ): Promise<boolean> {
    return await authorizationServiceInstance.authorize(feature, requiredLevel);
  }
}
