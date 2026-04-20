import { t as resolvePluginCapabilityProviders } from "./capability-provider-runtime-CFZVcnCd.js";
import { n as normalizeCapabilityProviderId, t as buildCapabilityProviderMaps } from "./provider-registry-shared-BiA767Jk.js";
//#region src/tts/provider-registry.ts
function normalizeSpeechProviderId(providerId) {
	return normalizeCapabilityProviderId(providerId);
}
function resolveSpeechProviderPluginEntries(cfg) {
	return resolvePluginCapabilityProviders({
		key: "speechProviders",
		cfg
	});
}
function buildProviderMaps(cfg) {
	return buildCapabilityProviderMaps(resolveSpeechProviderPluginEntries(cfg));
}
function listSpeechProviders(cfg) {
	return [...buildProviderMaps(cfg).canonical.values()];
}
function getSpeechProvider(providerId, cfg) {
	const normalized = normalizeSpeechProviderId(providerId);
	if (!normalized) return;
	return buildProviderMaps(cfg).aliases.get(normalized);
}
function canonicalizeSpeechProviderId(providerId, cfg) {
	const normalized = normalizeSpeechProviderId(providerId);
	if (!normalized) return;
	return getSpeechProvider(normalized, cfg)?.id ?? normalized;
}
//#endregion
export { normalizeSpeechProviderId as i, getSpeechProvider as n, listSpeechProviders as r, canonicalizeSpeechProviderId as t };
