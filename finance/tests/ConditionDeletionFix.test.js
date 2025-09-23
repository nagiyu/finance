"use strict";
/**
 * Test to verify that condition deletions are properly preserved
 * during notification processing
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var ExchangeServiceMock_1 = __importDefault(require("@finance/tests/mocks/services/ExchangeServiceMock"));
var FinanceNotificationDataAccessorMock_1 = __importDefault(require("@finance/tests/mocks/services/FinanceNotificationDataAccessorMock"));
var FinanceNotificationService_1 = __importDefault(require("../services/FinanceNotificationService"));
var FinanceUtilMock_1 = __importDefault(require("@finance/tests/mocks/utils/FinanceUtilMock"));
var TickerServiceMock_1 = __importDefault(require("@finance/tests/mocks/services/TickerServiceMock"));
// Mock NotificationService
var mockNotificationService = {
    sendPushNotification: jest.fn()
};
describe('FinanceNotificationService - Condition Deletion Fix', function () {
    var service;
    var superGetByIdSpy;
    var superUpdateSpy;
    var dataAccessor = new FinanceNotificationDataAccessorMock_1.default();
    var exchangeService = new ExchangeServiceMock_1.default();
    var tickerService = new TickerServiceMock_1.default();
    var conditionService = new ConditionService_1.default(exchangeService, tickerService);
    beforeEach(function () {
        jest.clearAllMocks();
        // Setup mock stock price data  
        FinanceUtilMock_1.default.StockPriceDataMock = [
            {
                date: '2025-01-01 00:00',
                data: [1000, 960, 950, 1010]
            }
        ];
        service = new FinanceNotificationService_1.default(dataAccessor, exchangeService, tickerService, conditionService, mockNotificationService);
        // Mock the base class methods
        jest.spyOn(service, 'get').mockImplementation(jest.fn());
        superGetByIdSpy = jest.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(service)), 'getById').mockImplementation(jest.fn());
        superUpdateSpy = jest.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(service)), 'update').mockImplementation(jest.fn());
        // Mock the time-related private methods to ensure conditions are always checked
        jest.spyOn(service, 'isWithinExchangeHours').mockReturnValue(true);
        jest.spyOn(service, 'isExchangeStartTime').mockReturnValue(true);
    });
    it('should preserve condition deletions during notification processing', function () { return __awaiter(void 0, void 0, void 0, function () {
        var originalNotification, latestNotification;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    originalNotification = {
                        id: 'notification-1',
                        terminalId: 'terminal-1',
                        subscriptionEndpoint: 'https://example.com/endpoint',
                        subscriptionKeysP256dh: 'test-p256dh',
                        subscriptionKeysAuth: 'test-auth',
                        exchangeId: 'exchange-1',
                        tickerId: 'ticker-1',
                        conditionList: [
                            {
                                id: 'condition-1',
                                mode: 'Buy',
                                conditionName: 'GreaterThan',
                                frequency: 'ExchangeStartOnly',
                                session: 'extended',
                                targetPrice: 100,
                                firstNotificationSent: false
                            },
                            {
                                id: 'condition-2',
                                mode: 'Sell',
                                conditionName: 'LessThan',
                                frequency: 'ExchangeStartOnly',
                                session: 'extended',
                                targetPrice: 50,
                                firstNotificationSent: false
                            }
                        ],
                        create: Date.now(),
                        update: Date.now()
                    };
                    latestNotification = __assign(__assign({}, originalNotification), { conditionList: [
                            {
                                id: 'condition-2',
                                mode: 'Sell',
                                conditionName: 'LessThan',
                                frequency: 'ExchangeStartOnly',
                                session: 'extended',
                                targetPrice: 50,
                                firstNotificationSent: false
                            }
                        ] });
                    // Mock the service methods
                    service.get.mockResolvedValue([originalNotification]);
                    superGetByIdSpy.mockResolvedValue(latestNotification);
                    superUpdateSpy.mockResolvedValue(latestNotification);
                    // Execute the notification method
                    return [4 /*yield*/, service.notification('https://example.com/endpoint')];
                case 1:
                    // Execute the notification method
                    _a.sent();
                    // Verify that update was called with the latest condition list (preserving deletion)
                    expect(superUpdateSpy).toHaveBeenCalledWith('notification-1', {
                        conditionList: [
                            {
                                id: 'condition-2',
                                mode: 'Sell',
                                conditionName: 'LessThan',
                                frequency: 'ExchangeStartOnly',
                                session: 'extended',
                                targetPrice: 50,
                                firstNotificationSent: true // This should be updated to true
                            }
                        ]
                    });
                    // Verify getById was called to get latest data
                    expect(superGetByIdSpy).toHaveBeenCalledWith('notification-1');
                    return [2 /*return*/];
            }
        });
    }); });
    it('should handle empty condition list after all conditions are deleted', function () { return __awaiter(void 0, void 0, void 0, function () {
        var originalNotification, latestNotification;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    originalNotification = {
                        id: 'notification-1',
                        terminalId: 'terminal-1',
                        subscriptionEndpoint: 'https://example.com/endpoint',
                        subscriptionKeysP256dh: 'test-p256dh',
                        subscriptionKeysAuth: 'test-auth',
                        exchangeId: 'exchange-1',
                        tickerId: 'ticker-1',
                        conditionList: [
                            {
                                id: 'condition-1',
                                mode: 'Buy',
                                conditionName: 'GreaterThan',
                                frequency: 'ExchangeStartOnly',
                                session: 'extended',
                                targetPrice: 100,
                                firstNotificationSent: false
                            }
                        ],
                        create: Date.now(),
                        update: Date.now()
                    };
                    latestNotification = __assign(__assign({}, originalNotification), { conditionList: [] });
                    // Mock the service methods
                    service.get.mockResolvedValue([originalNotification]);
                    superGetByIdSpy.mockResolvedValue(latestNotification);
                    superUpdateSpy.mockResolvedValue(latestNotification);
                    // Execute the notification method
                    return [4 /*yield*/, service.notification('https://example.com/endpoint')];
                case 1:
                    // Execute the notification method
                    _a.sent();
                    // Verify that update was called with empty condition list
                    expect(superUpdateSpy).toHaveBeenCalledWith('notification-1', {
                        conditionList: []
                    });
                    return [2 /*return*/];
            }
        });
    }); });
    it('should skip update when no conditions need firstNotificationSent flag update', function () { return __awaiter(void 0, void 0, void 0, function () {
        var originalNotification;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    originalNotification = {
                        id: 'notification-1',
                        terminalId: 'terminal-1',
                        subscriptionEndpoint: 'https://example.com/endpoint',
                        subscriptionKeysP256dh: 'test-p256dh',
                        subscriptionKeysAuth: 'test-auth',
                        exchangeId: 'exchange-1',
                        tickerId: 'ticker-1',
                        conditionList: [
                            {
                                id: 'condition-1',
                                mode: 'Buy',
                                conditionName: 'GreaterThan',
                                frequency: 'ExchangeStartOnly',
                                session: 'extended',
                                targetPrice: 100,
                                firstNotificationSent: true // Already sent
                            }
                        ],
                        create: Date.now(),
                        update: Date.now()
                    };
                    // Mock the service methods
                    service.get.mockResolvedValue([originalNotification]);
                    // Execute the notification method
                    return [4 /*yield*/, service.notification('https://example.com/endpoint')];
                case 1:
                    // Execute the notification method
                    _a.sent();
                    // Verify that update was not called since no conditions need updating
                    expect(superUpdateSpy).not.toHaveBeenCalled();
                    expect(superGetByIdSpy).not.toHaveBeenCalled();
                    return [2 /*return*/];
            }
        });
    }); });
});
