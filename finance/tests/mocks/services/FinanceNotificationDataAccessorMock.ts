import DynamoDBServiceMock from '@common-mock/tests/mock/services/aws/DynamoDBServiceMock';

import FinanceNotificationDataAccessor from '@finance/services/FinanceNotificationDataAccessor';
import FinanceDataAccessorBase from '@finance/services/FinanceDataAccessorBase';
import { FinanceNotificationRecordType } from '@finance/interfaces/record/FinanceNotificationRecordType';

export default class FinanceNotificationDataAccessorMock extends FinanceNotificationDataAccessor {
  private dynamoDBServiceMock: DynamoDBServiceMock<FinanceNotificationRecordType>;

  public constructor() {
    const dynamoDBServiceMock = new DynamoDBServiceMock<FinanceNotificationRecordType>('TestFinance');
    super(dynamoDBServiceMock);
    this.dynamoDBServiceMock = dynamoDBServiceMock;
  }

  public getService(): DynamoDBServiceMock<FinanceNotificationRecordType> {
    return this.dynamoDBServiceMock;
  }
}
