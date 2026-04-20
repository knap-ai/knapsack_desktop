import { s as normalizeOptionalString } from "./string-coerce-BUSzWgUA.js";
import { r as normalizeOptionalAccountId } from "./account-id-j7GeQlaZ.js";
import { o as listSecretTargetRegistryEntries, r as discoverConfigSecretTargetsByIds } from "./target-registry-CziBPyjo.js";
//#region src/cli/command-secret-targets.ts
const STATIC_QR_REMOTE_TARGET_IDS = ["gateway.remote.token", "gateway.remote.password"];
const STATIC_MODEL_TARGET_IDS = [
	"models.providers.*.apiKey",
	"models.providers.*.headers.*",
	"models.providers.*.request.headers.*",
	"models.providers.*.request.auth.token",
	"models.providers.*.request.auth.value",
	"models.providers.*.request.proxy.tls.ca",
	"models.providers.*.request.proxy.tls.cert",
	"models.providers.*.request.proxy.tls.key",
	"models.providers.*.request.proxy.tls.passphrase",
	"models.providers.*.request.tls.ca",
	"models.providers.*.request.tls.cert",
	"models.providers.*.request.tls.key",
	"models.providers.*.request.tls.passphrase"
];
const STATIC_AGENT_RUNTIME_BASE_TARGET_IDS = [
	...STATIC_MODEL_TARGET_IDS,
	"agents.defaults.memorySearch.remote.apiKey",
	"agents.list[].memorySearch.remote.apiKey",
	"messages.tts.providers.*.apiKey",
	"skills.entries.*.apiKey",
	"tools.web.search.apiKey",
	"plugins.entries.brave.config.webSearch.apiKey",
	"plugins.entries.google.config.webSearch.apiKey",
	"plugins.entries.exa.config.webSearch.apiKey",
	"plugins.entries.xai.config.webSearch.apiKey",
	"plugins.entries.moonshot.config.webSearch.apiKey",
	"plugins.entries.perplexity.config.webSearch.apiKey",
	"plugins.entries.firecrawl.config.webSearch.apiKey",
	"plugins.entries.firecrawl.config.webFetch.apiKey",
	"plugins.entries.tavily.config.webSearch.apiKey",
	"plugins.entries.minimax.config.webSearch.apiKey"
];
const STATIC_STATUS_TARGET_IDS = ["agents.defaults.memorySearch.remote.apiKey", "agents.list[].memorySearch.remote.apiKey"];
const STATIC_SECURITY_AUDIT_TARGET_IDS = [
	"gateway.auth.token",
	"gateway.auth.password",
	"gateway.remote.token",
	"gateway.remote.password"
];
function idsByPrefix(prefixes) {
	return listSecretTargetRegistryEntries().map((entry) => entry.id).filter((id) => prefixes.some((prefix) => id.startsWith(prefix))).toSorted();
}
let cachedCommandSecretTargets;
let cachedChannelSecretTargetIds;
function getChannelSecretTargetIds() {
	cachedChannelSecretTargetIds ??= idsByPrefix(["channels."]);
	return cachedChannelSecretTargetIds;
}
function buildCommandSecretTargets() {
	const channelTargetIds = getChannelSecretTargetIds();
	return {
		channels: channelTargetIds,
		agentRuntime: [...STATIC_AGENT_RUNTIME_BASE_TARGET_IDS, ...channelTargetIds],
		status: [...STATIC_STATUS_TARGET_IDS, ...channelTargetIds],
		securityAudit: [...STATIC_SECURITY_AUDIT_TARGET_IDS, ...channelTargetIds]
	};
}
function getCommandSecretTargets() {
	cachedCommandSecretTargets ??= buildCommandSecretTargets();
	return cachedCommandSecretTargets;
}
function toTargetIdSet(values) {
	return new Set(values);
}
function selectChannelTargetIds(channel) {
	const commandSecretTargets = getCommandSecretTargets();
	if (!channel) return toTargetIdSet(commandSecretTargets.channels);
	return toTargetIdSet(commandSecretTargets.channels.filter((id) => id.startsWith(`channels.${channel}.`)));
}
function pathTargetsScopedChannelAccount(params) {
	const [root, channelId, accountRoot, accountId] = params.pathSegments;
	if (root !== "channels" || channelId !== params.channel) return false;
	if (accountRoot !== "accounts") return true;
	return accountId === params.accountId;
}
function getScopedChannelsCommandSecretTargets(params) {
	const channel = normalizeOptionalString(params.channel);
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
	return toTargetIdSet(STATIC_QR_REMOTE_TARGET_IDS);
}
function getChannelsCommandSecretTargetIds() {
	return toTargetIdSet(getCommandSecretTargets().channels);
}
function getModelsCommandSecretTargetIds() {
	return toTargetIdSet(STATIC_MODEL_TARGET_IDS);
}
function getAgentRuntimeCommandSecretTargetIds(params) {
	if (params?.includeChannelTargets !== true) return toTargetIdSet(STATIC_AGENT_RUNTIME_BASE_TARGET_IDS);
	return toTargetIdSet(getCommandSecretTargets().agentRuntime);
}
function getStatusCommandSecretTargetIds() {
	return toTargetIdSet(getCommandSecretTargets().status);
}
function getSecurityAuditCommandSecretTargetIds() {
	return toTargetIdSet(getCommandSecretTargets().securityAudit);
}
//#endregion
export { getScopedChannelsCommandSecretTargets as a, getQrRemoteCommandSecretTargetIds as i, getChannelsCommandSecretTargetIds as n, getSecurityAuditCommandSecretTargetIds as o, getModelsCommandSecretTargetIds as r, getStatusCommandSecretTargetIds as s, getAgentRuntimeCommandSecretTargetIds as t };
