import DynamoDBService from '@common/services/aws/DynamoDBService';
import FinanceDataAccessorBase from '@finance/services/FinanceDataAccessorBase';
import { FinanceNotificationRecordType } from '@finance/interfaces/record/FinanceNotificationRecordType';
import { FINANCE_RECORD_DATA_TYPE } from '@finance/types/FinanceRecordDataType';

export default class FinanceNotificationDataAccessor extends FinanceDataAccessorBase<FinanceNotificationRecordType> {
  public constructor(
    dynamoDBService: DynamoDBService<FinanceNotificationRecordType>
      = new DynamoDBService<FinanceNotificationRecordType>(FinanceDataAccessorBase.getFinanceTableName())
  ) {
    super(FINANCE_RECORD_DATA_TYPE.FINANCE_NOTIFICATION, dynamoDBService);
  }
}
