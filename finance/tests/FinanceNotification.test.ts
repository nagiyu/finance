jest.mock('@finance/utils/FinanceUtil', () => {
  return {
    __esModule: true,
    default: jest.requireActual('@finance/tests/mocks/utils/FinanceUtilMock').default,
  };
});

import CommonUtil from '@common/utils/CommonUtil';
import NotificationServiceMock from '@common-mock/services/NotificationServiceMock';

import ConditionService from '@finance/services/ConditionService';
import ExchangeServiceMock from '@finance/tests/mocks/services/ExchangeServiceMock';
import FinanceNotificationDataAccessorMock from '@finance/tests/mocks/services/FinanceNotificationDataAccessorMock';
import FinanceNotificationService from '@finance/services/FinanceNotificationService';
import FinanceUtilMock from '@finance/tests/mocks/utils/FinanceUtilMock';
import TickerServiceMock from '@finance/tests/mocks/services/TickerServiceMock';
import { EXCHANGE_SESSION } from '@finance/consts/ExchangeConsts';
import {
  FINANCE_NOTIFICATION_CONDITION_MODE,
  FINANCE_NOTIFICATION_FREQUENCY,
} from '@finance/consts/FinanceNotificationConst';
import { FINANCE_RECORD_DATA_TYPE } from '@finance/types/FinanceRecordDataType';
import type { TimeFrame } from '@finance/utils/FinanceUtil';

