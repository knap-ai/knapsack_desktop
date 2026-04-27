import { g as listAgentIds } from "./agent-scope-_6dFncNS.js";
import { n as getActiveMemorySearchManager, r as resolveActiveMemoryBackendConfig } from "./memory-runtime-CKatHNRH.js";
import { t as resolveMemorySearchConfig } from "./memory-search--kG5KoFE.js";
//#region src/gateway/server-startup-memory.ts
async function startGatewayMemoryBackend(params) {
	const agentIds = listAgentIds(params.cfg);
	const armedAgentIds = [];
	for (const agentId of agentIds) {
		if (!resolveMemorySearchConfig(params.cfg, agentId)) continue;
		const resolved = resolveActiveMemoryBackendConfig({
			cfg: params.cfg,
			agentId
		});
		if (!resolved) continue;
		if (resolved.backend !== "qmd" || !resolved.qmd) continue;
		const { manager, error } = await getActiveMemorySearchManager({
			cfg: params.cfg,
			agentId
		});
		if (!manager) {
			params.log.warn(`qmd memory startup initialization failed for agent "${agentId}": ${error ?? "unknown error"}`);
			continue;
		}
		armedAgentIds.push(agentId);
	}
	if (armedAgentIds.length > 0) params.log.info?.(`qmd memory startup initialization armed for ${formatAgentCount(armedAgentIds.length)}: ${armedAgentIds.map((agentId) => `"${agentId}"`).join(", ")}`);
}
function formatAgentCount(count) {
	return count === 1 ? "1 agent" : `${count} agents`;
}
//#endregion
export { startGatewayMemoryBackend };
