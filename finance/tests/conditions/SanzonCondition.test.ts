jest.mock('@finance/utils/FinanceUtil', () => {
  return {
    __esModule: true,
    default: jest.requireActual('@finance/tests/mocks/utils/FinanceUtilMock').default,
  };
});

import ConditionService from '@finance/services/ConditionService';
import ExchangeServiceMock from '@finance/tests/mocks/services/ExchangeServiceMock';
import FinanceUtilMock from '@finance/tests/mocks/utils/FinanceUtilMock';
import SanzonCondition from '@finance/conditions/SanzonCondition';
import TickerServiceMock from '@finance/tests/mocks/services/TickerServiceMock';
import { EXCHANGE_SESSION } from '@finance/consts/ExchangeConsts';

describe('SanzonCondition', () => {
  let service: ConditionService;
  const conditionKey = 'Sanzon';

  beforeEach(() => {
    service = new ConditionService(new ExchangeServiceMock(), new TickerServiceMock());
  });

  describe('三尊', () => {
    it('Not Contains in Buy Condition List', () => {
      const conditionList = service.getBuyConditionList();
      expect(conditionList).not.toContain(conditionKey);
    });

    it('Contains in Sell Condition List', () => {
      const conditionList = service.getSellConditionList();
      expect(conditionList).toContain(conditionKey);
    });

    it('Get Condition Info', () => {
      const info = service.getConditionInfo(conditionKey);
      expect(info.name).toBe('三尊');
      expect(info.description).not.toBe('');
      expect(info.isBuyCondition).toBe(false);
      expect(info.isSellCondition).toBe(true);
    });

    it('Get Condition', () => {
      const ConditionClass = service.getCondition(conditionKey);
      expect(ConditionClass).toBe(SanzonCondition);
    });

    it('Check Condition: 典型的な三尊パターン（完全な形）', async () => {
      // Classic head and shoulders pattern with clear formation and neckline break
      FinanceUtilMock.StockPriceDataMock = [
        // Build up to left shoulder
        { date: '2025-01-01 00:00', data: [1000, 1010, 990, 1020] },
        // Left shoulder peak
        { date: '2025-01-02 00:00', data: [1010, 1030, 1005, 1070] }, // Left shoulder: 1070
        // Valley after left shoulder
        { date: '2025-01-03 00:00', data: [1030, 1020, 1000, 1035] }, // Valley: 1000
        { date: '2025-01-04 00:00', data: [1020, 1025, 1015, 1030] },

        // Head peak (highest)
        { date: '2025-01-05 00:00', data: [1025, 1040, 1020, 1100] }, // Head: 1100 (highest)
        // Valley after head
        { date: '2025-01-06 00:00', data: [1040, 1030, 1005, 1045] }, // Valley: 1005
        { date: '2025-01-07 00:00', data: [1030, 1035, 1025, 1040] },

        // Right shoulder peak (similar to left)
        { date: '2025-01-08 00:00', data: [1035, 1045, 1030, 1075] }, // Right shoulder: 1075 (similar to 1070)
        // Decline from right shoulder
        { date: '2025-01-09 00:00', data: [1045, 1035, 1025, 1050] },
        { date: '2025-01-10 00:00', data: [1035, 1020, 1015, 1040] },

        // Neckline break confirmation (neckline = (1000 + 1005) / 2 = 1002.5)
        { date: '2025-01-11 00:00', data: [1020, 1010, 1000, 1025] },
        { date: '2025-01-12 00:00', data: [1010, 1000, 990, 1015] },
        { date: '2025-01-13 00:00', data: [1000, 995, 985, 1005] }, // Break: close=995 < 1002.5
        { date: '2025-01-14 00:00', data: [995, 980, 975, 1000] }, // Confirmation: close=980 < 1002.5
        { date: '2025-01-15 00:00', data: [980, 970, 965, 985] }, // Confirmation: close=970 < 1002.5
      ];

      const result = await service.checkCondition(
        conditionKey,
        'MOCK_EXCHANGE',
        'MOCK_TICKER',
        EXCHANGE_SESSION.EXTENDED
      );

      expect(result.met).toBe(true);
      expect(result.message).not.toBe('');
    });

    it('Check Condition: 非対称な肩のパターン（無効）', async () => {
      // Invalid pattern: shoulders are too different (asymmetric)
      FinanceUtilMock.StockPriceDataMock = [
        { date: '2025-01-01 00:00', data: [1000, 1010, 990, 1020] },
        // Left shoulder - much lower
        { date: '2025-01-02 00:00', data: [1010, 1030, 1005, 1050] }, // Left shoulder: 1050
        { date: '2025-01-03 00:00', data: [1030, 1020, 1000, 1035] }, // Valley: 1000
        { date: '2025-01-04 00:00', data: [1020, 1025, 1015, 1030] },

        // Head peak
        { date: '2025-01-05 00:00', data: [1025, 1040, 1020, 1100] }, // Head: 1100
        { date: '2025-01-06 00:00', data: [1040, 1030, 1005, 1045] }, // Valley: 1005
        { date: '2025-01-07 00:00', data: [1030, 1035, 1025, 1040] },

        // Right shoulder - much higher (20% difference from left shoulder)
        { date: '2025-01-08 00:00', data: [1035, 1045, 1030, 1260] }, // Right shoulder: 1260 (too high)
        { date: '2025-01-09 00:00', data: [1045, 1035, 1025, 1050] },
        { date: '2025-01-10 00:00', data: [1035, 1020, 1015, 1040] },
        { date: '2025-01-11 00:00', data: [1020, 1010, 1000, 1025] },
        { date: '2025-01-12 00:00', data: [1010, 1000, 990, 1015] },
        { date: '2025-01-13 00:00', data: [1000, 995, 985, 1005] },
        { date: '2025-01-14 00:00', data: [995, 980, 975, 1000] },
        { date: '2025-01-15 00:00', data: [980, 970, 965, 985] },
      ];

      const result = await service.checkCondition(
        conditionKey,
        'MOCK_EXCHANGE',
        'MOCK_TICKER',
        EXCHANGE_SESSION.EXTENDED
      );

      expect(result.met).toBe(false);
    });

    it('Check Condition: 浅い谷のパターン（無効）', async () => {
      // Invalid pattern: valleys are too shallow (not deep enough from peaks)
      // This test creates a scenario where the valleys between peaks are deliberately shallow (<2% depth)
      FinanceUtilMock.StockPriceDataMock = [
        { date: '2025-01-01 00:00', data: [1000, 1010, 990, 1020] },
        // Left shoulder
        { date: '2025-01-02 00:00', data: [1010, 1030, 1005, 1070] }, // Left shoulder: 1070
        { date: '2025-01-03 00:00', data: [1030, 1020, 1060, 1035] }, // Very shallow valley: 1060 (only 0.9% below 1070)
        { date: '2025-01-04 00:00', data: [1020, 1025, 1058, 1030] }, // Still shallow

        // Head peak
        { date: '2025-01-05 00:00', data: [1025, 1040, 1020, 1100] }, // Head: 1100
        { date: '2025-01-06 00:00', data: [1040, 1030, 1085, 1045] }, // Very shallow valley: 1085 (only 1.4% below 1100)
        { date: '2025-01-07 00:00', data: [1030, 1035, 1083, 1040] }, // Still shallow

        // Right shoulder
        { date: '2025-01-08 00:00', data: [1035, 1045, 1030, 1075] }, // Right shoulder: 1075
        // Keep all subsequent valleys high to ensure shallow valleys between peaks are used
        { date: '2025-01-09 00:00', data: [1045, 1035, 1080, 1050] },
        { date: '2025-01-10 00:00', data: [1035, 1020, 1075, 1040] },
        { date: '2025-01-11 00:00', data: [1020, 1010, 1070, 1025] },
        { date: '2025-01-12 00:00', data: [1010, 1000, 1065, 1015] },
        { date: '2025-01-13 00:00', data: [1000, 995, 1060, 1005] },
        { date: '2025-01-14 00:00', data: [995, 980, 1055, 1000] },
        { date: '2025-01-15 00:00', data: [980, 970, 1050, 985] },
      ];

      const result = await service.checkCondition(
        conditionKey,
        'MOCK_EXCHANGE',
        'MOCK_TICKER',
        EXCHANGE_SESSION.EXTENDED
      );

      expect(result.met).toBe(false);
    });

    it('Check Condition: ネックライン未突破（無効）', async () => {
      // Invalid pattern: price hasn't broken below neckline
      FinanceUtilMock.StockPriceDataMock = [
        { date: '2025-01-01 00:00', data: [1000, 1010, 990, 1020] },
        // Left shoulder
        { date: '2025-01-02 00:00', data: [1010, 1030, 1005, 1070] }, // Left shoulder: 1070
        { date: '2025-01-03 00:00', data: [1030, 1020, 1000, 1035] }, // Valley: 1000
        { date: '2025-01-04 00:00', data: [1020, 1025, 1015, 1030] },

        // Head peak
        { date: '2025-01-05 00:00', data: [1025, 1040, 1020, 1100] }, // Head: 1100
        { date: '2025-01-06 00:00', data: [1040, 1030, 1005, 1045] }, // Valley: 1005
        { date: '2025-01-07 00:00', data: [1030, 1035, 1025, 1040] },

        // Right shoulder
        { date: '2025-01-08 00:00', data: [1035, 1045, 1030, 1075] }, // Right shoulder: 1075
        { date: '2025-01-09 00:00', data: [1045, 1035, 1025, 1050] },
        { date: '2025-01-10 00:00', data: [1035, 1020, 1015, 1040] },

        // No neckline break - prices stay above neckline (1002.5)
        { date: '2025-01-11 00:00', data: [1020, 1010, 1005, 1025] }, // close=1010 > 1002.5
        { date: '2025-01-12 00:00', data: [1010, 1008, 1003, 1015] }, // close=1008 > 1002.5
        { date: '2025-01-13 00:00', data: [1008, 1005, 1000, 1010] }, // close=1005 > 1002.5
        { date: '2025-01-14 00:00', data: [1005, 1004, 1000, 1008] }, // close=1004 > 1002.5
        { date: '2025-01-15 00:00', data: [1004, 1003, 1000, 1006] }, // close=1003 > 1002.5
      ];

      const result = await service.checkCondition(
        conditionKey,
        'MOCK_EXCHANGE',
        'MOCK_TICKER',
        EXCHANGE_SESSION.EXTENDED
      );

      expect(result.met).toBe(false);
    });

    it('Check Condition: 確認不足のパターン（無効）', async () => {
      // Invalid pattern: insufficient confirmation (only 1 candle breaks neckline)
      FinanceUtilMock.StockPriceDataMock = [
        { date: '2025-01-01 00:00', data: [1000, 1010, 990, 1020] },
        // Left shoulder
        { date: '2025-01-02 00:00', data: [1010, 1030, 1005, 1070] }, // Left shoulder: 1070
        { date: '2025-01-03 00:00', data: [1030, 1020, 1000, 1035] }, // Valley: 1000
        { date: '2025-01-04 00:00', data: [1020, 1025, 1015, 1030] },

        // Head peak
        { date: '2025-01-05 00:00', data: [1025, 1040, 1020, 1100] }, // Head: 1100
        { date: '2025-01-06 00:00', data: [1040, 1030, 1005, 1045] }, // Valley: 1005
        { date: '2025-01-07 00:00', data: [1030, 1035, 1025, 1040] },

        // Right shoulder
        { date: '2025-01-08 00:00', data: [1035, 1045, 1030, 1075] }, // Right shoulder: 1075
        { date: '2025-01-09 00:00', data: [1045, 1035, 1025, 1050] },
        { date: '2025-01-10 00:00', data: [1035, 1020, 1015, 1040] },

        // Insufficient confirmation - only 1 of last 3 candles breaks neckline
        { date: '2025-01-11 00:00', data: [1020, 1010, 1005, 1025] }, // close=1010 > 1002.5
        { date: '2025-01-12 00:00', data: [1010, 1005, 1000, 1015] }, // close=1005 > 1002.5
        { date: '2025-01-13 00:00', data: [1005, 1000, 995, 1010] }, // close=1000 < 1002.5 (only 1 break)
        { date: '2025-01-14 00:00', data: [1000, 1003, 1000, 1008] }, // close=1003 > 1002.5
        { date: '2025-01-15 00:00', data: [1003, 1004, 1000, 1006] }, // close=1004 > 1002.5
      ];

      const result = await service.checkCondition(
        conditionKey,
        'MOCK_EXCHANGE',
        'MOCK_TICKER',
        EXCHANGE_SESSION.EXTENDED
      );

      expect(result.met).toBe(false);
    });

    it('Check Condition: 実際の市場データに基づく三尊（日経平均想定）', async () => {
      // Realistic head and shoulders pattern based on typical market behavior
      // Simulating a pattern like Nikkei 225 declining from highs
      FinanceUtilMock.StockPriceDataMock = [
        // Build up trend
        { date: '2025-01-01 00:00', data: [28500, 28800, 28400, 28900] },
        // Left shoulder formation
        { date: '2025-01-02 00:00', data: [28800, 29200, 28700, 29500] }, // Left shoulder: 29500
        { date: '2025-01-03 00:00', data: [29200, 28900, 28600, 29100] }, // Valley: 28600
        { date: '2025-01-04 00:00', data: [28900, 29000, 28800, 29100] },

        // Head formation (highest point)
        { date: '2025-01-05 00:00', data: [29000, 29800, 28950, 30200] }, // Head: 30200 (highest)
        { date: '2025-01-06 00:00', data: [29800, 29100, 28650, 29500] }, // Valley: 28650
        { date: '2025-01-07 00:00', data: [29100, 29300, 29000, 29400] },

        // Right shoulder formation (similar to left)
        { date: '2025-01-08 00:00', data: [29300, 29600, 29200, 29400] }, // Right shoulder: 29400 (similar to 29500)
        { date: '2025-01-09 00:00', data: [29600, 29200, 29000, 29500] },
        { date: '2025-01-10 00:00', data: [29200, 28900, 28700, 29100] },

        // Neckline break (neckline = (28600 + 28650) / 2 = 28625)
        { date: '2025-01-11 00:00', data: [28900, 28700, 28500, 28800] },
        { date: '2025-01-12 00:00', data: [28700, 28400, 28300, 28600] }, // Break: close=28400 < 28625
        { date: '2025-01-13 00:00', data: [28400, 28100, 28000, 28300] }, // Confirmation: close=28100 < 28625
        { date: '2025-01-14 00:00', data: [28100, 27800, 27700, 28000] }, // Confirmation: close=27800 < 28625
        { date: '2025-01-15 00:00', data: [27800, 27500, 27400, 27700] }, // Continued decline
      ];

      const result = await service.checkCondition(
        conditionKey,
        'MOCK_EXCHANGE',
        'MOCK_TICKER',
        EXCHANGE_SESSION.EXTENDED
      );

      expect(result.met).toBe(true);
      expect(result.message).not.toBe('');
    });
  });
});
