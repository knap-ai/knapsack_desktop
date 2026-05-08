import { a as getActivePluginRegistry } from "./runtime-Df1Zlb_-.js";
//#region src/plugins/agent-tool-result-middleware.ts
const AGENT_TOOL_RESULT_MIDDLEWARE_RUNTIMES = ["pi", "codex"];
const AGENT_TOOL_RESULT_MIDDLEWARE_RUNTIME_SET = new Set(AGENT_TOOL_RESULT_MIDDLEWARE_RUNTIMES);
function normalizeAgentToolResultMiddlewareRuntime(runtime) {
	const normalized = runtime.trim().toLowerCase();
	if (normalized === "codex-app-server") return "codex";
	return AGENT_TOOL_RESULT_MIDDLEWARE_RUNTIME_SET.has(normalized) ? normalized : void 0;
}
function normalizeAgentToolResultMiddlewareRuntimes(options) {
	const requested = options?.runtimes ?? options?.harnesses;
	if (!requested || requested.length === 0) return [...AGENT_TOOL_RESULT_MIDDLEWARE_RUNTIMES];
	const normalized = [];
	for (const runtime of requested) {
		const value = normalizeAgentToolResultMiddlewareRuntime(runtime);
		if (!value) continue;
		if (!normalized.includes(value)) normalized.push(value);
	}
	return normalized;
}
function normalizeAgentToolResultMiddlewareRuntimeIds(runtimes) {
	const normalized = [];
	for (const runtime of runtimes ?? []) {
		const value = normalizeAgentToolResultMiddlewareRuntime(runtime);
		if (value && !normalized.includes(value)) normalized.push(value);
	}
	return normalized;
}
function listAgentToolResultMiddlewares(runtime) {
	return getActivePluginRegistry()?.agentToolResultMiddlewares?.filter((entry) => entry.runtimes.includes(runtime)).map((entry) => entry.handler) ?? [];
}
//#endregion
export { normalizeAgentToolResultMiddlewareRuntimeIds as n, normalizeAgentToolResultMiddlewareRuntimes as r, listAgentToolResultMiddlewares as t };
