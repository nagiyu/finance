jest.mock('@finance/utils/FinanceUtil', () => {
  return {
    __esModule: true,
    default: require('@finance/tests/mocks/utils/FinanceUtilMock').default
  };
});

import ConditionService from '@finance/services/ConditionService';
import RisingDoubleBottomCondition from '@finance/conditions/RisingDoubleBottomCondition';
import ExchangeServiceMock from '@finance/tests/mocks/services/ExchangeServiceMock';
import FinanceUtilMock from '@finance/tests/mocks/utils/FinanceUtilMock';
import TickerServiceMock from '@finance/tests/mocks/services/TickerServiceMock';
import { EXCHANGE_SESSION } from '@finance/consts/ExchangeConsts';

describe('RisingDoubleBottomCondition', () => {
  let service: ConditionService;
  const conditionKey = 'RisingDoubleBottom';

  beforeEach(() => {
    service = new ConditionService(
      new ExchangeServiceMock(),
      new TickerServiceMock()
    );
  });

  describe('切り上げダブルボトム', () => {
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
      expect(info.name).toBe('切り上げダブルボトム');
      expect(info.description).not.toBe('');
      expect(info.isBuyCondition).toBe(true);
      expect(info.isSellCondition).toBe(false);
    });

    it('Get Condition', () => {
      const ConditionClass = service.getCondition(conditionKey);
      expect(ConditionClass).toBe(RisingDoubleBottomCondition);
    });

    it('Check Condition', async () => {
      // Mock stock data that represents a rising double bottom pattern
      // Price sequence: 1000 (first bottom), 1200 (peak/neckline), 1050 (second bottom higher than first), 1250 (breakout)
      FinanceUtilMock.StockPriceDataMock = [
        { date: '2025-01-01 00:00', data: [1100, 1080, 1070, 1120] }, // preceding data
        { date: '2025-01-02 00:00', data: [1080, 1060, 1050, 1090] }, // preceding data
        { date: '2025-01-03 00:00', data: [1060, 1020, 1000, 1040] }, // first bottom at 1000
        { date: '2025-01-04 00:00', data: [1040, 1080, 1020, 1100] }, // recovery
        { date: '2025-01-05 00:00', data: [1100, 1150, 1080, 1180] }, // continuing recovery
        { date: '2025-01-06 00:00', data: [1180, 1200, 1160, 1210] }, // peak/neckline at 1200
        { date: '2025-01-07 00:00', data: [1210, 1180, 1170, 1190] }, // pullback
        { date: '2025-01-08 00:00', data: [1190, 1120, 1100, 1140] }, // decline
        { date: '2025-01-09 00:00', data: [1140, 1080, 1050, 1100] }, // second bottom at 1050 (higher than 1000)
        { date: '2025-01-10 00:00', data: [1100, 1140, 1080, 1160] }, // recovery start
        { date: '2025-01-11 00:00', data: [1160, 1200, 1150, 1220] }, // approaching neckline
        { date: '2025-01-12 00:00', data: [1220, 1250, 1210, 1260] }, // breakout above neckline (1200)
        { date: '2025-01-13 00:00', data: [1260, 1280, 1240, 1290] }, // confirmation
      ];

      const result = await service.checkCondition(
        conditionKey,
        'MOCK_EXCHANGE',
        'MOCK_TICKER',
        EXCHANGE_SESSION.REGULAR
      );

      expect(result.met).toBe(true);
    });

    it('Check Condition - Not Met (No Rising Pattern)', async () => {
      // Mock stock data that represents a regular double bottom (second bottom same level as first)
      FinanceUtilMock.StockPriceDataMock = [
        { date: '2025-01-01 00:00', data: [1100, 1080, 1070, 1120] }, // preceding data
        { date: '2025-01-02 00:00', data: [1080, 1060, 1050, 1090] }, // preceding data
        { date: '2025-01-03 00:00', data: [1060, 1020, 1000, 1040] }, // first bottom at 1000
        { date: '2025-01-04 00:00', data: [1040, 1080, 1020, 1100] }, // recovery
        { date: '2025-01-05 00:00', data: [1100, 1150, 1080, 1180] }, // continuing recovery
        { date: '2025-01-06 00:00', data: [1180, 1200, 1160, 1210] }, // peak/neckline at 1200
        { date: '2025-01-07 00:00', data: [1210, 1180, 1170, 1190] }, // pullback
        { date: '2025-01-08 00:00', data: [1190, 1120, 1100, 1140] }, // decline
        { date: '2025-01-09 00:00', data: [1140, 1020, 1000, 1040] }, // second bottom at same level (1000)
        { date: '2025-01-10 00:00', data: [1040, 1080, 1020, 1100] }, // recovery start
        { date: '2025-01-11 00:00', data: [1100, 1150, 1130, 1170] }, // no breakout
        { date: '2025-01-12 00:00', data: [1170, 1180, 1150, 1190] }, // still below neckline
        { date: '2025-01-13 00:00', data: [1190, 1195, 1170, 1200] }, // at neckline but no clear breakout
      ];

      const result = await service.checkCondition(
        conditionKey,
        'MOCK_EXCHANGE',
        'MOCK_TICKER',
        EXCHANGE_SESSION.REGULAR
      );

      expect(result.met).toBe(false);
    });

    it('Check Condition - Not Met (No Breakout)', async () => {
      // Mock stock data with rising double bottom but no neckline breakout
      FinanceUtilMock.StockPriceDataMock = [
        { date: '2025-01-01 00:00', data: [1100, 1080, 1070, 1120] }, // preceding data
        { date: '2025-01-02 00:00', data: [1080, 1060, 1050, 1090] }, // preceding data
        { date: '2025-01-03 00:00', data: [1060, 1020, 1000, 1040] }, // first bottom at 1000
        { date: '2025-01-04 00:00', data: [1040, 1080, 1020, 1100] }, // recovery
        { date: '2025-01-05 00:00', data: [1100, 1150, 1080, 1180] }, // continuing recovery
        { date: '2025-01-06 00:00', data: [1180, 1200, 1160, 1210] }, // peak/neckline at 1200
        { date: '2025-01-07 00:00', data: [1210, 1180, 1170, 1190] }, // pullback
        { date: '2025-01-08 00:00', data: [1190, 1120, 1100, 1140] }, // decline
        { date: '2025-01-09 00:00', data: [1140, 1080, 1050, 1100] }, // second bottom at 1050 (higher than 1000)
        { date: '2025-01-10 00:00', data: [1100, 1140, 1080, 1160] }, // recovery start
        { date: '2025-01-11 00:00', data: [1160, 1190, 1150, 1195] }, // approaching neckline but no breakout
        { date: '2025-01-12 00:00', data: [1195, 1180, 1170, 1185] }, // pullback, no breakout
        { date: '2025-01-13 00:00', data: [1185, 1190, 1170, 1195] }, // still below neckline
      ];

      const result = await service.checkCondition(
        conditionKey,
        'MOCK_EXCHANGE',
        'MOCK_TICKER',
        EXCHANGE_SESSION.REGULAR
      );

      expect(result.met).toBe(false);
    });

    it('Check Condition - Not Met (Insufficient Data)', async () => {
      // Mock insufficient stock data
      FinanceUtilMock.StockPriceDataMock = [
        { date: '2025-01-01 00:00', data: [1100, 1080, 1070, 1120] },
        { date: '2025-01-02 00:00', data: [1080, 1060, 1050, 1090] },
      ];

      const result = await service.checkCondition(
        conditionKey,
        'MOCK_EXCHANGE',
        'MOCK_TICKER',
        EXCHANGE_SESSION.REGULAR
      );

      expect(result.met).toBe(false);
    });
  });
});