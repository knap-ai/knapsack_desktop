import { c as logToolLoopAction } from "./diagnostic-Dk8ZkzCp.js";
import { n as getDiagnosticSessionState } from "./diagnostic-session-state-BY_MmyXa.js";
import { n as recordToolCall, r as recordToolCallOutcome, t as detectToolCallLoop } from "./tool-loop-detection-dxCym8jO.js";
//#region src/agents/pi-tools.before-tool-call.runtime.ts
const beforeToolCallRuntime = {
	getDiagnosticSessionState,
	logToolLoopAction,
	detectToolCallLoop,
	recordToolCall,
	recordToolCallOutcome
};
//#endregion
export { beforeToolCallRuntime };
