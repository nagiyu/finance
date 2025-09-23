"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
jest.mock('@finance/utils/FinanceUtil', function () {
    return {
        __esModule: true,
        default: require('@finance/tests/mocks/utils/FinanceUtilMock').default
    };
});
var ConditionService_1 = __importDefault(require("@finance/services/ConditionService"));
var DoubleTopCondition_1 = __importDefault(require("@finance/conditions/DoubleTopCondition"));
var ExchangeServiceMock_1 = __importDefault(require("@finance/tests/mocks/services/ExchangeServiceMock"));
var FinanceUtilMock_1 = __importDefault(require("@finance/tests/mocks/utils/FinanceUtilMock"));
var GreaterThanCondition_1 = __importDefault(require("@finance/conditions/GreaterThanCondition"));
var LessThanCondition_1 = __importDefault(require("@finance/conditions/LessThanCondition"));
var SansenAkenomyojoCondition_1 = __importDefault(require("@finance/conditions/SansenAkenomyojoCondition"));
var SansenYoinomyojoCondition_1 = __importDefault(require("@finance/conditions/SansenYoinomyojoCondition"));
var SanzonCondition_1 = __importDefault(require("@finance/conditions/SanzonCondition"));
var TickerServiceMock_1 = __importDefault(require("@finance/tests/mocks/services/TickerServiceMock"));
var ExchangeConsts_1 = require("@finance/consts/ExchangeConsts");
describe('ConditionTest', function () {
    var service;
    beforeEach(function () {
        service = new ConditionService_1.default(new ExchangeServiceMock_1.default(), new TickerServiceMock_1.default());
    });
    describe('指定価格を上回る', function () {
        var conditionKey = 'GreaterThan';
        it('Contains in Buy Condition List', function () {
            var conditionList = service.getBuyConditionList();
            expect(conditionList).toContain(conditionKey);
        });
        it('Contains in Sell Condition List', function () {
            var conditionList = service.getSellConditionList();
            expect(conditionList).toContain(conditionKey);
        });
        it('Get Condition Info', function () {
            var info = service.getConditionInfo(conditionKey);
            expect(info.name).toBe('指定価格を上回る');
            expect(info.description).not.toBe('');
            expect(info.isBuyCondition).toBe(true);
            expect(info.isSellCondition).toBe(true);
        });
        it('Get Condition', function () {
            var ConditionClass = service.getCondition(conditionKey);
            expect(ConditionClass).toBe(GreaterThanCondition_1.default);
        });
        it('Check Condition', function () { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        FinanceUtilMock_1.default.StockPriceDataMock = [
                            {
                                date: '2025-01-01 00:00',
                                data: [1000, 960, 950, 1010]
                            }
                        ];
                        return [4 /*yield*/, service.checkCondition(conditionKey, 'MOCK_EXCHANGE', 'MOCK_TICKER', ExchangeConsts_1.EXCHANGE_SESSION.EXTENDED, 950)];
                    case 1:
                        result = _a.sent();
                        expect(result.met).toBe(true);
                        expect(result.message).not.toBe('');
                        return [2 /*return*/];
                }
            });
        }); });
        it('Check Condition: targetPrice=0で条件判定が動作する', function () { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        FinanceUtilMock_1.default.StockPriceDataMock = [
                            {
                                date: '2025-01-01 00:00',
                                data: [1000, 960, 950, 10] // 終値10
                            }
                        ];
                        return [4 /*yield*/, service.checkCondition(conditionKey, 'MOCK_EXCHANGE', 'MOCK_TICKER', ExchangeConsts_1.EXCHANGE_SESSION.EXTENDED, 0)];
                    case 1:
                        result = _a.sent();
                        expect(result.met).toBe(true);
                        expect(result.message).not.toBe('');
                        return [2 /*return*/];
                }
            });
        }); });
        it('Check Condition: targetPrice未指定で例外', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, expect(service.checkCondition(conditionKey, 'MOCK_EXCHANGE', 'MOCK_TICKER', ExchangeConsts_1.EXCHANGE_SESSION.EXTENDED)).rejects.toThrow('Target price is required for GreaterThanCondition')];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('指定価格を下回る', function () {
        var conditionKey = 'LessThan';
        it('Contains in Buy Condition List', function () {
            var conditionList = service.getBuyConditionList();
            expect(conditionList).toContain(conditionKey);
        });
        it('Contains in Sell Condition List', function () {
            var conditionList = service.getSellConditionList();
            expect(conditionList).toContain(conditionKey);
        });
        it('Get Condition Info', function () {
            var info = service.getConditionInfo(conditionKey);
            expect(info.name).toBe('指定価格を下回る');
            expect(info.description).not.toBe('');
            expect(info.isBuyCondition).toBe(true);
            expect(info.isSellCondition).toBe(true);
        });
        it('Get Condition', function () {
            var ConditionClass = service.getCondition(conditionKey);
            expect(ConditionClass).toBe(LessThanCondition_1.default);
        });
        it('Check Condition: currentPrice < targetPrice', function () { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        FinanceUtilMock_1.default.StockPriceDataMock = [
                            {
                                date: '2025-01-01 00:00',
                                data: [1000, 900, 950, 960] // 終値900
                            }
                        ];
                        return [4 /*yield*/, service.checkCondition(conditionKey, 'MOCK_EXCHANGE', 'MOCK_TICKER', ExchangeConsts_1.EXCHANGE_SESSION.EXTENDED, 950)];
                    case 1:
                        result = _a.sent();
                        expect(result.met).toBe(true);
                        expect(result.message).not.toBe('');
                        return [2 /*return*/];
                }
            });
        }); });
        it('Check Condition: currentPrice >= targetPrice', function () { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        FinanceUtilMock_1.default.StockPriceDataMock = [
                            {
                                date: '2025-01-01 00:00',
                                data: [1000, 1000, 950, 960] // 終値1000
                            }
                        ];
                        return [4 /*yield*/, service.checkCondition(conditionKey, 'MOCK_EXCHANGE', 'MOCK_TICKER', ExchangeConsts_1.EXCHANGE_SESSION.EXTENDED, 950)];
                    case 1:
                        result = _a.sent();
                        expect(result.met).toBe(false);
                        expect(result.message).not.toBe('');
                        return [2 /*return*/];
                }
            });
        }); });
        it('Check Condition: targetPrice=0で条件判定が動作する', function () { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        FinanceUtilMock_1.default.StockPriceDataMock = [
                            {
                                date: '2025-01-01 00:00',
                                data: [1000, -1, 950, 960] // high価格が-1 (0を下回る)
                            }
                        ];
                        return [4 /*yield*/, service.checkCondition(conditionKey, 'MOCK_EXCHANGE', 'MOCK_TICKER', ExchangeConsts_1.EXCHANGE_SESSION.EXTENDED, 0)];
                    case 1:
                        result = _a.sent();
                        expect(result.met).toBe(true);
                        expect(result.message).not.toBe('');
                        return [2 /*return*/];
                }
            });
        }); });
        it('Check Condition: targetPrice未指定で例外', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, expect(service.checkCondition(conditionKey, 'MOCK_EXCHANGE', 'MOCK_TICKER', ExchangeConsts_1.EXCHANGE_SESSION.EXTENDED)).rejects.toThrow('Target price is required for LessThanCondition')];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('三川明けの明星', function () {
        var conditionKey = 'SansenAkenomyojo';
        it('Contains in Buy Condition List', function () {
            var conditionList = service.getBuyConditionList();
            expect(conditionList).toContain(conditionKey);
        });
        it('Not Contains in Sell Condition List', function () {
            var conditionList = service.getSellConditionList();
            expect(conditionList).not.toContain(conditionKey);
        });
        it('Get Condition Info', function () {
            var info = service.getConditionInfo(conditionKey);
            expect(info.name).toBe('三川明けの明星');
            expect(info.description).not.toBe('');
            expect(info.isBuyCondition).toBe(true);
            expect(info.isSellCondition).toBe(false);
        });
        it('Get Condition', function () {
            var ConditionClass = service.getCondition(conditionKey);
            expect(ConditionClass).toBe(SansenAkenomyojoCondition_1.default);
        });
        it('Check Condition', function () { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        FinanceUtilMock_1.default.StockPriceDataMock = [
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
                        return [4 /*yield*/, service.checkCondition(conditionKey, 'MOCK_EXCHANGE', 'MOCK_TICKER', ExchangeConsts_1.EXCHANGE_SESSION.EXTENDED)];
                    case 1:
                        result = _a.sent();
                        expect(result.met).toBe(true);
                        expect(result.message).not.toBe('');
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('三川宵の明星', function () {
        var conditionKey = 'SansenYoinomyojo';
        it('Not Contains in Buy Condition List', function () {
            var conditionList = service.getBuyConditionList();
            expect(conditionList).not.toContain(conditionKey);
        });
        it('Contains in Sell Condition List', function () {
            var conditionList = service.getSellConditionList();
            expect(conditionList).toContain(conditionKey);
        });
        it('Get Condition Info', function () {
            var info = service.getConditionInfo(conditionKey);
            expect(info.name).toBe('三川宵の明星');
            expect(info.description).not.toBe('');
            expect(info.isBuyCondition).toBe(false);
            expect(info.isSellCondition).toBe(true);
        });
        it('Get Condition', function () {
            var ConditionClass = service.getCondition(conditionKey);
            expect(ConditionClass).toBe(SansenYoinomyojoCondition_1.default);
        });
        it('Check Condition', function () { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Evening star pattern: large bullish, small bearish with gap up, large bearish
                        FinanceUtilMock_1.default.StockPriceDataMock = [
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
                        return [4 /*yield*/, service.checkCondition(conditionKey, 'MOCK_EXCHANGE', 'MOCK_TICKER', ExchangeConsts_1.EXCHANGE_SESSION.EXTENDED)];
                    case 1:
                        result = _a.sent();
                        expect(result.met).toBe(true);
                        expect(result.message).not.toBe('');
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('三尊', function () {
        var conditionKey = 'Sanzon';
        it('Not Contains in Buy Condition List', function () {
            var conditionList = service.getBuyConditionList();
            expect(conditionList).not.toContain(conditionKey);
        });
        it('Contains in Sell Condition List', function () {
            var conditionList = service.getSellConditionList();
            expect(conditionList).toContain(conditionKey);
        });
        it('Get Condition Info', function () {
            var info = service.getConditionInfo(conditionKey);
            expect(info.name).toBe('三尊');
            expect(info.description).not.toBe('');
            expect(info.isBuyCondition).toBe(false);
            expect(info.isSellCondition).toBe(true);
        });
        it('Get Condition', function () {
            var ConditionClass = service.getCondition(conditionKey);
            expect(ConditionClass).toBe(SanzonCondition_1.default);
        });
        it('Check Condition', function () { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Very explicit head and shoulders pattern
                        FinanceUtilMock_1.default.StockPriceDataMock = [
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
                            { date: '2025-01-13 00:00', data: [1000, 995, 985, 1005] }, // Break: close=995 < neckline=1002.5
                            { date: '2025-01-14 00:00', data: [995, 980, 975, 1000] },
                            { date: '2025-01-15 00:00', data: [980, 970, 965, 985] } // Added 15th item
                        ];
                        return [4 /*yield*/, service.checkCondition(conditionKey, 'MOCK_EXCHANGE', 'MOCK_TICKER', ExchangeConsts_1.EXCHANGE_SESSION.EXTENDED)];
                    case 1:
                        result = _a.sent();
                        expect(result.met).toBe(true);
                        expect(result.message).not.toBe('');
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('ダブルトップ', function () {
        var conditionKey = 'DoubleTop';
        it('Not Contains in Buy Condition List', function () {
            var conditionList = service.getBuyConditionList();
            expect(conditionList).not.toContain(conditionKey);
        });
        it('Contains in Sell Condition List', function () {
            var conditionList = service.getSellConditionList();
            expect(conditionList).toContain(conditionKey);
        });
        it('Get Condition Info', function () {
            var info = service.getConditionInfo(conditionKey);
            expect(info.name).toBe('ダブルトップ');
            expect(info.description).not.toBe('');
            expect(info.isBuyCondition).toBe(false);
            expect(info.isSellCondition).toBe(true);
        });
        it('Get Condition', function () {
            var ConditionClass = service.getCondition(conditionKey);
            expect(ConditionClass).toBe(DoubleTopCondition_1.default);
        });
        it('Check Condition', function () { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Double top pattern: two peaks at similar levels with valley between, then breakdown below neckline
                        FinanceUtilMock_1.default.StockPriceDataMock = [
                            // Build up to first peak
                            { date: '2025-01-01 00:00', data: [950, 970, 945, 975] },
                            { date: '2025-01-02 00:00', data: [970, 990, 965, 995] },
                            // First peak at 1000
                            { date: '2025-01-03 00:00', data: [990, 1000, 985, 1000] }, // First top: high=1000
                            // Valley formation (neckline around 900)
                            { date: '2025-01-04 00:00', data: [1000, 950, 940, 960] },
                            { date: '2025-01-05 00:00', data: [950, 920, 900, 930] }, // Valley: low=900 (neckline)
                            { date: '2025-01-06 00:00', data: [920, 910, 905, 925] },
                            // Recovery towards second peak
                            { date: '2025-01-07 00:00', data: [910, 940, 910, 945] },
                            { date: '2025-01-08 00:00', data: [940, 970, 935, 975] },
                            { date: '2025-01-09 00:00', data: [970, 990, 965, 995] },
                            // Second peak at similar level to first (990, within 5% of 1000)
                            { date: '2025-01-10 00:00', data: [990, 990, 980, 990] }, // Second top: high=990 (similar to 1000)
                            // Decline and breakdown below neckline
                            { date: '2025-01-11 00:00', data: [990, 950, 940, 960] },
                            { date: '2025-01-12 00:00', data: [950, 920, 910, 930] },
                            { date: '2025-01-13 00:00', data: [920, 890, 880, 895] }, // Break below neckline: close=895 < 900
                            { date: '2025-01-14 00:00', data: [890, 880, 870, 885] }, // Confirmation: close=885 < 900
                            { date: '2025-01-15 00:00', data: [880, 870, 860, 875] },
                            { date: '2025-01-16 00:00', data: [870, 860, 850, 865] },
                            { date: '2025-01-17 00:00', data: [860, 850, 840, 855] },
                            { date: '2025-01-18 00:00', data: [850, 840, 830, 845] },
                            { date: '2025-01-19 00:00', data: [840, 830, 820, 835] },
                            { date: '2025-01-20 00:00', data: [830, 820, 810, 825] }
                        ];
                        return [4 /*yield*/, service.checkCondition(conditionKey, 'MOCK_EXCHANGE', 'MOCK_TICKER', ExchangeConsts_1.EXCHANGE_SESSION.EXTENDED)];
                    case 1:
                        result = _a.sent();
                        expect(result.met).toBe(true);
                        expect(result.message).not.toBe('');
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