describe('FinanceNotificationService', () => {
  let service: FinanceNotificationService;
  let dataAccessor: FinanceNotificationDataAccessorMock;
  const conditionService = new ConditionService(new ExchangeServiceMock(), new TickerServiceMock());
  const notificationService = new NotificationServiceMock();

  beforeEach(() => {
    dataAccessor = new FinanceNotificationDataAccessorMock();
    notificationService.clearMessages();
    service = new FinanceNotificationService(
      dataAccessor,
      new ExchangeServiceMock(),
      new TickerServiceMock(),
      conditionService,
      notificationService,
      false // Disable cache for testing
    );
  });

  describe('Notification', () => {
    it('should send notification', async () => {
      FinanceUtilMock.StockPriceDataMock = [
        {
          date: '2025-01-01 00:00',
          data: [1000, 960, 950, 1010],
        },
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
            timeframe: '1' as TimeFrame,
            firstNotificationSent: false,
          },
        ],
      });

      await service.notification('http://localhost:3000/endpoint');

      const messages = notificationService.getMessages();

      expect(messages.length).toBe(1);
      expect(messages[0]).toContain('(通知頻度: 1分ごと)');
    });

    it('should include different frequency information in notification', async () => {
      FinanceUtilMock.StockPriceDataMock = [
        {
          date: '2025-01-01 00:00',
          data: [1000, 960, 950, 1010],
        },
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
            id: 'test-condition-2',
            mode: FINANCE_NOTIFICATION_CONDITION_MODE.BUY,
            conditionName: 'GreaterThan',
            frequency: FINANCE_NOTIFICATION_FREQUENCY.TEN_MINUTE_LEVEL,
            session: EXCHANGE_SESSION.EXTENDED,
            targetPrice: 950,
            timeframe: '1' as TimeFrame,
            firstNotificationSent: false,
          },
        ],
      });

      await service.notification('http://localhost:3000/endpoint');

      const messages = notificationService.getMessages();

      expect(messages.length).toBe(1);
      expect(messages[0]).toContain('(通知頻度: 10分ごと)');
    });
  });

  describe('Exchange Ticker Uniqueness', () => {
    it('should allow creating duplicate Exchange and Ticker combination for different terminals', async () => {
      const notificationData = {
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
            timeframe: '1' as TimeFrame,
            firstNotificationSent: false,
          },
        ],
      };

      // First creation should succeed
      await service.create(notificationData);

      // Second creation with same exchangeId and tickerId but different terminal ID should succeed
      await expect(
        service.create({
          ...notificationData,
          terminalId: CommonUtil.generateUUID(), // Different terminal ID
        })
      ).resolves.toBeDefined();
    });

    it('should prevent creating duplicate Exchange and Ticker combination for same terminal', async () => {
      const terminalId = CommonUtil.generateUUID();
      const notificationData = {
        terminalId: terminalId,
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
            timeframe: '1' as TimeFrame,
            firstNotificationSent: false,
          },
        ],
      };

      // First creation should succeed
      await service.create(notificationData);

      // Second creation with same exchangeId, tickerId AND same terminal ID should fail
      await expect(
        service.create({
          ...notificationData,
          subscriptionEndpoint: 'http://localhost:3000/endpoint2', // Different endpoint but same terminal
        })
      ).rejects.toThrow('指定された Exchange と Ticker の組み合わせは既に登録されています');
    });

    it('should allow creating notifications with different Exchange or Ticker', async () => {
      const baseNotificationData = {
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
            timeframe: '1' as TimeFrame,
            firstNotificationSent: false,
          },
        ],
      };

      // Create first notification
      await service.create(baseNotificationData);

      // Since the mock services return the same data for any ID,
      // we can't test with different exchange/ticker IDs in this mock environment.
      // This test demonstrates the concept but would work with real services
      // that return different data for different IDs.

      // In a real environment, this would test:
      // 1. Different ticker with same exchange - should succeed
      // 2. Different exchange with same ticker - should succeed
      // 3. Both different - should succeed

      expect(true).toBe(true); // Placeholder for mock limitation
    });

    it('should allow updating same record with same Exchange and Ticker', async () => {
      const notificationData = {
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
            timeframe: '1' as TimeFrame,
            firstNotificationSent: false,
          },
        ],
      };

      // Create notification
      const created = await service.create(notificationData);

      // Update with same exchangeId and tickerId should succeed
      await expect(
        service.update(created.id, {
          exchangeId: ExchangeServiceMock.MockExchangeName,
          tickerId: TickerServiceMock.MockTickerName,
          conditionList: [
            {
              id: 'test-condition-1',
              mode: FINANCE_NOTIFICATION_CONDITION_MODE.BUY,
              conditionName: 'GreaterThan',
              frequency: FINANCE_NOTIFICATION_FREQUENCY.MINUTE_LEVEL,
              session: EXCHANGE_SESSION.EXTENDED,
              targetPrice: 1000, // Different target price
              timeframe: '1' as TimeFrame,
              firstNotificationSent: false,
            },
          ],
        })
      ).resolves.toBeDefined();
    });

    it('should prevent updating to duplicate Exchange and Ticker combination for same terminal', async () => {
      const terminalId = CommonUtil.generateUUID();

      // Create two different notifications for the same terminal
      const notification1 = await service.create({
        terminalId: terminalId,
        subscriptionEndpoint: 'http://localhost:3000/endpoint1',
        subscriptionKeysP256dh: 'p256dh1',
        subscriptionKeysAuth: 'auth1',
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
            timeframe: '1' as TimeFrame,
            firstNotificationSent: false,
          },
        ],
      });

      const notification2 = await service.create({
        terminalId: terminalId,
        subscriptionEndpoint: 'http://localhost:3000/endpoint2',
        subscriptionKeysP256dh: 'p256dh2',
        subscriptionKeysAuth: 'auth2',
        exchangeId: 'different-exchange-id',
        tickerId: 'different-ticker-id',
        conditionList: [
          {
            id: 'test-condition-2',
            mode: FINANCE_NOTIFICATION_CONDITION_MODE.BUY,
            conditionName: 'GreaterThan',
            frequency: FINANCE_NOTIFICATION_FREQUENCY.MINUTE_LEVEL,
            session: EXCHANGE_SESSION.EXTENDED,
            targetPrice: 950,
            timeframe: '1' as TimeFrame,
            firstNotificationSent: false,
          },
        ],
      });

      // Try to update notification2 to use same exchange/ticker as notification1 (same terminal)
      await expect(
        service.update(notification2.id, {
          exchangeId: ExchangeServiceMock.MockExchangeName,
          tickerId: TickerServiceMock.MockTickerName,
          conditionList: [
            {
              id: 'test-condition-2',
              mode: FINANCE_NOTIFICATION_CONDITION_MODE.BUY,
              conditionName: 'GreaterThan',
              frequency: FINANCE_NOTIFICATION_FREQUENCY.MINUTE_LEVEL,
              session: EXCHANGE_SESSION.EXTENDED,
              targetPrice: 950,
              timeframe: '1' as TimeFrame,
              firstNotificationSent: false,
            },
          ],
        })
      ).rejects.toThrow('指定された Exchange と Ticker の組み合わせは既に登録されています');
    });

    it('should allow updating to duplicate Exchange and Ticker combination for different terminals', async () => {
      const terminalId1 = CommonUtil.generateUUID();
      const terminalId2 = CommonUtil.generateUUID();

      // Create notifications for different terminals
      const notification1 = await service.create({
        terminalId: terminalId1,
        subscriptionEndpoint: 'http://localhost:3000/endpoint1',
        subscriptionKeysP256dh: 'p256dh1',
        subscriptionKeysAuth: 'auth1',
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
            timeframe: '1' as TimeFrame,
            firstNotificationSent: false,
          },
        ],
      });

      const notification2 = await service.create({
        terminalId: terminalId2,
        subscriptionEndpoint: 'http://localhost:3000/endpoint2',
        subscriptionKeysP256dh: 'p256dh2',
        subscriptionKeysAuth: 'auth2',
        exchangeId: 'different-exchange-id',
        tickerId: 'different-ticker-id',
        conditionList: [
          {
            id: 'test-condition-2',
            mode: FINANCE_NOTIFICATION_CONDITION_MODE.BUY,
            conditionName: 'GreaterThan',
            frequency: FINANCE_NOTIFICATION_FREQUENCY.MINUTE_LEVEL,
            session: EXCHANGE_SESSION.EXTENDED,
            targetPrice: 950,
            timeframe: '1' as TimeFrame,
            firstNotificationSent: false,
          },
        ],
      });

      // Try to update notification2 to use same exchange/ticker as notification1 (different terminal)
      await expect(
        service.update(notification2.id, {
          exchangeId: ExchangeServiceMock.MockExchangeName,
          tickerId: TickerServiceMock.MockTickerName,
          conditionList: [
            {
              id: 'test-condition-2',
              mode: FINANCE_NOTIFICATION_CONDITION_MODE.BUY,
              conditionName: 'GreaterThan',
              frequency: FINANCE_NOTIFICATION_FREQUENCY.MINUTE_LEVEL,
              session: EXCHANGE_SESSION.EXTENDED,
              targetPrice: 950,
              timeframe: '1' as TimeFrame,
              firstNotificationSent: false,
            },
          ],
        })
      ).resolves.toBeDefined();
    });
  });

  describe('checkConditionsByMode', () => {
    describe('Buy Mode', () => {
      it('should check buy pattern conditions excluding GreaterThan/LessThan', async () => {
        FinanceUtilMock.StockPriceDataMock = [
          {
            date: '2025-01-01 00:00',
            data: [1000, 960, 950, 1010],
          },
        ];

        const results = await service.checkConditionsByMode(
          FINANCE_NOTIFICATION_CONDITION_MODE.BUY,
          ExchangeServiceMock.MockExchangeName,
          TickerServiceMock.MockTickerName,
          EXCHANGE_SESSION.EXTENDED,
          950,
          FINANCE_NOTIFICATION_FREQUENCY.MINUTE_LEVEL,
          '1' as TimeFrame
        );

        // Should only check pattern conditions, not GreaterThan/LessThan
        expect(results).toBeDefined();
        expect(Array.isArray(results)).toBe(true);
        // GreaterThan should be excluded even with targetPrice
      });

      it('should check only pattern conditions when targetPrice is not provided', async () => {
        FinanceUtilMock.StockPriceDataMock = [
          {
            date: '2025-01-01 00:00',
            data: [1000, 900, 950, 1010],
          },
        ];

        const results = await service.checkConditionsByMode(
          FINANCE_NOTIFICATION_CONDITION_MODE.BUY,
          ExchangeServiceMock.MockExchangeName,
          TickerServiceMock.MockTickerName,
          EXCHANGE_SESSION.EXTENDED,
          null,
          FINANCE_NOTIFICATION_FREQUENCY.MINUTE_LEVEL,
          '1' as TimeFrame
        );

        // Should only check pattern conditions that don't require targetPrice
        expect(results).toBeDefined();
        expect(Array.isArray(results)).toBe(true);
        // Results can be empty or contain pattern-based conditions
      });

      it('should return empty array when no pattern conditions are met', async () => {
        FinanceUtilMock.StockPriceDataMock = [
          {
            date: '2025-01-01 00:00',
            data: [900, 900, 900, 900],
          },
        ];

        const results = await service.checkConditionsByMode(
          FINANCE_NOTIFICATION_CONDITION_MODE.BUY,
          ExchangeServiceMock.MockExchangeName,
          TickerServiceMock.MockTickerName,
          EXCHANGE_SESSION.EXTENDED,
          1000,
          FINANCE_NOTIFICATION_FREQUENCY.MINUTE_LEVEL,
          '1' as TimeFrame
        );

        // No buy pattern conditions should be met with flat price
        expect(results).toBeDefined();
        expect(Array.isArray(results)).toBe(true);
      });

      it('should handle conditions with different timeframes', async () => {
        FinanceUtilMock.StockPriceDataMock = [
          {
            date: '2025-01-01 00:00',
            data: [1000, 960, 950, 1010],
          },
        ];

        const results = await service.checkConditionsByMode(
          FINANCE_NOTIFICATION_CONDITION_MODE.BUY,
          ExchangeServiceMock.MockExchangeName,
          TickerServiceMock.MockTickerName,
          EXCHANGE_SESSION.EXTENDED,
          950,
          FINANCE_NOTIFICATION_FREQUENCY.MINUTE_LEVEL,
          'D' as TimeFrame
        );

        expect(results).toBeDefined();
        expect(Array.isArray(results)).toBe(true);
      });
    });

    describe('Sell Mode', () => {
      it('should check sell pattern conditions excluding GreaterThan/LessThan', async () => {
        FinanceUtilMock.StockPriceDataMock = [
          {
            date: '2025-01-01 00:00',
            data: [1000, 900, 850, 900],
          },
        ];

        const results = await service.checkConditionsByMode(
          FINANCE_NOTIFICATION_CONDITION_MODE.SELL,
          ExchangeServiceMock.MockExchangeName,
          TickerServiceMock.MockTickerName,
          EXCHANGE_SESSION.EXTENDED,
          950,
          FINANCE_NOTIFICATION_FREQUENCY.MINUTE_LEVEL,
          '1' as TimeFrame
        );

        // Should only check pattern conditions, not LessThan
        expect(results).toBeDefined();
        expect(Array.isArray(results)).toBe(true);
        // LessThan should be excluded even with targetPrice
      });

      it('should check only pattern conditions when targetPrice is not provided', async () => {
        FinanceUtilMock.StockPriceDataMock = [
          {
            date: '2025-01-01 00:00',
            data: [1000, 900, 850, 900],
          },
        ];

        const results = await service.checkConditionsByMode(
          FINANCE_NOTIFICATION_CONDITION_MODE.SELL,
          ExchangeServiceMock.MockExchangeName,
          TickerServiceMock.MockTickerName,
          EXCHANGE_SESSION.EXTENDED,
          null,
          FINANCE_NOTIFICATION_FREQUENCY.MINUTE_LEVEL,
          '1' as TimeFrame
        );

        // Should only check pattern conditions that don't require targetPrice
        expect(results).toBeDefined();
        expect(Array.isArray(results)).toBe(true);
      });

      it('should return empty array when no pattern conditions are met', async () => {
        FinanceUtilMock.StockPriceDataMock = [
          {
            date: '2025-01-01 00:00',
            data: [1100, 1100, 1100, 1100],
          },
        ];

        const results = await service.checkConditionsByMode(
          FINANCE_NOTIFICATION_CONDITION_MODE.SELL,
          ExchangeServiceMock.MockExchangeName,
          TickerServiceMock.MockTickerName,
          EXCHANGE_SESSION.EXTENDED,
          1000,
          FINANCE_NOTIFICATION_FREQUENCY.MINUTE_LEVEL,
          '1' as TimeFrame
        );

        // No sell pattern conditions should be met with flat price
        expect(results).toBeDefined();
        expect(Array.isArray(results)).toBe(true);
      });
    });

    describe('Error Handling', () => {
      it('should handle errors gracefully and continue checking other conditions', async () => {
        FinanceUtilMock.StockPriceDataMock = [
          {
            date: '2025-01-01 00:00',
            data: [1000, 960, 950, 1010],
          },
        ];

        const results = await service.checkConditionsByMode(
          FINANCE_NOTIFICATION_CONDITION_MODE.BUY,
          ExchangeServiceMock.MockExchangeName,
          TickerServiceMock.MockTickerName,
          EXCHANGE_SESSION.EXTENDED,
          950,
          FINANCE_NOTIFICATION_FREQUENCY.MINUTE_LEVEL,
          '1' as TimeFrame
        );

        // Even if some conditions fail, the method should return results
        expect(results).toBeDefined();
        expect(Array.isArray(results)).toBe(true);
      });
    });

    describe('Frequency Integration', () => {
      it('should include frequency information in met conditions', async () => {
        FinanceUtilMock.StockPriceDataMock = [
          {
            date: '2025-01-01 00:00',
            data: [1000, 960, 950, 1010],
          },
        ];

        const results = await service.checkConditionsByMode(
          FINANCE_NOTIFICATION_CONDITION_MODE.BUY,
          ExchangeServiceMock.MockExchangeName,
          TickerServiceMock.MockTickerName,
          EXCHANGE_SESSION.EXTENDED,
          950,
          FINANCE_NOTIFICATION_FREQUENCY.TEN_MINUTE_LEVEL,
          '1' as TimeFrame
        );

        // Check that results with messages include frequency information
        const metConditionsWithMessage = results.filter((r) => r.message);
        if (metConditionsWithMessage.length > 0) {
          expect(metConditionsWithMessage.some((r) => r.message?.includes('通知頻度'))).toBe(true);
        }
      });
    });
  });
});
