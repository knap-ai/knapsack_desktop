import "./subsystem-CJEvHE2o.js";
import { r as normalizeProviderId } from "./provider-id-CTiEzT1T.js";
import "./model-selection-8a6zD_aX.js";
import { t as isBlockedObjectKey } from "./prototype-keys-C9Ot198c.js";
import "./provider-env-vars-BgFCVfb6.js";
import "./model-auth-BxuwOp1l.js";
import "./failover-error-qR7EPsdr.js";
import { t as resolvePluginCapabilityProviders } from "./capability-provider-runtime-PYXIzZGK.js";
import "./google-B4rwKHX0.js";
import "./openai-En0qhI42.js";
//#region src/image-generation/provider-registry.ts
const BUILTIN_IMAGE_GENERATION_PROVIDERS = [];
const UNSAFE_PROVIDER_IDS = new Set([
	"__proto__",
	"constructor",
	"prototype"
]);
function normalizeImageGenerationProviderId(id) {
	const normalized = normalizeProviderId(id ?? "");
	if (!normalized || isBlockedObjectKey(normalized)) return;
	return normalized;
}
function isSafeImageGenerationProviderId(id) {
	return Boolean(id && !UNSAFE_PROVIDER_IDS.has(id));
}
function resolvePluginImageGenerationProviders(cfg) {
	return resolvePluginCapabilityProviders({
		key: "imageGenerationProviders",
		cfg
	});
}
function buildProviderMaps(cfg) {
	const canonical = /* @__PURE__ */ new Map();
	const aliases = /* @__PURE__ */ new Map();
	const register = (provider) => {
		const id = normalizeImageGenerationProviderId(provider.id);
		if (!isSafeImageGenerationProviderId(id)) return;
		canonical.set(id, provider);
		aliases.set(id, provider);
		for (const alias of provider.aliases ?? []) {
			const normalizedAlias = normalizeImageGenerationProviderId(alias);
			if (isSafeImageGenerationProviderId(normalizedAlias)) aliases.set(normalizedAlias, provider);
		}
	};
	for (const provider of BUILTIN_IMAGE_GENERATION_PROVIDERS) register(provider);
	for (const provider of resolvePluginImageGenerationProviders(cfg)) register(provider);
	return {
		canonical,
		aliases
	};
}
function listImageGenerationProviders(cfg) {
	return [...buildProviderMaps(cfg).canonical.values()];
}
function getImageGenerationProvider(providerId, cfg) {
	const normalized = normalizeImageGenerationProviderId(providerId);
	if (!normalized) return;
	return buildProviderMaps(cfg).aliases.get(normalized);
}
//#endregion
export { listImageGenerationProviders as n, getImageGenerationProvider as t };
