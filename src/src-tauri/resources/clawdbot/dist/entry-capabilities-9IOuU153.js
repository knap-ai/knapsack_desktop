import { r as normalizeProviderId } from "./provider-id-DRW5WMbW.js";
//#region src/media-understanding/provider-id.ts
function normalizeMediaProviderId(id) {
	const normalized = normalizeProviderId(id);
	if (normalized === "gemini") return "google";
	return normalized;
}
//#endregion
//#region src/media-understanding/config-provider-models.ts
function hasImageCapableModel(providerCfg) {
	return (providerCfg.models ?? []).some((model) => Array.isArray(model?.input) && model.input.includes("image"));
}
function resolveImageCapableConfigProviderIds(cfg) {
	const configProviders = cfg?.models?.providers;
	if (!configProviders || typeof configProviders !== "object") return [];
	const providerIds = [];
	for (const [providerKey, providerCfg] of Object.entries(configProviders)) {
		if (!providerKey?.trim() || !hasImageCapableModel(providerCfg)) continue;
		providerIds.push(normalizeMediaProviderId(providerKey));
	}
	return providerIds;
}
//#endregion
//#region src/media-understanding/entry-capabilities.ts
const MEDIA_CAPABILITIES = [
	"audio",
	"image",
	"video"
];
function isMediaCapability(value) {
	return typeof value === "string" && MEDIA_CAPABILITIES.includes(value);
}
function resolveEntryType(entry) {
	return entry.type ?? (entry.command ? "cli" : "provider");
}
function resolveConfiguredMediaEntryCapabilities(entry) {
	if (!Array.isArray(entry.capabilities)) return;
	const capabilities = entry.capabilities.filter(isMediaCapability);
	return capabilities.length > 0 ? capabilities : void 0;
}
function resolveEffectiveMediaEntryCapabilities(params) {
	const configured = resolveConfiguredMediaEntryCapabilities(params.entry);
	if (configured) return configured;
	if (params.source !== "shared") return;
	if (resolveEntryType(params.entry) === "cli") return;
	const providerId = normalizeMediaProviderId(params.entry.provider ?? "");
	if (!providerId) return;
	return params.providerRegistry.get(providerId)?.capabilities;
}
function matchesMediaEntryCapability(params) {
	const capabilities = resolveEffectiveMediaEntryCapabilities(params);
	if (!capabilities || capabilities.length === 0) return params.source === "capability";
	return capabilities.includes(params.capability);
}
//#endregion
export { normalizeMediaProviderId as a, resolveImageCapableConfigProviderIds as i, resolveConfiguredMediaEntryCapabilities as n, resolveEffectiveMediaEntryCapabilities as r, matchesMediaEntryCapability as t };
