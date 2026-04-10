"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFunctionComplete = void 0;
const errors_1 = require("../errors");
function createFunctionComplete(context, client) {
    const { functionExecutionId } = context;
    if (!functionExecutionId) {
        const errorMsg = 'No function_execution_id found';
        throw new errors_1.CustomFunctionCompleteSuccessError(errorMsg);
    }
    let called = false;
    const complete = (params = {}) => {
        called = true;
        return client.functions.completeSuccess({
            outputs: params.outputs || {},
            function_execution_id: functionExecutionId,
        });
    };
    complete.hasBeenCalled = () => called;
    return complete;
}
exports.createFunctionComplete = createFunctionComplete;
//# sourceMappingURL=create-function-complete.js.map