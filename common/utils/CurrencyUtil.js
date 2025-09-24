"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CurrencyUtil = /** @class */ (function () {
    function CurrencyUtil() {
    }
    /**
     * Convert USD to JPY
     * @param usdAmount Amount in USD
     * @returns Amount in JPY
     */
    CurrencyUtil.convertUsdToJpy = function (usdAmount) {
        return Math.round(usdAmount * this.USD_TO_JPY_RATE * 100) / 100;
    };
    /**
     * Convert JPY to USD
     * @param jpyAmount Amount in JPY
     * @returns Amount in USD
     */
    CurrencyUtil.convertJpyToUsd = function (jpyAmount) {
        return Math.round(jpyAmount * this.JPY_TO_USD_RATE * 100) / 100;
    };
    /**
     * Get current USD to JPY exchange rate
     * @returns USD to JPY exchange rate
     */
    CurrencyUtil.getUsdToJpyRate = function () {
        return this.USD_TO_JPY_RATE;
    };
    /**
     * Get current JPY to USD exchange rate
     * @returns JPY to USD exchange rate
     */
    CurrencyUtil.getJpyToUsdRate = function () {
        return this.JPY_TO_USD_RATE;
    };
    // Fixed exchange rates
    CurrencyUtil.USD_TO_JPY_RATE = 143.0;
    CurrencyUtil.JPY_TO_USD_RATE = 0.007;
    return CurrencyUtil;
}());
exports.default = CurrencyUtil;
