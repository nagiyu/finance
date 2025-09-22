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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var CRUDServiceBase_1 = __importDefault(require("@common/services/CRUDServiceBase"));
var TimeUtil_1 = __importDefault(require("@common/utils/TimeUtil"));
var ExchangeDataAccessor_1 = __importDefault(require("@finance/services/ExchangeDataAccessor"));
var ExchangeService = /** @class */ (function (_super) {
    __extends(ExchangeService, _super);
    function ExchangeService() {
        return _super.call(this, new ExchangeDataAccessor_1.default()) || this;
    }
    ExchangeService.prototype.dataToRecord = function (data) {
        return {
            Name: data.name,
            Key: data.key,
            Start: TimeUtil_1.default.formatTime(data.start || TimeUtil_1.default.parseTime('00:00')),
            End: TimeUtil_1.default.formatTime(data.end || TimeUtil_1.default.parseTime('00:00')),
        };
    };
    ExchangeService.prototype.recordToData = function (record) {
        return {
            id: record.ID,
            name: record.Name,
            key: record.Key,
            start: TimeUtil_1.default.parseTime(record.Start),
            end: TimeUtil_1.default.parseTime(record.End),
            create: record.Create,
            update: record.Update,
        };
    };
    return ExchangeService;
}(CRUDServiceBase_1.default));
exports.default = ExchangeService;
