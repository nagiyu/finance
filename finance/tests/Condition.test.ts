jest.mock('@finance/utils/FinanceUtil', () => {
  return {
    __esModule: true,
    default: require('@finance/tests/mocks/utils/FinanceUtilMock').default
  };
});

import ConditionService from '@finance/services/ConditionService';
import BearCollarCondition from '@finance/conditions/BearCollarCondition';
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

    it('Check Condition', async () => {
      // Very explicit head and shoulders pattern
      FinanceUtilMock.StockPriceDataMock = [
        // Lead up to left shoulder
        { date: '2025-01-01 00:00', data: [1000, 1010, 990, 1020] },
        // Left shoulder peak at index 1
        { date: '2025-01-02 00:00', data: [1010, 1030, 1005, 1070] }, // Peak: high=1070
        // Valley after left shoulder  
        { date: '2025-01-03 00:00', data: [1030, 1020, 1000, 1035] }, // Valley: low=1000
        { date: '2025-01-04 00:00', data: [1020, 1025, 1015, 1030] },
        
        // Head peak at index 4 (highest)
        { date: '2025-01-05 00:00', data: [1025, 1040, 1020, 1100] }, // Head Peak: high=1100 (highest)
        // Valley after head
        { date: '2025-01-06 00:00', data: [1040, 1030, 1005, 1045] }, // Valley: low=1005
        { date: '2025-01-07 00:00', data: [1030, 1035, 1025, 1040] },
        
        // Right shoulder peak at index 7 (similar to left)
        { date: '2025-01-08 00:00', data: [1035, 1045, 1030, 1075] }, // Peak: high=1075 (similar to left 1070)
        // Down from right shoulder
        { date: '2025-01-09 00:00', data: [1045, 1035, 1025, 1050] },
        { date: '2025-01-10 00:00', data: [1035, 1020, 1015, 1040] },
        
        // Break below neckline (neckline = (1000 + 1005) / 2 = 1002.5)
        { date: '2025-01-11 00:00', data: [1020, 1010, 1000, 1025] },
        { date: '2025-01-12 00:00', data: [1010, 1000, 990, 1015] },
        { date: '2025-01-13 00:00', data: [1000, 995, 985, 1005] },   // Break: close=995 < neckline=1002.5
        { date: '2025-01-14 00:00', data: [995, 980, 975, 1000] },
        { date: '2025-01-15 00:00', data: [980, 970, 965, 985] }      // Added 15th item
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

  describe('ベアコラッグ', () => {
    const conditionKey = 'BearCollar';

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
      expect(info.name).toBe('ベアコラッグ');
      expect(info.description).not.toBe('');
      expect(info.isBuyCondition).toBe(false);
      expect(info.isSellCondition).toBe(true);
    });

    it('Get Condition', () => {
      const ConditionClass = service.getCondition(conditionKey);
      expect(ConditionClass).toBe(BearCollarCondition);
    });

    it('Requires Target Price', async () => {
      await expect(
        service.checkCondition(conditionKey, 'MOCK_EXCHANGE', 'MOCK_TICKER', EXCHANGE_SESSION.EXTENDED)
      ).rejects.toThrow('Target price is required for BearCollarCondition');
    });

    it('Check Condition - High Volatility with Bearish Pressure', async () => {
      // Mock data showing high volatility and bearish pressure near target price
      FinanceUtilMock.StockPriceDataMock = [
        // Volatile price movements
        { date: '2025-01-01 00:00', data: [1000, 1050, 980, 1020] },
        { date: '2025-01-02 00:00', data: [1020, 970, 960, 990] },
        { date: '2025-01-03 00:00', data: [990, 1040, 970, 1010] },
        { date: '2025-01-04 00:00', data: [1010, 980, 950, 970] },
        { date: '2025-01-05 00:00', data: [970, 1020, 960, 1000] },
        { date: '2025-01-06 00:00', data: [1000, 980, 940, 960] },
        { date: '2025-01-07 00:00', data: [960, 990, 930, 950] },
        { date: '2025-01-08 00:00', data: [950, 970, 920, 940] },
        { date: '2025-01-09 00:00', data: [940, 960, 910, 930] },
        { date: '2025-01-10 00:00', data: [930, 950, 900, 920] },
        { date: '2025-01-11 00:00', data: [920, 940, 890, 910] },
        { date: '2025-01-12 00:00', data: [910, 930, 880, 900] },
        { date: '2025-01-13 00:00', data: [900, 920, 870, 890] },
        { date: '2025-01-14 00:00', data: [890, 910, 860, 880] },
        { date: '2025-01-15 00:00', data: [880, 900, 850, 870] },
        // Recent bearish candles near target price (860)
        { date: '2025-01-16 00:00', data: [870, 860, 840, 850] }, // bearish
        { date: '2025-01-17 00:00', data: [850, 840, 820, 830] }, // bearish
        { date: '2025-01-18 00:00', data: [830, 820, 800, 810] }, // bearish
        { date: '2025-01-19 00:00', data: [810, 830, 790, 820] }, // bullish but small
        { date: '2025-01-20 00:00', data: [820, 870, 850, 860] }  // bearish, current price close to target
      ];

      // Set current price to be near target price (860) with high volatility conditions
      const targetPrice = 860;
      const result = await service.checkCondition(conditionKey, 'MOCK_EXCHANGE', 'MOCK_TICKER', EXCHANGE_SESSION.EXTENDED, targetPrice);

      expect(result.met).toBe(true);
      expect(result.message).not.toBe('');
    });

    it('Check Condition - Low Volatility should not trigger', async () => {
      // Mock data showing low volatility and stable prices
      FinanceUtilMock.StockPriceDataMock = [
        { date: '2025-01-01 00:00', data: [1000, 1005, 995, 1002] },
        { date: '2025-01-02 00:00', data: [1002, 1007, 997, 1004] },
        { date: '2025-01-03 00:00', data: [1004, 1009, 999, 1006] },
        { date: '2025-01-04 00:00', data: [1006, 1011, 1001, 1008] },
        { date: '2025-01-05 00:00', data: [1008, 1013, 1003, 1010] },
        { date: '2025-01-06 00:00', data: [1010, 1015, 1005, 1012] },
        { date: '2025-01-07 00:00', data: [1012, 1017, 1007, 1014] },
        { date: '2025-01-08 00:00', data: [1014, 1019, 1009, 1016] },
        { date: '2025-01-09 00:00', data: [1016, 1021, 1011, 1018] },
        { date: '2025-01-10 00:00', data: [1018, 1023, 1013, 1020] },
        { date: '2025-01-11 00:00', data: [1020, 1025, 1015, 1022] },
        { date: '2025-01-12 00:00', data: [1022, 1027, 1017, 1024] },
        { date: '2025-01-13 00:00', data: [1024, 1029, 1019, 1026] },
        { date: '2025-01-14 00:00', data: [1026, 1031, 1021, 1028] },
        { date: '2025-01-15 00:00', data: [1028, 1033, 1023, 1030] },
        { date: '2025-01-16 00:00', data: [1030, 1035, 1025, 1032] },
        { date: '2025-01-17 00:00', data: [1032, 1037, 1027, 1034] },
        { date: '2025-01-18 00:00', data: [1034, 1039, 1029, 1036] },
        { date: '2025-01-19 00:00', data: [1036, 1041, 1031, 1038] },
        { date: '2025-01-20 00:00', data: [1038, 1043, 1033, 1040] }
      ];

      const targetPrice = 1040;
      const result = await service.checkCondition(conditionKey, 'MOCK_EXCHANGE', 'MOCK_TICKER', EXCHANGE_SESSION.EXTENDED, targetPrice);

      expect(result.met).toBe(false);
    });
  });
});
