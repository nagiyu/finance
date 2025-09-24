"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CacheUtil = /** @class */ (function () {
    function CacheUtil() {
    }
    CacheUtil.get = function (key) {
        var cacheData = this.cache[key];
        if (cacheData && (Date.now() - cacheData.timestamp < this.CACHE_TTL)) {
            return cacheData.value;
        }
        return null;
    };
    CacheUtil.set = function (key, value) {
        this.cache[key] = { value: value, timestamp: Date.now() };
    };
    CacheUtil.clear = function (key) {
        delete this.cache[key];
    };
    CacheUtil.cache = {};
    CacheUtil.CACHE_TTL = 10 * 60 * 1000;
    return CacheUtil;
}());
exports.default = CacheUtil;
