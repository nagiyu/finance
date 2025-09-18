/**
 * Test to verify that condition deletions are properly preserved 
 * during notification processing
 */

jest.mock('@finance/utils/FinanceUtil', () => {
  return {
    __esModule: true,
    default: require('@finance/tests/mocks/utils/FinanceUtilMock').default
  };
});

import ConditionService from '@finance/services/ConditionService';
import ExchangeServiceMock from '@finance/tests/mocks/services/ExchangeServiceMock';
import FinanceNotificationDataAccessorMock from '@finance/tests/mocks/services/FinanceNotificationDataAccessorMock';
import FinanceNotificationService from '../services/FinanceNotificationService';
import FinanceUtilMock from '@finance/tests/mocks/utils/FinanceUtilMock';
import TickerServiceMock from '@finance/tests/mocks/services/TickerServiceMock';

// Mock NotificationService
const mockNotificationService = {
  sendPushNotification: jest.fn()
};

describe('FinanceNotificationService - Condition Deletion Fix', () => {
  let service: FinanceNotificationService;
  let superGetByIdSpy: jest.SpyInstance;
  let superUpdateSpy: jest.SpyInstance;
  const dataAccessor = new FinanceNotificationDataAccessorMock();
  const exchangeService = new ExchangeServiceMock();
  const tickerService = new TickerServiceMock();
  const conditionService = new ConditionService(exchangeService, tickerService);

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock stock price data  
    FinanceUtilMock.StockPriceDataMock = [
      {
        date: '2025-01-01 00:00',
        data: [1000, 960, 950, 1010]
      }
    ];

    service = new FinanceNotificationService(
      dataAccessor,
      exchangeService,
      tickerService,
      conditionService,
      mockNotificationService as any
    );

    // Mock the base class methods
    jest.spyOn(service, 'get').mockImplementation(jest.fn());
    superGetByIdSpy = jest.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(service)), 'getById').mockImplementation(jest.fn());
    superUpdateSpy = jest.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(service)), 'update').mockImplementation(jest.fn());

    // Mock the time-related private methods to ensure conditions are always checked
    jest.spyOn(service as any, 'isWithinExchangeHours').mockReturnValue(true);
    jest.spyOn(service as any, 'isExchangeStartTime').mockReturnValue(true);
  });

  it('should preserve condition deletions during notification processing', async () => {
    // Setup: Original notification with 2 conditions
    const originalNotification = {
      id: 'notification-1',
      terminalId: 'terminal-1',
      subscriptionEndpoint: 'https://example.com/endpoint',
      subscriptionKeysP256dh: 'test-p256dh',
      subscriptionKeysAuth: 'test-auth',
      exchangeId: 'exchange-1',
      tickerId: 'ticker-1',
      conditionList: [
        {
          id: 'condition-1',
          mode: 'Buy' as any,
          conditionName: 'GreaterThan',
          frequency: 'ExchangeStartOnly' as any,
          session: 'extended' as any,
          targetPrice: 100,
          firstNotificationSent: false
        },
        {
          id: 'condition-2',
          mode: 'Sell' as any,
          conditionName: 'LessThan',
          frequency: 'ExchangeStartOnly' as any,
          session: 'extended' as any,
          targetPrice: 50,
          firstNotificationSent: false
        }
      ],
      create: Date.now(),
      update: Date.now()
    };

    // Setup: Latest notification with condition-1 deleted by user
    const latestNotification = {
      ...originalNotification,
      conditionList: [
        {
          id: 'condition-2',
          mode: 'Sell' as any,
          conditionName: 'LessThan',
          frequency: 'ExchangeStartOnly' as any,
          session: 'extended' as any,
          targetPrice: 50,
          firstNotificationSent: false
        }
      ]
    };

    // Mock the service methods
    (service.get as jest.Mock).mockResolvedValue([originalNotification]);
    superGetByIdSpy.mockResolvedValue(latestNotification);
    superUpdateSpy.mockResolvedValue(latestNotification);

    // Execute the notification method
    await service.notification('https://example.com/endpoint');

    // Verify that update was called with the latest condition list (preserving deletion)
    expect(superUpdateSpy).toHaveBeenCalledWith(
      'notification-1',
      {
        conditionList: [
          {
            id: 'condition-2',
            mode: 'Sell',
            conditionName: 'LessThan',
            frequency: 'ExchangeStartOnly',
            session: 'extended',
            targetPrice: 50,
            firstNotificationSent: true // This should be updated to true
          }
        ]
      }
    );

    // Verify getById was called to get latest data
    expect(superGetByIdSpy).toHaveBeenCalledWith('notification-1');
  });

  it('should handle empty condition list after all conditions are deleted', async () => {
    // Setup: Original notification with conditions
    const originalNotification = {
      id: 'notification-1',
      terminalId: 'terminal-1',
      subscriptionEndpoint: 'https://example.com/endpoint',
      subscriptionKeysP256dh: 'test-p256dh',
      subscriptionKeysAuth: 'test-auth',
      exchangeId: 'exchange-1',
      tickerId: 'ticker-1',
      conditionList: [
        {
          id: 'condition-1',
          mode: 'Buy' as any,
          conditionName: 'GreaterThan',
          frequency: 'ExchangeStartOnly' as any,
          session: 'extended' as any,
          targetPrice: 100,
          firstNotificationSent: false
        }
      ],
      create: Date.now(),
      update: Date.now()
    };

    // Setup: All conditions deleted by user
    const latestNotification = {
      ...originalNotification,
      conditionList: []
    };

    // Mock the service methods
    (service.get as jest.Mock).mockResolvedValue([originalNotification]);
    superGetByIdSpy.mockResolvedValue(latestNotification);
    superUpdateSpy.mockResolvedValue(latestNotification);

    // Execute the notification method
    await service.notification('https://example.com/endpoint');

    // Verify that update was called with empty condition list
    expect(superUpdateSpy).toHaveBeenCalledWith(
      'notification-1',
      {
        conditionList: []
      }
    );
  });

  it('should skip update when no conditions need firstNotificationSent flag update', async () => {
    // Setup: Notification where all conditions already have firstNotificationSent = true
    const originalNotification = {
      id: 'notification-1',
      terminalId: 'terminal-1',
      subscriptionEndpoint: 'https://example.com/endpoint',
      subscriptionKeysP256dh: 'test-p256dh',
      subscriptionKeysAuth: 'test-auth',
      exchangeId: 'exchange-1',
      tickerId: 'ticker-1',
      conditionList: [
        {
          id: 'condition-1',
          mode: 'Buy' as any,
          conditionName: 'GreaterThan',
          frequency: 'ExchangeStartOnly' as any,
          session: 'extended' as any,
          targetPrice: 100,
          firstNotificationSent: true // Already sent
        }
      ],
      create: Date.now(),
      update: Date.now()
    };

    // Mock the service methods
    (service.get as jest.Mock).mockResolvedValue([originalNotification]);

    // Execute the notification method
    await service.notification('https://example.com/endpoint');

    // Verify that update was not called since no conditions need updating
    expect(superUpdateSpy).not.toHaveBeenCalled();
    expect(superGetByIdSpy).not.toHaveBeenCalled();
  });
});