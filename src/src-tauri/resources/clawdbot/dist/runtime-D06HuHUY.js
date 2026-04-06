import { r as logVerbose } from "./globals-BJZkpw-q.js";
import { d as resolveSecretInputRef, l as normalizeSecretInputString } from "./types.secrets-DTXJhyWe.js";
import { n as normalizeSecretInput } from "./normalize-secret-input-CRNbANMO.js";
import { r as getActiveRuntimeWebToolsMetadata } from "./runtime-Dowbpm1j.js";
import { r as sortWebSearchProvidersForAutoDetect } from "./web-search-providers.shared-CiXeJJJg.js";
import { t as resolveBundledPluginWebSearchProviders } from "./web-search-providers-ihUOk3z4.js";
import { n as resolveRuntimeWebSearchProviders, t as resolvePluginWebSearchProviders } from "./web-search-providers.runtime-BGcv6M1I.js";
//#region src/web-search/runtime.ts
function resolveSearchConfig(cfg) {
	const search = cfg?.tools?.web?.search;
	if (!search || typeof search !== "object") return;
	return search;
}
function resolveWebSearchEnabled(params) {
	if (typeof params.search?.enabled === "boolean") return params.search.enabled;
	if (params.sandboxed) return true;
	return true;
}
function readProviderEnvValue(envVars) {
	for (const envVar of envVars) {
		const value = normalizeSecretInput(process.env[envVar]);
		if (value) return value;
	}
}
function providerRequiresCredential(provider) {
	return provider.requiresCredential !== false;
}
function hasEntryCredential(provider, config, search) {
	if (!providerRequiresCredential(provider)) return true;
	const rawValue = provider.getConfiguredCredentialValue?.(config) ?? (provider.id === "brave" ? provider.getCredentialValue(search) : void 0);
	const configuredRef = resolveSecretInputRef({ value: rawValue }).ref;
	if (configuredRef && configuredRef.source !== "env") return true;
	const fromConfig = normalizeSecretInput(normalizeSecretInputString(rawValue));
	if (configuredRef?.source === "env") return Boolean(normalizeSecretInput(process.env[configuredRef.id]) || readProviderEnvValue(provider.envVars));
	return Boolean(fromConfig || readProviderEnvValue(provider.envVars));
}
function listWebSearchProviders(params) {
	return resolveRuntimeWebSearchProviders({
		config: params?.config,
		bundledAllowlistCompat: true
	});
}
function listConfiguredWebSearchProviders(params) {
	return resolvePluginWebSearchProviders({
		config: params?.config,
		bundledAllowlistCompat: true
	});
}
function resolveWebSearchProviderId(params) {
	const providers = sortWebSearchProvidersForAutoDetect(params.providers ?? resolveBundledPluginWebSearchProviders({
		config: params.config,
		bundledAllowlistCompat: true
	}));
	const raw = params.search && "provider" in params.search && typeof params.search.provider === "string" ? params.search.provider.trim().toLowerCase() : "";
	if (raw) {
		const explicit = providers.find((provider) => provider.id === raw);
		if (explicit) return explicit.id;
	}
	if (!raw) {
		let keylessFallbackProviderId = "";
		for (const provider of providers) {
			if (!providerRequiresCredential(provider)) {
				keylessFallbackProviderId ||= provider.id;
				continue;
			}
			if (!hasEntryCredential(provider, params.config, params.search)) continue;
			logVerbose(`web_search: no provider configured, auto-detected "${provider.id}" from available API keys`);
			return provider.id;
		}
		if (keylessFallbackProviderId) {
			logVerbose(`web_search: no provider configured and no credentials found, falling back to keyless provider "${keylessFallbackProviderId}"`);
			return keylessFallbackProviderId;
		}
	}
	return providers[0]?.id ?? "";
}
function resolveWebSearchDefinition(options) {
	const search = resolveSearchConfig(options?.config);
	const runtimeWebSearch = options?.runtimeWebSearch ?? getActiveRuntimeWebToolsMetadata()?.search;
	if (!resolveWebSearchEnabled({
		search,
		sandboxed: options?.sandboxed
	})) return null;
	const providers = sortWebSearchProvidersForAutoDetect(options?.preferRuntimeProviders ? resolveRuntimeWebSearchProviders({
		config: options?.config,
		bundledAllowlistCompat: true
	}) : resolveBundledPluginWebSearchProviders({
		config: options?.config,
		bundledAllowlistCompat: true
	})).filter(Boolean);
	if (providers.length === 0) return null;
	const providerId = options?.providerId ?? runtimeWebSearch?.selectedProvider ?? runtimeWebSearch?.providerConfigured ?? resolveWebSearchProviderId({
		config: options?.config,
		search,
		providers
	});
	const provider = providers.find((entry) => entry.id === providerId) ?? providers.find((entry) => entry.id === resolveWebSearchProviderId({
		config: options?.config,
		search,
		providers
	})) ?? providers[0];
	if (!provider) return null;
	const definition = provider.createTool({
		config: options?.config,
		searchConfig: search,
		runtimeMetadata: runtimeWebSearch
	});
	if (!definition) return null;
	return {
		provider,
		definition
	};
}
async function runWebSearch(params) {
	const resolved = resolveWebSearchDefinition({
		...params,
		preferRuntimeProviders: true
	});
	if (!resolved) throw new Error("web_search is disabled or no provider is available.");
	return {
		provider: resolved.provider.id,
		result: await resolved.definition.execute(params.args)
	};
}
//#endregion
export { runWebSearch as i, listWebSearchProviders as n, resolveWebSearchDefinition as r, listConfiguredWebSearchProviders as t };
