import AuthService from '@common/services/auth/AuthService';

import AuthUtil from '@client-common/auth/AuthUtil';

import { FinanceAuthDataType } from '@/interfaces/data/FinanceAuthDataType';
import { FinanceAuthRecordType } from '@/interfaces/records/FinanceAuthRecordType';
import PermissionMatrixService from '@/services/auth/PermissionMatrixService';
import {
  Feature,
  PermissionLevel,
  UserType,
} from '@/types/AuthorizationTypes';

/**
 * Finance用の認証サービス
 */
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
 * 汎用認可サービス
 * 機能とレベルに基づいた権限チェックを提供
 */
export default class AuthorizationService {
  /**
   * 権限レベルの階層
   * NONE < VIEW < EDIT < DELETE < ADMIN
   */
  private static readonly PERMISSION_HIERARCHY = [
    PermissionLevel.NONE,
    PermissionLevel.VIEW,
    PermissionLevel.EDIT,
    PermissionLevel.DELETE,
    PermissionLevel.ADMIN,
  ];

  /**
   * セッションからユーザータイプを取得
   * 
   * @returns ユーザータイプ
   */
  public static async getUserType(): Promise<UserType> {
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
   * ユーザーが指定された機能に対して指定レベルの権限を持つかチェック
   * 
   * @param userType ユーザータイプ
   * @param feature 機能
   * @param requiredLevel 必要な権限レベル
   * @returns 権限がある場合true
   */
  public static async hasPermission(
    userType: UserType,
    feature: Feature,
    requiredLevel: PermissionLevel
  ): Promise<boolean> {
    try {
      // データベースから権限マトリックスを取得
      const permissionMatrix = await PermissionMatrixService.getPermissionMatrix();
      const userPermission = permissionMatrix[feature]?.[userType] || PermissionLevel.NONE;
      return this.comparePermissionLevel(userPermission, requiredLevel);
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  }

  /**
   * 現在のユーザーが指定機能へのアクセス権限を持つかチェック
   * 
   * @param feature 機能
   * @param requiredLevel 必要な権限レベル
   * @returns 権限がある場合true
   */
  public static async authorize(
    feature: Feature,
    requiredLevel: PermissionLevel
  ): Promise<boolean> {
    const userType = await this.getUserType();
    return this.hasPermission(userType, feature, requiredLevel);
  }

  /**
   * 権限レベルの比較（階層を考慮）
   * 
   * @param userLevel ユーザーが持つ権限レベル
   * @param requiredLevel 必要な権限レベル
   * @returns ユーザーレベルが必要レベル以上の場合true
   */
  private static comparePermissionLevel(
    userLevel: PermissionLevel,
    requiredLevel: PermissionLevel
  ): boolean {
    const userLevelIndex = this.PERMISSION_HIERARCHY.indexOf(userLevel);
    const requiredLevelIndex = this.PERMISSION_HIERARCHY.indexOf(requiredLevel);

    if (userLevelIndex === -1 || requiredLevelIndex === -1) {
      return false;
    }

    return userLevelIndex >= requiredLevelIndex;
  }
}
