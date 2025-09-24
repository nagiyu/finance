"use strict";
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
var ErrorUtil_1 = __importDefault(require("@common/utils/ErrorUtil"));
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
var generateTypeBRecord = function () {
    return {
        DataType: TEST_RECORD_DATA_TYPE.TYPEB,
        StringColumn: 'stringB',
        NumberColumn: 456,
        BooleanColumn: false,
        StringArrayColumn: ['x', 'y', 'z'],
        NumberArrayColumn: [4, 5, 6],
        ListColumn: [
            { stringProperty: 'listB', numberProperty: 4 },
            { stringProperty: 'listB2', numberProperty: 5, optionalProperty: 'optional' }
        ],
        OptionalStringColumn: 'optionalB',
        OptionalNumberColumn: 789,
        OptionalBooleanColumn: false,
        OptionalStringArrayColumn: ['x', 'y', 'z'],
        OptionalNumberArrayColumn: [4, 5, 6],
        OptionalListColumn: [
            { stringProperty: 'optionalListB', numberProperty: 7 },
            { stringProperty: 'optionalListB2', numberProperty: 8, optionalProperty: 'optional' }
        ],
    };
};
describe.skip('AWS Tests', function () {
    describe('DynamoDBService', function () {
        var tableName = 'Test';
        var dynamoDBService;
        beforeEach(function () {
            dynamoDBService = new DynamoDBService_1.default(tableName);
        });
        it('Get All', function () { return __awaiter(void 0, void 0, void 0, function () {
            var item1, item2, allItems;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, dynamoDBService.create(generateTypeARecord())];
                    case 1:
                        item1 = _a.sent();
                        return [4 /*yield*/, dynamoDBService.create(generateTypeBRecord())];
                    case 2:
                        item2 = _a.sent();
                        return [4 /*yield*/, dynamoDBService.getAll()];
                    case 3:
                        allItems = _a.sent();
                        expect(allItems.length).toBeGreaterThanOrEqual(2);
                        expect(allItems.find(function (i) { return i.ID === item1.ID; })).toBeDefined();
                        expect(allItems.find(function (i) { return i.ID === item2.ID; })).toBeDefined();
                        return [2 /*return*/];
                }
            });
        }); });
        it('Get All By DataType', function () { return __awaiter(void 0, void 0, void 0, function () {
            var item1, item2, typeAItems, typeBItems;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, dynamoDBService.create(generateTypeARecord())];
                    case 1:
                        item1 = _a.sent();
                        return [4 /*yield*/, dynamoDBService.create(generateTypeBRecord())];
                    case 2:
                        item2 = _a.sent();
                        return [4 /*yield*/, dynamoDBService.getAllByDataType(TEST_RECORD_DATA_TYPE.TYPEA)];
                    case 3:
                        typeAItems = _a.sent();
                        return [4 /*yield*/, dynamoDBService.getAllByDataType(TEST_RECORD_DATA_TYPE.TYPEB)];
                    case 4:
                        typeBItems = _a.sent();
                        expect(typeAItems.length).toBeGreaterThanOrEqual(1);
                        expect(typeAItems.find(function (i) { return i.ID === item1.ID; })).toBeDefined();
                        expect(typeAItems.find(function (i) { return i.ID === item2.ID; })).toBeUndefined();
                        expect(typeBItems.length).toBeGreaterThanOrEqual(1);
                        expect(typeBItems.find(function (i) { return i.ID === item2.ID; })).toBeDefined();
                        expect(typeBItems.find(function (i) { return i.ID === item1.ID; })).toBeUndefined();
                        return [2 /*return*/];
                }
            });
        }); });
        it('CRUD', function () { return __awaiter(void 0, void 0, void 0, function () {
            var createItem, id, createResult, updateItem, updateResult, deleteResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, dynamoDBService.create(generateTypeARecord())];
                    case 1:
                        createItem = _a.sent();
                        id = createItem.ID;
                        return [4 /*yield*/, dynamoDBService.getById(id)];
                    case 2:
                        createResult = _a.sent();
                        if (!createResult) {
                            ErrorUtil_1.default.throwError('Item not found after creation');
                        }
                        expect(createResult.ID).toBe(createItem.ID);
                        expect(createResult.DataType).toBe(createItem.DataType);
                        expect(createResult.StringColumn).toBe(createItem.StringColumn);
                        expect(createResult.NumberColumn).toBe(createItem.NumberColumn);
                        expect(createResult.BooleanColumn).toBe(createItem.BooleanColumn);
                        createResult.StringArrayColumn.forEach(function (value, index) {
                            expect(value).toBe(createItem.StringArrayColumn[index]);
                        });
                        createResult.NumberArrayColumn.forEach(function (value, index) {
                            expect(value).toBe(createItem.NumberArrayColumn[index]);
                        });
                        createResult.ListColumn.forEach(function (value, index) {
                            expect(value.stringProperty).toBe(createItem.ListColumn[index].stringProperty);
                            expect(value.numberProperty).toBe(createItem.ListColumn[index].numberProperty);
                            if (createItem.ListColumn[index].optionalProperty) {
                                expect(value.optionalProperty).toBe(createItem.ListColumn[index].optionalProperty);
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
                        expect(createResult.Create).toBe(createItem.Create);
                        expect(createResult.Update).toBe(createItem.Update);
                        updateItem = {
                            StringColumn: 'updated',
                            NumberColumn: 2,
                            BooleanColumn: false,
                            StringArrayColumn: ['updated1', 'updated2'],
                            NumberArrayColumn: [7, 8, 9],
                            ListColumn: [
                                { stringProperty: 'updatedList', numberProperty: 3 },
                                { stringProperty: 'updatedList2', numberProperty: 4, optionalProperty: 'optional' }
                            ],
                            OptionalStringColumn: 'optional',
                            OptionalNumberColumn: 42,
                            OptionalBooleanColumn: true,
                            OptionalStringArrayColumn: ['optional1', 'optional2'],
                            OptionalNumberArrayColumn: [10, 11, 12],
                            OptionalListColumn: [
                                { stringProperty: 'optionalList', numberProperty: 5 },
                                { stringProperty: 'optionalList2', numberProperty: 6, optionalProperty: 'optional' }
                            ],
                        };
                        return [4 /*yield*/, dynamoDBService.update(id, TEST_RECORD_DATA_TYPE.TYPEA, updateItem)];
                    case 3:
                        updateResult = _a.sent();
                        if (!updateResult) {
                            ErrorUtil_1.default.throwError('Item not found after update');
                        }
                        expect(updateResult.ID).toBe(createItem.ID);
                        expect(updateResult.DataType).toBe(createItem.DataType);
                        expect(updateResult.StringColumn).toBe(updateItem.StringColumn);
                        expect(updateResult.NumberColumn).toBe(updateItem.NumberColumn);
                        expect(updateResult.BooleanColumn).toBe(updateItem.BooleanColumn);
                        updateResult.StringArrayColumn.forEach(function (value, index) {
                            expect(value).toBe(updateItem.StringArrayColumn[index]);
                        });
                        updateResult.NumberArrayColumn.forEach(function (value, index) {
                            expect(value).toBe(updateItem.NumberArrayColumn[index]);
                        });
                        updateResult.ListColumn.forEach(function (value, index) {
                            expect(value.stringProperty).toBe(updateItem.ListColumn[index].stringProperty);
                            expect(value.numberProperty).toBe(updateItem.ListColumn[index].numberProperty);
                            if (updateItem.ListColumn[index].optionalProperty) {
                                expect(value.optionalProperty).toBe(updateItem.ListColumn[index].optionalProperty);
                            }
                            else {
                                expect(value.optionalProperty).toBeUndefined();
                            }
                        });
                        expect(updateResult.OptionalStringColumn).toBe(updateItem.OptionalStringColumn);
                        expect(updateResult.OptionalNumberColumn).toBe(updateItem.OptionalNumberColumn);
                        expect(updateResult.OptionalBooleanColumn).toBe(updateItem.OptionalBooleanColumn);
                        updateResult.OptionalStringArrayColumn.forEach(function (value, index) {
                            expect(value).toBe(updateItem.OptionalStringArrayColumn[index]);
                        });
                        updateResult.OptionalNumberArrayColumn.forEach(function (value, index) {
                            expect(value).toBe(updateItem.OptionalNumberArrayColumn[index]);
                        });
                        updateResult.OptionalListColumn.forEach(function (value, index) {
                            expect(value.stringProperty).toBe(updateItem.OptionalListColumn[index].stringProperty);
                            expect(value.numberProperty).toBe(updateItem.OptionalListColumn[index].numberProperty);
                            if (updateItem.OptionalListColumn[index].optionalProperty) {
                                expect(value.optionalProperty).toBe(updateItem.OptionalListColumn[index].optionalProperty);
                            }
                            else {
                                expect(value.optionalProperty).toBeUndefined();
                            }
                        });
                        expect(updateResult.Create).toBe(createItem.Create);
                        expect(updateResult.Update).toBeGreaterThanOrEqual(createItem.Update);
                        return [4 /*yield*/, dynamoDBService.delete(id, TEST_RECORD_DATA_TYPE.TYPEA)];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, dynamoDBService.getById(id)];
                    case 5:
                        deleteResult = _a.sent();
                        expect(deleteResult).toBeNull();
                        return [2 /*return*/];
                }
            });
        }); });
        it('Update Partial Columns', function () { return __awaiter(void 0, void 0, void 0, function () {
            var createItem, id, updateItem, updateResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, dynamoDBService.create(generateTypeBRecord())];
                    case 1:
                        createItem = _a.sent();
                        id = createItem.ID;
                        updateItem = {
                            NumberColumn: 2,
                            StringArrayColumn: ['updated1', 'updated2'],
                        };
                        return [4 /*yield*/, dynamoDBService.update(id, TEST_RECORD_DATA_TYPE.TYPEB, updateItem)];
                    case 2:
                        updateResult = _a.sent();
                        if (!updateResult) {
                            ErrorUtil_1.default.throwError('Item not found after update');
                        }
                        expect(updateResult.ID).toBe(createItem.ID);
                        expect(updateResult.DataType).toBe(createItem.DataType);
                        expect(updateResult.StringColumn).toBe(createItem.StringColumn);
                        expect(updateResult.NumberColumn).toBe(updateItem.NumberColumn);
                        expect(updateResult.BooleanColumn).toBe(createItem.BooleanColumn);
                        expect(updateResult.StringArrayColumn.length).toBe(updateItem.StringArrayColumn.length);
                        updateResult.StringArrayColumn.forEach(function (value, index) {
                            expect(value).toBe(updateItem.StringArrayColumn[index]);
                        });
                        expect(updateResult.NumberArrayColumn.length).toBe(createItem.NumberArrayColumn.length);
                        updateResult.NumberArrayColumn.forEach(function (value, index) {
                            expect(value).toBe(createItem.NumberArrayColumn[index]);
                        });
                        expect(updateResult.ListColumn.length).toBe(createItem.ListColumn.length);
                        updateResult.ListColumn.forEach(function (value, index) {
                            expect(value.stringProperty).toBe(createItem.ListColumn[index].stringProperty);
                            expect(value.numberProperty).toBe(createItem.ListColumn[index].numberProperty);
                            if (createItem.ListColumn[index].optionalProperty) {
                                expect(value.optionalProperty).toBe(createItem.ListColumn[index].optionalProperty);
                            }
                            else {
                                expect(value.optionalProperty).toBeUndefined();
                            }
                        });
                        expect(updateResult.OptionalStringColumn).toBe(createItem.OptionalStringColumn);
                        expect(updateResult.OptionalNumberColumn).toBe(createItem.OptionalNumberColumn);
                        expect(updateResult.OptionalBooleanColumn).toBe(createItem.OptionalBooleanColumn);
                        expect(updateResult.OptionalStringArrayColumn.length).toBe(createItem.OptionalStringArrayColumn.length);
                        updateResult.OptionalStringArrayColumn.forEach(function (value, index) {
                            expect(value).toBe(createItem.OptionalStringArrayColumn[index]);
                        });
                        expect(updateResult.OptionalNumberArrayColumn.length).toBe(createItem.OptionalNumberArrayColumn.length);
                        updateResult.OptionalNumberArrayColumn.forEach(function (value, index) {
                            expect(value).toBe(createItem.OptionalNumberArrayColumn[index]);
                        });
                        expect(updateResult.OptionalListColumn.length).toBe(createItem.OptionalListColumn.length);
                        updateResult.OptionalListColumn.forEach(function (value, index) {
                            expect(value.stringProperty).toBe(createItem.OptionalListColumn[index].stringProperty);
                            expect(value.numberProperty).toBe(createItem.OptionalListColumn[index].numberProperty);
                            if (createItem.OptionalListColumn[index].optionalProperty) {
                                expect(value.optionalProperty).toBe(createItem.OptionalListColumn[index].optionalProperty);
                            }
                            else {
                                expect(value.optionalProperty).toBeUndefined();
                            }
                        });
                        expect(updateResult.Create).toBe(createItem.Create);
                        expect(updateResult.Update).toBeGreaterThanOrEqual(createItem.Update);
                        return [2 /*return*/];
                }
            });
        }); });
        it('Delete Optional Columns', function () { return __awaiter(void 0, void 0, void 0, function () {
            var createItem, id, updateItem, updateResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, dynamoDBService.create(generateTypeBRecord())];
                    case 1:
                        createItem = _a.sent();
                        id = createItem.ID;
                        updateItem = {
                            StringColumn: 'updated',
                            NumberColumn: 2,
                            BooleanColumn: true,
                            StringArrayColumn: ['updated1', 'updated2'],
                            NumberArrayColumn: [7, 8, 9],
                            ListColumn: [
                                { stringProperty: 'updatedList', numberProperty: 3 },
                                { stringProperty: 'updatedList2', numberProperty: 4, optionalProperty: 'optional' }
                            ],
                            OptionalStringColumn: null,
                            OptionalNumberColumn: null,
                            OptionalBooleanColumn: null,
                            OptionalStringArrayColumn: null,
                            OptionalNumberArrayColumn: null,
                            OptionalListColumn: null,
                        };
                        return [4 /*yield*/, dynamoDBService.update(id, TEST_RECORD_DATA_TYPE.TYPEB, updateItem)];
                    case 2:
                        updateResult = _a.sent();
                        if (!updateResult) {
                            ErrorUtil_1.default.throwError('Item not found after update');
                        }
                        expect(updateResult.ID).toBe(createItem.ID);
                        expect(updateResult.DataType).toBe(createItem.DataType);
                        expect(updateResult.StringColumn).toBe(updateItem.StringColumn);
                        expect(updateResult.NumberColumn).toBe(updateItem.NumberColumn);
                        expect(updateResult.BooleanColumn).toBe(updateItem.BooleanColumn);
                        updateResult.StringArrayColumn.forEach(function (value, index) {
                            expect(value).toBe(updateItem.StringArrayColumn[index]);
                        });
                        updateResult.NumberArrayColumn.forEach(function (value, index) {
                            expect(value).toBe(updateItem.NumberArrayColumn[index]);
                        });
                        updateResult.ListColumn.forEach(function (value, index) {
                            expect(value.stringProperty).toBe(updateItem.ListColumn[index].stringProperty);
                            expect(value.numberProperty).toBe(updateItem.ListColumn[index].numberProperty);
                            if (updateItem.ListColumn[index].optionalProperty) {
                                expect(value.optionalProperty).toBe(updateItem.ListColumn[index].optionalProperty);
                            }
                            else {
                                expect(value.optionalProperty).toBeUndefined();
                            }
                        });
                        expect(updateResult.OptionalStringColumn).toBeUndefined();
                        expect(updateResult.OptionalNumberColumn).toBeUndefined();
                        expect(updateResult.OptionalBooleanColumn).toBeUndefined();
                        expect(updateResult.OptionalStringArrayColumn).toBeUndefined();
                        expect(updateResult.OptionalNumberArrayColumn).toBeUndefined();
                        expect(updateResult.OptionalListColumn).toBeUndefined();
                        expect(updateResult.Create).toBe(createItem.Create);
                        expect(updateResult.Update).toBeGreaterThanOrEqual(createItem.Update);
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
