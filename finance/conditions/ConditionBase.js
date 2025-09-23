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
var ErrorUtil_1 = __importDefault(require("@common/utils/ErrorUtil"));
var ExchangeService_1 = __importDefault(require("@finance/services/ExchangeService"));
var FinanceUtil_1 = __importDefault(require("@finance/utils/FinanceUtil"));
var TickerService_1 = __importDefault(require("@finance/services/TickerService"));
/**
 * Base class for all conditions.
 */
var ConditionBase = /** @class */ (function () {
    function ConditionBase(exchangeService, tickerService) {
        if (exchangeService === void 0) { exchangeService = new ExchangeService_1.default(); }
        if (tickerService === void 0) { tickerService = new TickerService_1.default(); }
        this.exchangeService = exchangeService;
        this.tickerService = tickerService;
    }
    /**
     * Gets stock price data.
     * @param exchangeId Exchange ID
     * @param tickerId Ticker ID
     * @param options Options for getting stock price data
     * @returns Stock price data or an error
     */
    ConditionBase.prototype.getStockPriceData = function (exchangeId, tickerId, options) {
        return __awaiter(this, void 0, void 0, function () {
            var exchange, ticker;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.exchangeService.getById(exchangeId)];
                    case 1:
                        exchange = _a.sent();
                        if (!exchange) {
                            ErrorUtil_1.default.throwError("Exchange with ID ".concat(exchangeId, " not found"));
                        }
                        return [4 /*yield*/, this.tickerService.getById(tickerId)];
                    case 2:
                        ticker = _a.sent();
                        if (!ticker) {
                            ErrorUtil_1.default.throwError("Ticker with ID ".concat(tickerId, " not found"));
                        }
                        return [2 /*return*/, FinanceUtil_1.default.getStockPriceData(exchange.key, ticker.key, options)];
                }
            });
        });
    };
    /**
     * Gets the current stock price.
     * @param exchangeId Exchange ID
     * @param tickerId Ticker ID
     * @param session Exchange session (optional)
     * @returns Current stock price or null if not available
     */
    ConditionBase.prototype.getCurrentStockPrice = function (exchangeId, tickerId, session) {
        return __awaiter(this, void 0, void 0, function () {
            var exchange, ticker;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.exchangeService.getById(exchangeId)];
                    case 1:
                        exchange = _a.sent();
                        if (!exchange) {
                            ErrorUtil_1.default.throwError("Exchange with ID ".concat(exchangeId, " not found"));
                        }
                        return [4 /*yield*/, this.tickerService.getById(tickerId)];
                    case 2:
                        ticker = _a.sent();
                        if (!ticker) {
                            ErrorUtil_1.default.throwError("Ticker with ID ".concat(tickerId, " not found"));
                        }
                        return [2 /*return*/, FinanceUtil_1.default.getCurrentStockPrice(exchange.key, ticker.key, session)];
                }
            });
        });
    };
    return ConditionBase;
}());
exports.default = ConditionBase;
