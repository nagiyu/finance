"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// 共通日付ユーティリティ
var dayjs_1 = __importDefault(require("dayjs"));
var utc_1 = __importDefault(require("dayjs/plugin/utc"));
var timezone_1 = __importDefault(require("dayjs/plugin/timezone"));
// プラグインを有効化
dayjs_1.default.extend(utc_1.default);
dayjs_1.default.extend(timezone_1.default);
var DateUtil = /** @class */ (function () {
    function DateUtil() {
    }
    /**
     * 現在の日本時間を取得
     */
    DateUtil.nowInJST = function () {
        return (0, dayjs_1.default)().tz(this.JST_TIMEZONE);
    };
    /**
     * 日本時間の現在時刻のDateオブジェクトを取得
     */
    DateUtil.getNowJSTAsDate = function () {
        return this.nowInJST().toDate();
    };
    /**
     * 本日00:00:00のタイムスタンプを返す（JST基準）
     */
    DateUtil.getTodayStartTimestamp = function () {
        return this.nowInJST().startOf('day').valueOf();
    };
    /**
     * 任意の日付を0:00:00にしてタイムスタンプを返す（JST基準）
     */
    DateUtil.toStartOfDay = function (date) {
        return (0, dayjs_1.default)(date).tz(this.JST_TIMEZONE).startOf('day').valueOf();
    };
    /**
     * 日本時間でDateオブジェクトを作成
     * @param year 年
     * @param month 月（0-indexed: 0=January, 11=December）
     * @param day 日
     * @param hour 時
     * @param minute 分
     * @param second 秒
     */
    DateUtil.createJSTDate = function (year, month, day, hour, minute, second) {
        var dateString = "".concat(year || (0, dayjs_1.default)().year(), "-").concat(((month || 0) + 1).toString().padStart(2, '0'), "-").concat((day || 1).toString().padStart(2, '0'), " ").concat((hour || 0).toString().padStart(2, '0'), ":").concat((minute || 0).toString().padStart(2, '0'), ":").concat((second || 0).toString().padStart(2, '0'));
        var jstDate = dayjs_1.default.tz(dateString, this.JST_TIMEZONE);
        return jstDate.toDate();
    };
    /**
     * DateオブジェクトをJSTで解釈してdayjsオブジェクトに変換
     */
    DateUtil.toJSTDayjs = function (date) {
        return (0, dayjs_1.default)(date).tz(this.JST_TIMEZONE);
    };
    // 日本時間を統一タイムゾーンとして使用
    DateUtil.JST_TIMEZONE = 'Asia/Tokyo';
    return DateUtil;
}());
exports.default = DateUtil;
