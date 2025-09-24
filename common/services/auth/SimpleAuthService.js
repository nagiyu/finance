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
var AuthService_1 = __importDefault(require("@common/services/auth/AuthService"));
var SimpleAuthService = /** @class */ (function (_super) {
    __extends(SimpleAuthService, _super);
    function SimpleAuthService() {
        return _super.call(this, SimpleAuthService.dataToRecord, SimpleAuthService.recordToData) || this;
    }
    SimpleAuthService.dataToRecord = function (data) {
        return AuthService_1.default.dataToRecordBase(data);
    };
    SimpleAuthService.recordToData = function (record) {
        return AuthService_1.default.recordToDataBase(record);
    };
    return SimpleAuthService;
}(AuthService_1.default));
exports.default = SimpleAuthService;
