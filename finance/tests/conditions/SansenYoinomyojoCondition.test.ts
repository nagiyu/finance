jest.mock('@finance/utils/FinanceUtil', () => {
  return {
    __esModule: true,
    default: require('@finance/tests/mocks/utils/FinanceUtilMock').default
  };
});

import ConditionService from '@finance/services/ConditionService';
import ExchangeServiceMock from '@finance/tests/mocks/services/ExchangeServiceMock';
import FinanceUtilMock from '@finance/tests/mocks/utils/FinanceUtilMock';
import SansenYoinomyojoCondition from '@finance/conditions/SansenYoinomyojoCondition';
import TickerServiceMock from '@finance/tests/mocks/services/TickerServiceMock';
import { EXCHANGE_SESSION } from '@finance/consts/ExchangeConsts';

describe('SansenYoinomyojoCondition', () => {
  let service: ConditionService;
  const conditionKey = 'SansenYoinomyojo';

  beforeEach(() => {
    service = new ConditionService(
      new ExchangeServiceMock(),
      new TickerServiceMock()
    );
  });

  describe('三川宵の明星', () => {
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
});