import { AuthorizationServiceBase } from '@common/services/authorization/AuthorizationServiceBase';
import { BadRequestError } from '@common/errors';
import { PermissionLevel } from '@common/enums/PermissionLevel';
import { PermissionMatrix } from '@common/interfaces/authorization/PermissionMatrix';
import { UserType } from '@common/enums/UserType';

import { FinanceFeature } from '@finance/consts/FinanceConst';

/**
 * Finance用の認可サービス
 * typescript-common の AuthorizationServiceBase を継承して実装
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
   * 派生クラスで実装が必要
   * このメソッドは実際の実装クラス（クライアント側またはサーバー側）でオーバーライドされる
   */
  protected async getPermissionMatrix(): Promise<PermissionMatrix<FinanceFeature>> {
    throw new Error('getPermissionMatrix must be implemented by derived class');
  }

  /**
   * ユーザータイプを取得
   * 派生クラスで実装が必要
   * このメソッドは実際の実装クラス（クライアント側またはサーバー側）でオーバーライドされる
   */
  protected async getUserType(): Promise<UserType> {
    throw new Error('getUserType must be implemented by derived class');
  }

  /**
   * ユーザーIDを取得
   * 派生クラスで実装が必要
   * このメソッドは実際の実装クラス（クライアント側またはサーバー側）でオーバーライドされる
   */
  protected async getUserId(): Promise<string | undefined> {
    throw new Error('getUserId must be implemented by derived class');
  }
}
