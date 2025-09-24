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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var DynamoDBService_1 = __importDefault(require("@common/services/aws/DynamoDBService"));
var CommonUtil_1 = __importDefault(require("@common/utils/CommonUtil"));
var ErrorUtil_1 = __importDefault(require("@common/utils/ErrorUtil"));
var DynamoDBServiceMock = /** @class */ (function (_super) {
    __extends(DynamoDBServiceMock, _super);
    function DynamoDBServiceMock() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.items = [];
        return _this;
    }
    DynamoDBServiceMock.prototype.getAll = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.items];
            });
        });
    };
    DynamoDBServiceMock.prototype.getAllByDataType = function (dataTypeValue) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.items.filter(function (item) { return item.DataType === dataTypeValue; })];
            });
        });
    };
    DynamoDBServiceMock.prototype.getById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var item;
            return __generator(this, function (_a) {
                item = this.items.find(function (item) { return item.ID === id; });
                return [2 /*return*/, item || null];
            });
        });
    };
    DynamoDBServiceMock.prototype.create = function (creates) {
        return __awaiter(this, void 0, void 0, function () {
            var item;
            return __generator(this, function (_a) {
                if (!creates.DataType) {
                    ErrorUtil_1.default.throwError('DataType is required');
                }
                item = __assign(__assign({}, creates), { ID: CommonUtil_1.default.generateUUID(), Create: Date.now(), Update: Date.now() });
                this.items.push(item);
                return [2 /*return*/, item];
            });
        });
    };
    DynamoDBServiceMock.prototype.update = function (id, dataType, updates) {
        return __awaiter(this, void 0, void 0, function () {
            var index;
            return __generator(this, function (_a) {
                updates.Update = Date.now();
                index = this.items.findIndex(function (item) { return item.ID === id && item.DataType === dataType; });
                if (index !== -1) {
                    this.items[index] = __assign(__assign({}, this.items[index]), updates);
                }
                return [2 /*return*/, this.items[index]];
            });
        });
    };
    DynamoDBServiceMock.prototype.delete = function (id, dataType) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.items = this.items.filter(function (item) { return !(item.ID === id && item.DataType === dataType); });
                return [2 /*return*/];
            });
        });
    };
    DynamoDBServiceMock.prototype.clearData = function () {
        this.items = [];
    };
    return DynamoDBServiceMock;
}(DynamoDBService_1.default));
exports.default = DynamoDBServiceMock;
