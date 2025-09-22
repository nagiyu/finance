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
var DataAccessorBase_1 = __importDefault(require("@common/services/DataAccessorBase"));
var DynamoDBService_1 = __importDefault(require("@common/services/aws/DynamoDBService"));
var EnvironmentalUtil_1 = __importDefault(require("@common/utils/EnvironmentalUtil"));
var FinanceDataAccessorBase = /** @class */ (function (_super) {
    __extends(FinanceDataAccessorBase, _super);
    function FinanceDataAccessorBase(dataType, dynamoDBService) {
        if (dynamoDBService === void 0) { dynamoDBService = new DynamoDBService_1.default(FinanceDataAccessorBase.getFinanceTableName()); }
        return _super.call(this, FinanceDataAccessorBase.getFinanceTableName(), dataType, dynamoDBService) || this;
    }
    FinanceDataAccessorBase.getFinanceTableName = function () {
        switch (EnvironmentalUtil_1.default.GetProcessEnv()) {
            case 'local':
            case 'development':
                return 'DevFinance';
            case 'production':
                return 'Finance';
            default:
                return 'DevFinance';
        }
    };
    return FinanceDataAccessorBase;
}(DataAccessorBase_1.default));
exports.default = FinanceDataAccessorBase;
