"use strict";
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
var client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
var util_dynamodb_1 = require("@aws-sdk/util-dynamodb");
var CommonUtil_1 = __importDefault(require("@common/utils/CommonUtil"));
var ErrorUtil_1 = __importDefault(require("@common/utils/ErrorUtil"));
var SecretsManagerUtil_1 = __importDefault(require("@common/aws/SecretsManagerUtil"));
var DynamoDBService = /** @class */ (function () {
    function DynamoDBService(tableName) {
        this.tableName = tableName;
    }
    DynamoDBService.prototype.getTableName = function () {
        return this.tableName;
    };
    DynamoDBService.prototype.getAll = function () {
        return __awaiter(this, void 0, void 0, function () {
            var dynamoClient, command, response, items, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getDynamoClient()];
                    case 1:
                        dynamoClient = _a.sent();
                        command = new client_dynamodb_1.ScanCommand({
                            TableName: this.tableName
                        });
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, dynamoClient.send(command)];
                    case 3:
                        response = _a.sent();
                        items = response.Items || [];
                        return [2 /*return*/, items.map(function (item) { return (0, util_dynamodb_1.unmarshall)(item); })];
                    case 4:
                        error_1 = _a.sent();
                        ErrorUtil_1.default.throwError(null, error_1);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    DynamoDBService.prototype.getAllByDataType = function (dataTypeValue) {
        return __awaiter(this, void 0, void 0, function () {
            var dynamoClient, command, response, items, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getDynamoClient()];
                    case 1:
                        dynamoClient = _a.sent();
                        command = new client_dynamodb_1.ScanCommand({
                            TableName: this.tableName,
                            FilterExpression: "#dt = :dt",
                            ExpressionAttributeNames: { "#dt": "DataType" },
                            ExpressionAttributeValues: { ":dt": { S: dataTypeValue } }
                        });
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, dynamoClient.send(command)];
                    case 3:
                        response = _a.sent();
                        items = response.Items || [];
                        return [2 /*return*/, items.map(function (item) { return (0, util_dynamodb_1.unmarshall)(item); })];
                    case 4:
                        error_2 = _a.sent();
                        ErrorUtil_1.default.throwError(null, error_2);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    DynamoDBService.prototype.getById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var dynamoClient, command, response, items, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getDynamoClient()];
                    case 1:
                        dynamoClient = _a.sent();
                        command = new client_dynamodb_1.ScanCommand({
                            TableName: this.tableName,
                            FilterExpression: "#id = :id",
                            ExpressionAttributeNames: { "#id": "ID" },
                            ExpressionAttributeValues: { ":id": { S: id } }
                        });
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, dynamoClient.send(command)];
                    case 3:
                        response = _a.sent();
                        items = response.Items || [];
                        if (items.length === 0) {
                            return [2 /*return*/, null];
                        }
                        return [2 /*return*/, (0, util_dynamodb_1.unmarshall)(items[0])];
                    case 4:
                        error_3 = _a.sent();
                        ErrorUtil_1.default.throwError(null, error_3);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    DynamoDBService.prototype.create = function (creates) {
        return __awaiter(this, void 0, void 0, function () {
            var item, dynamoClient, command, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!creates.DataType) {
                            ErrorUtil_1.default.throwError('DataType is required');
                        }
                        item = __assign(__assign({}, creates), { ID: CommonUtil_1.default.generateUUID(), Create: Date.now(), Update: Date.now() });
                        return [4 /*yield*/, this.getDynamoClient()];
                    case 1:
                        dynamoClient = _a.sent();
                        command = new client_dynamodb_1.PutItemCommand({
                            TableName: this.tableName,
                            Item: (0, util_dynamodb_1.marshall)(item, { removeUndefinedValues: true })
                        });
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, dynamoClient.send(command)];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        error_4 = _a.sent();
                        ErrorUtil_1.default.throwError(null, error_4);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/, item];
                }
            });
        });
    };
    DynamoDBService.prototype.update = function (id, dataType, updates) {
        return __awaiter(this, void 0, void 0, function () {
            var dynamoClient, setEntries, removeEntries, updateExpr, exprAttrNames, exprAttrValues, command, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getDynamoClient()];
                    case 1:
                        dynamoClient = _a.sent();
                        updates.Update = Date.now();
                        setEntries = Object.entries(updates)
                            .filter(function (_a) {
                            var k = _a[0], v = _a[1];
                            return !["ID", "DataType"].includes(k) && v !== undefined && v !== null;
                        });
                        removeEntries = Object.entries(updates)
                            .filter(function (_a) {
                            var k = _a[0], v = _a[1];
                            return !["ID", "DataType"].includes(k) && v === null;
                        });
                        updateExpr = '';
                        exprAttrNames = {};
                        exprAttrValues = {};
                        if (setEntries.length > 0) {
                            updateExpr += 'SET ' + setEntries.map(function (_a) {
                                var k = _a[0];
                                return "#".concat(k, " = :").concat(k);
                            }).join(', ');
                            Object.assign(exprAttrNames, Object.fromEntries(setEntries.map(function (_a) {
                                var k = _a[0];
                                return ["#".concat(k), k];
                            })));
                            Object.assign(exprAttrValues, Object.fromEntries(setEntries.map(function (_a) {
                                var _b;
                                var k = _a[0], v = _a[1];
                                return [":".concat(k), (0, util_dynamodb_1.marshall)((_b = {}, _b[k] = v, _b), { removeUndefinedValues: true })[k]];
                            })));
                        }
                        if (removeEntries.length > 0) {
                            if (updateExpr)
                                updateExpr += ' ';
                            updateExpr += 'REMOVE ' + removeEntries.map(function (_a) {
                                var k = _a[0];
                                return "#".concat(k);
                            }).join(', ');
                            Object.assign(exprAttrNames, Object.fromEntries(removeEntries.map(function (_a) {
                                var k = _a[0];
                                return ["#".concat(k), k];
                            })));
                        }
                        if (!updateExpr) {
                            ErrorUtil_1.default.throwError('No fields to update');
                        }
                        command = new client_dynamodb_1.UpdateItemCommand({
                            TableName: this.tableName,
                            Key: (0, util_dynamodb_1.marshall)({ ID: id, DataType: dataType }),
                            UpdateExpression: updateExpr,
                            ExpressionAttributeNames: Object.keys(exprAttrNames).length > 0 ? exprAttrNames : undefined,
                            ExpressionAttributeValues: Object.keys(exprAttrValues).length > 0 ? exprAttrValues : undefined
                        });
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, dynamoClient.send(command)];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        error_5 = _a.sent();
                        ErrorUtil_1.default.throwError(null, error_5);
                        return [3 /*break*/, 5];
                    case 5: return [4 /*yield*/, this.getById(id)];
                    case 6: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DynamoDBService.prototype.delete = function (id, dataType) {
        return __awaiter(this, void 0, void 0, function () {
            var dynamoClient, command, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getDynamoClient()];
                    case 1:
                        dynamoClient = _a.sent();
                        command = new client_dynamodb_1.DeleteItemCommand({
                            TableName: this.tableName,
                            Key: (0, util_dynamodb_1.marshall)({ ID: id, DataType: dataType })
                        });
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, dynamoClient.send(command)];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        error_6 = _a.sent();
                        ErrorUtil_1.default.throwError(null, error_6);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    DynamoDBService.prototype.getDynamoClient = function () {
        return __awaiter(this, void 0, void 0, function () {
            var secretName, _a, _b;
            var _c, _d, _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        secretName = process.env.PROJECT_SECRET;
                        if (!(process.env.PROCESS_ENV !== 'local')) return [3 /*break*/, 2];
                        _a = client_dynamodb_1.DynamoDBClient.bind;
                        _c = {};
                        return [4 /*yield*/, SecretsManagerUtil_1.default.getSecretValue(secretName, 'AWS_REGION')];
                    case 1: return [2 /*return*/, new (_a.apply(client_dynamodb_1.DynamoDBClient, [void 0, (_c.region = _f.sent(),
                                _c)]))()];
                    case 2:
                        _b = client_dynamodb_1.DynamoDBClient.bind;
                        _d = {};
                        return [4 /*yield*/, SecretsManagerUtil_1.default.getSecretValue(secretName, 'AWS_REGION')];
                    case 3:
                        _d.region = _f.sent();
                        _e = {};
                        return [4 /*yield*/, SecretsManagerUtil_1.default.getSecretValue(secretName, 'AWS_ACCESS_KEY')];
                    case 4:
                        _e.accessKeyId = _f.sent();
                        return [4 /*yield*/, SecretsManagerUtil_1.default.getSecretValue(secretName, 'AWS_SECRET_ACCESS_KEY')];
                    case 5: return [2 /*return*/, new (_b.apply(client_dynamodb_1.DynamoDBClient, [void 0, (_d.credentials = (_e.secretAccessKey = _f.sent(),
                                _e),
                                _d)]))()];
                }
            });
        });
    };
    return DynamoDBService;
}());
exports.default = DynamoDBService;
