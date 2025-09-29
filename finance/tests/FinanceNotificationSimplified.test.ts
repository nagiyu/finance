/**
 * Unit tests for simplified notification configuration functionality
 * This test file focuses on the new business logic without complex dependencies
 */

import { FINANCE_NOTIFICATION_CONDITION_MODE, FINANCE_NOTIFICATION_FREQUENCY } from '../consts/FinanceNotificationConst';
import { EXCHANGE_SESSION } from '../consts/ExchangeConsts';
import { FinanceNotificationSimplifiedConfig } from '../interfaces/FinanceNotificationType';
import { SimplifiedFinanceNotificationService } from './mocks/services/SimplifiedFinanceNotificationService';

describe('FinanceNotificationService - Simplified Configuration', () => {
  let service: SimplifiedFinanceNotificationService;

  beforeEach(() => {
    service = new SimplifiedFinanceNotificationService();
  });

  describe('generateConditionListFromMode', () => {
    it('should generate buy conditions with target price', () => {
      const config: FinanceNotificationSimplifiedConfig = {
        mode: FINANCE_NOTIFICATION_CONDITION_MODE.BUY,
        frequency: FINANCE_NOTIFICATION_FREQUENCY.MINUTE_LEVEL,
        session: EXCHANGE_SESSION.EXTENDED,
        targetPrice: 950
      };

      const conditionList = service.generateConditionListFromMode(config);

      expect(conditionList.length).toBe(3); // All 3 buy conditions should be included
      
      // Verify all conditions are buy conditions
      conditionList.forEach(condition => {
        expect(condition.mode).toBe(FINANCE_NOTIFICATION_CONDITION_MODE.BUY);
        expect(condition.frequency).toBe(FINANCE_NOTIFICATION_FREQUENCY.MINUTE_LEVEL);
        expect(condition.session).toBe(EXCHANGE_SESSION.EXTENDED);
        expect(condition.firstNotificationSent).toBe(false);
      });

      // Check specific conditions
      const greaterThanCondition = conditionList.find(c => c.conditionName === 'GreaterThan');
      expect(greaterThanCondition).toBeDefined();
      expect(greaterThanCondition.targetPrice).toBe(950);

      const patternCondition = conditionList.find(c => c.conditionName === 'SansenAkenomyojo');
      expect(patternCondition).toBeDefined();
      expect(patternCondition.targetPrice).toBeNull();
    });

    it('should generate sell conditions with target price', () => {
      const config: FinanceNotificationSimplifiedConfig = {
        mode: FINANCE_NOTIFICATION_CONDITION_MODE.SELL,
        frequency: FINANCE_NOTIFICATION_FREQUENCY.HOURLY_LEVEL,
        session: EXCHANGE_SESSION.REGULAR,
        targetPrice: 1050
      };

      const conditionList = service.generateConditionListFromMode(config);

      expect(conditionList.length).toBe(3); // All 3 sell conditions should be included
      
      // Verify all conditions are sell conditions
      conditionList.forEach(condition => {
        expect(condition.mode).toBe(FINANCE_NOTIFICATION_CONDITION_MODE.SELL);
        expect(condition.frequency).toBe(FINANCE_NOTIFICATION_FREQUENCY.HOURLY_LEVEL);
        expect(condition.session).toBe(EXCHANGE_SESSION.REGULAR);
        expect(condition.firstNotificationSent).toBe(false);
      });

      // Check specific conditions
      const lessThanCondition = conditionList.find(c => c.conditionName === 'LessThan');
      expect(lessThanCondition).toBeDefined();
      expect(lessThanCondition.targetPrice).toBe(1050);

      const patternCondition = conditionList.find(c => c.conditionName === 'DoubleTop');
      expect(patternCondition).toBeDefined();
      expect(patternCondition.targetPrice).toBeNull();
    });

    it('should filter out conditions requiring target price when none provided', () => {
      const configWithoutTarget: FinanceNotificationSimplifiedConfig = {
        mode: FINANCE_NOTIFICATION_CONDITION_MODE.BUY,
        frequency: FINANCE_NOTIFICATION_FREQUENCY.MINUTE_LEVEL,
        session: EXCHANGE_SESSION.EXTENDED
        // No target price
      };

      const conditionListWithoutTarget = service.generateConditionListFromMode(configWithoutTarget);

      const configWithTarget: FinanceNotificationSimplifiedConfig = {
        mode: FINANCE_NOTIFICATION_CONDITION_MODE.BUY,
        frequency: FINANCE_NOTIFICATION_FREQUENCY.MINUTE_LEVEL,
        session: EXCHANGE_SESSION.EXTENDED,
        targetPrice: 950
      };

      const conditionListWithTarget = service.generateConditionListFromMode(configWithTarget);

      // Without target price should have fewer conditions (only pattern-based)
      expect(conditionListWithoutTarget.length).toBe(2); // Only SansenAkenomyojo and GyakusanZon
      expect(conditionListWithTarget.length).toBe(3); // All 3 conditions

      // All conditions without target price should not require target price
      conditionListWithoutTarget.forEach(condition => {
        expect(condition.targetPrice).toBeNull();
        expect(['SansenAkenomyojo', 'GyakusanZon']).toContain(condition.conditionName);
      });
    });

    it('should set target price only for conditions that support it', () => {
      const config: FinanceNotificationSimplifiedConfig = {
        mode: FINANCE_NOTIFICATION_CONDITION_MODE.BUY,
        frequency: FINANCE_NOTIFICATION_FREQUENCY.MINUTE_LEVEL,
        session: EXCHANGE_SESSION.EXTENDED,
        targetPrice: 950
      };

      const conditionList = service.generateConditionListFromMode(config);

      conditionList.forEach(condition => {
        if (condition.conditionName === 'GreaterThan') {
          expect(condition.targetPrice).toBe(950);
        } else {
          // Pattern conditions should have null target price
          expect(condition.targetPrice).toBeNull();
        }
      });
    });

    it('should handle timeframe parameter correctly', () => {
      const config: FinanceNotificationSimplifiedConfig = {
        mode: FINANCE_NOTIFICATION_CONDITION_MODE.BUY,
        frequency: FINANCE_NOTIFICATION_FREQUENCY.MINUTE_LEVEL,
        session: EXCHANGE_SESSION.EXTENDED,
        targetPrice: 950,
        timeframe: '5' as any // TimeFrame type
      };

      const conditionList = service.generateConditionListFromMode(config);

      conditionList.forEach(condition => {
        expect(condition.timeframe).toBe('5');
      });
    });
  });
});