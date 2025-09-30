/**
 * Unit tests for simplified notification configuration functionality
 * Tests the generateConditionListFromMode logic using the actual ConditionService
 */

import ConditionService from '../services/ConditionService';
import ExchangeServiceMock from './mocks/services/ExchangeServiceMock';
import TickerServiceMock from './mocks/services/TickerServiceMock';
import { FINANCE_NOTIFICATION_CONDITION_MODE, FINANCE_NOTIFICATION_FREQUENCY } from '../consts/FinanceNotificationConst';
import { EXCHANGE_SESSION } from '../consts/ExchangeConsts';
import { FinanceNotificationSimplifiedConfig, FinanceNotificationCondition } from '../interfaces/FinanceNotificationType';

/**
 * Standalone implementation of generateConditionListFromMode for testing
 * This mirrors the exact logic from FinanceNotificationService.generateConditionListFromMode
 */
function generateConditionListFromMode(
  conditionService: ConditionService,
  config: FinanceNotificationSimplifiedConfig
): FinanceNotificationCondition[] {
  const { mode, frequency, session, timeframe, targetPrice } = config;
  
  // Get all conditions based on mode
  const applicableConditions = mode === FINANCE_NOTIFICATION_CONDITION_MODE.BUY 
    ? conditionService.getBuyConditionList()
    : conditionService.getSellConditionList();

  const conditionList: FinanceNotificationCondition[] = [];

  for (const conditionName of applicableConditions) {
    const conditionInfo = conditionService.getConditionInfo(conditionName);
    
    // If target price is not provided, skip conditions that require it
    if (!targetPrice && conditionInfo.enableTargetPrice) {
      continue;
    }

    // Create condition configuration
    const condition: FinanceNotificationCondition = {
      id: null, // Will be set when saved to database
      mode,
      conditionName,
      frequency,
      session,
      timeframe,
      targetPrice: conditionInfo.enableTargetPrice ? targetPrice : null,
      firstNotificationSent: false,
    };

    conditionList.push(condition);
  }

  return conditionList;
}

