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
var CacheUtil_1 = __importDefault(require("@common/utils/CacheUtil"));
/**
 * @deprecated Use the updated version in services/CRUDServiceBase.ts
 */
var CRUDServiceBase = /** @class */ (function () {
    function CRUDServiceBase(dataAccessor, dataToRecord, recordToData, useCache) {
        if (useCache === void 0) { useCache = true; }
        this.dataAccessor = dataAccessor;
        this.dataToRecord = dataToRecord;
        this.recordToData = recordToData;
        this.useCache = useCache;
        // Create more specific cache key to prevent collisions
        this.cacheKey = "".concat(dataAccessor.constructor.name, "_").concat(dataAccessor.getTableName(), "_").concat(dataAccessor.getDataType());
    }
    CRUDServiceBase.prototype.get = function () {
        return __awaiter(this, void 0, void 0, function () {
            var cachedData, data, mappedData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.useCache) {
                            cachedData = this.getCache();
                            if (cachedData) {
                                return [2 /*return*/, cachedData];
                            }
                        }
                        return [4 /*yield*/, this.dataAccessor.get()];
                    case 1:
                        data = _a.sent();
                        mappedData = data.map(this.recordToData);
                        if (this.useCache) {
                            CacheUtil_1.default.set(this.cacheKey, mappedData);
                        }
                        return [2 /*return*/, mappedData];
                }
            });
        });
    };
    CRUDServiceBase.prototype.create = function (item) {
        return __awaiter(this, void 0, void 0, function () {
            var cachedData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.dataAccessor.create(this.dataToRecord(item))];
                    case 1:
                        _a.sent();
                        if (this.useCache) {
                            cachedData = this.getCache() || [];
                            cachedData.push(item);
                            CacheUtil_1.default.set(this.cacheKey, cachedData);
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    CRUDServiceBase.prototype.update = function (item) {
        return __awaiter(this, void 0, void 0, function () {
            var cachedData, index;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.dataAccessor.update(this.dataToRecord(item))];
                    case 1:
                        _a.sent();
                        if (this.useCache) {
                            cachedData = this.getCache() || [];
                            index = cachedData.findIndex(function (i) { return i.id === item.id; });
                            if (index !== -1) {
                                cachedData[index] = item;
                                CacheUtil_1.default.set(this.cacheKey, cachedData);
                            }
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    CRUDServiceBase.prototype.delete = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var cachedData, updatedData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.dataAccessor.delete(id)];
                    case 1:
                        _a.sent();
                        if (this.useCache) {
                            cachedData = this.getCache() || [];
                            updatedData = cachedData.filter(function (i) { return i.id !== id; });
                            CacheUtil_1.default.set(this.cacheKey, updatedData);
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    CRUDServiceBase.prototype.syncCache = function () {
        return __awaiter(this, void 0, void 0, function () {
            var data, mappedData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.useCache) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.dataAccessor.get()];
                    case 1:
                        data = _a.sent();
                        mappedData = data.map(this.recordToData);
                        CacheUtil_1.default.set(this.cacheKey, mappedData);
                        return [2 /*return*/];
                }
            });
        });
    };
    CRUDServiceBase.prototype.getCache = function () {
        if (this.useCache) {
            return CacheUtil_1.default.get(this.cacheKey);
        }
        return null;
    };
    return CRUDServiceBase;
}());
exports.default = CRUDServiceBase;
