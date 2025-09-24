"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var DateUtil_1 = __importDefault(require("./DateUtil"));
var TimeUtil = /** @class */ (function () {
    function TimeUtil() {
    }
    TimeUtil.formatTime = function (value) {
        return "".concat(value.hour, ":").concat(value.minute.toString().padStart(2, '0'));
    };
    TimeUtil.parseTime = function (value) {
        var _a = value.split(':').map(Number), hour = _a[0], minute = _a[1];
        return { hour: hour, minute: minute };
    };
    /**
     * 現在のJST時刻から時間と分を取得
     */
    TimeUtil.getCurrentJSTTime = function () {
        var jstNow = DateUtil_1.default.nowInJST();
        return {
            hour: jstNow.hour(),
            minute: jstNow.minute()
        };
    };
    /**
     * 指定されたDateオブジェクトをJSTで解釈して時間と分を取得
     */
    TimeUtil.getJSTTime = function (date) {
        var jstDate = DateUtil_1.default.toJSTDayjs(date);
        return {
            hour: jstDate.hour(),
            minute: jstDate.minute()
        };
    };
    return TimeUtil;
}());
exports.default = TimeUtil;