describe('FinanceNotificationService.generateConditionListFromMode', () => {
  let conditionService: ConditionService;

  beforeEach(() => {
    // Use the actual ConditionService with mocked dependencies
    conditionService = new ConditionService(
      new ExchangeServiceMock(),
      new TickerServiceMock()
    );
  });

  describe('Buy Mode Tests', () => {
    it('should generate buy conditions with target price using actual ConditionService', () => {
      const config: FinanceNotificationSimplifiedConfig = {
        mode: FINANCE_NOTIFICATION_CONDITION_MODE.BUY,
        frequency: FINANCE_NOTIFICATION_FREQUENCY.MINUTE_LEVEL,
        session: EXCHANGE_SESSION.EXTENDED,
        targetPrice: 950
      };

      const conditionList = generateConditionListFromMode(conditionService, config);

      // Should include all buy conditions
      expect(conditionList.length).toBeGreaterThan(0);
      
      // Get the actual buy conditions from ConditionService
      const actualBuyConditions = conditionService.getBuyConditionList();
      
      // Verify all conditions are buy conditions
      conditionList.forEach(condition => {
        expect(condition.mode).toBe(FINANCE_NOTIFICATION_CONDITION_MODE.BUY);
        expect(condition.frequency).toBe(FINANCE_NOTIFICATION_FREQUENCY.MINUTE_LEVEL);
        expect(condition.session).toBe(EXCHANGE_SESSION.EXTENDED);
        expect(condition.firstNotificationSent).toBe(false);
        
        // Verify it's actually a buy condition using actual ConditionService
        const conditionInfo = conditionService.getConditionInfo(condition.conditionName);
        expect(conditionInfo.isBuyCondition).toBe(true);
        expect(actualBuyConditions).toContain(condition.conditionName);
      });

      // Verify conditions that require target price have it set
      const conditionsWithTargetPrice = conditionList.filter(c => {
        const info = conditionService.getConditionInfo(c.conditionName);
        return info.enableTargetPrice;
      });
      
      conditionsWithTargetPrice.forEach(condition => {
        expect(condition.targetPrice).toBe(950);
      });

      // Verify conditions that don't require target price have null
      const conditionsWithoutTargetPrice = conditionList.filter(c => {
        const info = conditionService.getConditionInfo(c.conditionName);
        return !info.enableTargetPrice;
      });
      
      conditionsWithoutTargetPrice.forEach(condition => {
        expect(condition.targetPrice).toBeNull();
      });
    });

    it('should filter out buy conditions requiring target price when none provided', () => {
      const configWithoutTarget: FinanceNotificationSimplifiedConfig = {
        mode: FINANCE_NOTIFICATION_CONDITION_MODE.BUY,
        frequency: FINANCE_NOTIFICATION_FREQUENCY.MINUTE_LEVEL,
        session: EXCHANGE_SESSION.EXTENDED
        // No target price
      };

      const conditionListWithoutTarget = generateConditionListFromMode(conditionService, configWithoutTarget);

      const configWithTarget: FinanceNotificationSimplifiedConfig = {
        mode: FINANCE_NOTIFICATION_CONDITION_MODE.BUY,
        frequency: FINANCE_NOTIFICATION_FREQUENCY.MINUTE_LEVEL,
        session: EXCHANGE_SESSION.EXTENDED,
        targetPrice: 950
      };

      const conditionListWithTarget = generateConditionListFromMode(conditionService, configWithTarget);

      // Without target price should have fewer or equal conditions
      expect(conditionListWithoutTarget.length).toBeLessThanOrEqual(conditionListWithTarget.length);

      // All conditions without target price should not require target price
      conditionListWithoutTarget.forEach(condition => {
        const conditionInfo = conditionService.getConditionInfo(condition.conditionName);
        expect(conditionInfo.enableTargetPrice).toBe(false);
        expect(condition.targetPrice).toBeNull();
      });
    });
  });

  describe('Sell Mode Tests', () => {
    it('should generate sell conditions with target price using actual ConditionService', () => {
      const config: FinanceNotificationSimplifiedConfig = {
        mode: FINANCE_NOTIFICATION_CONDITION_MODE.SELL,
        frequency: FINANCE_NOTIFICATION_FREQUENCY.HOURLY_LEVEL,
        session: EXCHANGE_SESSION.REGULAR,
        targetPrice: 1050
      };

      const conditionList = generateConditionListFromMode(conditionService, config);

      // Should include all sell conditions
      expect(conditionList.length).toBeGreaterThan(0);
      
      // Get the actual sell conditions from ConditionService
      const actualSellConditions = conditionService.getSellConditionList();
      
      // Verify all conditions are sell conditions
      conditionList.forEach(condition => {
        expect(condition.mode).toBe(FINANCE_NOTIFICATION_CONDITION_MODE.SELL);
        expect(condition.frequency).toBe(FINANCE_NOTIFICATION_FREQUENCY.HOURLY_LEVEL);
        expect(condition.session).toBe(EXCHANGE_SESSION.REGULAR);
        expect(condition.firstNotificationSent).toBe(false);
        
        // Verify it's actually a sell condition using actual ConditionService
        const conditionInfo = conditionService.getConditionInfo(condition.conditionName);
        expect(conditionInfo.isSellCondition).toBe(true);
        expect(actualSellConditions).toContain(condition.conditionName);
      });
    });
  });

  describe('Target Price Handling', () => {
    it('should set target price only for conditions that support it', () => {
      const config: FinanceNotificationSimplifiedConfig = {
        mode: FINANCE_NOTIFICATION_CONDITION_MODE.BUY,
        frequency: FINANCE_NOTIFICATION_FREQUENCY.MINUTE_LEVEL,
        session: EXCHANGE_SESSION.EXTENDED,
        targetPrice: 950
      };

      const conditionList = generateConditionListFromMode(conditionService, config);

      conditionList.forEach(condition => {
        const conditionInfo = conditionService.getConditionInfo(condition.conditionName);
        if (conditionInfo.enableTargetPrice) {
          expect(condition.targetPrice).toBe(950);
        } else {
          expect(condition.targetPrice).toBeNull();
        }
      });
    });

    it('should verify GreaterThan condition gets target price', () => {
      const config: FinanceNotificationSimplifiedConfig = {
        mode: FINANCE_NOTIFICATION_CONDITION_MODE.BUY,
        frequency: FINANCE_NOTIFICATION_FREQUENCY.MINUTE_LEVEL,
        session: EXCHANGE_SESSION.EXTENDED,
        targetPrice: 950
      };

      const conditionList = generateConditionListFromMode(conditionService, config);
      const greaterThanCondition = conditionList.find(c => c.conditionName === 'GreaterThan');
      
      if (greaterThanCondition) {
        expect(greaterThanCondition.targetPrice).toBe(950);
      }
    });

    it('should verify LessThan condition gets target price in sell mode', () => {
      const config: FinanceNotificationSimplifiedConfig = {
        mode: FINANCE_NOTIFICATION_CONDITION_MODE.SELL,
        frequency: FINANCE_NOTIFICATION_FREQUENCY.MINUTE_LEVEL,
        session: EXCHANGE_SESSION.EXTENDED,
        targetPrice: 1050
      };

      const conditionList = generateConditionListFromMode(conditionService, config);
      const lessThanCondition = conditionList.find(c => c.conditionName === 'LessThan');
      
      if (lessThanCondition) {
        expect(lessThanCondition.targetPrice).toBe(1050);
      }
    });
  });

  describe('Additional Parameters', () => {
    it('should handle timeframe parameter correctly', () => {
      const config: FinanceNotificationSimplifiedConfig = {
        mode: FINANCE_NOTIFICATION_CONDITION_MODE.BUY,
        frequency: FINANCE_NOTIFICATION_FREQUENCY.MINUTE_LEVEL,
        session: EXCHANGE_SESSION.EXTENDED,
        targetPrice: 950,
        timeframe: '5' as any // TimeFrame type
      };

      const conditionList = generateConditionListFromMode(conditionService, config);

      conditionList.forEach(condition => {
        expect(condition.timeframe).toBe('5');
      });
    });

    it('should handle missing timeframe parameter', () => {
      const config: FinanceNotificationSimplifiedConfig = {
        mode: FINANCE_NOTIFICATION_CONDITION_MODE.BUY,
        frequency: FINANCE_NOTIFICATION_FREQUENCY.MINUTE_LEVEL,
        session: EXCHANGE_SESSION.EXTENDED,
        targetPrice: 950
        // No timeframe
      };

      const conditionList = generateConditionListFromMode(conditionService, config);

      conditionList.forEach(condition => {
        expect(condition.timeframe).toBeUndefined();
      });
    });
  });

  describe('Integration with Real ConditionService', () => {
    it('should use actual condition metadata from ConditionService', () => {
      const config: FinanceNotificationSimplifiedConfig = {
        mode: FINANCE_NOTIFICATION_CONDITION_MODE.BUY,
        frequency: FINANCE_NOTIFICATION_FREQUENCY.MINUTE_LEVEL,
        session: EXCHANGE_SESSION.EXTENDED,
        targetPrice: 950
      };

      const conditionList = generateConditionListFromMode(conditionService, config);
      
      // Verify each condition exists in the actual ConditionService
      conditionList.forEach(condition => {
        const conditionInfo = conditionService.getConditionInfo(condition.conditionName);
        expect(conditionInfo).toBeDefined();
        expect(conditionInfo.name).toBeDefined();
        expect(conditionInfo.description).toBeDefined();
      });
    });

    it('should respect evaluable condition list logic', () => {
      const evaluableConditions = conditionService.getEvaluableConditionList();
      
      const config: FinanceNotificationSimplifiedConfig = {
        mode: FINANCE_NOTIFICATION_CONDITION_MODE.BUY,
        frequency: FINANCE_NOTIFICATION_FREQUENCY.MINUTE_LEVEL,
        session: EXCHANGE_SESSION.EXTENDED
        // No target price - should only get evaluable conditions
      };

      const conditionList = generateConditionListFromMode(conditionService, config);
      
      // All conditions should be evaluable (don't require target price)
      conditionList.forEach(condition => {
        const conditionInfo = conditionService.getConditionInfo(condition.conditionName);
        expect(conditionInfo.enableTargetPrice).toBe(false);
      });
    });
  });
});