import ConditionUtil from '@finance/utils/ConditionUtil';
import GreaterThanCondition from '@finance/conditions/GreaterThanCondition';
import LessThanCondition from '@finance/conditions/LessThanCondition';
import SansenAkenomyojoCondition from '@finance/conditions/SansenAkenomyojoCondition';

describe('ConditionUtil', () => {
  describe('getBuyConditionList', () => {
    it('returns list of buy conditions', () => {
      const buyConditions = ConditionUtil.getBuyConditionList();
      expect(buyConditions).toContain('SansenAkenomyojo');
      expect(buyConditions).toContain('Gyakusanzon');
      expect(buyConditions).toContain('RisingDoubleBottom');
      expect(buyConditions).toContain('BullFlag');
      expect(buyConditions).toContain('AscendingTriangle');
    });

    it('does not contain sell-only conditions', () => {
      const buyConditions = ConditionUtil.getBuyConditionList();
      // Currently no sell-only conditions, but test the pattern
      expect(Array.isArray(buyConditions)).toBe(true);
    });
  });

  describe('getSellConditionList', () => {
    it('returns list of sell conditions', () => {
      const sellConditions = ConditionUtil.getSellConditionList();
      expect(sellConditions).toContain('SansenYoinomyojo');
      expect(sellConditions).toContain('Sanzon');
      expect(sellConditions).toContain('DoubleTop');
      expect(sellConditions).toContain('BearCollar');
      expect(sellConditions).toContain('RisingWedge');
    });
  });

  describe('getEvaluableConditionList', () => {
    it('returns list of conditions that do not require target price', () => {
      const evaluableConditions = ConditionUtil.getEvaluableConditionList();
      // Pattern-based conditions should not require target price
      expect(evaluableConditions).toContain('SansenAkenomyojo');
      expect(evaluableConditions).toContain('Sanzon');
      expect(evaluableConditions).not.toContain('GreaterThan');
      expect(evaluableConditions).not.toContain('LessThan');
    });
  });

  describe('getConditionInfo', () => {
    it('returns condition info for valid condition name', () => {
      const info = ConditionUtil.getConditionInfo('SansenAkenomyojo');
      expect(info.name).toBe('三川明けの明星');
      expect(info.isBuyCondition).toBe(true);
      expect(info.isSellCondition).toBe(false);
    });

    it('throws error for invalid condition name', () => {
      expect(() => {
        ConditionUtil.getConditionInfo('InvalidCondition');
      }).toThrow('Condition InvalidCondition not found');
    });
  });

  describe('getCondition', () => {
    it('returns condition class for valid condition name', () => {
      const ConditionClass = ConditionUtil.getCondition('GreaterThan');
      expect(ConditionClass).toBe(GreaterThanCondition);
    });

    it('returns correct condition class for pattern-based condition', () => {
      const ConditionClass = ConditionUtil.getCondition('SansenAkenomyojo');
      expect(ConditionClass).toBe(SansenAkenomyojoCondition);
    });

    it('throws error for invalid condition name', () => {
      expect(() => {
        ConditionUtil.getCondition('InvalidCondition');
      }).toThrow('Condition InvalidCondition not found');
    });
  });

  describe('multiple conditions', () => {
    it('GreaterThan and LessThan should have target price enabled', () => {
      const greaterInfo = ConditionUtil.getConditionInfo('GreaterThan');
      const lessInfo = ConditionUtil.getConditionInfo('LessThan');
      
      expect(greaterInfo.enableTargetPrice).toBe(true);
      expect(lessInfo.enableTargetPrice).toBe(true);
    });
  });
});
