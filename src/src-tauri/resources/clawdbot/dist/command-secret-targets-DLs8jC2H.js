import { v as normalizeOptionalAccountId } from "./session-key-DAhnzjyr.js";
import { r as discoverConfigSecretTargetsByIds, s as listSecretTargetRegistryEntries } from "./target-registry-9OUOvlxj.js";
//#region src/cli/command-secret-targets.ts
function idsByPrefix(prefixes) {
	return listSecretTargetRegistryEntries().map((entry) => entry.id).filter((id) => prefixes.some((prefix) => id.startsWith(prefix))).toSorted();
}
const COMMAND_SECRET_TARGETS = {
	memory: ["agents.defaults.memorySearch.remote.apiKey", "agents.list[].memorySearch.remote.apiKey"],
	qrRemote: ["gateway.remote.token", "gateway.remote.password"],
	channels: idsByPrefix(["channels."]),
	models: idsByPrefix(["models.providers."]),
	agentRuntime: idsByPrefix([
		"channels.",
		"models.providers.",
		"agents.defaults.memorySearch.remote.",
		"agents.list[].memorySearch.remote.",
		"skills.entries.",
		"messages.tts.",
		"tools.web.search",
		"tools.web.fetch.firecrawl."
	]),
	status: idsByPrefix([
		"channels.",
		"agents.defaults.memorySearch.remote.",
		"agents.list[].memorySearch.remote."
	]),
	securityAudit: idsByPrefix([
		"channels.",
		"gateway.auth.",
		"gateway.remote."
	])
};
function toTargetIdSet(values) {
	return new Set(values);
}
function normalizeScopedChannelId(value) {
	const trimmed = value?.trim();
	return trimmed ? trimmed : void 0;
}
function selectChannelTargetIds(channel) {
	if (!channel) return toTargetIdSet(COMMAND_SECRET_TARGETS.channels);
	return toTargetIdSet(COMMAND_SECRET_TARGETS.channels.filter((id) => id.startsWith(`channels.${channel}.`)));
}
function pathTargetsScopedChannelAccount(params) {
	const [root, channelId, accountRoot, accountId] = params.pathSegments;
	if (root !== "channels" || channelId !== params.channel) return false;
	if (accountRoot !== "accounts") return true;
	return accountId === params.accountId;
}
function getScopedChannelsCommandSecretTargets(params) {
	const channel = normalizeScopedChannelId(params.channel);
	const targetIds = selectChannelTargetIds(channel);
	const normalizedAccountId = normalizeOptionalAccountId(params.accountId);
	if (!channel || !normalizedAccountId) return { targetIds };
	const allowedPaths = /* @__PURE__ */ new Set();
	for (const target of discoverConfigSecretTargetsByIds(params.config, targetIds)) if (pathTargetsScopedChannelAccount({
		pathSegments: target.pathSegments,
		channel,
		accountId: normalizedAccountId
	})) allowedPaths.add(target.path);
	return {
		targetIds,
		allowedPaths
	};
}
function getMemoryCommandSecretTargetIds() {
	return toTargetIdSet(COMMAND_SECRET_TARGETS.memory);
}
function getQrRemoteCommandSecretTargetIds() {
	return toTargetIdSet(COMMAND_SECRET_TARGETS.qrRemote);
}
function getChannelsCommandSecretTargetIds() {
	return toTargetIdSet(COMMAND_SECRET_TARGETS.channels);
}
function getModelsCommandSecretTargetIds() {
	return toTargetIdSet(COMMAND_SECRET_TARGETS.models);
}
function getAgentRuntimeCommandSecretTargetIds() {
	return toTargetIdSet(COMMAND_SECRET_TARGETS.agentRuntime);
}
function getStatusCommandSecretTargetIds() {
	return toTargetIdSet(COMMAND_SECRET_TARGETS.status);
}
function getSecurityAuditCommandSecretTargetIds() {
	return toTargetIdSet(COMMAND_SECRET_TARGETS.securityAudit);
}
//#endregion
export { getQrRemoteCommandSecretTargetIds as a, getStatusCommandSecretTargetIds as c, getModelsCommandSecretTargetIds as i, getChannelsCommandSecretTargetIds as n, getScopedChannelsCommandSecretTargets as o, getMemoryCommandSecretTargetIds as r, getSecurityAuditCommandSecretTargetIds as s, getAgentRuntimeCommandSecretTargetIds as t };
