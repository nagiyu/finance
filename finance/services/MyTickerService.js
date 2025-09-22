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
var MyTickerDataAccessor_1 = __importDefault(require("@finance/services/MyTickerDataAccessor"));
var MyTickerService = /** @class */ (function (_super) {
    __extends(MyTickerService, _super);
    function MyTickerService() {
        return _super.call(this, new MyTickerDataAccessor_1.default()) || this;
    }
    MyTickerService.prototype.dataToRecord = function (data) {
        return {
            UserID: data.userId,
            ExchangeID: data.exchangeId,
            TickerID: data.tickerId,
            Deal: data.deal,
            Date: data.date,
            Price: data.price,
            Quantity: data.quantity,
        };
    };
    MyTickerService.prototype.recordToData = function (record) {
        return {
            id: record.ID,
            userId: record.UserID,
            exchangeId: record.ExchangeID,
            tickerId: record.TickerID,
            deal: record.Deal,
            date: record.Date,
            price: record.Price,
            quantity: record.Quantity,
            create: record.Create,
            update: record.Update,
        };
    };
    return MyTickerService;
}(CRUDServiceBase_1.default));
exports.default = MyTickerService;
