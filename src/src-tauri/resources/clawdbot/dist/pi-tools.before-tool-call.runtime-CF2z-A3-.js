import { c as logToolLoopAction } from "./diagnostic-DitKp9ni.js";
import { n as getDiagnosticSessionState } from "./diagnostic-session-state-CQYzfYot.js";
import { n as recordToolCall, r as recordToolCallOutcome, t as detectToolCallLoop } from "./tool-loop-detection-DM5A0xwA.js";
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
