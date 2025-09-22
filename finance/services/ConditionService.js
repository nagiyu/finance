"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
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
var ErrorUtil_1 = __importDefault(require("@common/utils/ErrorUtil"));
var ExchangeService_1 = __importDefault(require("@finance/services/ExchangeService"));
var GreaterThanCondition_1 = __importStar(require("@finance/conditions/GreaterThanCondition"));
var LessThanCondition_1 = __importStar(require("@finance/conditions/LessThanCondition"));
var SansenAkenomyojoCondition_1 = __importStar(require("@finance/conditions/SansenAkenomyojoCondition"));
var SansenYoinomyojoCondition_1 = __importStar(require("@finance/conditions/SansenYoinomyojoCondition"));
var TickerService_1 = __importDefault(require("@finance/services/TickerService"));
var FrequencyUtil_1 = __importDefault(require("@finance/utils/FrequencyUtil"));
var ConditionService = /** @class */ (function () {
    function ConditionService(exchangeService, tickerService) {
        if (exchangeService === void 0) { exchangeService = new ExchangeService_1.default(); }
        if (tickerService === void 0) { tickerService = new TickerService_1.default(); }
        /**
         * Condition map
         */
        this.conditionMap = {
            GreaterThan: {
                info: GreaterThanCondition_1.GreaterThanConditionInfo,
                condition: GreaterThanCondition_1.default
            },
            LessThan: {
                info: LessThanCondition_1.LessThanConditionInfo,
                condition: LessThanCondition_1.default
            },
            SansenAkenomyojo: {
                info: SansenAkenomyojoCondition_1.SansenAkenomyojoConditionInfo,
                condition: SansenAkenomyojoCondition_1.default
            },
            SansenYoinomyojo: {
                info: SansenYoinomyojoCondition_1.SansenYoinomyojoConditionInfo,
                condition: SansenYoinomyojoCondition_1.default
            },
        };
        this.exchangeService = exchangeService;
        this.tickerService = tickerService;
    }
    /**
     * Gets the list of buy conditions.
     * @returns List of buy condition keys
     */
    ConditionService.prototype.getBuyConditionList = function () {
        return Object.entries(this.conditionMap)
            .filter(function (_a) {
            var value = _a[1];
            return value.info.isBuyCondition;
        })
            .map(function (_a) {
            var key = _a[0];
            return key;
        });
    };
    /**
     * Gets the list of sell conditions.
     * @returns List of sell condition keys
     */
    ConditionService.prototype.getSellConditionList = function () {
        return Object.entries(this.conditionMap)
            .filter(function (_a) {
            var value = _a[1];
            return value.info.isSellCondition;
        })
            .map(function (_a) {
            var key = _a[0];
            return key;
        });
    };
    /**
     * Gets the list of conditions that don't require target price.
     * @returns List of condition keys that can be evaluated without target price
     */
    ConditionService.prototype.getEvaluableConditionList = function () {
        return Object.entries(this.conditionMap)
            .filter(function (_a) {
            var value = _a[1];
            return !value.info.enableTargetPrice;
        })
            .map(function (_a) {
            var key = _a[0];
            return key;
        });
    };
    /**
     * Gets the information about a specific condition.
     * @param conditionName Condition Name
     * @returns Condition Information
     */
    ConditionService.prototype.getConditionInfo = function (conditionName) {
        var condition = this.conditionMap[conditionName];
        if (!condition) {
            ErrorUtil_1.default.throwError("Condition ".concat(conditionName, " not found"));
        }
        return condition.info;
    };
    /**
     * Gets the condition class by name.
     * @param conditionName Condition Name
     * @returns Condition Class
     */
    ConditionService.prototype.getCondition = function (conditionName) {
        var condition = this.conditionMap[conditionName];
        if (!condition) {
            ErrorUtil_1.default.throwError("Condition ".concat(conditionName, " not found"));
        }
        return condition.condition;
    };
    /**
     * Checks if the specified condition is met.
     * @param conditionName Condition Name
     * @param exchangeId Exchange ID
     * @param tickerId Ticker ID
     * @param session Exchange session type
     * @param targetPrice Target price (optional)
     * @param frequency Notification frequency (optional)
     * @param timeframe Timeframe for candlestick data (optional, defaults to '1')
     * @returns Promise that resolves to true if the condition is met, false otherwise
     */
    ConditionService.prototype.checkCondition = function (conditionName, exchangeId, tickerId, session, targetPrice, frequency, timeframe) {
        return __awaiter(this, void 0, void 0, function () {
            var ConditionClass, condition, met, message;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        ConditionClass = this.getCondition(conditionName);
                        condition = new ConditionClass(this.exchangeService, this.tickerService);
                        return [4 /*yield*/, condition.checkCondition(exchangeId, tickerId, session, targetPrice, timeframe)];
                    case 1:
                        met = _a.sent();
                        if (!met) {
                            return [2 /*return*/, { met: met }];
                        }
                        return [4 /*yield*/, this.getNotificationMessage(this.getConditionInfo(conditionName).name, tickerId, frequency)];
                    case 2:
                        message = _a.sent();
                        return [2 /*return*/, { met: met, message: message }];
                }
            });
        });
    };
    ConditionService.prototype.getNotificationMessage = function (conditionName, tickerId, frequency) {
        return __awaiter(this, void 0, void 0, function () {
            var ticker, message, frequencyText;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.tickerService.getById(tickerId)];
                    case 1:
                        ticker = _a.sent();
                        if (!ticker) {
                            ErrorUtil_1.default.throwError("Ticker with ID ".concat(tickerId, " not found"));
                        }
                        message = "".concat(ticker.name, " shows ").concat(conditionName, " pattern - signal detected");
                        if (frequency) {
                            frequencyText = FrequencyUtil_1.default.formatFrequency(frequency);
                            message += " (\u901A\u77E5\u983B\u5EA6: ".concat(frequencyText, ")");
                        }
                        return [2 /*return*/, message];
                }
            });
        });
    };
    return ConditionService;
}());
exports.default = ConditionService;
