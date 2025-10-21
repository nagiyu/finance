import { PutItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';

import FinanceDataAccessorBase from '@finance/services/FinanceDataAccessorBase';
import { FINANCE_RECORD_DATA_TYPE } from '@finance/types/FinanceRecordDataType';
import DynamoDBService from '@common/services/aws/DynamoDBService';

import { PermissionMatrixRecordType } from '@/interfaces/records/PermissionMatrixRecordType';

/**
 * 権限マトリックスのデータアクセサー
 */
export default class PermissionMatrixDataAccessor extends FinanceDataAccessorBase<PermissionMatrixRecordType> {
  public constructor() {
    super(FINANCE_RECORD_DATA_TYPE.PERMISSION_MATRIX);
  }

  /**
   * 固定IDで権限マトリックスレコードを作成
   * 通常のcreate()メソッドはIDを自動生成するが、
   * 権限マトリックスは常に "PermissionMatrix" という固定IDを使用する必要がある
   * 
   * @param id 固定ID (通常は "PermissionMatrix")
   * @param record レコードデータ
   * @returns 作成されたレコード
   */
  public async createWithFixedId(
    id: string,
    record: Partial<PermissionMatrixRecordType>
  ): Promise<PermissionMatrixRecordType> {
    const item: PermissionMatrixRecordType = {
      ...record,
      ID: id,
      DataType: FINANCE_RECORD_DATA_TYPE.PERMISSION_MATRIX,
      Create: Date.now(),
      Update: Date.now(),
    } as PermissionMatrixRecordType;

    // 親クラスのDynamoDBServiceにアクセス
    const dynamoDBService = this.getDynamoDBService();
    
    // DynamoDBのPutItemを直接使用
    const dynamoClient = await (dynamoDBService as any).getDynamoClient();
    
    const command = new PutItemCommand({
      TableName: this.getTableName(),
      Item: marshall(item, { removeUndefinedValues: true }),
    });

    await dynamoClient.send(command);
    
    return item;
  }

  /**
   * DynamoDBServiceインスタンスを取得
   * @private
   */
  private getDynamoDBService(): DynamoDBService<PermissionMatrixRecordType> {
    // DataAccessorBaseの内部DynamoDBServiceにアクセス
    return (this as any).DynamoDBService;
  }
}
