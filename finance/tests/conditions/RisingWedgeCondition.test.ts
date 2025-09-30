jest.mock('@finance/utils/FinanceUtil', () => {
  return {
    __esModule: true,
    default: require('@finance/tests/mocks/utils/FinanceUtilMock').default
  };
});

import ConditionService from '@finance/services/ConditionService';
import ExchangeServiceMock from '@finance/tests/mocks/services/ExchangeServiceMock';
import FinanceUtilMock from '@finance/tests/mocks/utils/FinanceUtilMock';
import RisingWedgeCondition from '@finance/conditions/RisingWedgeCondition';
import TickerServiceMock from '@finance/tests/mocks/services/TickerServiceMock';
import { EXCHANGE_SESSION } from '@finance/consts/ExchangeConsts';

describe('RisingWedgeCondition', () => {
  let service: ConditionService;
  const conditionKey = 'RisingWedge';

  beforeEach(() => {
    service = new ConditionService(
      new ExchangeServiceMock(),
      new TickerServiceMock()
    );
  });

  describe('上昇ウェッジ', () => {
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
      expect(info.name).toBe('上昇ウェッジ');
      expect(info.description).not.toBe('');
      expect(info.isBuyCondition).toBe(false);
      expect(info.isSellCondition).toBe(true);
    });

    it('Get Condition', () => {
      const ConditionClass = service.getCondition(conditionKey);
      expect(ConditionClass).toBeDefined();
    });

    it('Check Condition: 典型的な上昇ウェッジパターン（完全な形）', async () => {
      // Classic rising wedge pattern with converging trend lines and breakdown
      FinanceUtilMock.StockPriceDataMock = [
        // Early rising trend with wider spread
        { date: '2025-01-01 00:00', data: [1000, 1020, 990, 1025] },
        { date: '2025-01-02 00:00', data: [1025, 1010, 1005, 1030] },
        { date: '2025-01-03 00:00', data: [1030, 1040, 1015, 1045] }, // High: 1045, Low: 1015, spread: 30
        { date: '2025-01-04 00:00', data: [1045, 1035, 1020, 1050] },
        { date: '2025-01-05 00:00', data: [1050, 1055, 1030, 1060] }, // High: 1060, Low: 1030, spread: 30

        // Middle section - both highs and lows rising but converging
        { date: '2025-01-06 00:00', data: [1060, 1065, 1040, 1070] },
        { date: '2025-01-07 00:00', data: [1070, 1060, 1045, 1075] }, // High: 1075, Low: 1045, spread: 30
        { date: '2025-01-08 00:00', data: [1075, 1080, 1055, 1085] },
        { date: '2025-01-09 00:00', data: [1085, 1075, 1060, 1090] }, // High: 1090, Low: 1060, spread: 30
        { date: '2025-01-10 00:00', data: [1090, 1095, 1070, 1100] },

        // Later section - spread narrowing (convergence)
        { date: '2025-01-11 00:00', data: [1100, 1105, 1080, 1110] },
        { date: '2025-01-12 00:00', data: [1110, 1100, 1085, 1115] }, // High: 1115, Low: 1085, spread: 30
        { date: '2025-01-13 00:00', data: [1115, 1120, 1095, 1125] },
        { date: '2025-01-14 00:00', data: [1125, 1115, 1100, 1130] }, // High: 1130, Low: 1100, spread: 30
        { date: '2025-01-15 00:00', data: [1130, 1135, 1110, 1140] },

        // Final narrowing and breakdown
        { date: '2025-01-16 00:00', data: [1140, 1145, 1120, 1150] }, // High: 1150, Low: 1120, spread: 30
        { date: '2025-01-17 00:00', data: [1150, 1140, 1125, 1155] },
        { date: '2025-01-18 00:00', data: [1155, 1160, 1135, 1165] }, // High: 1165, Low: 1135, spread: 30
        { date: '2025-01-19 00:00', data: [1165, 1155, 1140, 1170] },

        // Breakdown confirmation - price breaks below lower trend line
        { date: '2025-01-20 00:00', data: [1170, 1120, 1110, 1130] }, // Breakdown begins
        { date: '2025-01-21 00:00', data: [1130, 1100, 1090, 1110] }, // Confirmed breakdown
        { date: '2025-01-22 00:00', data: [1110, 1090, 1080, 1095] }, // Sustained breakdown
        { date: '2025-01-23 00:00', data: [1095, 1080, 1070, 1085] }, // Further confirmation
        { date: '2025-01-24 00:00', data: [1085, 1070, 1060, 1075] }  // Current candle
      ];

      const result = await service.checkCondition(conditionKey, 'MOCK_EXCHANGE', 'MOCK_TICKER', EXCHANGE_SESSION.EXTENDED);

      expect(result.met).toBe(true);
      expect(result.message).not.toBe('');
    });

    it('Check Condition: 上昇ウェッジ未完成（収束不足）', async () => {
      // Rising trend but not converging enough to form a wedge
      FinanceUtilMock.StockPriceDataMock = [
        { date: '2025-01-01 00:00', data: [1000, 1020, 990, 1025] },
        { date: '2025-01-02 00:00', data: [1025, 1010, 1005, 1030] },
        { date: '2025-01-03 00:00', data: [1030, 1040, 1015, 1045] }, // High: 1045, Low: 1015, spread: 30
        { date: '2025-01-04 00:00', data: [1045, 1035, 1020, 1050] },
        { date: '2025-01-05 00:00', data: [1050, 1055, 1030, 1060] }, // High: 1060, Low: 1030, spread: 30

        // Parallel lines - not converging
        { date: '2025-01-06 00:00', data: [1060, 1065, 1040, 1070] },
        { date: '2025-01-07 00:00', data: [1070, 1060, 1045, 1075] }, // High: 1075, Low: 1045, spread: 30
        { date: '2025-01-08 00:00', data: [1075, 1080, 1055, 1085] },
        { date: '2025-01-09 00:00', data: [1085, 1075, 1060, 1090] }, // High: 1090, Low: 1060, spread: 30
        { date: '2025-01-10 00:00', data: [1090, 1095, 1070, 1100] },

        // Still parallel - no convergence
        { date: '2025-01-11 00:00', data: [1100, 1105, 1080, 1110] },
        { date: '2025-01-12 00:00', data: [1110, 1100, 1085, 1115] }, // High: 1115, Low: 1085, spread: 30
        { date: '2025-01-13 00:00', data: [1115, 1120, 1095, 1125] },
        { date: '2025-01-14 00:00', data: [1125, 1115, 1100, 1130] }, // High: 1130, Low: 1100, spread: 30
        { date: '2025-01-15 00:00', data: [1130, 1135, 1110, 1140] }
      ];

      const result = await service.checkCondition(conditionKey, 'MOCK_EXCHANGE', 'MOCK_TICKER', EXCHANGE_SESSION.EXTENDED);

      expect(result.met).toBe(false);
    });

    it('Check Condition: 下降トレンド（上昇ウェッジではない）', async () => {
      // Declining trend - opposite of rising wedge
      FinanceUtilMock.StockPriceDataMock = [
        { date: '2025-01-01 00:00', data: [1200, 1180, 1170, 1190] },
        { date: '2025-01-02 00:00', data: [1190, 1170, 1160, 1175] },
        { date: '2025-01-03 00:00', data: [1175, 1160, 1150, 1165] },
        { date: '2025-01-04 00:00', data: [1165, 1150, 1140, 1155] },
        { date: '2025-01-05 00:00', data: [1155, 1140, 1130, 1145] },
        { date: '2025-01-06 00:00', data: [1145, 1130, 1120, 1135] },
        { date: '2025-01-07 00:00', data: [1135, 1120, 1110, 1125] },
        { date: '2025-01-08 00:00', data: [1125, 1110, 1100, 1115] },
        { date: '2025-01-09 00:00', data: [1115, 1100, 1090, 1105] },
        { date: '2025-01-10 00:00', data: [1105, 1090, 1080, 1095] }
      ];

      const result = await service.checkCondition(conditionKey, 'MOCK_EXCHANGE', 'MOCK_TICKER', EXCHANGE_SESSION.EXTENDED);

      expect(result.met).toBe(false);
    });

    it('Check Condition: ブレイクダウンなし（ウェッジ形成のみ）', async () => {
      // Wedge formation but no breakdown confirmation
      FinanceUtilMock.StockPriceDataMock = [
        // Early rising trend with wider spread
        { date: '2025-01-01 00:00', data: [1000, 1020, 990, 1025] },
        { date: '2025-01-02 00:00', data: [1025, 1010, 1005, 1030] },
        { date: '2025-01-03 00:00', data: [1030, 1040, 1015, 1045] },
        { date: '2025-01-04 00:00', data: [1045, 1035, 1020, 1050] },
        { date: '2025-01-05 00:00', data: [1050, 1055, 1030, 1060] },

        // Converging pattern
        { date: '2025-01-06 00:00', data: [1060, 1065, 1040, 1070] },
        { date: '2025-01-07 00:00', data: [1070, 1060, 1045, 1075] },
        { date: '2025-01-08 00:00', data: [1075, 1080, 1055, 1085] },
        { date: '2025-01-09 00:00', data: [1085, 1075, 1060, 1090] },
        { date: '2025-01-10 00:00', data: [1090, 1095, 1070, 1100] },

        // Narrowing spread
        { date: '2025-01-11 00:00', data: [1100, 1105, 1085, 1110] },
        { date: '2025-01-12 00:00', data: [1110, 1100, 1090, 1115] },
        { date: '2025-01-13 00:00', data: [1115, 1120, 1105, 1125] },
        { date: '2025-01-14 00:00', data: [1125, 1115, 1110, 1130] },

        // No breakdown - price stays within wedge
        { date: '2025-01-15 00:00', data: [1130, 1135, 1115, 1140] },
        { date: '2025-01-16 00:00', data: [1140, 1145, 1125, 1150] },
        { date: '2025-01-17 00:00', data: [1150, 1155, 1135, 1160] } // Still within bounds
      ];

      const result = await service.checkCondition(conditionKey, 'MOCK_EXCHANGE', 'MOCK_TICKER', EXCHANGE_SESSION.EXTENDED);

      expect(result.met).toBe(false);
    });

    it('Check Condition: データ不足', async () => {
      // Insufficient data points to form a pattern
      FinanceUtilMock.StockPriceDataMock = [
        { date: '2025-01-01 00:00', data: [1000, 1020, 990, 1025] },
        { date: '2025-01-02 00:00', data: [1025, 1010, 1005, 1030] },
        { date: '2025-01-03 00:00', data: [1030, 1040, 1015, 1045] }
      ];

      const result = await service.checkCondition(conditionKey, 'MOCK_EXCHANGE', 'MOCK_TICKER', EXCHANGE_SESSION.EXTENDED);

      expect(result.met).toBe(false);
    });

    it('Check Condition: 急角度での収束（強い上昇ウェッジ）', async () => {
      // Steeper lower trend line showing strong convergence
      FinanceUtilMock.StockPriceDataMock = [
        // Early phase - wide spread
        { date: '2025-01-01 00:00', data: [1000, 1020, 980, 1025] },  // Spread: 45
        { date: '2025-01-02 00:00', data: [1025, 1030, 1000, 1035] },
        { date: '2025-01-03 00:00', data: [1035, 1045, 1015, 1050] }, // Spread: 35
        { date: '2025-01-04 00:00', data: [1050, 1055, 1030, 1060] },
        { date: '2025-01-05 00:00', data: [1060, 1070, 1045, 1075] }, // Spread: 30
        
        // Middle phase - narrowing
        { date: '2025-01-06 00:00', data: [1075, 1080, 1060, 1085] },
        { date: '2025-01-07 00:00', data: [1085, 1090, 1072, 1095] }, // Spread: 23
        { date: '2025-01-08 00:00', data: [1095, 1100, 1082, 1105] },
        { date: '2025-01-09 00:00', data: [1105, 1110, 1092, 1115] }, // Spread: 23
        { date: '2025-01-10 00:00', data: [1115, 1120, 1102, 1125] },
        
        // Late phase - tight convergence
        { date: '2025-01-11 00:00', data: [1125, 1128, 1110, 1132] },
        { date: '2025-01-12 00:00', data: [1132, 1135, 1118, 1138] }, // Spread: 20
        { date: '2025-01-13 00:00', data: [1138, 1142, 1125, 1145] },
        { date: '2025-01-14 00:00', data: [1145, 1148, 1132, 1150] }, // Spread: 18
        { date: '2025-01-15 00:00', data: [1150, 1152, 1138, 1155] },
        
        // Breakdown
        { date: '2025-01-16 00:00', data: [1155, 1135, 1125, 1140] },
        { date: '2025-01-17 00:00', data: [1140, 1115, 1105, 1120] },
        { date: '2025-01-18 00:00', data: [1120, 1095, 1085, 1100] },
        { date: '2025-01-19 00:00', data: [1100, 1085, 1075, 1090] },
        { date: '2025-01-20 00:00', data: [1090, 1070, 1060, 1075] }
      ];

      const result = await service.checkCondition(conditionKey, 'MOCK_EXCHANGE', 'MOCK_TICKER', EXCHANGE_SESSION.EXTENDED);

      expect(result.met).toBe(true);
    });

    it('Check Condition: 緩やかな収束（ゆるやかな上昇ウェッジ）', async () => {
      // Slower convergence pattern
      FinanceUtilMock.StockPriceDataMock = [
        // Gradual narrowing over longer period
        { date: '2025-01-01 00:00', data: [1000, 1020, 990, 1025] },  // Spread: 35
        { date: '2025-01-02 00:00', data: [1025, 1030, 1005, 1035] },
        { date: '2025-01-03 00:00', data: [1035, 1040, 1015, 1045] },
        { date: '2025-01-04 00:00', data: [1045, 1050, 1025, 1055] }, // Spread: 30
        { date: '2025-01-05 00:00', data: [1055, 1060, 1035, 1065] },
        { date: '2025-01-06 00:00', data: [1065, 1070, 1045, 1075] },
        { date: '2025-01-07 00:00', data: [1075, 1080, 1055, 1085] }, // Spread: 30
        { date: '2025-01-08 00:00', data: [1085, 1090, 1065, 1095] },
        { date: '2025-01-09 00:00', data: [1095, 1100, 1075, 1105] },
        { date: '2025-01-10 00:00', data: [1105, 1110, 1087, 1115] }, // Spread: 28
        { date: '2025-01-11 00:00', data: [1115, 1120, 1095, 1125] },
        { date: '2025-01-12 00:00', data: [1125, 1130, 1105, 1135] },
        { date: '2025-01-13 00:00', data: [1135, 1140, 1117, 1145] }, // Spread: 28
        { date: '2025-01-14 00:00', data: [1145, 1150, 1125, 1155] },
        { date: '2025-01-15 00:00', data: [1155, 1160, 1137, 1165] }, // Spread: 28
        
        // Breakdown
        { date: '2025-01-16 00:00', data: [1165, 1145, 1130, 1150] },
        { date: '2025-01-17 00:00', data: [1150, 1125, 1115, 1130] },
        { date: '2025-01-18 00:00', data: [1130, 1110, 1100, 1115] },
        { date: '2025-01-19 00:00', data: [1115, 1095, 1085, 1100] },
        { date: '2025-01-20 00:00', data: [1100, 1080, 1070, 1085] }
      ];

      const result = await service.checkCondition(conditionKey, 'MOCK_EXCHANGE', 'MOCK_TICKER', EXCHANGE_SESSION.EXTENDED);

      expect(result.met).toBe(true);
    });

    it('Check Condition: 上昇拡大（発散パターン）', async () => {
      // Diverging pattern - spread is widening, not narrowing (opposite of wedge)
      FinanceUtilMock.StockPriceDataMock = [
        { date: '2025-01-01 00:00', data: [1000, 1020, 995, 1025] },   // Spread: 30
        { date: '2025-01-02 00:00', data: [1025, 1030, 1010, 1035] },
        { date: '2025-01-03 00:00', data: [1035, 1045, 1018, 1050] },  // Spread: 32
        { date: '2025-01-04 00:00', data: [1050, 1055, 1025, 1060] },
        { date: '2025-01-05 00:00', data: [1060, 1070, 1032, 1075] },  // Spread: 43
        { date: '2025-01-06 00:00', data: [1075, 1080, 1040, 1085] },
        { date: '2025-01-07 00:00', data: [1085, 1095, 1047, 1100] },  // Spread: 53
        { date: '2025-01-08 00:00', data: [1100, 1105, 1052, 1110] },
        { date: '2025-01-09 00:00', data: [1110, 1120, 1058, 1125] },  // Spread: 67
        { date: '2025-01-10 00:00', data: [1125, 1130, 1063, 1135] },
        { date: '2025-01-11 00:00', data: [1135, 1145, 1068, 1150] },  // Spread: 82
        { date: '2025-01-12 00:00', data: [1150, 1155, 1072, 1160] },
        { date: '2025-01-13 00:00', data: [1160, 1170, 1075, 1175] },  // Spread: 100
        { date: '2025-01-14 00:00', data: [1175, 1180, 1078, 1185] },
        { date: '2025-01-15 00:00', data: [1185, 1195, 1080, 1200] },  // Spread: 120
        { date: '2025-01-16 00:00', data: [1200, 1190, 1075, 1195] },
        { date: '2025-01-17 00:00', data: [1195, 1185, 1070, 1190] },
        { date: '2025-01-18 00:00', data: [1190, 1180, 1065, 1185] },
        { date: '2025-01-19 00:00', data: [1185, 1175, 1060, 1180] },
        { date: '2025-01-20 00:00', data: [1180, 1170, 1055, 1175] }
      ];

      const result = await service.checkCondition(conditionKey, 'MOCK_EXCHANGE', 'MOCK_TICKER', EXCHANGE_SESSION.EXTENDED);

      expect(result.met).toBe(false);
    });

    it('Check Condition: 横ばいトレンド（上昇していない）', async () => {
      // Sideways trend without rising characteristic
      FinanceUtilMock.StockPriceDataMock = [
        { date: '2025-01-01 00:00', data: [1000, 1010, 990, 1015] },
        { date: '2025-01-02 00:00', data: [1015, 1020, 995, 1025] },
        { date: '2025-01-03 00:00', data: [1025, 1015, 1000, 1020] },
        { date: '2025-01-04 00:00', data: [1020, 1025, 1005, 1030] },
        { date: '2025-01-05 00:00', data: [1030, 1020, 1010, 1025] },
        { date: '2025-01-06 00:00', data: [1025, 1030, 1015, 1035] },
        { date: '2025-01-07 00:00', data: [1035, 1025, 1020, 1030] },
        { date: '2025-01-08 00:00', data: [1030, 1035, 1025, 1040] },
        { date: '2025-01-09 00:00', data: [1040, 1030, 1025, 1035] },
        { date: '2025-01-10 00:00', data: [1035, 1040, 1030, 1045] },
        { date: '2025-01-11 00:00', data: [1045, 1035, 1030, 1040] },
        { date: '2025-01-12 00:00', data: [1040, 1045, 1035, 1050] },
        { date: '2025-01-13 00:00', data: [1050, 1040, 1035, 1045] },
        { date: '2025-01-14 00:00', data: [1045, 1050, 1040, 1055] },
        { date: '2025-01-15 00:00', data: [1055, 1045, 1040, 1050] }
      ];

      const result = await service.checkCondition(conditionKey, 'MOCK_EXCHANGE', 'MOCK_TICKER', EXCHANGE_SESSION.EXTENDED);

      expect(result.met).toBe(false);
    });
  });
});