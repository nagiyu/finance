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
  private static readonly CACHE_TTL = 300; // 5分（秒単位）
  
  // インメモリキャッシュ
  private static cachedMatrix: PermissionMatrix | null = null;
  private static cacheTimestamp: number | null = null;

  /**
   * 権限マトリックスを取得
   * DBに存在しない場合はデフォルトマトリックスを返す
   * キャッシュを使用してパフォーマンスを向上
   */
  public static async getPermissionMatrix(): Promise<PermissionMatrix> {
    // キャッシュが有効な場合はキャッシュから返す
    if (this.isCacheValid()) {
      return this.cachedMatrix!;
    }

    // DBから取得
    const dataAccessor = new PermissionMatrixDataAccessor();
    const record = await dataAccessor.getById(this.PERMISSION_MATRIX_ID);
    const matrix = record?.Matrix || this.getDefaultMatrix();
    
    // キャッシュに保存
    this.cachedMatrix = matrix;
    this.cacheTimestamp = Date.now();
    
    return matrix;
  }

  /**
   * キャッシュが有効かチェック
   */
  private static isCacheValid(): boolean {
    if (!this.cachedMatrix || !this.cacheTimestamp) {
      return false;
    }
    
    const now = Date.now();
    const cacheAge = (now - this.cacheTimestamp) / 1000; // ミリ秒を秒に変換
    return cacheAge < this.CACHE_TTL;
  }

  /**
   * キャッシュをクリア
   */
  public static clearCache(): void {
    this.cachedMatrix = null;
    this.cacheTimestamp = null;
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
      });
    } else {
      // 新規レコードを作成
      await dataAccessor.create({
        DataType: 'PermissionMatrix',
        Matrix: matrix,
      });
    }
    
    // 更新後、キャッシュをクリア
    this.clearCache();
  }

  /**
   * 権限マトリックスを削除
   * 注意: 権限チェックは AuthorizationService で行う必要がある
   */
  public static async deletePermissionMatrix(): Promise<void> {
    const dataAccessor = new PermissionMatrixDataAccessor();
    await dataAccessor.delete(this.PERMISSION_MATRIX_ID);
    
    // 削除後、キャッシュをクリア
    this.clearCache();
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
