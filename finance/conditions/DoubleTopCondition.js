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
exports.DoubleTopConditionInfo = void 0;
var ConditionBase_1 = __importDefault(require("@finance/conditions/ConditionBase"));
var ErrorUtil_1 = __importDefault(require("@common/utils/ErrorUtil"));
exports.DoubleTopConditionInfo = {
    name: 'ダブルトップ',
    description: 'ダブルトップは、株価チャートに現れる代表的な天井圏のチャートパターンで、トレンド転換のシグナルとしてよく使われます。上昇トレンドの終盤で株価がほぼ同じ水準で2回高値をつけることで形成され、2つの山の間にできる安値ライン（ネックライン）を下抜けると下落トレンドへの転換シグナルとされます。',
    isBuyCondition: false,
    isSellCondition: true,
    enableTargetPrice: false,
    enableTimeFrame: true,
};
var DoubleTopCondition = /** @class */ (function (_super) {
    __extends(DoubleTopCondition, _super);
    function DoubleTopCondition() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DoubleTopCondition.prototype.checkCondition = function (exchangeId, tickerId, session, targetPrice, timeframe) {
        return __awaiter(this, void 0, void 0, function () {
            var stockData, candles, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.getStockPriceData(exchangeId, tickerId, {
                                count: 20, // Need enough data points to detect the pattern
                                session: session,
                                timeframe: timeframe || '1'
                            })];
                    case 1:
                        stockData = _a.sent();
                        if (!stockData || !Array.isArray(stockData) || stockData.length < 10) {
                            return [2 /*return*/, false];
                        }
                        candles = stockData.slice(-20);
                        // Detect double top pattern
                        return [2 /*return*/, this.detectDoubleTopPattern(candles)];
                    case 2:
                        error_1 = _a.sent();
                        ErrorUtil_1.default.throwError("Error checking condition ".concat(exports.DoubleTopConditionInfo.name), error_1);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Detect double top pattern
     * Look for two peaks at similar levels with a valley between them,
     * and confirmation when price breaks below the neckline
     */
    DoubleTopCondition.prototype.detectDoubleTopPattern = function (candles) {
        // Find peaks (where high is greater than neighbors)
        var peaks = [];
        for (var i = 1; i < candles.length - 1; i++) {
            var prevHigh = candles[i - 1].data[3]; // high price
            var currentHigh = candles[i].data[3];
            var nextHigh = candles[i + 1].data[3];
            if (currentHigh > prevHigh && currentHigh > nextHigh) {
                peaks.push({ index: i, price: currentHigh });
            }
        }
        if (peaks.length < 2) {
            return false;
        }
        // Check each pair of peaks for double top pattern
        for (var i = 0; i < peaks.length - 1; i++) {
            var firstPeak = peaks[i];
            var secondPeak = peaks[i + 1];
            // Peaks should be similar in height (within 5% tolerance)
            var heightDiff = Math.abs(firstPeak.price - secondPeak.price) / Math.max(firstPeak.price, secondPeak.price);
            if (heightDiff > 0.05) {
                continue;
            }
            // Find the valley (lowest point) between the two peaks
            var valley = this.findLowestBetween(candles, firstPeak.index, secondPeak.index);
            if (valley === null) {
                continue;
            }
            // The valley should be significantly lower than the peaks (at least 3% lower)
            var valleyDepth = Math.min((firstPeak.price - valley) / firstPeak.price, (secondPeak.price - valley) / secondPeak.price);
            if (valleyDepth < 0.03) {
                continue;
            }
            // Check if current price has broken below the neckline (valley level)
            var currentClose = candles[candles.length - 1].data[1]; // close price
            var neckline = valley;
            if (currentClose < neckline) {
                // Additional confirmation: ensure the breakdown is not just a brief dip
                // Check if at least one more recent candle also closed below neckline
                var confirmationCount = 0;
                for (var j = Math.max(0, candles.length - 3); j < candles.length; j++) {
                    if (candles[j].data[1] < neckline) { // close price
                        confirmationCount++;
                    }
                }
                if (confirmationCount >= 2) {
                    return true;
                }
            }
        }
        return false;
    };
    /**
     * Find the lowest low price between two indices
     */
    DoubleTopCondition.prototype.findLowestBetween = function (candles, startIndex, endIndex) {
        if (startIndex >= endIndex) {
            return null;
        }
        var lowest = Number.MAX_VALUE;
        for (var i = startIndex + 1; i < endIndex; i++) {
            var low = candles[i].data[2]; // low price
            if (low < lowest) {
                lowest = low;
            }
        }
        return lowest === Number.MAX_VALUE ? null : lowest;
    };
    return DoubleTopCondition;
}(ConditionBase_1.default));
exports.default = DoubleTopCondition;
