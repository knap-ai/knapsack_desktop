import { i as normalizeLowercaseStringOrEmpty, o as normalizeOptionalLowercaseString } from "./string-coerce-BUSzWgUA.js";
import { d as resolveSecretInputRef, l as normalizeSecretInputString } from "./types.secrets-CeL3gSMO.js";
import { r as logVerbose } from "./globals-De6QTwLG.js";
import { n as normalizeSecretInput } from "./normalize-secret-input-DqcJmob1.js";
import { n as getActiveRuntimeWebToolsMetadata } from "./runtime-web-tools-state-DuT4kvJs.js";
import { r as sortWebSearchProvidersForAutoDetect } from "./web-search-providers.shared-BiBdRUdb.js";
import { n as resolveRuntimeWebSearchProviders, t as resolvePluginWebSearchProviders } from "./web-search-providers.runtime-zu0IAtJm.js";
//#region src/web/provider-runtime-shared.ts
function resolveWebProviderConfig(cfg, kind) {
	const webConfig = cfg?.tools?.web;
	if (!webConfig || typeof webConfig !== "object") return;
	const toolConfig = webConfig[kind];
	if (!toolConfig || typeof toolConfig !== "object") return;
	return toolConfig;
}
function readWebProviderEnvValue(envVars, processEnv = process.env) {
	for (const envVar of envVars) {
		const value = normalizeSecretInput(processEnv[envVar]);
		if (value) return value;
	}
}
function providerRequiresCredential(provider) {
	return provider.requiresCredential !== false;
}
function hasWebProviderEntryCredential(params) {
	if (!providerRequiresCredential(params.provider)) return true;
	const rawValue = params.resolveRawValue({
		provider: params.provider,
		config: params.config,
		toolConfig: params.toolConfig
	});
	const configuredRef = resolveSecretInputRef({ value: rawValue }).ref;
	if (configuredRef && configuredRef.source !== "env") return true;
	if (normalizeSecretInput(normalizeSecretInputString(rawValue))) return true;
	return Boolean(params.resolveEnvValue({
		provider: params.provider,
		configuredEnvVarId: configuredRef?.source === "env" ? configuredRef.id : void 0
	}));
}
function resolveWebProviderDefinition(params) {
	if (!params.resolveEnabled({
		toolConfig: params.toolConfig,
		sandboxed: params.sandboxed
	})) return null;
	const providers = params.providers.filter(Boolean);
	if (providers.length === 0) return null;
	const autoProviderId = params.resolveAutoProviderId({
		config: params.config,
		toolConfig: params.toolConfig,
		providers
	});
	const providerId = params.providerId ?? (params.runtimeMetadata ? params.runtimeMetadata.selectedProvider : autoProviderId);
	if (!providerId) return null;
	const provider = providers.find((entry) => entry.id === providerId) ?? providers.find((entry) => entry.id === params.resolveFallbackProviderId?.({
		config: params.config,
		toolConfig: params.toolConfig,
		providers,
		providerId
	}));
	if (!provider) return null;
	const definition = params.createTool({
		provider,
		config: params.config,
		toolConfig: params.toolConfig,
		runtimeMetadata: params.runtimeMetadata
	});
	if (!definition) return null;
	return {
		provider,
		definition
	};
}
//#endregion
//#region src/web-search/runtime.ts
function resolveSearchConfig(cfg) {
	return resolveWebProviderConfig(cfg, "search");
}
function resolveWebSearchEnabled(params) {
	if (typeof params.search?.enabled === "boolean") return params.search.enabled;
	if (params.sandboxed) return true;
	return true;
}
function hasEntryCredential(provider, config, search) {
	return hasWebProviderEntryCredential({
		provider,
		config,
		toolConfig: search,
		resolveRawValue: ({ provider: currentProvider, config: currentConfig, toolConfig }) => currentProvider.getConfiguredCredentialValue?.(currentConfig) ?? (currentProvider.id === "brave" ? currentProvider.getCredentialValue(toolConfig) : void 0),
		resolveEnvValue: ({ provider: currentProvider, configuredEnvVarId }) => (configuredEnvVarId ? readWebProviderEnvValue([configuredEnvVarId]) : void 0) ?? readWebProviderEnvValue(currentProvider.envVars)
	});
}
function isWebSearchProviderConfigured(params) {
	return hasEntryCredential(params.provider, params.config, resolveSearchConfig(params.config));
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
	const providers = sortWebSearchProvidersForAutoDetect(params.providers ?? resolvePluginWebSearchProviders({
		config: params.config,
		bundledAllowlistCompat: true,
		origin: "bundled"
	}));
	const raw = params.search && "provider" in params.search ? normalizeLowercaseStringOrEmpty(params.search.provider) : "";
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
	const providers = sortWebSearchProvidersForAutoDetect(options?.preferRuntimeProviders ? resolveRuntimeWebSearchProviders({
		config: options?.config,
		bundledAllowlistCompat: true
	}) : resolvePluginWebSearchProviders({
		config: options?.config,
		bundledAllowlistCompat: true,
		origin: "bundled"
	}));
	return resolveWebProviderDefinition({
		config: options?.config,
		toolConfig: search,
		runtimeMetadata: runtimeWebSearch,
		sandboxed: options?.sandboxed,
		providerId: options?.providerId,
		providers,
		resolveEnabled: ({ toolConfig, sandboxed }) => resolveWebSearchEnabled({
			search: toolConfig,
			sandboxed
		}),
		resolveAutoProviderId: ({ config, toolConfig, providers }) => resolveWebSearchProviderId({
			config,
			search: toolConfig,
			providers
		}),
		resolveFallbackProviderId: ({ config, toolConfig, providers }) => resolveWebSearchProviderId({
			config,
			search: toolConfig,
			providers
		}) || providers[0]?.id,
		createTool: ({ provider, config, toolConfig, runtimeMetadata }) => provider.createTool({
			config,
			searchConfig: toolConfig,
			runtimeMetadata
		})
	});
}
function resolveWebSearchCandidates(options) {
	const search = resolveSearchConfig(options?.config);
	const runtimeWebSearch = options?.runtimeWebSearch ?? getActiveRuntimeWebToolsMetadata()?.search;
	if (!resolveWebSearchEnabled({
		search,
		sandboxed: options?.sandboxed
	})) return [];
	const providers = sortWebSearchProvidersForAutoDetect(options?.preferRuntimeProviders ? resolveRuntimeWebSearchProviders({
		config: options?.config,
		bundledAllowlistCompat: true
	}) : resolvePluginWebSearchProviders({
		config: options?.config,
		bundledAllowlistCompat: true,
		origin: "bundled"
	})).filter(Boolean);
	if (providers.length === 0) return [];
	const preferredIds = [
		options?.providerId,
		runtimeWebSearch?.selectedProvider,
		runtimeWebSearch?.providerConfigured,
		resolveWebSearchProviderId({
			config: options?.config,
			search,
			providers
		})
	].filter((value, index, array) => Boolean(value) && array.indexOf(value) === index);
	const explicitProviderId = options?.providerId?.trim();
	if (explicitProviderId && !providers.some((entry) => entry.id === explicitProviderId)) throw new Error(`Unknown web_search provider "${explicitProviderId}".`);
	return [...preferredIds.map((id) => providers.find((entry) => entry.id === id)).filter((entry) => Boolean(entry)), ...providers.filter((entry) => !preferredIds.includes(entry.id))];
}
function hasExplicitWebSearchSelection(params) {
	if (params.providerId?.trim()) return true;
	const availableProviderIds = new Set((params.providers ?? []).map((provider) => normalizeLowercaseStringOrEmpty(provider.id)));
	const configuredProviderId = params.search && "provider" in params.search && typeof params.search.provider === "string" ? normalizeLowercaseStringOrEmpty(params.search.provider) : "";
	if (configuredProviderId && availableProviderIds.has(configuredProviderId)) return true;
	const runtimeConfiguredId = normalizeOptionalLowercaseString(params.runtimeWebSearch?.selectedProvider ?? params.runtimeWebSearch?.providerConfigured);
	if (params.runtimeWebSearch?.providerSource === "configured" && runtimeConfiguredId && availableProviderIds.has(runtimeConfiguredId)) return true;
	return false;
}
async function runWebSearch(params) {
	const search = resolveSearchConfig(params.config);
	const runtimeWebSearch = params.runtimeWebSearch ?? getActiveRuntimeWebToolsMetadata()?.search;
	const candidates = resolveWebSearchCandidates({
		...params,
		runtimeWebSearch,
		preferRuntimeProviders: params.preferRuntimeProviders ?? true
	});
	if (candidates.length === 0) throw new Error("web_search is disabled or no provider is available.");
	const allowFallback = !hasExplicitWebSearchSelection({
		search,
		runtimeWebSearch,
		providerId: params.providerId,
		providers: candidates
	});
	let lastError;
	let sawUnavailableProvider = false;
	for (const candidate of candidates) try {
		const definition = candidate.createTool({
			config: params.config,
			searchConfig: search,
			runtimeMetadata: runtimeWebSearch
		});
		if (!definition) {
			if (!allowFallback) throw new Error(`web_search provider "${candidate.id}" is not available.`);
			sawUnavailableProvider = true;
			continue;
		}
		return {
			provider: candidate.id,
			result: await definition.execute(params.args)
		};
	} catch (error) {
		lastError = error;
		if (!allowFallback) throw error;
	}
	if (sawUnavailableProvider && lastError === void 0) throw new Error("web_search is enabled but no provider is currently available.");
	throw lastError instanceof Error ? lastError : new Error(String(lastError));
}
//#endregion
export { runWebSearch as a, readWebProviderEnvValue as c, resolveWebSearchDefinition as i, resolveWebProviderConfig as l, listConfiguredWebSearchProviders as n, hasWebProviderEntryCredential as o, listWebSearchProviders as r, providerRequiresCredential as s, isWebSearchProviderConfigured as t, resolveWebProviderDefinition as u };
