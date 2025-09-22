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
var DynamoDBService_1 = __importDefault(require("@common/services/aws/DynamoDBService"));
var FinanceDataAccessorBase_1 = __importDefault(require("@finance/services/FinanceDataAccessorBase"));
var FinanceRecordDataType_1 = require("@finance/types/FinanceRecordDataType");
var FinanceNotificationDataAccessor = /** @class */ (function (_super) {
    __extends(FinanceNotificationDataAccessor, _super);
    function FinanceNotificationDataAccessor(dynamoDBService) {
        if (dynamoDBService === void 0) { dynamoDBService = new DynamoDBService_1.default(FinanceDataAccessorBase_1.default.getFinanceTableName()); }
        return _super.call(this, FinanceRecordDataType_1.FINANCE_RECORD_DATA_TYPE.FINANCE_NOTIFICATION, dynamoDBService) || this;
    }
    return FinanceNotificationDataAccessor;
}(FinanceDataAccessorBase_1.default));
exports.default = FinanceNotificationDataAccessor;
