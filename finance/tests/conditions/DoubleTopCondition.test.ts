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
import TickerServiceMock from '@finance/tests/mocks/services/TickerServiceMock';
import { EXCHANGE_SESSION } from '@finance/consts/ExchangeConsts';

describe('DoubleTopCondition', () => {
  let service: ConditionService;
  const conditionKey = 'DoubleTop';

  beforeEach(() => {
    service = new ConditionService(
      new ExchangeServiceMock(),
      new TickerServiceMock()
    );
  });

  describe('ダブルトップ', () => {
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