import { AuthorizationServiceBase } from '@common/services/authorization/AuthorizationServiceBase';
import { BadRequestError } from '@common/errors';
import { PermissionLevel } from '@common/enums/PermissionLevel';
import { PermissionMatrix } from '@common/interfaces/authorization/PermissionMatrix';
import { UserType } from '@common/enums/UserType';

import SessionUtil from '@client-common/utils/SessionUtil.server';

import FinanceAuthService from '@finance/services/FinanceAuthService';
import { FinanceAuthDataType } from '@finance/interfaces/data/FinanceAuthDataType';
import { FinanceFeature } from '@finance/consts/FinanceConst';

import PermissionMatrixService from '@/services/auth/PermissionMatrixService';

const financeAuthService = new FinanceAuthService();

/**
 * Finance用の認可サービス
 */
export class FinanceAuthorizationService extends AuthorizationServiceBase<FinanceFeature> {
  /**
   * 入力の検証
   * Feature と PermissionLevel の妥当性をチェック
   */
  public override validate(feature: FinanceFeature, level: PermissionLevel): void {
    super.validate(feature, level);

    if (!feature || !Object.values(FinanceFeature).includes(feature as FinanceFeature)) {
      throw new BadRequestError('Invalid feature');
    }
  }

  /**
   * 権限マトリックスを取得
   */
  protected async getPermissionMatrix(): Promise<PermissionMatrix<FinanceFeature>> {
    return await PermissionMatrixService.getPermissionMatrix();
  }

  /**
   * ユーザータイプを取得
   */
  protected async getUserType(): Promise<UserType> {
    const user = await this.getUser();

    if (!user) {
      return UserType.GUEST;
    }

    return user.finance;
  }

  /**
   * ユーザーIDを取得
   */
  protected async getUserId(): Promise<string | undefined> {
    const user = await this.getUser();

    if (!user) {
      return undefined;
    }

    return user.id;
  }

  /**
   * ユーザー情報を取得
   * @returns ユーザー情報、存在しない場合は null
   */
  protected async getUser(): Promise<FinanceAuthDataType | null> {
    const session = await SessionUtil.getSession();

    if (!session) {
      return null;
    }

    const googleUserId = await SessionUtil.getGoogleUserIdFromSession(session);

    if (!googleUserId) {
      return null;
    }

    return await financeAuthService.getByGoogleUserId(googleUserId);
  }
}
