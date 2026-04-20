//#region src/agents/subagent-registry-steer-runtime.ts
let replaceSubagentRunAfterSteerImpl = null;
function configureSubagentRegistrySteerRuntime(params) {
	replaceSubagentRunAfterSteerImpl = params.replaceSubagentRunAfterSteer;
}
function replaceSubagentRunAfterSteer(params) {
	return replaceSubagentRunAfterSteerImpl?.(params) ?? false;
}
//#endregion
export { replaceSubagentRunAfterSteer as n, configureSubagentRegistrySteerRuntime as t };
