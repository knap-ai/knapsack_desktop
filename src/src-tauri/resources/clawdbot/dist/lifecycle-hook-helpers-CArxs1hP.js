import { t as createSubsystemLogger } from "./subsystem-CWI_MDy_.js";
import { t as getGlobalHookRunner } from "./hook-runner-global-C-5w-v1N.js";
//#region src/agents/harness/hook-context.ts
function buildAgentHookContext(params) {
	return {
		runId: params.runId,
		...params.agentId ? { agentId: params.agentId } : {},
		...params.sessionKey ? { sessionKey: params.sessionKey } : {},
		...params.sessionId ? { sessionId: params.sessionId } : {},
		...params.workspaceDir ? { workspaceDir: params.workspaceDir } : {},
		...params.messageProvider ? { messageProvider: params.messageProvider } : {},
		...params.trigger ? { trigger: params.trigger } : {},
		...params.channelId ? { channelId: params.channelId } : {}
	};
}
//#endregion
//#region src/agents/harness/lifecycle-hook-helpers.ts
const log = createSubsystemLogger("agents/harness");
function runAgentHarnessLlmInputHook(params) {
	const hookRunner = params.hookRunner ?? getGlobalHookRunner();
	if (!hookRunner?.hasHooks("llm_input")) return;
	hookRunner.runLlmInput(params.event, buildAgentHookContext(params.ctx)).catch((error) => {
		log.warn(`llm_input hook failed: ${String(error)}`);
	});
}
function runAgentHarnessLlmOutputHook(params) {
	const hookRunner = params.hookRunner ?? getGlobalHookRunner();
	if (!hookRunner?.hasHooks("llm_output")) return;
	hookRunner.runLlmOutput(params.event, buildAgentHookContext(params.ctx)).catch((error) => {
		log.warn(`llm_output hook failed: ${String(error)}`);
	});
}
function runAgentHarnessAgentEndHook(params) {
	const hookRunner = params.hookRunner ?? getGlobalHookRunner();
	if (!hookRunner?.hasHooks("agent_end")) return;
	hookRunner.runAgentEnd(params.event, buildAgentHookContext(params.ctx)).catch((error) => {
		log.warn(`agent_end hook failed: ${String(error)}`);
	});
}
//#endregion
export { buildAgentHookContext as i, runAgentHarnessLlmInputHook as n, runAgentHarnessLlmOutputHook as r, runAgentHarnessAgentEndHook as t };
