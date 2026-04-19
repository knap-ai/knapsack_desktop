import { o as normalizeOptionalLowercaseString, s as normalizeOptionalString } from "./string-coerce-BUSzWgUA.js";
import { r as normalizeProviderId } from "./provider-id-KaStHhRz.js";
import { i as listThinkingLevels$1, r as listThinkingLevelLabels$1, t as formatThinkingLevels$1 } from "./thinking.shared-CAbk7EZs.js";
//#region src/plugins/provider-thinking.ts
const PLUGIN_REGISTRY_STATE = Symbol.for("openclaw.pluginRegistryState");
function matchesProviderId(provider, providerId) {
	const normalized = normalizeProviderId(providerId);
	if (!normalized) return false;
	if (normalizeProviderId(provider.id) === normalized) return true;
	return (provider.aliases ?? []).some((alias) => normalizeProviderId(alias) === normalized);
}
function resolveActiveThinkingProvider(providerId) {
	return globalThis[PLUGIN_REGISTRY_STATE]?.activeRegistry?.providers?.find((entry) => {
		return matchesProviderId(entry.provider, providerId);
	})?.provider;
}
function resolveProviderBinaryThinking(params) {
	return resolveActiveThinkingProvider(params.provider)?.isBinaryThinking?.(params.context);
}
function resolveProviderXHighThinking(params) {
	return resolveActiveThinkingProvider(params.provider)?.supportsXHighThinking?.(params.context);
}
//#endregion
//#region src/auto-reply/thinking.ts
function isBinaryThinkingProvider(provider, model) {
	const providerRaw = normalizeOptionalString(provider);
	const normalizedProvider = providerRaw ? normalizeProviderId(providerRaw) : "";
	if (!normalizedProvider) return false;
	const pluginDecision = resolveProviderBinaryThinking({
		provider: normalizedProvider,
		context: {
			provider: normalizedProvider,
			modelId: normalizeOptionalString(model) ?? ""
		}
	});
	if (typeof pluginDecision === "boolean") return pluginDecision;
	return false;
}
function supportsXHighThinking(provider, model) {
	const modelKey = normalizeOptionalLowercaseString(model);
	if (!modelKey) return false;
	const providerRaw = normalizeOptionalString(provider);
	const providerKey = providerRaw ? normalizeProviderId(providerRaw) : "";
	if (providerKey) {
		const pluginDecision = resolveProviderXHighThinking({
			provider: providerKey,
			context: {
				provider: providerKey,
				modelId: modelKey
			}
		});
		if (typeof pluginDecision === "boolean") return pluginDecision;
	}
	return false;
}
function listThinkingLevels(provider, model) {
	const levels = listThinkingLevels$1(provider, model);
	if (supportsXHighThinking(provider, model)) levels.splice(levels.length - 1, 0, "xhigh");
	return levels;
}
function listThinkingLevelLabels(provider, model) {
	if (isBinaryThinkingProvider(provider, model)) return ["off", "on"];
	return listThinkingLevelLabels$1(provider, model);
}
function formatThinkingLevels(provider, model, separator = ", ") {
	return supportsXHighThinking(provider, model) ? listThinkingLevelLabels(provider, model).join(separator) : formatThinkingLevels$1(provider, model, separator);
}
//#endregion
export { supportsXHighThinking as i, listThinkingLevelLabels as n, listThinkingLevels as r, formatThinkingLevels as t };
