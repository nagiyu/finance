/**
 * Test to verify that condition deletions are properly preserved 
 * during notification processing
 */

import FinanceNotificationService from '../services/FinanceNotificationService';

// Mock the dependencies
const mockDataAccessor = {
  getById: jest.fn(),
  update: jest.fn(),
  get: jest.fn()
};

const mockExchangeService = {
  getById: jest.fn().mockResolvedValue({
    id: 'exchange-1',
    key: 'NASDAQ',
    name: 'NASDAQ',
    start: { hour: 9, minute: 30 },
    end: { hour: 16, minute: 0 }
  })
};

const mockTickerService = {
  getById: jest.fn().mockResolvedValue({
    id: 'ticker-1',
    key: 'AAPL',
    name: 'Apple Inc.'
  })
};

const mockConditionService = {
  checkCondition: jest.fn().mockResolvedValue({ met: false, message: '' })
};

const mockNotificationService = {
  sendPushNotification: jest.fn()
};

describe('FinanceNotificationService - Condition Deletion Fix', () => {
  let service: FinanceNotificationService;

  beforeEach(() => {
    jest.clearAllMocks();
    
    service = new FinanceNotificationService(
      mockDataAccessor as any,
      mockExchangeService as any,
      mockTickerService as any,
      mockConditionService as any,
      mockNotificationService as any
    );

    // Mock the base class methods
    (service as any).get = jest.fn();
    (service as any).getById = jest.fn();
    (service as any).update = jest.fn();
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
          frequency: 'MinuteLevel' as any,
          session: 'extended' as any,
          targetPrice: 100,
          firstNotificationSent: false
        },
        {
          id: 'condition-2',
          mode: 'Sell' as any,
          conditionName: 'LessThan',
          frequency: 'MinuteLevel' as any,
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
          frequency: 'MinuteLevel' as any,
          session: 'extended' as any,
          targetPrice: 50,
          firstNotificationSent: false
        }
      ]
    };

    // Mock the service methods
    (service as any).get.mockResolvedValue([originalNotification]);
    (service as any).getById.mockResolvedValue(latestNotification);
    (service as any).update.mockResolvedValue(latestNotification);

    // Execute the notification method
    await service.notification('https://example.com/endpoint');

    // Verify that update was called with the latest condition list (preserving deletion)
    expect((service as any).update).toHaveBeenCalledWith(
      'notification-1',
      {
        conditionList: [
          {
            id: 'condition-2',
            mode: 'Sell',
            conditionName: 'LessThan',
            frequency: 'MinuteLevel',
            session: 'extended',
            targetPrice: 50,
            firstNotificationSent: true // This should be updated to true
          }
        ]
      }
    );

    // Verify getById was called to get latest data
    expect((service as any).getById).toHaveBeenCalledWith('notification-1');
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
          frequency: 'MinuteLevel' as any,
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
    (service as any).get.mockResolvedValue([originalNotification]);
    (service as any).getById.mockResolvedValue(latestNotification);
    (service as any).update.mockResolvedValue(latestNotification);

    // Execute the notification method
    await service.notification('https://example.com/endpoint');

    // Verify that update was called with empty condition list
    expect((service as any).update).toHaveBeenCalledWith(
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
          frequency: 'MinuteLevel' as any,
          session: 'extended' as any,
          targetPrice: 100,
          firstNotificationSent: true // Already sent
        }
      ],
      create: Date.now(),
      update: Date.now()
    };

    // Mock the service methods
    (service as any).get.mockResolvedValue([originalNotification]);

    // Execute the notification method
    await service.notification('https://example.com/endpoint');

    // Verify that update was not called since no conditions need updating
    expect((service as any).update).not.toHaveBeenCalled();
    expect((service as any).getById).not.toHaveBeenCalled();
  });
});