"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var EnvironmentalUtil = /** @class */ (function () {
    function EnvironmentalUtil() {
    }
    EnvironmentalUtil.GetProcessEnv = function () {
        switch (process.env.PROCESS_ENV) {
            case 'local':
            case 'development':
            case 'production':
                return process.env.PROCESS_ENV;
            default:
                return 'local';
        }
    };
    return EnvironmentalUtil;
}());
exports.default = EnvironmentalUtil;
