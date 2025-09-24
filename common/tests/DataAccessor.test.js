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
var DataAccessorBase_1 = __importDefault(require("@common/services/DataAccessorBase"));
var DynamoDBServiceMock_1 = __importDefault(require("@common/tests/mock/services/aws/DynamoDBServiceMock"));
var ErrorUtil_1 = __importDefault(require("@common/utils/ErrorUtil"));
var tableName = 'Test';
var TEST_RECORD_DATA_TYPE = {
    TYPEA: 'TypeA',
    TYPEB: 'TypeB',
};
var generateTypeARecord = function () {
    return {
        DataType: TEST_RECORD_DATA_TYPE.TYPEA,
        StringColumn: 'stringA',
        NumberColumn: 123,
        BooleanColumn: true,
        StringArrayColumn: ['a', 'b', 'c'],
        NumberArrayColumn: [1, 2, 3],
        ListColumn: [
            { stringProperty: 'listA', numberProperty: 1 },
            { stringProperty: 'listA2', numberProperty: 2, optionalProperty: 'optional' }
        ],
    };
};
var TestDataAccessor = /** @class */ (function (_super) {
    __extends(TestDataAccessor, _super);
    function TestDataAccessor() {
        return _super.call(this, tableName, TEST_RECORD_DATA_TYPE.TYPEA, new DynamoDBServiceMock_1.default(tableName)) || this;
    }
    return TestDataAccessor;
}(DataAccessorBase_1.default));
describe('DataAccessorBase', function () {
    var dataAccessor;
    beforeEach(function () {
        dataAccessor = new TestDataAccessor();
    });
    it('Get Table Name', function () {
        expect(dataAccessor.getTableName()).toBe(tableName);
    });
    it('Get', function () { return __awaiter(void 0, void 0, void 0, function () {
        var item1, item2, results;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, dataAccessor.create(generateTypeARecord())];
                case 1:
                    item1 = _a.sent();
                    return [4 /*yield*/, dataAccessor.create(generateTypeARecord())];
                case 2:
                    item2 = _a.sent();
                    return [4 /*yield*/, dataAccessor.get()];
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
        var _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0: return [4 /*yield*/, dataAccessor.create(generateTypeARecord())];
                case 1:
                    createItem = _d.sent();
                    id = createItem.ID;
                    return [4 /*yield*/, dataAccessor.getById(id)];
                case 2:
                    createResult = _d.sent();
                    if (!createResult) {
                        ErrorUtil_1.default.throwError('Create result is null');
                    }
                    expect(createResult.ID).toEqual(createItem.ID);
                    expect(createResult.DataType).toEqual(createItem.DataType);
                    expect(createResult.StringColumn).toEqual(createItem.StringColumn);
                    expect(createResult.NumberColumn).toEqual(createItem.NumberColumn);
                    expect(createResult.BooleanColumn).toEqual(createItem.BooleanColumn);
                    createResult.StringArrayColumn.forEach(function (value, index) {
                        expect(value).toEqual(createItem.StringArrayColumn[index]);
                    });
                    createResult.NumberArrayColumn.forEach(function (value, index) {
                        expect(value).toEqual(createItem.NumberArrayColumn[index]);
                    });
                    createResult.ListColumn.forEach(function (value, index) {
                        expect(value.stringProperty).toEqual(createItem.ListColumn[index].stringProperty);
                        expect(value.numberProperty).toEqual(createItem.ListColumn[index].numberProperty);
                        if (createItem.ListColumn[index].optionalProperty) {
                            expect(value.optionalProperty).toEqual(createItem.ListColumn[index].optionalProperty);
                        }
                        else {
                            expect(value.optionalProperty).toBeUndefined();
                        }
                    });
                    expect(createResult.OptionalStringColumn).toBeUndefined();
                    expect(createResult.OptionalNumberColumn).toBeUndefined();
                    expect(createResult.OptionalBooleanColumn).toBeUndefined();
                    expect(createResult.OptionalStringArrayColumn).toBeUndefined();
                    expect(createResult.OptionalNumberArrayColumn).toBeUndefined();
                    expect(createResult.OptionalListColumn).toBeUndefined();
                    expect(createResult.Create).toEqual(createItem.Create);
                    expect(createResult.Update).toEqual(createItem.Update);
                    updateItem = {
                        StringColumn: 'updated',
                        NumberColumn: 456,
                        BooleanColumn: false,
                        StringArrayColumn: ['updated1', 'updated2'],
                        NumberArrayColumn: [7, 8, 9],
                        ListColumn: [
                            { stringProperty: 'updatedList', numberProperty: 3 },
                            { stringProperty: 'updatedList2', numberProperty: 4, optionalProperty: 'optional' }
                        ],
                        OptionalStringColumn: 'optional',
                        OptionalNumberColumn: 789,
                        OptionalBooleanColumn: true,
                        OptionalStringArrayColumn: ['optional1', 'optional2'],
                        OptionalNumberArrayColumn: [10, 11, 12],
                        OptionalListColumn: [
                            { stringProperty: 'optionalList', numberProperty: 5 },
                            { stringProperty: 'optionalList2', numberProperty: 6, optionalProperty: 'optional' }
                        ],
                    };
                    return [4 /*yield*/, dataAccessor.update(id, updateItem)];
                case 3:
                    updateResult = _d.sent();
                    if (!updateResult) {
                        ErrorUtil_1.default.throwError('Update result is null');
                    }
                    expect(updateResult.ID).toEqual(createItem.ID);
                    expect(updateResult.DataType).toEqual(createItem.DataType);
                    expect(updateResult.StringColumn).toEqual(updateItem.StringColumn);
                    expect(updateResult.NumberColumn).toEqual(updateItem.NumberColumn);
                    expect(updateResult.BooleanColumn).toEqual(updateItem.BooleanColumn);
                    updateResult.StringArrayColumn.forEach(function (value, index) {
                        var _a;
                        expect(value).toEqual((_a = updateItem.StringArrayColumn) === null || _a === void 0 ? void 0 : _a[index]);
                    });
                    updateResult.NumberArrayColumn.forEach(function (value, index) {
                        var _a;
                        expect(value).toEqual((_a = updateItem.NumberArrayColumn) === null || _a === void 0 ? void 0 : _a[index]);
                    });
                    updateResult.ListColumn.forEach(function (value, index) {
                        var _a, _b, _c;
                        expect(value.stringProperty).toEqual((_a = updateItem.ListColumn) === null || _a === void 0 ? void 0 : _a[index].stringProperty);
                        expect(value.numberProperty).toEqual((_b = updateItem.ListColumn) === null || _b === void 0 ? void 0 : _b[index].numberProperty);
                        if ((_c = updateItem.ListColumn) === null || _c === void 0 ? void 0 : _c[index].optionalProperty) {
                            expect(value.optionalProperty).toEqual(updateItem.ListColumn[index].optionalProperty);
                        }
                        else {
                            expect(value.optionalProperty).toBeUndefined();
                        }
                    });
                    expect(updateResult.OptionalStringColumn).toEqual(updateItem.OptionalStringColumn);
                    expect(updateResult.OptionalNumberColumn).toEqual(updateItem.OptionalNumberColumn);
                    expect(updateResult.OptionalBooleanColumn).toEqual(updateItem.OptionalBooleanColumn);
                    (_a = updateResult.OptionalStringArrayColumn) === null || _a === void 0 ? void 0 : _a.forEach(function (value, index) {
                        var _a;
                        expect(value).toEqual((_a = updateItem.OptionalStringArrayColumn) === null || _a === void 0 ? void 0 : _a[index]);
                    });
                    (_b = updateResult.OptionalNumberArrayColumn) === null || _b === void 0 ? void 0 : _b.forEach(function (value, index) {
                        var _a;
                        expect(value).toEqual((_a = updateItem.OptionalNumberArrayColumn) === null || _a === void 0 ? void 0 : _a[index]);
                    });
                    (_c = updateResult.OptionalListColumn) === null || _c === void 0 ? void 0 : _c.forEach(function (value, index) {
                        var _a, _b, _c;
                        expect(value.stringProperty).toEqual((_a = updateItem.OptionalListColumn) === null || _a === void 0 ? void 0 : _a[index].stringProperty);
                        expect(value.numberProperty).toEqual((_b = updateItem.OptionalListColumn) === null || _b === void 0 ? void 0 : _b[index].numberProperty);
                        if ((_c = updateItem.OptionalListColumn) === null || _c === void 0 ? void 0 : _c[index].optionalProperty) {
                            expect(value.optionalProperty).toEqual(updateItem.OptionalListColumn[index].optionalProperty);
                        }
                        else {
                            expect(value.optionalProperty).toBeUndefined();
                        }
                    });
                    expect(updateResult.Create).toBe(createItem.Create);
                    expect(updateResult.Update).toBeGreaterThanOrEqual(createItem.Update);
                    return [4 /*yield*/, dataAccessor.delete(id)];
                case 4:
                    _d.sent();
                    return [4 /*yield*/, dataAccessor.getById(id)];
                case 5:
                    deleteResult = _d.sent();
                    expect(deleteResult).toBeNull();
                    return [2 /*return*/];
            }
        });
    }); });
});
