"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = exports.CustomFunction = exports.matchCallbackId = void 0;
const errors_1 = require("./errors");
const builtin_1 = require("./middleware/builtin");
/*
 * Middleware that matches a function callback ID
 */
function matchCallbackId(callbackId) {
    return async ({ payload, next }) => {
        if (payload.function.callback_id === callbackId) {
            await next();
        }
    };
}
exports.matchCallbackId = matchCallbackId;
/** Class */
class CustomFunction {
    /** Function callback_id */
    callbackId;
    listeners;
    options;
    constructor(callbackId, listeners, options) {
        validate(callbackId, listeners);
        this.callbackId = callbackId;
        this.listeners = listeners;
        this.options = options;
    }
    getListeners() {
        if (this.options.autoAcknowledge) {
            return [
                builtin_1.onlyEvents,
                (0, builtin_1.matchEventType)('function_executed'),
                matchCallbackId(this.callbackId),
                builtin_1.autoAcknowledge,
                ...this.listeners,
            ];
        }
        return [
            builtin_1.onlyEvents,
            (0, builtin_1.matchEventType)('function_executed'),
            matchCallbackId(this.callbackId),
            ...this.listeners,
        ]; // FIXME: workaround for TypeScript 4.7 breaking changes
    }
}
exports.CustomFunction = CustomFunction;
/** Helper Functions */
function validate(callbackId, middleware) {
    // Ensure callbackId is valid
    if (typeof callbackId !== 'string') {
        const errorMsg = 'CustomFunction expects a callback_id as the first argument';
        throw new errors_1.CustomFunctionInitializationError(errorMsg);
    }
    // Ensure middleware argument is either a function or an array
    if (typeof middleware !== 'function' && !Array.isArray(middleware)) {
        const errorMsg = 'CustomFunction expects a function or array of functions as the second argument';
        throw new errors_1.CustomFunctionInitializationError(errorMsg);
    }
    // Ensure array includes only functions
    if (Array.isArray(middleware)) {
        for (const fn of middleware) {
            if (!(fn instanceof Function)) {
                const errorMsg = 'All CustomFunction middleware must be functions';
                throw new errors_1.CustomFunctionInitializationError(errorMsg);
            }
        }
    }
}
exports.validate = validate;
//# sourceMappingURL=CustomFunction.js.map