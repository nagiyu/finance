jest.mock('@finance/utils/FinanceUtil', () => {
  return {
    __esModule: true,
    default: require('@finance/tests/mocks/utils/FinanceUtilMock').default,
  };
});

import ConditionService from '@finance/services/ConditionService';
import ExchangeServiceMock from '@finance/tests/mocks/services/ExchangeServiceMock';
import FinanceUtilMock from '@finance/tests/mocks/utils/FinanceUtilMock';
import GreaterThanCondition from '@finance/conditions/GreaterThanCondition';
import TickerServiceMock from '@finance/tests/mocks/services/TickerServiceMock';
import { EXCHANGE_SESSION } from '@finance/consts/ExchangeConsts';

describe('GreaterThanCondition', () => {
  let service: ConditionService;
  const conditionKey = 'GreaterThan';

  beforeEach(() => {
    service = new ConditionService(new ExchangeServiceMock(), new TickerServiceMock());
  });

  describe('指定価格を上回る', () => {
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
          data: [1000, 960, 950, 1010],
        },
      ];

      const result = await service.checkCondition(
        conditionKey,
        'MOCK_EXCHANGE',
        'MOCK_TICKER',
        EXCHANGE_SESSION.EXTENDED,
        950
      );

      expect(result.met).toBe(true);
      expect(result.message).not.toBe('');
    });

    it('Check Condition: targetPrice=0で条件判定が動作する', async () => {
      FinanceUtilMock.StockPriceDataMock = [
        {
          date: '2025-01-01 00:00',
          data: [1000, 960, 950, 10], // 終値10
        },
      ];
      const result = await service.checkCondition(
        conditionKey,
        'MOCK_EXCHANGE',
        'MOCK_TICKER',
        EXCHANGE_SESSION.EXTENDED,
        0
      );
      expect(result.met).toBe(true);
      expect(result.message).not.toBe('');
    });

    it('Check Condition: targetPrice未指定で例外', async () => {
      await expect(
        service.checkCondition(
          conditionKey,
          'MOCK_EXCHANGE',
          'MOCK_TICKER',
          EXCHANGE_SESSION.EXTENDED
        )
      ).rejects.toThrow('Target price is required for GreaterThanCondition');
    });
  });
});
