import { i as normalizeProviderIdForAuth } from "./provider-id-CTiEzT1T.js";
import "./paths-CD8i0MSg.js";
import { i as coerceSecretRef, t as DEFAULT_SECRET_PROVIDER_ALIAS } from "./types.secrets-DTXJhyWe.js";
import "./agent-paths-BiYMSfDv.js";
import { n as normalizeSecretInput } from "./normalize-secret-input-CRNbANMO.js";
import "./profiles-RmR8EAZC.js";
import { n as getProviderEnvVars } from "./provider-env-vars-BgFCVfb6.js";
import "node:fs";
import "node:path";
//#region src/plugins/provider-auth-helpers.ts
const ENV_REF_PATTERN = /^\$\{([A-Z][A-Z0-9_]*)\}$/;
function buildEnvSecretRef(id) {
	return {
		source: "env",
		provider: DEFAULT_SECRET_PROVIDER_ALIAS,
		id
	};
}
function parseEnvSecretRef(value) {
	const match = ENV_REF_PATTERN.exec(value);
	if (!match) return null;
	return buildEnvSecretRef(match[1]);
}
function resolveProviderDefaultEnvSecretRef(provider) {
	const envVar = getProviderEnvVars(provider)?.find((candidate) => candidate.trim().length > 0);
	if (!envVar) throw new Error(`Provider "${provider}" does not have a default env var mapping for secret-input-mode=ref.`);
	return buildEnvSecretRef(envVar);
}
function resolveApiKeySecretInput(provider, input, options) {
	const coercedRef = coerceSecretRef(input);
	if (coercedRef) return coercedRef;
	const normalized = normalizeSecretInput(input);
	const inlineEnvRef = parseEnvSecretRef(normalized);
	if (inlineEnvRef) return inlineEnvRef;
	if (options?.secretInputMode === "ref") return resolveProviderDefaultEnvSecretRef(provider);
	return normalized;
}
function buildApiKeyCredential(provider, input, metadata, options) {
	const secretInput = resolveApiKeySecretInput(provider, input, options);
	if (typeof secretInput === "string") return {
		type: "api_key",
		provider,
		key: secretInput,
		...metadata ? { metadata } : {}
	};
	return {
		type: "api_key",
		provider,
		keyRef: secretInput,
		...metadata ? { metadata } : {}
	};
}
function applyAuthProfileConfig(cfg, params) {
	const normalizedProvider = normalizeProviderIdForAuth(params.provider);
	const profiles = {
		...cfg.auth?.profiles,
		[params.profileId]: {
			provider: params.provider,
			mode: params.mode,
			...params.email ? { email: params.email } : {},
			...params.displayName ? { displayName: params.displayName } : {}
		}
	};
	const configuredProviderProfiles = Object.entries(cfg.auth?.profiles ?? {}).filter(([, profile]) => normalizeProviderIdForAuth(profile.provider) === normalizedProvider).map(([profileId, profile]) => ({
		profileId,
		mode: profile.mode
	}));
	const matchingProviderOrderEntries = Object.entries(cfg.auth?.order ?? {}).filter(([providerId]) => normalizeProviderIdForAuth(providerId) === normalizedProvider);
	const existingProviderOrder = matchingProviderOrderEntries.length > 0 ? [...new Set(matchingProviderOrderEntries.flatMap(([, order]) => order))] : void 0;
	const preferProfileFirst = params.preferProfileFirst ?? true;
	const reorderedProviderOrder = existingProviderOrder && preferProfileFirst ? [params.profileId, ...existingProviderOrder.filter((profileId) => profileId !== params.profileId)] : existingProviderOrder;
	const hasMixedConfiguredModes = configuredProviderProfiles.some(({ profileId, mode }) => profileId !== params.profileId && mode !== params.mode);
	const derivedProviderOrder = existingProviderOrder === void 0 && preferProfileFirst && hasMixedConfiguredModes ? [params.profileId, ...configuredProviderProfiles.map(({ profileId }) => profileId).filter((profileId) => profileId !== params.profileId)] : void 0;
	const baseOrder = matchingProviderOrderEntries.length > 0 ? Object.fromEntries(Object.entries(cfg.auth?.order ?? {}).filter(([providerId]) => normalizeProviderIdForAuth(providerId) !== normalizedProvider)) : cfg.auth?.order;
	const order = existingProviderOrder !== void 0 ? {
		...baseOrder,
		[normalizedProvider]: reorderedProviderOrder?.includes(params.profileId) ? reorderedProviderOrder : [...reorderedProviderOrder ?? [], params.profileId]
	} : derivedProviderOrder ? {
		...baseOrder,
		[normalizedProvider]: derivedProviderOrder
	} : baseOrder;
	return {
		...cfg,
		auth: {
			...cfg.auth,
			profiles,
			...order ? { order } : {}
		}
	};
}
//#endregion
export { buildApiKeyCredential as n, applyAuthProfileConfig as t };
