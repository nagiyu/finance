jest.mock('@finance/utils/FinanceUtil', () => {
  return {
    __esModule: true,
    default: require('@finance/tests/mocks/utils/FinanceUtilMock').default
  };
});

import CommonUtil from '@common/utils/CommonUtil';
import NotificationServiceMock from '@common/tests/mock/services/NotificationServiceMock';

import ConditionService from '@finance/services/ConditionService';
import ExchangeServiceMock from '@finance/tests/mocks/services/ExchangeServiceMock';
import FinanceNotificationDataAccessorMock from '@finance/tests/mocks/services/FinanceNotificationDataAccessorMock';
import FinanceNotificationService from '@finance/services/FinanceNotificationService';
import FinanceUtilMock from '@finance/tests/mocks/utils/FinanceUtilMock';
import TickerServiceMock from '@finance/tests/mocks/services/TickerServiceMock';
import { EXCHANGE_SESSION } from '@finance/consts/ExchangeConsts';
import { FINANCE_NOTIFICATION_CONDITION_MODE, FINANCE_NOTIFICATION_FREQUENCY } from '@finance/consts/FinanceNotificationConst';
import { FINANCE_RECORD_DATA_TYPE } from '@finance/types/FinanceRecordDataType';

describe('FinanceNotificationService', () => {
  let service: FinanceNotificationService;
  const dataAccessor = new FinanceNotificationDataAccessorMock();
  const conditionService = new ConditionService(
    new ExchangeServiceMock(),
    new TickerServiceMock()
  );
  const notificationService = new NotificationServiceMock();

  beforeEach(() => {
    service = new FinanceNotificationService(
      dataAccessor,
      new ExchangeServiceMock(),
      new TickerServiceMock(),
      conditionService,
      notificationService
    );
  });

  describe('Notification', () => {
    it('should send notification', async () => {
      FinanceUtilMock.StockPriceDataMock = [
        {
          date: '2025-01-01 00:00',
          data: [1000, 960, 950, 1010]
        }
      ];

      await service.create({
        terminalId: CommonUtil.generateUUID(),
        subscriptionEndpoint: 'http://localhost:3000/endpoint',
        subscriptionKeysP256dh: 'p256dh',
        subscriptionKeysAuth: 'auth',
        exchangeId: ExchangeServiceMock.MockExchangeName,
        tickerId: TickerServiceMock.MockTickerName,
        conditionList: [
          {
            id: 'test-condition-1',
            mode: FINANCE_NOTIFICATION_CONDITION_MODE.BUY,
            conditionName: 'GreaterThan',
            frequency: FINANCE_NOTIFICATION_FREQUENCY.MINUTE_LEVEL,
            session: EXCHANGE_SESSION.EXTENDED,
            targetPrice: 950,
            firstNotificationSent: false
          }
        ]
      });

      await service.notification('http://localhost:3000/endpoint');

      const messages = notificationService.getMessages();

      expect(messages.length).toBe(1);
    });
  });
});
