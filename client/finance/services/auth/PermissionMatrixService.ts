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
  private static readonly PERMISSION_MATRIX_DATA_TYPE = 'PermissionMatrix';

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
   * 権限マトリックスを更新または作成
   * 注意: 権限チェックは AuthorizationService で行う必要がある
   * 
   * @param matrix 新しい権限マトリックス
   */
  public static async updatePermissionMatrix(
    matrix: PermissionMatrix
  ): Promise<void> {
    const dataAccessor = new PermissionMatrixDataAccessor();
    
    // 既存のレコードを確認
    const existingRecord = await dataAccessor.getById(this.PERMISSION_MATRIX_ID);
    
    if (existingRecord) {
      // 既存レコードを更新
      await dataAccessor.update(this.PERMISSION_MATRIX_ID, {
        Matrix: matrix,
      });
    } else {
      // 新規レコードの場合、DynamoDB PutItemを使用して初期化
      await this.initializePermissionMatrix(matrix);
    }
  }

  /**
   * 権限マトリックスを初期化する
   * create()はIDを自動生成するため、直接DynamoDB PutItemを使用
   * 
   * @param matrix 初期権限マトリックス
   */
  private static async initializePermissionMatrix(matrix: PermissionMatrix): Promise<void> {
    const { DynamoDBClient, PutItemCommand } = await import('@aws-sdk/client-dynamodb');
    const { marshall } = await import('@aws-sdk/util-dynamodb');
    const SecretsManagerUtil = (await import('@common/aws/SecretsManagerUtil')).default;
    
    const tableName = this.getFinanceTableName();
    const item = {
      ID: this.PERMISSION_MATRIX_ID,
      DataType: this.PERMISSION_MATRIX_DATA_TYPE,
      Matrix: matrix,
      Create: Date.now(),
      Update: Date.now(),
    };
    
    // DynamoDBクライアントを作成
    const secretName = process.env.PROJECT_SECRET!;
    let dynamoClient: DynamoDBClient;
    
    if (process.env.PROCESS_ENV !== 'local') {
      // 本番環境: IAMロールを使用
      const region = await SecretsManagerUtil.getSecretValue(secretName, 'AWS_REGION');
      dynamoClient = new DynamoDBClient({ region });
    } else {
      // ローカル環境: 環境変数の認証情報を使用
      dynamoClient = new DynamoDBClient({
        region: process.env.PROJECT_AWS_REGION || 'ap-northeast-1',
        credentials: {
          accessKeyId: process.env.PROJECT_AWS_ACCESS_KEY!,
          secretAccessKey: process.env.PROJECT_AWS_SECRET_ACCESS_KEY!,
        },
      });
    }
    
    const command = new PutItemCommand({
      TableName: tableName,
      Item: marshall(item, { removeUndefinedValues: true }),
    });
    
    await dynamoClient.send(command);
  }

  /**
   * Financeテーブル名を取得
   */
  private static getFinanceTableName(): string {
    const processEnv = process.env.PROCESS_ENV;
    switch (processEnv) {
      case 'local':
      case 'development':
        return 'DevFinance';
      case 'production':
        return 'Finance';
      default:
        return 'DevFinance';
    }
  }

  /**
   * 権限マトリックスを削除
   * 注意: 権限チェックは AuthorizationService で行う必要がある
   */
  public static async deletePermissionMatrix(): Promise<void> {
    const dataAccessor = new PermissionMatrixDataAccessor();
    await dataAccessor.delete(this.PERMISSION_MATRIX_ID);
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
