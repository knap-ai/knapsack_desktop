import { t as resolvePluginCapabilityProviders } from "./capability-provider-runtime-PYXIzZGK.js";
//#region src/tts/provider-registry.ts
function trimToUndefined(value) {
	const trimmed = value?.trim().toLowerCase();
	return trimmed ? trimmed : void 0;
}
function normalizeSpeechProviderId(providerId) {
	return trimToUndefined(providerId);
}
function resolveSpeechProviderPluginEntries(cfg) {
	return resolvePluginCapabilityProviders({
		key: "speechProviders",
		cfg
	});
}
function buildProviderMaps(cfg) {
	const canonical = /* @__PURE__ */ new Map();
	const aliases = /* @__PURE__ */ new Map();
	const register = (provider) => {
		const id = normalizeSpeechProviderId(provider.id);
		if (!id) return;
		canonical.set(id, provider);
		aliases.set(id, provider);
		for (const alias of provider.aliases ?? []) {
			const normalizedAlias = normalizeSpeechProviderId(alias);
			if (normalizedAlias) aliases.set(normalizedAlias, provider);
		}
	};
	for (const provider of resolveSpeechProviderPluginEntries(cfg)) register(provider);
	return {
		canonical,
		aliases
	};
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
