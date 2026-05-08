import { c as normalizeAgentId } from "./session-key-hxP9B3Or.js";
import { S as resolveDefaultAgentId, _ as listAgentIds, g as listAgentEntries } from "./agent-scope-i10se9ty.js";
import { n as getActiveMemorySearchManager } from "./memory-runtime-Cf4jsTGa.js";
import { t as resolveMemorySearchConfig } from "./memory-search-BkPKyCZS.js";
import { t as resolveMemoryBackendConfig } from "./backend-config-BEtQXaHi.js";
//#region src/gateway/server-startup-memory.ts
function shouldStartQmdBackgroundWork(qmd) {
	return qmd.update.onBoot || qmd.update.intervalMs > 0 || qmd.update.embedIntervalMs > 0;
}
function hasExplicitAgentMemorySearchConfig(cfg, agentId) {
	return listAgentEntries(cfg).some((entry) => normalizeAgentId(entry.id) === agentId && entry.memorySearch != null);
}
function shouldEagerlyStartAgentMemory(params) {
	if (params.agentCount <= 1) return true;
	if (params.agentId === resolveDefaultAgentId(params.cfg)) return true;
	if (params.cfg.agents?.defaults?.memorySearch?.enabled === true) return true;
	return hasExplicitAgentMemorySearchConfig(params.cfg, params.agentId);
}
async function startGatewayMemoryBackend(params) {
	const agentIds = listAgentIds(params.cfg);
	const armedAgentIds = [];
	const deferredAgentIds = [];
	for (const agentId of agentIds) {
		if (!resolveMemorySearchConfig(params.cfg, agentId)) continue;
		const resolved = resolveMemoryBackendConfig({
			cfg: params.cfg,
			agentId
		});
		if (!resolved) continue;
		if (resolved.backend !== "qmd" || !resolved.qmd) continue;
		if (!shouldStartQmdBackgroundWork(resolved.qmd)) continue;
		if (!shouldEagerlyStartAgentMemory({
			cfg: params.cfg,
			agentId,
			agentCount: agentIds.length
		})) {
			deferredAgentIds.push(agentId);
			continue;
		}
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
	if (deferredAgentIds.length > 0) params.log.info?.(`qmd memory startup initialization deferred for ${formatAgentCount(deferredAgentIds.length)}: ${deferredAgentIds.map((agentId) => `"${agentId}"`).join(", ")}`);
}
function formatAgentCount(count) {
	return count === 1 ? "1 agent" : `${count} agents`;
}
//#endregion
export { startGatewayMemoryBackend };
