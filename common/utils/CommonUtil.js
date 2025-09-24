"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var crypto_1 = require("crypto");
var CommonUtil = /** @class */ (function () {
    function CommonUtil() {
    }
    CommonUtil.generateUUID = function () {
        return (0, crypto_1.randomUUID)();
    };
    return CommonUtil;
}());
exports.default = CommonUtil;
