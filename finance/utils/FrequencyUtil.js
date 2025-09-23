"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var ErrorUtil_1 = __importDefault(require("@common/utils/ErrorUtil"));
var FinanceNotificationConst_1 = require("@finance/consts/FinanceNotificationConst");
var FrequencyUtil = /** @class */ (function () {
    function FrequencyUtil() {
    }
    FrequencyUtil.formatFrequency = function (frequency) {
        switch (frequency) {
            case FinanceNotificationConst_1.FINANCE_NOTIFICATION_FREQUENCY.MINUTE_LEVEL:
                return '1分ごと';
            case FinanceNotificationConst_1.FINANCE_NOTIFICATION_FREQUENCY.TEN_MINUTE_LEVEL:
                return '10分ごと';
            case FinanceNotificationConst_1.FINANCE_NOTIFICATION_FREQUENCY.HOURLY_LEVEL:
                return '1時間ごと';
            case FinanceNotificationConst_1.FINANCE_NOTIFICATION_FREQUENCY.EXCHANGE_START_ONLY:
                return '取引開始時のみ';
            default:
                ErrorUtil_1.default.throwError("Unknown frequency type: ".concat(frequency));
        }
    };
    return FrequencyUtil;
}());
exports.default = FrequencyUtil;
