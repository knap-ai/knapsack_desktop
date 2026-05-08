import { a as normalizeLowercaseStringOrEmpty } from "./string-coerce-Bje8XVt9.js";
import { n as loadPluginManifestRegistryForPluginRegistry } from "./plugin-registry-CZ8QXP5l.js";
//#region src/plugins/manifest-model-id-normalization.ts
let manifestModelIdNormalizationCache;
function loadManifestModelIdNormalizationPolicies() {
	if (manifestModelIdNormalizationCache) return manifestModelIdNormalizationCache;
	const policies = /* @__PURE__ */ new Map();
	const registry = loadPluginManifestRegistryForPluginRegistry({ includeDisabled: true });
	for (const plugin of registry.plugins) for (const [provider, policy] of Object.entries(plugin.modelIdNormalization?.providers ?? {})) policies.set(provider, policy);
	manifestModelIdNormalizationCache = policies;
	return policies;
}
function hasProviderPrefix(modelId) {
	return modelId.includes("/");
}
function formatPrefixedModelId(prefix, modelId) {
	return `${prefix.replace(/\/+$/u, "")}/${modelId.replace(/^\/+/u, "")}`;
}
function normalizeProviderModelIdWithManifest(params) {
	const policy = loadManifestModelIdNormalizationPolicies().get(params.provider);
	if (!policy) return;
	let modelId = params.context.modelId.trim();
	if (!modelId) return modelId;
	for (const prefix of policy.stripPrefixes ?? []) {
		const normalizedPrefix = normalizeLowercaseStringOrEmpty(prefix);
		if (normalizedPrefix && normalizeLowercaseStringOrEmpty(modelId).startsWith(normalizedPrefix)) {
			modelId = modelId.slice(prefix.length);
			break;
		}
	}
	modelId = policy.aliases?.[normalizeLowercaseStringOrEmpty(modelId)] ?? modelId;
	if (!hasProviderPrefix(modelId)) {
		for (const rule of policy.prefixWhenBareAfterAliasStartsWith ?? []) if (normalizeLowercaseStringOrEmpty(modelId).startsWith(rule.modelPrefix.toLowerCase())) return formatPrefixedModelId(rule.prefix, modelId);
		if (policy.prefixWhenBare) return formatPrefixedModelId(policy.prefixWhenBare, modelId);
	}
	return modelId;
}
//#endregion
export { normalizeProviderModelIdWithManifest as t };
