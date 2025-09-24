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
var CRUDServiceBase_1 = __importDefault(require("@common/services/CRUDServiceBase"));
var DataAccessorBase_1 = __importDefault(require("@common/services/DataAccessorBase"));
var DynamoDBServiceMock_1 = __importDefault(require("@common/tests/mock/services/aws/DynamoDBServiceMock"));
var ErrorUtil_1 = __importDefault(require("@common/utils/ErrorUtil"));
var tableName = 'Test';
var TEST_RECORD_DATA_TYPE = {
    TYPEC: 'TypeC',
};
var TestDataAccessor = /** @class */ (function (_super) {
    __extends(TestDataAccessor, _super);
    function TestDataAccessor() {
        return _super.call(this, tableName, TEST_RECORD_DATA_TYPE.TYPEC, new DynamoDBServiceMock_1.default(tableName)) || this;
    }
    return TestDataAccessor;
}(DataAccessorBase_1.default));
var TestCRUDService = /** @class */ (function (_super) {
    __extends(TestCRUDService, _super);
    function TestCRUDService() {
        return _super.call(this, new TestDataAccessor()) || this;
    }
    TestCRUDService.prototype.dataToRecord = function (data) {
        return {
            ColumnA: data.columnA,
            ColumnB: data.columnB,
            ColumnC: data.columnC,
            ColumnD: data.columnD,
        };
    };
    TestCRUDService.prototype.recordToData = function (record) {
        return {
            id: record.ID,
            columnA: record.ColumnA,
            columnB: record.ColumnB,
            columnC: record.ColumnC,
            columnD: record.ColumnD,
            create: record.Create,
            update: record.Update,
        };
    };
    return TestCRUDService;
}(CRUDServiceBase_1.default));
var TestCRUDNoCacheService = /** @class */ (function (_super) {
    __extends(TestCRUDNoCacheService, _super);
    function TestCRUDNoCacheService() {
        return _super.call(this, new TestDataAccessor(), false) || this;
    }
    TestCRUDNoCacheService.prototype.dataToRecord = function (data) {
        return {
            ColumnA: data.columnA,
            ColumnB: data.columnB,
            ColumnC: data.columnC,
            ColumnD: data.columnD,
        };
    };
    TestCRUDNoCacheService.prototype.recordToData = function (record) {
        return {
            id: record.ID,
            columnA: record.ColumnA,
            columnB: record.ColumnB,
            columnC: record.ColumnC,
            columnD: record.ColumnD,
            create: record.Create,
            update: record.Update,
        };
    };
    return TestCRUDNoCacheService;
}(CRUDServiceBase_1.default));
describe('CRUDServiceBase', function () {
    var service;
    var serviceNoCache;
    beforeEach(function () {
        service = new TestCRUDService();
        serviceNoCache = new TestCRUDNoCacheService();
    });
    it('Get', function () { return __awaiter(void 0, void 0, void 0, function () {
        var item1, item2, results;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, service.create({ columnA: 'A1', columnB: 1, columnC: true, columnD: { propX: 'X1', propY: 10 } })];
                case 1:
                    item1 = _a.sent();
                    return [4 /*yield*/, service.create({ columnA: 'A2', columnB: 2, columnC: false, columnD: { propX: 'X2', propY: 20 } })];
                case 2:
                    item2 = _a.sent();
                    return [4 /*yield*/, service.get()];
                case 3:
                    results = _a.sent();
                    expect(results.length).toBeGreaterThanOrEqual(2);
                    expect(results).toEqual(expect.arrayContaining([item1, item2]));
                    return [2 /*return*/];
            }
        });
    }); });
    it('Get No Cache', function () { return __awaiter(void 0, void 0, void 0, function () {
        var item1, item2, results;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, serviceNoCache.create({ columnA: 'A1', columnB: 1, columnC: true, columnD: { propX: 'X1', propY: 10 } })];
                case 1:
                    item1 = _a.sent();
                    return [4 /*yield*/, serviceNoCache.create({ columnA: 'A2', columnB: 2, columnC: false, columnD: { propX: 'X2', propY: 20 } })];
                case 2:
                    item2 = _a.sent();
                    return [4 /*yield*/, serviceNoCache.get()];
                case 3:
                    results = _a.sent();
                    expect(results.length).toBeGreaterThanOrEqual(2);
                    expect(results).toEqual(expect.arrayContaining([item1, item2]));
                    return [2 /*return*/];
            }
        });
    }); });
    it('CRUD', function () { return __awaiter(void 0, void 0, void 0, function () {
        var createItem, id, createResult, updateItem, updateResult, deleteResult;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, service.create({ columnA: 'A1', columnB: 1, columnC: true, columnD: { propX: 'X1', propY: 10 } })];
                case 1:
                    createItem = _c.sent();
                    id = createItem.id;
                    return [4 /*yield*/, service.getById(id)];
                case 2:
                    createResult = _c.sent();
                    if (!createResult) {
                        ErrorUtil_1.default.throwError('Create result is null');
                    }
                    expect(createResult.id).toEqual(createItem.id);
                    expect(createResult.columnA).toEqual(createItem.columnA);
                    expect(createResult.columnB).toEqual(createItem.columnB);
                    expect(createResult.columnC).toEqual(createItem.columnC);
                    expect(createResult.columnD.propX).toEqual(createItem.columnD.propX);
                    expect(createResult.columnD.propY).toEqual(createItem.columnD.propY);
                    expect(createResult.create).toEqual(createItem.create);
                    expect(createResult.update).toEqual(createItem.update);
                    updateItem = {
                        columnA: 'A2',
                        columnB: 2,
                        columnC: false,
                        columnD: { propX: 'X2', propY: 20 },
                    };
                    return [4 /*yield*/, service.update(id, updateItem)];
                case 3:
                    updateResult = _c.sent();
                    if (!updateResult) {
                        ErrorUtil_1.default.throwError('Update result is null');
                    }
                    expect(updateResult.id).toEqual(createItem.id);
                    expect(updateResult.columnA).toEqual(updateItem.columnA);
                    expect(updateResult.columnB).toEqual(updateItem.columnB);
                    expect(updateResult.columnC).toEqual(updateItem.columnC);
                    expect(updateResult.columnD.propX).toEqual((_a = updateItem.columnD) === null || _a === void 0 ? void 0 : _a.propX);
                    expect(updateResult.columnD.propY).toEqual((_b = updateItem.columnD) === null || _b === void 0 ? void 0 : _b.propY);
                    expect(updateResult.create).toBe(createItem.create);
                    expect(updateResult.update).toBeGreaterThanOrEqual(createItem.update);
                    return [4 /*yield*/, service.delete(id)];
                case 4:
                    _c.sent();
                    return [4 /*yield*/, service.getById(id)];
                case 5:
                    deleteResult = _c.sent();
                    expect(deleteResult).toBeNull();
                    return [2 /*return*/];
            }
        });
    }); });
    it('CRUD No Cache', function () { return __awaiter(void 0, void 0, void 0, function () {
        var createItem, id, createResult, updateItem, updateResult, deleteResult;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, serviceNoCache.create({ columnA: 'A1', columnB: 1, columnC: true, columnD: { propX: 'X1', propY: 10 } })];
                case 1:
                    createItem = _c.sent();
                    id = createItem.id;
                    return [4 /*yield*/, serviceNoCache.getById(id)];
                case 2:
                    createResult = _c.sent();
                    if (!createResult) {
                        ErrorUtil_1.default.throwError('Create result is null');
                    }
                    expect(createResult.id).toEqual(createItem.id);
                    expect(createResult.columnA).toEqual(createItem.columnA);
                    expect(createResult.columnB).toEqual(createItem.columnB);
                    expect(createResult.columnC).toEqual(createItem.columnC);
                    expect(createResult.columnD.propX).toEqual(createItem.columnD.propX);
                    expect(createResult.columnD.propY).toEqual(createItem.columnD.propY);
                    expect(createResult.create).toEqual(createItem.create);
                    expect(createResult.update).toEqual(createItem.update);
                    updateItem = {
                        columnA: 'A2',
                        columnB: 2,
                        columnC: false,
                        columnD: { propX: 'X2', propY: 20 },
                    };
                    return [4 /*yield*/, serviceNoCache.update(id, updateItem)];
                case 3:
                    updateResult = _c.sent();
                    if (!updateResult) {
                        ErrorUtil_1.default.throwError('Update result is null');
                    }
                    expect(updateResult.id).toEqual(createItem.id);
                    expect(updateResult.columnA).toEqual(updateItem.columnA);
                    expect(updateResult.columnB).toEqual(updateItem.columnB);
                    expect(updateResult.columnC).toEqual(updateItem.columnC);
                    expect(updateResult.columnD.propX).toEqual((_a = updateItem.columnD) === null || _a === void 0 ? void 0 : _a.propX);
                    expect(updateResult.columnD.propY).toEqual((_b = updateItem.columnD) === null || _b === void 0 ? void 0 : _b.propY);
                    expect(updateResult.create).toBe(createItem.create);
                    expect(updateResult.update).toBeGreaterThanOrEqual(createItem.update);
                    return [4 /*yield*/, serviceNoCache.delete(id)];
                case 4:
                    _c.sent();
                    return [4 /*yield*/, serviceNoCache.getById(id)];
                case 5:
                    deleteResult = _c.sent();
                    expect(deleteResult).toBeNull();
                    return [2 /*return*/];
            }
        });
    }); });
});
