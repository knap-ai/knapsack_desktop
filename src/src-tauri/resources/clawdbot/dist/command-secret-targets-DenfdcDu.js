import { v as normalizeOptionalAccountId } from "./session-key-D7XpmyVq.js";
import { r as discoverConfigSecretTargetsByIds, s as listSecretTargetRegistryEntries } from "./target-registry-CO65L87H.js";
//#region src/cli/command-secret-targets.ts
function idsByPrefix(prefixes) {
	return listSecretTargetRegistryEntries().map((entry) => entry.id).filter((id) => prefixes.some((prefix) => id.startsWith(prefix))).toSorted();
}
function idsByPredicate(predicate) {
	return listSecretTargetRegistryEntries().map((entry) => entry.id).filter(predicate).toSorted();
}
const WEB_PLUGIN_SECRET_TARGETS = idsByPredicate((id) => /^plugins\.entries\.[^.]+\.config\.(webSearch|webFetch)\.apiKey$/.test(id));
const COMMAND_SECRET_TARGETS = {
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
		"tools.web.search"
	]).concat(WEB_PLUGIN_SECRET_TARGETS),
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
export { getScopedChannelsCommandSecretTargets as a, getQrRemoteCommandSecretTargetIds as i, getChannelsCommandSecretTargetIds as n, getSecurityAuditCommandSecretTargetIds as o, getModelsCommandSecretTargetIds as r, getStatusCommandSecretTargetIds as s, getAgentRuntimeCommandSecretTargetIds as t };
