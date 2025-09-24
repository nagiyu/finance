jest.mock('@finance/utils/FinanceUtil', () => {
  return {
    __esModule: true,
    default: require('@finance/tests/mocks/utils/FinanceUtilMock').default
  };
});

import ConditionService from '@finance/services/ConditionService';
import DoubleTopCondition from '@finance/conditions/DoubleTopCondition';
import ExchangeServiceMock from '@finance/tests/mocks/services/ExchangeServiceMock';
import FinanceUtilMock from '@finance/tests/mocks/utils/FinanceUtilMock';
import GreaterThanCondition from '@finance/conditions/GreaterThanCondition';
import LessThanCondition from '@finance/conditions/LessThanCondition';
import SansenAkenomyojoCondition from '@finance/conditions/SansenAkenomyojoCondition';
import SansenYoinomyojoCondition from '@finance/conditions/SansenYoinomyojoCondition';
import SanzonCondition from '@finance/conditions/SanzonCondition';
import TickerServiceMock from '@finance/tests/mocks/services/TickerServiceMock';
import { EXCHANGE_SESSION } from '@finance/consts/ExchangeConsts';

describe('ConditionTest', () => {
  let service: ConditionService;

  beforeEach(() => {
    service = new ConditionService(
      new ExchangeServiceMock(),
      new TickerServiceMock()
    );
  });

  describe('指定価格を上回る', () => {
    const conditionKey = 'GreaterThan';

    it('Contains in Buy Condition List', () => {
      const conditionList = service.getBuyConditionList();
      expect(conditionList).toContain(conditionKey);
    });

    it('Contains in Sell Condition List', () => {
      const conditionList = service.getSellConditionList();
      expect(conditionList).toContain(conditionKey);
    });

    it('Get Condition Info', () => {
      const info = service.getConditionInfo(conditionKey);
      expect(info.name).toBe('指定価格を上回る');
      expect(info.description).not.toBe('');
      expect(info.isBuyCondition).toBe(true);
      expect(info.isSellCondition).toBe(true);
    });

    it('Get Condition', () => {
      const ConditionClass = service.getCondition(conditionKey);
      expect(ConditionClass).toBe(GreaterThanCondition);
    });

    it('Check Condition', async () => {
      FinanceUtilMock.StockPriceDataMock = [
        {
          date: '2025-01-01 00:00',
          data: [1000, 960, 950, 1010]
        }
      ];

      const result = await service.checkCondition(conditionKey, 'MOCK_EXCHANGE', 'MOCK_TICKER', EXCHANGE_SESSION.EXTENDED, 950);

      expect(result.met).toBe(true);
      expect(result.message).not.toBe('');
    });

    it('Check Condition: targetPrice=0で条件判定が動作する', async () => {
      FinanceUtilMock.StockPriceDataMock = [
        {
          date: '2025-01-01 00:00',
          data: [1000, 960, 950, 10] // 終値10
        }
      ];
      const result = await service.checkCondition(conditionKey, 'MOCK_EXCHANGE', 'MOCK_TICKER', EXCHANGE_SESSION.EXTENDED, 0);
      expect(result.met).toBe(true);
      expect(result.message).not.toBe('');
    });

    it('Check Condition: targetPrice未指定で例外', async () => {
      await expect(
        service.checkCondition(conditionKey, 'MOCK_EXCHANGE', 'MOCK_TICKER', EXCHANGE_SESSION.EXTENDED)
      ).rejects.toThrow('Target price is required for GreaterThanCondition');
    });
  });

  describe('指定価格を下回る', () => {
    const conditionKey = 'LessThan';

    it('Contains in Buy Condition List', () => {
      const conditionList = service.getBuyConditionList();
      expect(conditionList).toContain(conditionKey);
    });

    it('Contains in Sell Condition List', () => {
      const conditionList = service.getSellConditionList();
      expect(conditionList).toContain(conditionKey);
    });

    it('Get Condition Info', () => {
      const info = service.getConditionInfo(conditionKey);
      expect(info.name).toBe('指定価格を下回る');
      expect(info.description).not.toBe('');
      expect(info.isBuyCondition).toBe(true);
      expect(info.isSellCondition).toBe(true);
    });

    it('Get Condition', () => {
      const ConditionClass = service.getCondition(conditionKey);
      expect(ConditionClass).toBe(LessThanCondition);
    });

    it('Check Condition: currentPrice < targetPrice', async () => {
      FinanceUtilMock.StockPriceDataMock = [
        {
          date: '2025-01-01 00:00',
          data: [1000, 900, 950, 960] // 終値900
        }
      ];
      const result = await service.checkCondition(conditionKey, 'MOCK_EXCHANGE', 'MOCK_TICKER', EXCHANGE_SESSION.EXTENDED, 950);
      expect(result.met).toBe(true);
      expect(result.message).not.toBe('');
    });

    it('Check Condition: currentPrice >= targetPrice', async () => {
      FinanceUtilMock.StockPriceDataMock = [
        {
          date: '2025-01-01 00:00',
          data: [1000, 1000, 950, 960] // 終値1000
        }
      ];
      const result = await service.checkCondition(conditionKey, 'MOCK_EXCHANGE', 'MOCK_TICKER', EXCHANGE_SESSION.EXTENDED, 950);
      expect(result.met).toBe(false);
      expect(result.message).not.toBe('');
    });

    it('Check Condition: targetPrice=0で条件判定が動作する', async () => {
      FinanceUtilMock.StockPriceDataMock = [
        {
          date: '2025-01-01 00:00',
          data: [1000, -1, 950, 960] // high価格が-1 (0を下回る)
        }
      ];
      const result = await service.checkCondition(conditionKey, 'MOCK_EXCHANGE', 'MOCK_TICKER', EXCHANGE_SESSION.EXTENDED, 0);
      expect(result.met).toBe(true);
      expect(result.message).not.toBe('');
    });

    it('Check Condition: targetPrice未指定で例外', async () => {
      await expect(
        service.checkCondition(conditionKey, 'MOCK_EXCHANGE', 'MOCK_TICKER', EXCHANGE_SESSION.EXTENDED)
      ).rejects.toThrow('Target price is required for LessThanCondition');
    });
  });

  describe('三川明けの明星', () => {
    const conditionKey = 'SansenAkenomyojo';

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
      expect(info.name).toBe('三川明けの明星');
      expect(info.description).not.toBe('');
      expect(info.isBuyCondition).toBe(true);
      expect(info.isSellCondition).toBe(false);
    });

    it('Get Condition', () => {
      const ConditionClass = service.getCondition(conditionKey);
      expect(ConditionClass).toBe(SansenAkenomyojoCondition);
    });

    it('Check Condition', async () => {
      FinanceUtilMock.StockPriceDataMock = [
        {
          date: '2025-01-01 00:00',
          data: [1000, 960, 950, 1010]
        },
        {
          date: '2025-01-02 00:00',
          data: [940, 950, 930, 960]
        },
        {
          date: '2025-01-03 00:00',
          data: [970, 1010, 970, 1020]
        }
      ];

      const result = await service.checkCondition(conditionKey, 'MOCK_EXCHANGE', 'MOCK_TICKER', EXCHANGE_SESSION.EXTENDED);

      expect(result.met).toBe(true);
      expect(result.message).not.toBe('');
    });
  });

  describe('三川宵の明星', () => {
    const conditionKey = 'SansenYoinomyojo';

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
      expect(info.name).toBe('三川宵の明星');
      expect(info.description).not.toBe('');
      expect(info.isBuyCondition).toBe(false);
      expect(info.isSellCondition).toBe(true);
    });

    it('Get Condition', () => {
      const ConditionClass = service.getCondition(conditionKey);
      expect(ConditionClass).toBe(SansenYoinomyojoCondition);
    });

    it('Check Condition', async () => {
      // Evening star pattern: large bullish, small bearish with gap up, large bearish
      FinanceUtilMock.StockPriceDataMock = [
        {
          date: '2025-01-01 00:00',
          data: [950, 1010, 940, 1020] // large bullish candle [open, close, low, high] - close > open, large body
        },
        {
          date: '2025-01-02 00:00',
          data: [1030, 1025, 1025, 1040] // small bearish candle with gap up [open, close, low, high] - gap up (low 1025 > first high 1020), small body
        },
        {
          date: '2025-01-03 00:00',
          data: [1020, 960, 950, 1025] // large bearish candle [open, close, low, high] - close < open, large body
        }
      ];

      const result = await service.checkCondition(conditionKey, 'MOCK_EXCHANGE', 'MOCK_TICKER', EXCHANGE_SESSION.EXTENDED);

      expect(result.met).toBe(true);
      expect(result.message).not.toBe('');
    });
  });

  describe('三尊', () => {
    const conditionKey = 'Sanzon';

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
        { date: '2025-01-13 00:00', data: [1000, 995, 985, 1005] },   // Break: close=995 < 1002.5
        { date: '2025-01-14 00:00', data: [995, 980, 975, 1000] },   // Confirmation: close=980 < 1002.5
        { date: '2025-01-15 00:00', data: [980, 970, 965, 985] }     // Confirmation: close=970 < 1002.5
      ];

      const result = await service.checkCondition(conditionKey, 'MOCK_EXCHANGE', 'MOCK_TICKER', EXCHANGE_SESSION.EXTENDED);

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
        { date: '2025-01-15 00:00', data: [980, 970, 965, 985] }
      ];

      const result = await service.checkCondition(conditionKey, 'MOCK_EXCHANGE', 'MOCK_TICKER', EXCHANGE_SESSION.EXTENDED);

      expect(result.met).toBe(false);
    });

    it('Check Condition: 浅い谷のパターン（無効）', async () => {
      // Invalid pattern: valleys are too shallow (not deep enough from peaks)
      FinanceUtilMock.StockPriceDataMock = [
        { date: '2025-01-01 00:00', data: [1000, 1010, 990, 1020] },
        // Left shoulder
        { date: '2025-01-02 00:00', data: [1010, 1030, 1005, 1070] }, // Left shoulder: 1070
        { date: '2025-01-03 00:00', data: [1030, 1020, 1065, 1035] }, // Shallow valley: 1065 (too high)
        { date: '2025-01-04 00:00', data: [1020, 1025, 1015, 1030] },
        
        // Head peak
        { date: '2025-01-05 00:00', data: [1025, 1040, 1020, 1100] }, // Head: 1100
        { date: '2025-01-06 00:00', data: [1040, 1030, 1070, 1045] }, // Shallow valley: 1070 (too high)
        { date: '2025-01-07 00:00', data: [1030, 1035, 1025, 1040] },
        
        // Right shoulder
        { date: '2025-01-08 00:00', data: [1035, 1045, 1030, 1075] }, // Right shoulder: 1075
        { date: '2025-01-09 00:00', data: [1045, 1035, 1025, 1050] },
        { date: '2025-01-10 00:00', data: [1035, 1020, 1015, 1040] },
        { date: '2025-01-11 00:00', data: [1020, 1010, 1000, 1025] },
        { date: '2025-01-12 00:00', data: [1010, 1000, 990, 1015] },
        { date: '2025-01-13 00:00', data: [1000, 995, 985, 1005] },
        { date: '2025-01-14 00:00', data: [995, 980, 975, 1000] },
        { date: '2025-01-15 00:00', data: [980, 970, 965, 985] }
      ];

      const result = await service.checkCondition(conditionKey, 'MOCK_EXCHANGE', 'MOCK_TICKER', EXCHANGE_SESSION.EXTENDED);

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
        { date: '2025-01-15 00:00', data: [1004, 1003, 1000, 1006] }  // close=1003 > 1002.5
      ];

      const result = await service.checkCondition(conditionKey, 'MOCK_EXCHANGE', 'MOCK_TICKER', EXCHANGE_SESSION.EXTENDED);

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
        { date: '2025-01-13 00:00', data: [1005, 1000, 995, 1010] },  // close=1000 < 1002.5 (only 1 break)
        { date: '2025-01-14 00:00', data: [1000, 1003, 1000, 1008] }, // close=1003 > 1002.5
        { date: '2025-01-15 00:00', data: [1003, 1004, 1000, 1006] }  // close=1004 > 1002.5
      ];

      const result = await service.checkCondition(conditionKey, 'MOCK_EXCHANGE', 'MOCK_TICKER', EXCHANGE_SESSION.EXTENDED);

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
        { date: '2025-01-15 00:00', data: [27800, 27500, 27400, 27700] }  // Continued decline
      ];

      const result = await service.checkCondition(conditionKey, 'MOCK_EXCHANGE', 'MOCK_TICKER', EXCHANGE_SESSION.EXTENDED);

      expect(result.met).toBe(true);
      expect(result.message).not.toBe('');
    });
  });

  describe('ダブルトップ', () => {
    const conditionKey = 'DoubleTop';

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
      expect(info.name).toBe('ダブルトップ');
      expect(info.description).not.toBe('');
      expect(info.isBuyCondition).toBe(false);
      expect(info.isSellCondition).toBe(true);
    });

    it('Get Condition', () => {
      const ConditionClass = service.getCondition(conditionKey);
      expect(ConditionClass).toBe(DoubleTopCondition);
    });

    it('Check Condition', async () => {
      // Double top pattern: two peaks at similar levels with valley between, then breakdown below neckline
      FinanceUtilMock.StockPriceDataMock = [
        // Build up to first peak
        { date: '2025-01-01 00:00', data: [950, 970, 945, 975] },
        { date: '2025-01-02 00:00', data: [970, 990, 965, 995] },
        // First peak at 1000
        { date: '2025-01-03 00:00', data: [990, 1000, 985, 1000] }, // First top: high=1000
        
        // Valley formation (neckline around 900)
        { date: '2025-01-04 00:00', data: [1000, 950, 940, 960] },
        { date: '2025-01-05 00:00', data: [950, 920, 900, 930] },   // Valley: low=900 (neckline)
        { date: '2025-01-06 00:00', data: [920, 910, 905, 925] },
        
        // Recovery towards second peak
        { date: '2025-01-07 00:00', data: [910, 940, 910, 945] },
        { date: '2025-01-08 00:00', data: [940, 970, 935, 975] },
        { date: '2025-01-09 00:00', data: [970, 990, 965, 995] },
        // Second peak at similar level to first (990, within 5% of 1000)
        { date: '2025-01-10 00:00', data: [990, 990, 980, 990] },   // Second top: high=990 (similar to 1000)
        
        // Decline and breakdown below neckline
        { date: '2025-01-11 00:00', data: [990, 950, 940, 960] },
        { date: '2025-01-12 00:00', data: [950, 920, 910, 930] },
        { date: '2025-01-13 00:00', data: [920, 890, 880, 895] },   // Break below neckline: close=895 < 900
        { date: '2025-01-14 00:00', data: [890, 880, 870, 885] },   // Confirmation: close=885 < 900
        { date: '2025-01-15 00:00', data: [880, 870, 860, 875] },
        { date: '2025-01-16 00:00', data: [870, 860, 850, 865] },
        { date: '2025-01-17 00:00', data: [860, 850, 840, 855] },
        { date: '2025-01-18 00:00', data: [850, 840, 830, 845] },
        { date: '2025-01-19 00:00', data: [840, 830, 820, 835] },
        { date: '2025-01-20 00:00', data: [830, 820, 810, 825] }
      ];

      const result = await service.checkCondition(conditionKey, 'MOCK_EXCHANGE', 'MOCK_TICKER', EXCHANGE_SESSION.EXTENDED);

      expect(result.met).toBe(true);
      expect(result.message).not.toBe('');
    });
  });
});
