"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFunctionFail = void 0;
const errors_1 = require("../errors");
function createFunctionFail(context, client) {
    const { functionExecutionId } = context;
    if (!functionExecutionId) {
        const errorMsg = 'No function_execution_id found';
        throw new errors_1.CustomFunctionCompleteFailError(errorMsg);
    }
    let called = false;
    const fail = (params) => {
        called = true;
        return client.functions.completeError({
            error: params.error,
            function_execution_id: functionExecutionId,
        });
    };
    fail.hasBeenCalled = () => called;
    return fail;
}
exports.createFunctionFail = createFunctionFail;
//# sourceMappingURL=create-function-fail.js.map