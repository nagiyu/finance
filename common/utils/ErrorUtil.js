"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Utility for handling errors in the application.
 */
var ErrorUtil = /** @class */ (function () {
    function ErrorUtil() {
    }
    /**
     * Throws an error with the provided message and error details.
     * @param message The error message to throw.
     * @param error The error details to include.
     * @throws Throws an Error with the specified message and error details.
     */
    ErrorUtil.throwError = function (message, error) {
        if (!message && !error) {
            var msg = 'An unknown error occurred';
            console.error(msg);
            throw new Error(msg);
        }
        if (!message) {
            var msg = error instanceof Error ? error.message : String(error);
            console.error(msg);
            throw error instanceof Error ? error : new Error(msg);
        }
        if (!error) {
            console.error(message);
            throw new Error(message);
        }
        var combinedMessage = "".concat(message, ": ").concat(error instanceof Error ? error.message : String(error));
        console.error(combinedMessage);
        throw new Error(combinedMessage);
    };
    return ErrorUtil;
}());
exports.default = ErrorUtil;
