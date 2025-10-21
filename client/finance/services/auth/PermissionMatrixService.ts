import PermissionMatrixDataAccessor from '@finance/services/PermissionMatrixDataAccessor';

import {
  Feature,
  PermissionLevel,
  PermissionMatrix,
  UserType,
} from '@/types/AuthorizationTypes';

/**
 * 権限マトリックス管理サービス
 * データベースから権限マトリックスを取得・更新
 */
export default class PermissionMatrixService {
  /**
   * 権限マトリックスを取得
   * DBに存在しない場合はデフォルトマトリックスを返す
   */
  public static async getPermissionMatrix(): Promise<PermissionMatrix> {
    const dataAccessor = new PermissionMatrixDataAccessor();
    const records = await dataAccessor.get();

    if (records.length === 0) {
      return this.getDefaultMatrix();
    }

    return records[0].Matrix;
  }

  /**
   * 権限マトリックスを更新
   * 注意: 権限チェックは AuthorizationService で行う必要がある
   * 
   * @param matrix 新しい権限マトリックス
   */
  public static async updatePermissionMatrix(
    matrix: PermissionMatrix
  ): Promise<void> {
    const dataAccessor = new PermissionMatrixDataAccessor();

    const records = await dataAccessor.get();

    if (records.length === 0) {
      await dataAccessor.create({
        DataType: 'PermissionMatrix',
        Matrix: matrix,
      });
    } else {
      const record = records[0];

      await dataAccessor.update(record.ID, {
        Matrix: matrix,
      });
    }
  }

  /**
   * デフォルトの権限マトリックス
   * 既存の権限設定との互換性を保つ
   */
  private static getDefaultMatrix(): PermissionMatrix {
    return {
      [Feature.EXCHANGE]: {
        [UserType.GUEST]: PermissionLevel.NONE,
        [UserType.AUTHENTICATED]: PermissionLevel.VIEW,
        [UserType.PREMIUM]: PermissionLevel.VIEW,
        [UserType.ADMIN]: PermissionLevel.ADMIN,
      },
      [Feature.TICKER]: {
        [UserType.GUEST]: PermissionLevel.NONE,
        [UserType.AUTHENTICATED]: PermissionLevel.VIEW,
        [UserType.PREMIUM]: PermissionLevel.VIEW,
        [UserType.ADMIN]: PermissionLevel.ADMIN,
      },
      [Feature.MY_TICKER]: {
        [UserType.GUEST]: PermissionLevel.NONE,
        [UserType.AUTHENTICATED]: PermissionLevel.EDIT,
        [UserType.PREMIUM]: PermissionLevel.EDIT,
        [UserType.ADMIN]: PermissionLevel.ADMIN,
      },
      [Feature.FINANCE_NOTIFICATION]: {
        [UserType.GUEST]: PermissionLevel.NONE,
        [UserType.AUTHENTICATED]: PermissionLevel.EDIT,
        [UserType.PREMIUM]: PermissionLevel.EDIT,
        [UserType.ADMIN]: PermissionLevel.ADMIN,
      },
      [Feature.STOCK_CHART]: {
        [UserType.GUEST]: PermissionLevel.NONE,
        [UserType.AUTHENTICATED]: PermissionLevel.VIEW,
        [UserType.PREMIUM]: PermissionLevel.VIEW,
        [UserType.ADMIN]: PermissionLevel.ADMIN,
      },
      [Feature.TARGET_PRICE]: {
        [UserType.GUEST]: PermissionLevel.NONE,
        [UserType.AUTHENTICATED]: PermissionLevel.VIEW,
        [UserType.PREMIUM]: PermissionLevel.VIEW,
        [UserType.ADMIN]: PermissionLevel.ADMIN,
      },
      [Feature.PERMISSION_ADMIN]: {
        [UserType.GUEST]: PermissionLevel.NONE,
        [UserType.AUTHENTICATED]: PermissionLevel.NONE,
        [UserType.PREMIUM]: PermissionLevel.NONE,
        [UserType.ADMIN]: PermissionLevel.ADMIN,
      },
    };
  }
}
