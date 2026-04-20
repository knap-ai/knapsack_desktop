import { m as resolveUserPath } from "./utils-D5DtWkEu.js";
import { a as resolveRuntimePluginRegistry } from "./loader-DYW2PvbF.js";
//#region src/agents/runtime-plugins.ts
function ensureRuntimePluginsLoaded(params) {
	const workspaceDir = typeof params.workspaceDir === "string" && params.workspaceDir.trim() ? resolveUserPath(params.workspaceDir) : void 0;
	resolveRuntimePluginRegistry({
		config: params.config,
		workspaceDir,
		runtimeOptions: params.allowGatewaySubagentBinding ? { allowGatewaySubagentBinding: true } : void 0
	});
}
//#endregion
export { ensureRuntimePluginsLoaded as t };
