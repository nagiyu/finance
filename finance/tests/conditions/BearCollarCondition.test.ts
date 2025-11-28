jest.mock('@finance/utils/FinanceUtil', () => {
  return {
    __esModule: true,
    default: jest.requireActual('@finance/tests/mocks/utils/FinanceUtilMock').default,
  };
});

import BearCollarCondition from '@finance/conditions/BearCollarCondition';
import ConditionService from '@finance/services/ConditionService';
import ExchangeServiceMock from '@finance/tests/mocks/services/ExchangeServiceMock';
import FinanceUtilMock from '@finance/tests/mocks/utils/FinanceUtilMock';
import TickerServiceMock from '@finance/tests/mocks/services/TickerServiceMock';
import { EXCHANGE_SESSION } from '@finance/consts/ExchangeConsts';

describe('BearCollarCondition', () => {
  let service: ConditionService;
  const conditionKey = 'BearCollar';

  beforeEach(() => {
    service = new ConditionService(new ExchangeServiceMock(), new TickerServiceMock());
  });

  describe('ベアコラッグ', () => {
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
        service.checkCondition(
          conditionKey,
          'MOCK_EXCHANGE',
          'MOCK_TICKER',
          EXCHANGE_SESSION.EXTENDED
        )
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
        { date: '2025-01-20 00:00', data: [820, 870, 850, 860] }, // bearish, current price close to target
      ];

      // Set current price to be near target price (860) with high volatility conditions
      const targetPrice = 860;
      const result = await service.checkCondition(
        conditionKey,
        'MOCK_EXCHANGE',
        'MOCK_TICKER',
        EXCHANGE_SESSION.EXTENDED,
        targetPrice
      );

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
        { date: '2025-01-20 00:00', data: [1038, 1043, 1033, 1040] },
      ];

      const targetPrice = 1040;
      const result = await service.checkCondition(
        conditionKey,
        'MOCK_EXCHANGE',
        'MOCK_TICKER',
        EXCHANGE_SESSION.EXTENDED,
        targetPrice
      );

      expect(result.met).toBe(false);
    });
  });
});
