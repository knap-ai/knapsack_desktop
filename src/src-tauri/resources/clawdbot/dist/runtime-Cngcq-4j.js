import { a as normalizeLowercaseStringOrEmpty, s as normalizeOptionalLowercaseString } from "./string-coerce-Bje8XVt9.js";
import { r as logVerbose } from "./globals-CJu56k75.js";
import { g as selectApplicableRuntimeConfig, i as getRuntimeConfigSnapshot, s as getRuntimeConfigSourceSnapshot } from "./runtime-snapshot-DLisEE8Y.js";
import { n as getActiveRuntimeWebToolsMetadata } from "./runtime-web-tools-state-BtJqif_X.js";
import { r as sortWebSearchProvidersForAutoDetect } from "./web-search-providers.shared-DN1TwPn0.js";
import { a as resolveWebProviderDefinition, i as resolveWebProviderConfig, n as providerRequiresCredential, r as readWebProviderEnvValue, t as hasWebProviderEntryCredential } from "./provider-runtime-shared-DPgiJEIj.js";
import { n as resolveRuntimeWebSearchProviders, t as resolvePluginWebSearchProviders } from "./web-search-providers.runtime-C2rzTGid.js";
//#region src/web-search/runtime.ts
function resolveSearchConfig(cfg) {
	return resolveWebProviderConfig(cfg, "search");
}
function resolveWebSearchRuntimeConfig(config) {
	return selectApplicableRuntimeConfig({
		inputConfig: config,
		runtimeConfig: getRuntimeConfigSnapshot(),
		runtimeSourceConfig: getRuntimeConfigSourceSnapshot()
	});
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
		resolveRawValue: ({ provider: currentProvider, config: currentConfig }) => currentProvider.getConfiguredCredentialValue?.(currentConfig),
		resolveEnvValue: ({ provider: currentProvider, configuredEnvVarId }) => (configuredEnvVarId ? readWebProviderEnvValue([configuredEnvVarId]) : void 0) ?? readWebProviderEnvValue(currentProvider.envVars)
	});
}
function isWebSearchProviderConfigured(params) {
	const config = resolveWebSearchRuntimeConfig(params.config);
	return hasEntryCredential(params.provider, config, resolveSearchConfig(config));
}
function listWebSearchProviders(params) {
	return resolveRuntimeWebSearchProviders({
		config: resolveWebSearchRuntimeConfig(params?.config),
		bundledAllowlistCompat: true
	});
}
function listConfiguredWebSearchProviders(params) {
	return resolvePluginWebSearchProviders({
		config: resolveWebSearchRuntimeConfig(params?.config),
		bundledAllowlistCompat: true
	});
}
function resolveWebSearchProviderId(params) {
	const config = resolveWebSearchRuntimeConfig(params.config);
	const search = params.search ?? resolveSearchConfig(config);
	const providers = sortWebSearchProvidersForAutoDetect(params.providers ?? resolvePluginWebSearchProviders({
		config,
		bundledAllowlistCompat: true,
		origin: "bundled"
	}));
	const raw = search && "provider" in search ? normalizeLowercaseStringOrEmpty(search.provider) : "";
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
			if (!hasEntryCredential(provider, config, search)) continue;
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
	const config = resolveWebSearchRuntimeConfig(options?.config);
	const search = resolveSearchConfig(config);
	const runtimeWebSearch = options?.runtimeWebSearch ?? getActiveRuntimeWebToolsMetadata()?.search;
	const providers = sortWebSearchProvidersForAutoDetect(options?.preferRuntimeProviders ? resolveRuntimeWebSearchProviders({
		config,
		bundledAllowlistCompat: true
	}) : resolvePluginWebSearchProviders({
		config,
		bundledAllowlistCompat: true,
		origin: "bundled"
	}));
	return resolveWebProviderDefinition({
		config,
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
	const config = resolveWebSearchRuntimeConfig(options?.config);
	const search = resolveSearchConfig(config);
	const runtimeWebSearch = options?.runtimeWebSearch ?? getActiveRuntimeWebToolsMetadata()?.search;
	if (!resolveWebSearchEnabled({
		search,
		sandboxed: options?.sandboxed
	})) return [];
	const providers = sortWebSearchProvidersForAutoDetect(options?.preferRuntimeProviders ? resolveRuntimeWebSearchProviders({
		config,
		bundledAllowlistCompat: true
	}) : resolvePluginWebSearchProviders({
		config,
		bundledAllowlistCompat: true,
		origin: "bundled"
	})).filter(Boolean);
	if (providers.length === 0) return [];
	const preferredIds = [
		options?.providerId,
		runtimeWebSearch?.selectedProvider,
		runtimeWebSearch?.providerConfigured,
		resolveWebSearchProviderId({
			config,
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
	const config = resolveWebSearchRuntimeConfig(params.config);
	const search = resolveSearchConfig(config);
	const runtimeWebSearch = params.runtimeWebSearch ?? getActiveRuntimeWebToolsMetadata()?.search;
	const candidates = resolveWebSearchCandidates({
		...params,
		config,
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
			config,
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
export { runWebSearch as a, resolveWebSearchDefinition as i, listConfiguredWebSearchProviders as n, listWebSearchProviders as r, isWebSearchProviderConfigured as t };
