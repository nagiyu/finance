jest.mock('@finance/utils/FinanceUtil', () => {
  return {
    __esModule: true,
    default: jest.requireActual('@finance/tests/mocks/utils/FinanceUtilMock').default,
  };
});

import ConditionService from '@finance/services/ConditionService';
import ExchangeServiceMock from '@finance/tests/mocks/services/ExchangeServiceMock';
import FinanceUtilMock from '@finance/tests/mocks/utils/FinanceUtilMock';
import AscendingTriangleCondition from '@finance/conditions/AscendingTriangleCondition';
import TickerServiceMock from '@finance/tests/mocks/services/TickerServiceMock';
import { EXCHANGE_SESSION } from '@finance/consts/ExchangeConsts';

describe('AscendingTriangleCondition', () => {
  let service: ConditionService;
  const conditionKey = 'AscendingTriangle';

  beforeEach(() => {
    service = new ConditionService(new ExchangeServiceMock(), new TickerServiceMock());
  });

  describe('アセンディング・トライアングル', () => {
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
      expect(info.name).toBe('アセンディング・トライアングル');
      expect(info.description).not.toBe('');
      expect(info.isBuyCondition).toBe(true);
      expect(info.isSellCondition).toBe(false);
    });

    it('Get Condition', () => {
      const ConditionClass = service.getCondition(conditionKey);
      expect(ConditionClass).toBe(AscendingTriangleCondition);
    });

    it('Check Condition: 典型的なアセンディング・トライアングルパターン', async () => {
      // Classic ascending triangle pattern with horizontal resistance and rising support
      FinanceUtilMock.StockPriceDataMock = [
        // Early pattern formation - lower lows
        { date: '2025-01-01 00:00', data: [1000, 1020, 990, 1025] }, // Low: 990
        { date: '2025-01-02 00:00', data: [1025, 1050, 1020, 1055] }, // High: 1055, Low: 1020
        { date: '2025-01-03 00:00', data: [1055, 1048, 1035, 1058] }, // High: 1058 (resistance)
        { date: '2025-01-04 00:00', data: [1048, 1030, 1025, 1052] }, // Pullback
        { date: '2025-01-05 00:00', data: [1030, 1045, 1025, 1050] }, // Higher low: 1025

        // Middle section - pattern continues
        { date: '2025-01-06 00:00', data: [1045, 1055, 1040, 1060] }, // High: 1060 (near resistance)
        { date: '2025-01-07 00:00', data: [1055, 1052, 1045, 1058] }, // Rejection at resistance
        { date: '2025-01-08 00:00', data: [1052, 1035, 1030, 1055] }, // Higher low: 1030
        { date: '2025-01-09 00:00', data: [1035, 1050, 1035, 1055] }, // Consolidation
        { date: '2025-01-10 00:00', data: [1050, 1058, 1045, 1062] }, // Test resistance again

        // Pattern completion
        { date: '2025-01-11 00:00', data: [1058, 1055, 1050, 1060] }, // Higher low: 1050
        { date: '2025-01-12 00:00', data: [1055, 1059, 1052, 1065] }, // Near resistance
        { date: '2025-01-13 00:00', data: [1059, 1057, 1055, 1062] }, // Higher low: 1055
        { date: '2025-01-14 00:00', data: [1057, 1062, 1056, 1065] }, // Testing resistance
        { date: '2025-01-15 00:00', data: [1062, 1070, 1060, 1075] }, // Breakout above 1058-1062 resistance

        // Confirmation
        { date: '2025-01-16 00:00', data: [1070, 1072, 1065, 1076] }, // Closes above resistance
        { date: '2025-01-17 00:00', data: [1072, 1078, 1068, 1080] }, // Continued upward momentum
        { date: '2025-01-18 00:00', data: [1078, 1085, 1075, 1088] }, // Strong follow through
        { date: '2025-01-19 00:00', data: [1085, 1082, 1080, 1090] }, // Consolidation above breakout
        { date: '2025-01-20 00:00', data: [1082, 1095, 1080, 1098] }, // Continued strength
      ];

      const result = await service.checkCondition(
        conditionKey,
        'MOCK_EXCHANGE',
        'MOCK_TICKER',
        EXCHANGE_SESSION.EXTENDED
      );

      expect(result.met).toBe(true);
    });

    it('Check Condition: 不完全なパターン（水平抵抗線なし）', async () => {
      // Pattern without clear horizontal resistance - just uptrend
      FinanceUtilMock.StockPriceDataMock = [
        { date: '2025-01-01 00:00', data: [1000, 1020, 990, 1025] },
        { date: '2025-01-02 00:00', data: [1025, 1050, 1020, 1055] },
        { date: '2025-01-03 00:00', data: [1055, 1080, 1050, 1085] }, // Much higher high
        { date: '2025-01-04 00:00', data: [1080, 1100, 1075, 1105] }, // Continuing higher
        { date: '2025-01-05 00:00', data: [1100, 1120, 1095, 1125] }, // No horizontal resistance
        { date: '2025-01-06 00:00', data: [1120, 1140, 1115, 1145] },
        { date: '2025-01-07 00:00', data: [1140, 1160, 1135, 1165] },
        { date: '2025-01-08 00:00', data: [1160, 1180, 1155, 1185] },
        { date: '2025-01-09 00:00', data: [1180, 1200, 1175, 1205] },
        { date: '2025-01-10 00:00', data: [1200, 1220, 1195, 1225] },
        { date: '2025-01-11 00:00', data: [1220, 1240, 1215, 1245] },
        { date: '2025-01-12 00:00', data: [1240, 1260, 1235, 1265] },
        { date: '2025-01-13 00:00', data: [1260, 1280, 1255, 1285] },
        { date: '2025-01-14 00:00', data: [1280, 1300, 1275, 1305] },
        { date: '2025-01-15 00:00', data: [1300, 1320, 1295, 1325] },
      ];

      const result = await service.checkCondition(
        conditionKey,
        'MOCK_EXCHANGE',
        'MOCK_TICKER',
        EXCHANGE_SESSION.EXTENDED
      );

      expect(result.met).toBe(false);
    });

    it('Check Condition: ブレイクアウトなし（抵抗線での反発）', async () => {
      // Pattern forms but no breakout - price gets rejected at resistance
      FinanceUtilMock.StockPriceDataMock = [
        { date: '2025-01-01 00:00', data: [1000, 1020, 990, 1025] }, // Low: 990
        { date: '2025-01-02 00:00', data: [1025, 1050, 1020, 1055] }, // High: 1055
        { date: '2025-01-03 00:00', data: [1055, 1048, 1035, 1058] }, // High: 1058 (resistance)
        { date: '2025-01-04 00:00', data: [1048, 1030, 1025, 1052] }, // Pullback
        { date: '2025-01-05 00:00', data: [1030, 1045, 1030, 1050] }, // Higher low: 1030
        { date: '2025-01-06 00:00', data: [1045, 1055, 1040, 1060] }, // High: 1060 (near resistance)
        { date: '2025-01-07 00:00', data: [1055, 1052, 1045, 1058] }, // Rejection at resistance
        { date: '2025-01-08 00:00', data: [1052, 1035, 1035, 1055] }, // Higher low: 1035
        { date: '2025-01-09 00:00', data: [1035, 1050, 1040, 1055] }, // Consolidation
        { date: '2025-01-10 00:00', data: [1050, 1058, 1045, 1062] }, // Test resistance
        { date: '2025-01-11 00:00', data: [1058, 1055, 1050, 1060] }, // Higher low: 1050
        { date: '2025-01-12 00:00', data: [1055, 1059, 1052, 1065] }, // Near resistance
        { date: '2025-01-13 00:00', data: [1059, 1057, 1055, 1062] }, // Higher low: 1055
        // Failed breakout - price gets rejected and falls
        { date: '2025-01-14 00:00', data: [1057, 1045, 1040, 1060] }, // Rejection, closes lower
        { date: '2025-01-15 00:00', data: [1045, 1035, 1030, 1050] }, // Continued weakness
      ];

      const result = await service.checkCondition(
        conditionKey,
        'MOCK_EXCHANGE',
        'MOCK_TICKER',
        EXCHANGE_SESSION.EXTENDED
      );

      expect(result.met).toBe(false);
    });

    it('Check Condition: 下降トレンド（アセンディング・トライアングルの反対）', async () => {
      // Descending pattern - opposite of ascending triangle
      FinanceUtilMock.StockPriceDataMock = [
        { date: '2025-01-01 00:00', data: [1200, 1180, 1170, 1190] },
        { date: '2025-01-02 00:00', data: [1180, 1160, 1150, 1170] },
        { date: '2025-01-03 00:00', data: [1160, 1140, 1130, 1150] },
        { date: '2025-01-04 00:00', data: [1140, 1120, 1110, 1130] },
        { date: '2025-01-05 00:00', data: [1120, 1100, 1090, 1110] },
        { date: '2025-01-06 00:00', data: [1100, 1080, 1070, 1090] },
        { date: '2025-01-07 00:00', data: [1080, 1060, 1050, 1070] },
        { date: '2025-01-08 00:00', data: [1060, 1040, 1030, 1050] },
        { date: '2025-01-09 00:00', data: [1040, 1020, 1010, 1030] },
        { date: '2025-01-10 00:00', data: [1020, 1000, 990, 1010] },
        { date: '2025-01-11 00:00', data: [1000, 980, 970, 990] },
        { date: '2025-01-12 00:00', data: [980, 960, 950, 970] },
        { date: '2025-01-13 00:00', data: [960, 940, 930, 950] },
        { date: '2025-01-14 00:00', data: [940, 920, 910, 930] },
        { date: '2025-01-15 00:00', data: [920, 900, 890, 910] },
      ];

      const result = await service.checkCondition(
        conditionKey,
        'MOCK_EXCHANGE',
        'MOCK_TICKER',
        EXCHANGE_SESSION.EXTENDED
      );

      expect(result.met).toBe(false);
    });

    it('Check Condition: データ不足', async () => {
      // Insufficient data points
      FinanceUtilMock.StockPriceDataMock = [
        { date: '2025-01-01 00:00', data: [1000, 1020, 990, 1025] },
        { date: '2025-01-02 00:00', data: [1025, 1050, 1020, 1055] },
        { date: '2025-01-03 00:00', data: [1055, 1048, 1035, 1058] },
      ];

      const result = await service.checkCondition(
        conditionKey,
        'MOCK_EXCHANGE',
        'MOCK_TICKER',
        EXCHANGE_SESSION.EXTENDED
      );

      expect(result.met).toBe(false);
    });
  });
});
