jest.mock('@finance/utils/FinanceUtil', () => {
  return {
    __esModule: true,
    default: require('@finance/tests/mocks/utils/FinanceUtilMock').default
  };
});

import ConditionService from '@finance/services/ConditionService';
import ExchangeServiceMock from '@finance/tests/mocks/services/ExchangeServiceMock';
import FinanceUtilMock from '@finance/tests/mocks/utils/FinanceUtilMock';
import BullFlagCondition from '@finance/conditions/BullFlagCondition';
import TickerServiceMock from '@finance/tests/mocks/services/TickerServiceMock';
import { EXCHANGE_SESSION } from '@finance/consts/ExchangeConsts';

describe('BullFlagCondition', () => {
  let service: ConditionService;
  const conditionKey = 'BullFlag';

  beforeEach(() => {
    service = new ConditionService(
      new ExchangeServiceMock(),
      new TickerServiceMock()
    );
  });

  describe('ブルフラッグ', () => {
    it('Contains in Buy Condition List', () => {
      const conditionList = service.getBuyConditionList();
      expect(conditionList).toContain(conditionKey);
    });

    it('Not Contains in Sell Condition List', () => {
      const conditionList = service.getSellConditionList();
      expect(conditionList).not.toContain(conditionKey);
    });

    it('Get Condition Info', () => {
      const info = service.getConditionInfo(conditionKey);
      expect(info.name).toBe('ブルフラッグ');
      expect(info.description).not.toBe('');
      expect(info.isBuyCondition).toBe(true);
      expect(info.isSellCondition).toBe(false);
      expect(info.enableTargetPrice).toBe(false);
      expect(info.enableTimeFrame).toBe(true);
    });

    it('Get Condition', () => {
      const ConditionClass = service.getCondition(conditionKey);
      expect(ConditionClass).toBe(BullFlagCondition);
    });

    it('Check Condition - Perfect Bull Flag Pattern', async () => {
      // Bull flag pattern: flagpole (1000->1300) + flag (consolidation) + breakout
      FinanceUtilMock.StockPriceDataMock = [
        // Earlier data for context
        { date: '2025-01-01 00:00', data: [980, 990, 975, 995] },
        { date: '2025-01-02 00:00', data: [990, 985, 980, 1000] },
        
        // Flagpole: Strong upward movement (1000 -> 1300, ~30% gain)
        { date: '2025-01-03 00:00', data: [1000, 1050, 995, 1055] }, // Start of flagpole
        { date: '2025-01-04 00:00', data: [1050, 1120, 1045, 1125] },
        { date: '2025-01-05 00:00', data: [1120, 1200, 1115, 1205] },
        { date: '2025-01-06 00:00', data: [1200, 1280, 1195, 1285] },
        { date: '2025-01-07 00:00', data: [1280, 1300, 1275, 1305] }, // End of flagpole
        
        // Flag: Small consolidation/pullback (1300 -> 1270)
        { date: '2025-01-08 00:00', data: [1300, 1290, 1285, 1305] },
        { date: '2025-01-09 00:00', data: [1290, 1280, 1275, 1295] },
        { date: '2025-01-10 00:00', data: [1280, 1275, 1270, 1285] },
        { date: '2025-01-11 00:00', data: [1275, 1270, 1265, 1280] }, // Flag low
        { date: '2025-01-12 00:00', data: [1270, 1275, 1268, 1280] },
        
        // Breakout: Price breaks above flag resistance
        { date: '2025-01-13 00:00', data: [1275, 1320, 1275, 1325] }, // Breakout candle
        { date: '2025-01-14 00:00', data: [1320, 1350, 1315, 1355] }, // Continuation
      ];

      const result = await service.checkCondition(conditionKey, 'MOCK_EXCHANGE', 'MOCK_TICKER', EXCHANGE_SESSION.EXTENDED);
      expect(result.met).toBe(true);
    });

    it('Check Condition - No Bull Flag (No Flagpole)', async () => {
      // Sideways movement without strong flagpole
      FinanceUtilMock.StockPriceDataMock = [
        { date: '2025-01-01 00:00', data: [1000, 1005, 995, 1010] },
        { date: '2025-01-02 00:00', data: [1005, 1000, 995, 1015] },
        { date: '2025-01-03 00:00', data: [1000, 1010, 995, 1020] },
        { date: '2025-01-04 00:00', data: [1010, 1005, 1000, 1015] },
        { date: '2025-01-05 00:00', data: [1005, 1015, 1000, 1020] },
        { date: '2025-01-06 00:00', data: [1015, 1010, 1005, 1025] },
        { date: '2025-01-07 00:00', data: [1010, 1020, 1005, 1025] },
        { date: '2025-01-08 00:00', data: [1020, 1015, 1010, 1030] },
        { date: '2025-01-09 00:00', data: [1015, 1025, 1010, 1030] },
        { date: '2025-01-10 00:00', data: [1025, 1020, 1015, 1035] },
      ];

      const result = await service.checkCondition(conditionKey, 'MOCK_EXCHANGE', 'MOCK_TICKER', EXCHANGE_SESSION.EXTENDED);
      expect(result.met).toBe(false);
    });

    it('Check Condition - No Bull Flag (Flagpole but No Flag)', async () => {
      // Strong upward movement but continues without consolidation
      FinanceUtilMock.StockPriceDataMock = [
        { date: '2025-01-01 00:00', data: [1000, 1050, 995, 1055] },
        { date: '2025-01-02 00:00', data: [1050, 1120, 1045, 1125] },
        { date: '2025-01-03 00:00', data: [1120, 1200, 1115, 1205] },
        { date: '2025-01-04 00:00', data: [1200, 1280, 1195, 1285] },
        { date: '2025-01-05 00:00', data: [1280, 1300, 1275, 1305] },
        // No flag formation - continues upward
        { date: '2025-01-06 00:00', data: [1300, 1350, 1295, 1355] },
        { date: '2025-01-07 00:00', data: [1350, 1400, 1345, 1405] },
        { date: '2025-01-08 00:00', data: [1400, 1450, 1395, 1455] },
        { date: '2025-01-09 00:00', data: [1450, 1500, 1445, 1505] },
        { date: '2025-01-10 00:00', data: [1500, 1550, 1495, 1555] },
      ];

      const result = await service.checkCondition(conditionKey, 'MOCK_EXCHANGE', 'MOCK_TICKER', EXCHANGE_SESSION.EXTENDED);
      expect(result.met).toBe(false);
    });

    it('Check Condition - No Bull Flag (Flag but No Breakout)', async () => {
      // Has flagpole and flag but no breakout yet
      FinanceUtilMock.StockPriceDataMock = [
        // Flagpole
        { date: '2025-01-01 00:00', data: [1000, 1050, 995, 1055] },
        { date: '2025-01-02 00:00', data: [1050, 1120, 1045, 1125] },
        { date: '2025-01-03 00:00', data: [1120, 1200, 1115, 1205] },
        { date: '2025-01-04 00:00', data: [1200, 1280, 1195, 1285] },
        { date: '2025-01-05 00:00', data: [1280, 1300, 1275, 1305] },
        
        // Flag formation
        { date: '2025-01-06 00:00', data: [1300, 1290, 1285, 1305] },
        { date: '2025-01-07 00:00', data: [1290, 1280, 1275, 1295] },
        { date: '2025-01-08 00:00', data: [1280, 1275, 1270, 1285] },
        { date: '2025-01-09 00:00', data: [1275, 1270, 1265, 1280] },
        
        // Still in flag - no breakout
        { date: '2025-01-10 00:00', data: [1270, 1280, 1265, 1285] },
        { date: '2025-01-11 00:00', data: [1280, 1275, 1270, 1290] },
      ];

      const result = await service.checkCondition(conditionKey, 'MOCK_EXCHANGE', 'MOCK_TICKER', EXCHANGE_SESSION.EXTENDED);
      expect(result.met).toBe(false);
    });

    it('Check Condition - No Bull Flag (Insufficient Data)', async () => {
      // Not enough data to form a complete pattern
      FinanceUtilMock.StockPriceDataMock = [
        { date: '2025-01-01 00:00', data: [1000, 1050, 995, 1055] },
        { date: '2025-01-02 00:00', data: [1050, 1120, 1045, 1125] },
        { date: '2025-01-03 00:00', data: [1120, 1200, 1115, 1205] },
      ];

      const result = await service.checkCondition(conditionKey, 'MOCK_EXCHANGE', 'MOCK_TICKER', EXCHANGE_SESSION.EXTENDED);
      expect(result.met).toBe(false);
    });

    it('Check Condition - Weak Bull Flag (Small Flagpole)', async () => {
      // Flagpole doesn't meet minimum gain requirement
      FinanceUtilMock.StockPriceDataMock = [
        // Small flagpole (~2% gain, below 3% threshold)
        { date: '2025-01-01 00:00', data: [1000, 1010, 995, 1015] },
        { date: '2025-01-02 00:00', data: [1010, 1015, 1005, 1020] },
        { date: '2025-01-03 00:00', data: [1015, 1020, 1010, 1025] },
        
        // Flag formation
        { date: '2025-01-04 00:00', data: [1020, 1018, 1015, 1025] },
        { date: '2025-01-05 00:00', data: [1018, 1016, 1012, 1022] },
        { date: '2025-01-06 00:00', data: [1016, 1014, 1010, 1020] },
        
        // Breakout
        { date: '2025-01-07 00:00', data: [1014, 1030, 1014, 1035] },
        { date: '2025-01-08 00:00', data: [1030, 1040, 1025, 1045] },
      ];

      const result = await service.checkCondition(conditionKey, 'MOCK_EXCHANGE', 'MOCK_TICKER', EXCHANGE_SESSION.EXTENDED);
      expect(result.met).toBe(false);
    });

    it('Check Condition - Bull Flag with Different Timeframe', async () => {
      // Test pattern recognition with smaller price movements (simulating different timeframe)
      FinanceUtilMock.StockPriceDataMock = [
        // Flagpole: 100.0 -> 105.0 (5% gain)
        { date: '2025-01-01 00:00', data: [100.0, 101.5, 99.8, 102.0] },
        { date: '2025-01-02 00:00', data: [101.5, 103.2, 101.0, 103.8] },
        { date: '2025-01-03 00:00', data: [103.2, 104.8, 102.9, 105.2] },
        { date: '2025-01-04 00:00', data: [104.8, 105.0, 104.5, 105.5] },
        
        // Flag: slight pullback and consolidation
        { date: '2025-01-05 00:00', data: [105.0, 104.5, 104.0, 105.2] },
        { date: '2025-01-06 00:00', data: [104.5, 104.2, 103.8, 104.8] },
        { date: '2025-01-07 00:00', data: [104.2, 104.0, 103.6, 104.5] },
        { date: '2025-01-08 00:00', data: [104.0, 104.3, 103.8, 104.6] },
        
        // Breakout
        { date: '2025-01-09 00:00', data: [104.3, 106.0, 104.3, 106.2] },
        { date: '2025-01-10 00:00', data: [106.0, 107.5, 105.8, 107.8] },
      ];

      const result = await service.checkCondition(conditionKey, 'MOCK_EXCHANGE', 'MOCK_TICKER', EXCHANGE_SESSION.EXTENDED);
      expect(result.met).toBe(true);
    });
  });
});