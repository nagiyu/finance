"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var CRUDServiceBase_1 = __importDefault(require("@common/services/CRUDServiceBase"));
var DateUtil_1 = __importDefault(require("@common/utils/DateUtil"));
var ErrorUtil_1 = __importDefault(require("@common/utils/ErrorUtil"));
var TimeUtil_1 = __importDefault(require("@common/utils/TimeUtil"));
var FinanceNotificationConst_1 = require("@finance/consts/FinanceNotificationConst");
var FinanceNotificationService = /** @class */ (function (_super) {
    __extends(FinanceNotificationService, _super);
    function FinanceNotificationService(dataAccessor, exchangeService, tickerService, conditionService, notificationService, useCache) {
        if (useCache === void 0) { useCache = true; }
        var _this = _super.call(this, dataAccessor, useCache) || this;
        _this.exchangeService = exchangeService;
        _this.tickerService = tickerService;
        _this.conditionService = conditionService;
        _this.notificationService = notificationService;
        return _this;
    }
    FinanceNotificationService.prototype.create = function (creates) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!creates.conditionList) {
                            ErrorUtil_1.default.throwError("Condition list is required");
                        }
                        // Check for duplicate Exchange and Ticker combination per terminal
                        return [4 /*yield*/, this.validateUniqueExchangeTicker(creates.exchangeId, creates.tickerId, creates.terminalId)];
                    case 1:
                        // Check for duplicate Exchange and Ticker combination per terminal
                        _a.sent();
                        creates.conditionList.forEach(function (condition) {
                            condition.firstNotificationSent = false;
                        });
                        return [4 /*yield*/, _super.prototype.create.call(this, creates)];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    FinanceNotificationService.prototype.update = function (id, updates) {
        return __awaiter(this, void 0, void 0, function () {
            var currentRecord, exchangeId, tickerId, terminalId;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!updates.conditionList) {
                            ErrorUtil_1.default.throwError("Condition list is required");
                        }
                        if (!(updates.exchangeId || updates.tickerId)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.getById(id)];
                    case 1:
                        currentRecord = _a.sent();
                        if (!currentRecord) {
                            ErrorUtil_1.default.throwError("Finance Notification with ID ".concat(id, " not found"));
                        }
                        exchangeId = updates.exchangeId || currentRecord.exchangeId;
                        tickerId = updates.tickerId || currentRecord.tickerId;
                        terminalId = updates.terminalId || currentRecord.terminalId;
                        return [4 /*yield*/, this.validateUniqueExchangeTicker(exchangeId, tickerId, terminalId, id)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        updates.conditionList.forEach(function (condition) {
                            condition.firstNotificationSent = false;
                        });
                        return [4 /*yield*/, _super.prototype.update.call(this, id, updates)];
                    case 4: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    FinanceNotificationService.prototype.notification = function (endpoint) {
        return __awaiter(this, void 0, void 0, function () {
            var notifications, errors, _loop_1, this_1, _i, notifications_1, notification;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.get()];
                    case 1:
                        notifications = _a.sent();
                        errors = [];
                        _loop_1 = function (notification) {
                            var exchange_1, ticker_1, conditionsToCheck, conditionPromises, results, _b, results_1, result, conditionResult, subscription, messageWithData, needsUpdate, latestNotification, error_1;
                            return __generator(this, function (_c) {
                                switch (_c.label) {
                                    case 0:
                                        _c.trys.push([0, 11, , 12]);
                                        console.log("Looking up exchange and ticker data for notification ".concat(notification.id));
                                        return [4 /*yield*/, this_1.exchangeService.getById(notification.exchangeId)];
                                    case 1:
                                        exchange_1 = _c.sent();
                                        if (!exchange_1) {
                                            ErrorUtil_1.default.throwError("Exchange not found for ID: ".concat(notification.exchangeId));
                                        }
                                        return [4 /*yield*/, this_1.tickerService.getById(notification.tickerId)];
                                    case 2:
                                        ticker_1 = _c.sent();
                                        if (!ticker_1) {
                                            ErrorUtil_1.default.throwError("Ticker not found for ID: ".concat(notification.tickerId));
                                        }
                                        console.log("Checking condition for ".concat(exchange_1.key, ":").concat(ticker_1.key));
                                        // Check if conditionList exists and is not empty
                                        if (!notification.conditionList || notification.conditionList.length === 0) {
                                            console.log("No conditions defined for notification ".concat(notification.id, ", skipping"));
                                            return [2 /*return*/, "continue"];
                                        }
                                        conditionsToCheck = notification.conditionList.filter(function (condition) {
                                            if (!_this.shouldCheckCondition(condition, exchange_1)) {
                                                // For pattern conditions, if it's the first notification, allow it to be checked
                                                if (!condition.firstNotificationSent) {
                                                    return true;
                                                }
                                                console.log("Condition ".concat(condition.conditionName, " skipped due to frequency constraint: ").concat(condition.frequency));
                                                return false;
                                            }
                                            return true;
                                        });
                                        // If there are conditions to check, run them in parallel
                                        if (!conditionsToCheck || conditionsToCheck.length === 0) {
                                            console.log("No conditions to check for notification ".concat(notification.id, " at this time"));
                                            return [2 /*return*/, "continue"];
                                        }
                                        conditionPromises = conditionsToCheck.map(function (condition) { return __awaiter(_this, void 0, void 0, function () {
                                            var error_2;
                                            return __generator(this, function (_a) {
                                                switch (_a.label) {
                                                    case 0:
                                                        _a.trys.push([0, 2, , 3]);
                                                        return [4 /*yield*/, this.conditionService.checkCondition(condition.conditionName, exchange_1.id, ticker_1.id, condition.session, condition.targetPrice, condition.frequency, condition.timeframe)];
                                                    case 1: return [2 /*return*/, _a.sent()];
                                                    case 2:
                                                        error_2 = _a.sent();
                                                        console.error("Error checking condition ".concat(condition.conditionName, ":"), error_2);
                                                        return [2 /*return*/, { met: false, message: '' }];
                                                    case 3: return [2 /*return*/];
                                                }
                                            });
                                        }); });
                                        return [4 /*yield*/, Promise.allSettled(conditionPromises)];
                                    case 3:
                                        results = _c.sent();
                                        _b = 0, results_1 = results;
                                        _c.label = 4;
                                    case 4:
                                        if (!(_b < results_1.length)) return [3 /*break*/, 7];
                                        result = results_1[_b];
                                        if (!(result.status === 'fulfilled')) return [3 /*break*/, 6];
                                        conditionResult = result.value;
                                        if (!conditionResult.met) {
                                            console.log("Condition not met for notification ".concat(notification.id, ", skipping push notification"));
                                            return [3 /*break*/, 6];
                                        }
                                        console.log("Condition met for notification ".concat(notification.id, ", sending push notification"));
                                        subscription = {
                                            endpoint: notification.subscriptionEndpoint,
                                            keys: {
                                                p256dh: notification.subscriptionKeysP256dh,
                                                auth: notification.subscriptionKeysAuth
                                            }
                                        };
                                        messageWithData = JSON.stringify({
                                            message: conditionResult.message || '',
                                            exchangeId: notification.exchangeId,
                                            tickerId: notification.tickerId
                                        });
                                        return [4 /*yield*/, this_1.notificationService.sendPushNotification(endpoint, messageWithData, subscription)];
                                    case 5:
                                        _c.sent();
                                        _c.label = 6;
                                    case 6:
                                        _b++;
                                        return [3 /*break*/, 4];
                                    case 7:
                                        needsUpdate = notification.conditionList && notification.conditionList.some(function (condition) { return !condition.firstNotificationSent; });
                                        if (!needsUpdate) return [3 /*break*/, 10];
                                        return [4 /*yield*/, _super.prototype.getById.call(this_1, notification.id)];
                                    case 8:
                                        latestNotification = _c.sent();
                                        if (!(latestNotification && latestNotification.conditionList)) return [3 /*break*/, 10];
                                        // Update only the firstNotificationSent flags on the latest data
                                        latestNotification.conditionList.forEach(function (latestCondition) {
                                            var _a;
                                            var processedCondition = (_a = notification.conditionList) === null || _a === void 0 ? void 0 : _a.find(function (c) { return c.id === latestCondition.id; });
                                            if (processedCondition && !processedCondition.firstNotificationSent) {
                                                latestCondition.firstNotificationSent = true;
                                            }
                                        });
                                        return [4 /*yield*/, _super.prototype.update.call(this_1, notification.id, { conditionList: latestNotification.conditionList })];
                                    case 9:
                                        _c.sent();
                                        _c.label = 10;
                                    case 10: return [3 /*break*/, 12];
                                    case 11:
                                        error_1 = _c.sent();
                                        if (error_1 instanceof Error) {
                                            errors.push("Error processing notification ".concat(notification.id, ": ").concat(error_1.message));
                                        }
                                        else {
                                            errors.push("Unknown error processing notification ".concat(notification.id));
                                        }
                                        return [3 /*break*/, 12];
                                    case 12: return [2 /*return*/];
                                }
                            });
                        };
                        this_1 = this;
                        _i = 0, notifications_1 = notifications;
                        _a.label = 2;
                    case 2:
                        if (!(_i < notifications_1.length)) return [3 /*break*/, 5];
                        notification = notifications_1[_i];
                        return [5 /*yield**/, _loop_1(notification)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5:
                        if (errors.length > 0) {
                            ErrorUtil_1.default.throwError(errors.join('; '));
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Validate that the Exchange and Ticker combination is unique per terminal
     * @param exchangeId - Exchange ID to validate
     * @param tickerId - Ticker ID to validate
     * @param terminalId - Terminal ID to limit validation scope
     * @param excludeId - ID to exclude from validation (for updates)
     */
    FinanceNotificationService.prototype.validateUniqueExchangeTicker = function (exchangeId, tickerId, terminalId, excludeId) {
        return __awaiter(this, void 0, void 0, function () {
            var existingNotifications, duplicateNotification;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!exchangeId || !tickerId || !terminalId) {
                            return [2 /*return*/]; // Skip validation if any required parameter is missing
                        }
                        return [4 /*yield*/, this.get()];
                    case 1:
                        existingNotifications = _a.sent();
                        duplicateNotification = existingNotifications.find(function (notification) {
                            return notification.id !== excludeId &&
                                notification.terminalId === terminalId &&
                                notification.exchangeId === exchangeId &&
                                notification.tickerId === tickerId;
                        });
                        if (duplicateNotification) {
                            ErrorUtil_1.default.throwError("\u6307\u5B9A\u3055\u308C\u305F Exchange \u3068 Ticker \u306E\u7D44\u307F\u5408\u308F\u305B\u306F\u65E2\u306B\u767B\u9332\u3055\u308C\u3066\u3044\u307E\u3059");
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    FinanceNotificationService.prototype.dataToRecord = function (data) {
        return {
            TerminalID: data.terminalId,
            SubscriptionEndpoint: data.subscriptionEndpoint,
            SubscriptionKeysP256dh: data.subscriptionKeysP256dh,
            SubscriptionKeysAuth: data.subscriptionKeysAuth,
            ExchangeID: data.exchangeId,
            TickerID: data.tickerId,
            ConditionList: data.conditionList,
        };
    };
    FinanceNotificationService.prototype.recordToData = function (record) {
        return {
            id: record.ID,
            terminalId: record.TerminalID,
            subscriptionEndpoint: record.SubscriptionEndpoint,
            subscriptionKeysP256dh: record.SubscriptionKeysP256dh,
            subscriptionKeysAuth: record.SubscriptionKeysAuth,
            exchangeId: record.ExchangeID,
            tickerId: record.TickerID,
            conditionList: record.ConditionList,
            create: record.Create,
            update: record.Update,
        };
    };
    /**
     * Check if a specific condition should be checked based on its frequency setting
     */
    FinanceNotificationService.prototype.shouldCheckCondition = function (conditionWithFrequency, exchange) {
        var currentTime = DateUtil_1.default.getNowJSTAsDate();
        // First check if we're within exchange hours
        if (!this.isWithinExchangeHours(exchange, currentTime)) {
            return false;
        }
        switch (conditionWithFrequency.frequency) {
            case FinanceNotificationConst_1.FINANCE_NOTIFICATION_FREQUENCY.EXCHANGE_START_ONLY:
                return this.isExchangeStartTime(exchange, currentTime);
            case FinanceNotificationConst_1.FINANCE_NOTIFICATION_FREQUENCY.MINUTE_LEVEL:
                return true;
            case FinanceNotificationConst_1.FINANCE_NOTIFICATION_FREQUENCY.TEN_MINUTE_LEVEL:
                return this.isTenMinuteInterval(currentTime);
            case FinanceNotificationConst_1.FINANCE_NOTIFICATION_FREQUENCY.HOURLY_LEVEL:
                return this.isHourlyInterval(currentTime);
            default:
                console.log("Unknown frequency: ".concat(conditionWithFrequency.frequency));
                return false;
        }
    };
    /**
     * Check if current time is within exchange operating hours
     */
    FinanceNotificationService.prototype.isWithinExchangeHours = function (exchange, currentTime) {
        if (currentTime === void 0) { currentTime = DateUtil_1.default.getNowJSTAsDate(); }
        var currentJSTTime = TimeUtil_1.default.getJSTTime(currentTime);
        var currentTotalMinutes = currentJSTTime.hour * 60 + currentJSTTime.minute;
        var startTotalMinutes = exchange.start.hour * 60 + exchange.start.minute;
        var endTotalMinutes = exchange.end.hour * 60 + exchange.end.minute;
        // Check if exchange operates across midnight (e.g., 23:00 to 01:00)
        if (startTotalMinutes > endTotalMinutes) {
            // Exchange crosses midnight - check both ranges
            return currentTotalMinutes >= startTotalMinutes || currentTotalMinutes <= endTotalMinutes;
        }
        else {
            // Normal case - start time is before end time
            return currentTotalMinutes >= startTotalMinutes && currentTotalMinutes <= endTotalMinutes;
        }
    };
    /**
     * Check if current time is the start of exchange hours (for daily notifications)
     */
    FinanceNotificationService.prototype.isExchangeStartTime = function (exchange, currentTime) {
        if (currentTime === void 0) { currentTime = DateUtil_1.default.getNowJSTAsDate(); }
        var currentJSTTime = TimeUtil_1.default.getJSTTime(currentTime);
        return currentJSTTime.hour === exchange.start.hour && currentJSTTime.minute === exchange.start.minute;
    };
    /**
     * Check if current time is at a 10-minute interval (0, 10, 20, 30, 40, 50 minutes)
     */
    FinanceNotificationService.prototype.isTenMinuteInterval = function (currentTime) {
        var minutes = currentTime.getMinutes();
        return minutes % 10 === 0;
    };
    /**
     * Check if current time is at an hourly interval (minute is 0)
     */
    FinanceNotificationService.prototype.isHourlyInterval = function (currentTime) {
        var minutes = currentTime.getMinutes();
        return minutes === 0;
    };
    return FinanceNotificationService;
}(CRUDServiceBase_1.default));
exports.default = FinanceNotificationService;
