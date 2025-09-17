import DynamoDBServiceMock from '@common/tests/mock/services/aws/DynamoDBServiceMock';

import FinanceNotificationDataAccessor from '@finance/services/FinanceNotificationDataAccessor';
import { FinanceNotificationRecordType } from '@finance/interfaces/record/FinanceNotificationRecordType';

export default class FinanceNotificationDataAccessorMock extends FinanceNotificationDataAccessor {
  public constructor() {
    super(new DynamoDBServiceMock(FinanceNotificationDataAccessorMock.getFinanceTableName()));
  }
}
