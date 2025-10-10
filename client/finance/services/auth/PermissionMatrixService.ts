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
  private static readonly PERMISSION_MATRIX_ID = 'PermissionMatrix';

  /**
   * 権限マトリックスを取得
   * DBに存在しない場合はデフォルトマトリックスを返す
   */
  public static async getPermissionMatrix(): Promise<PermissionMatrix> {
    const dataAccessor = new PermissionMatrixDataAccessor();
    const record = await dataAccessor.getById(this.PERMISSION_MATRIX_ID);
    return record?.Matrix || this.getDefaultMatrix();
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
    
    const existingRecord = await dataAccessor.getById(this.PERMISSION_MATRIX_ID);
    
    if (existingRecord) {
      // 既存レコードを更新
      await dataAccessor.update(this.PERMISSION_MATRIX_ID, {
        Matrix: matrix,
        Update: Date.now(),
      });
    } else {
      // 新規レコードを作成
      await dataAccessor.create({
        Id: this.PERMISSION_MATRIX_ID,
        DataType: 'PermissionMatrix',
        Matrix: matrix,
        Create: Date.now(),
        Update: Date.now(),
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
