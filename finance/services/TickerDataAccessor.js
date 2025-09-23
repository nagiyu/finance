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
var FinanceDataAccessorBase_1 = __importDefault(require("@finance/services/FinanceDataAccessorBase"));
var FinanceRecordDataType_1 = require("@finance/types/FinanceRecordDataType");
var TickerDataAccessor = /** @class */ (function (_super) {
    __extends(TickerDataAccessor, _super);
    function TickerDataAccessor() {
        return _super.call(this, FinanceRecordDataType_1.FINANCE_RECORD_DATA_TYPE.TICKER) || this;
    }
    return TickerDataAccessor;
}(FinanceDataAccessorBase_1.default));
exports.default = TickerDataAccessor;
