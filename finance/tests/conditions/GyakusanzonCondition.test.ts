jest.mock('@finance/utils/FinanceUtil', () => {
  return {
    __esModule: true,
    default: require('@finance/tests/mocks/utils/FinanceUtilMock').default
  };
});

import ConditionService from '@finance/services/ConditionService';
import ExchangeServiceMock from '@finance/tests/mocks/services/ExchangeServiceMock';
import FinanceUtilMock from '@finance/tests/mocks/utils/FinanceUtilMock';
import GyakusanzonCondition from '@finance/conditions/GyakusanzonCondition';
import TickerServiceMock from '@finance/tests/mocks/services/TickerServiceMock';
import { EXCHANGE_SESSION } from '@finance/consts/ExchangeConsts';

describe('GyakusanzonCondition', () => {
  let service: ConditionService;
  const conditionKey = 'Gyakusanzon';

  beforeEach(() => {
    service = new ConditionService(
      new ExchangeServiceMock(),
      new TickerServiceMock()
    );
  });

  describe('逆三尊', () => {
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
      expect(info.name).toBe('逆三尊');
      expect(info.description).not.toBe('');
      expect(info.isBuyCondition).toBe(true);
      expect(info.isSellCondition).toBe(false);
    });

    it('Get Condition', () => {
      const ConditionClass = service.getCondition(conditionKey);
      expect(ConditionClass).toBe(GyakusanzonCondition);
    });

    it('Check Condition: 典型的な逆三尊パターン（完全な形）', async () => {
      // Classic inverse head and shoulders pattern with clear formation and neckline break
      FinanceUtilMock.StockPriceDataMock = [
        // Build up to left shoulder
        { date: '2025-01-01 00:00', data: [1000, 990, 980, 995] },
        // Left shoulder valley
        { date: '2025-01-02 00:00', data: [990, 970, 930, 980] }, // Left shoulder: 930
        // Peak after left shoulder  
        { date: '2025-01-03 00:00', data: [970, 1000, 965, 1020] }, // Peak: 1000
        { date: '2025-01-04 00:00', data: [1000, 995, 975, 990] },
        
        // Head valley (lowest)
        { date: '2025-01-05 00:00', data: [995, 920, 900, 950] }, // Head: 900 (lowest)
        // Peak after head
        { date: '2025-01-06 00:00', data: [920, 1005, 945, 995] }, // Peak: 1005
        { date: '2025-01-07 00:00', data: [1005, 990, 975, 985] },
        
        // Right shoulder valley (similar to left)
        { date: '2025-01-08 00:00', data: [990, 955, 925, 960] }, // Right shoulder: 925 (similar to 930)
        // Rally from right shoulder
        { date: '2025-01-09 00:00', data: [955, 980, 950, 975] },
        { date: '2025-01-10 00:00', data: [980, 1000, 960, 985] },
        
        // Neckline break confirmation (neckline = (1000 + 1005) / 2 = 1002.5)
        { date: '2025-01-11 00:00', data: [1000, 1010, 990, 1005] },
        { date: '2025-01-12 00:00', data: [1010, 1020, 1000, 1015] },
        { date: '2025-01-13 00:00', data: [1020, 1025, 1005, 1020] }, // Break: close=1025 > 1002.5
        { date: '2025-01-14 00:00', data: [1025, 1030, 1015, 1028] }, // Confirmation: close=1030 > 1002.5
        { date: '2025-01-15 00:00', data: [1030, 1040, 1025, 1035] }  // Confirmation: close=1040 > 1002.5
      ];

      const result = await service.checkCondition(conditionKey, 'MOCK_EXCHANGE', 'MOCK_TICKER', EXCHANGE_SESSION.EXTENDED);

      expect(result.met).toBe(true);
      expect(result.message).not.toBe('');
    });

    it('Check Condition: 非対称な肩のパターン（無効）', async () => {
      // Invalid pattern: shoulders are too different (asymmetric)
      FinanceUtilMock.StockPriceDataMock = [
        { date: '2025-01-01 00:00', data: [1000, 990, 980, 995] },
        // Left shoulder - much higher valley
        { date: '2025-01-02 00:00', data: [990, 970, 950, 980] }, // Left shoulder: 950
        { date: '2025-01-03 00:00', data: [970, 1000, 965, 1020] }, // Peak: 1000
        { date: '2025-01-04 00:00', data: [1000, 995, 975, 990] },
        
        // Head valley
        { date: '2025-01-05 00:00', data: [995, 920, 900, 950] }, // Head: 900
        { date: '2025-01-06 00:00', data: [920, 1005, 945, 995] }, // Peak: 1005
        { date: '2025-01-07 00:00', data: [1005, 990, 975, 985] },
        
        // Right shoulder - much lower valley (20% difference from left shoulder)
        { date: '2025-01-08 00:00', data: [990, 820, 790, 850] }, // Right shoulder: 790 (too low)
        { date: '2025-01-09 00:00', data: [820, 880, 850, 875] },
        { date: '2025-01-10 00:00', data: [880, 900, 860, 985] },
        { date: '2025-01-11 00:00', data: [900, 1010, 990, 1005] },
        { date: '2025-01-12 00:00', data: [1010, 1020, 1000, 1015] },
        { date: '2025-01-13 00:00', data: [1020, 1025, 1005, 1020] },
        { date: '2025-01-14 00:00', data: [1025, 1030, 1015, 1028] },
        { date: '2025-01-15 00:00', data: [1030, 1040, 1025, 1035] }
      ];

      const result = await service.checkCondition(conditionKey, 'MOCK_EXCHANGE', 'MOCK_TICKER', EXCHANGE_SESSION.EXTENDED);

      expect(result.met).toBe(false);
    });

    it('Check Condition: 浅い山のパターン（無効）', async () => {
      // Invalid pattern: peaks are too shallow (not high enough from valleys)
      // This test creates a scenario where the peaks between valleys are deliberately shallow (<2% height)
      FinanceUtilMock.StockPriceDataMock = [
        { date: '2025-01-01 00:00', data: [1000, 990, 980, 995] },
        // Left shoulder
        { date: '2025-01-02 00:00', data: [990, 970, 930, 980] }, // Left shoulder: 930
        { date: '2025-01-03 00:00', data: [970, 940, 935, 945] }, // Very shallow peak: 940 (only 1.1% above 930)
        { date: '2025-01-04 00:00', data: [940, 942, 938, 941] }, // Still shallow
        
        // Head valley
        { date: '2025-01-05 00:00', data: [942, 920, 900, 950] }, // Head: 900
        { date: '2025-01-06 00:00', data: [920, 915, 910, 920] }, // Very shallow peak: 915 (only 1.7% above 900)
        { date: '2025-01-07 00:00', data: [915, 917, 912, 916] }, // Still shallow
        
        // Right shoulder
        { date: '2025-01-08 00:00', data: [917, 955, 925, 960] }, // Right shoulder: 925
        // Keep all subsequent peaks low to ensure shallow peaks between valleys are used
        { date: '2025-01-09 00:00', data: [955, 935, 920, 930] },
        { date: '2025-01-10 00:00', data: [935, 940, 930, 938] },
        { date: '2025-01-11 00:00', data: [940, 945, 938, 943] },
        { date: '2025-01-12 00:00', data: [945, 950, 943, 948] },
        { date: '2025-01-13 00:00', data: [950, 955, 948, 953] },
        { date: '2025-01-14 00:00', data: [955, 960, 953, 958] },
        { date: '2025-01-15 00:00', data: [960, 965, 958, 963] }
      ];

      const result = await service.checkCondition(conditionKey, 'MOCK_EXCHANGE', 'MOCK_TICKER', EXCHANGE_SESSION.EXTENDED);

      expect(result.met).toBe(false);
    });

    it('Check Condition: ネックライン未突破（無効）', async () => {
      // Invalid pattern: price hasn't broken above neckline
      FinanceUtilMock.StockPriceDataMock = [
        { date: '2025-01-01 00:00', data: [1000, 990, 980, 995] },
        // Left shoulder
        { date: '2025-01-02 00:00', data: [990, 970, 930, 980] }, // Left shoulder: 930
        { date: '2025-01-03 00:00', data: [970, 1000, 965, 1020] }, // Peak: 1000
        { date: '2025-01-04 00:00', data: [1000, 995, 975, 990] },
        
        // Head valley
        { date: '2025-01-05 00:00', data: [995, 920, 900, 950] }, // Head: 900
        { date: '2025-01-06 00:00', data: [920, 1005, 945, 995] }, // Peak: 1005
        { date: '2025-01-07 00:00', data: [1005, 990, 975, 985] },
        
        // Right shoulder
        { date: '2025-01-08 00:00', data: [990, 955, 925, 960] }, // Right shoulder: 925
        { date: '2025-01-09 00:00', data: [955, 980, 950, 975] },
        { date: '2025-01-10 00:00', data: [980, 1000, 960, 985] },
        
        // No neckline break - prices stay below neckline (1002.5)
        { date: '2025-01-11 00:00', data: [1000, 995, 990, 992] }, // close=992 < 1002.5
        { date: '2025-01-12 00:00', data: [995, 997, 993, 996] }, // close=997 < 1002.5
        { date: '2025-01-13 00:00', data: [997, 1000, 995, 998] }, // close=1000 < 1002.5
        { date: '2025-01-14 00:00', data: [1000, 1001, 998, 999] }, // close=1001 < 1002.5
        { date: '2025-01-15 00:00', data: [1001, 1002, 999, 1001] }  // close=1002 < 1002.5
      ];

      const result = await service.checkCondition(conditionKey, 'MOCK_EXCHANGE', 'MOCK_TICKER', EXCHANGE_SESSION.EXTENDED);

      expect(result.met).toBe(false);
    });

    it('Check Condition: 確認不足のパターン（無効）', async () => {
      // Invalid pattern: insufficient confirmation (only 1 candle breaks neckline)
      FinanceUtilMock.StockPriceDataMock = [
        { date: '2025-01-01 00:00', data: [1000, 990, 980, 995] },
        // Left shoulder
        { date: '2025-01-02 00:00', data: [990, 970, 930, 980] }, // Left shoulder: 930
        { date: '2025-01-03 00:00', data: [970, 1000, 965, 1020] }, // Peak: 1000
        { date: '2025-01-04 00:00', data: [1000, 995, 975, 990] },
        
        // Head valley
        { date: '2025-01-05 00:00', data: [995, 920, 900, 950] }, // Head: 900
        { date: '2025-01-06 00:00', data: [920, 1005, 945, 995] }, // Peak: 1005
        { date: '2025-01-07 00:00', data: [1005, 990, 975, 985] },
        
        // Right shoulder
        { date: '2025-01-08 00:00', data: [990, 955, 925, 960] }, // Right shoulder: 925
        { date: '2025-01-09 00:00', data: [955, 980, 950, 975] },
        { date: '2025-01-10 00:00', data: [980, 1000, 960, 985] },
        
        // Insufficient confirmation - only 1 of last 3 candles breaks neckline
        { date: '2025-01-11 00:00', data: [1000, 995, 990, 992] }, // close=992 < 1002.5
        { date: '2025-01-12 00:00', data: [995, 997, 993, 996] }, // close=997 < 1002.5
        { date: '2025-01-13 00:00', data: [997, 1010, 995, 1008] }, // close=1008 > 1002.5 (only 1 break)
        { date: '2025-01-14 00:00', data: [1010, 1001, 998, 999] }, // close=1001 < 1002.5
        { date: '2025-01-15 00:00', data: [1001, 1002, 999, 1000] }  // close=1002 < 1002.5
      ];

      const result = await service.checkCondition(conditionKey, 'MOCK_EXCHANGE', 'MOCK_TICKER', EXCHANGE_SESSION.EXTENDED);

      expect(result.met).toBe(false);
    });

    it('Check Condition: 実際の市場データに基づく逆三尊（日経平均想定）', async () => {
      // Realistic inverse head and shoulders pattern based on typical market behavior
      // Simulating a pattern like Nikkei 225 recovering from lows
      FinanceUtilMock.StockPriceDataMock = [
        // Build down trend
        { date: '2025-01-01 00:00', data: [28500, 28200, 28100, 28300] },
        // Left shoulder formation
        { date: '2025-01-02 00:00', data: [28200, 27900, 27500, 27800] }, // Left shoulder: 27500
        { date: '2025-01-03 00:00', data: [27900, 28400, 27700, 28200] }, // Peak: 28400
        { date: '2025-01-04 00:00', data: [28400, 28100, 28000, 28100] },
        
        // Head formation (lowest point)
        { date: '2025-01-05 00:00', data: [28100, 27200, 26800, 27500] }, // Head: 26800 (lowest)
        { date: '2025-01-06 00:00', data: [27200, 28350, 27100, 28000] }, // Peak: 28350
        { date: '2025-01-07 00:00', data: [28350, 28200, 28000, 28100] },
        
        // Right shoulder formation (similar to left)
        { date: '2025-01-08 00:00', data: [28200, 27800, 27600, 27900] }, // Right shoulder: 27600 (similar to 27500)
        { date: '2025-01-09 00:00', data: [27800, 28200, 27700, 28000] },
        { date: '2025-01-10 00:00', data: [28200, 28300, 28100, 28250] },
        
        // Neckline break (neckline = (28400 + 28350) / 2 = 28375)
        { date: '2025-01-11 00:00', data: [28300, 28500, 28200, 28400] },
        { date: '2025-01-12 00:00', data: [28500, 28600, 28400, 28550] }, // Break: close=28600 > 28375
        { date: '2025-01-13 00:00', data: [28600, 28900, 28500, 28800] }, // Confirmation: close=28900 > 28375
        { date: '2025-01-14 00:00', data: [28900, 29200, 28800, 29100] }, // Confirmation: close=29200 > 28375
        { date: '2025-01-15 00:00', data: [29200, 29500, 29100, 29400] }  // Continued rally
      ];

      const result = await service.checkCondition(conditionKey, 'MOCK_EXCHANGE', 'MOCK_TICKER', EXCHANGE_SESSION.EXTENDED);

      expect(result.met).toBe(true);
      expect(result.message).not.toBe('');
    });
  });
});