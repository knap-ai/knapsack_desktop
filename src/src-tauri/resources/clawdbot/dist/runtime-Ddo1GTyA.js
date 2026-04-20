import { i as normalizeLowercaseStringOrEmpty } from "./string-coerce-BUSzWgUA.js";
import { r as logVerbose } from "./globals-De6QTwLG.js";
import { n as getActiveRuntimeWebToolsMetadata } from "./runtime-web-tools-state-DuT4kvJs.js";
import { r as sortWebFetchProvidersForAutoDetect } from "./web-fetch-providers.shared-JSmqd1Em.js";
import { t as resolvePluginWebFetchProviders } from "./web-fetch-providers.runtime-BdSxC17d.js";
import { c as readWebProviderEnvValue, l as resolveWebProviderConfig, o as hasWebProviderEntryCredential, s as providerRequiresCredential, u as resolveWebProviderDefinition } from "./runtime-BRxW-LBe.js";
//#region src/web-fetch/runtime.ts
function resolveWebFetchEnabled(params) {
	if (typeof params.fetch?.enabled === "boolean") return params.fetch.enabled;
	return true;
}
function resolveFetchConfig(config) {
	return resolveWebProviderConfig(config, "fetch");
}
function hasEntryCredential(provider, config, fetch) {
	return hasWebProviderEntryCredential({
		provider,
		config,
		toolConfig: fetch,
		resolveRawValue: ({ provider: currentProvider, config: currentConfig, toolConfig }) => currentProvider.getConfiguredCredentialValue?.(currentConfig) ?? currentProvider.getCredentialValue(toolConfig),
		resolveEnvValue: ({ provider: currentProvider }) => readWebProviderEnvValue(currentProvider.envVars)
	});
}
function isWebFetchProviderConfigured(params) {
	return hasEntryCredential(params.provider, params.config, resolveFetchConfig(params.config));
}
function listWebFetchProviders(params) {
	return resolvePluginWebFetchProviders({
		config: params?.config,
		bundledAllowlistCompat: true,
		origin: "bundled"
	});
}
function resolveWebFetchProviderId(params) {
	const providers = sortWebFetchProvidersForAutoDetect(params.providers ?? resolvePluginWebFetchProviders({
		config: params.config,
		bundledAllowlistCompat: true,
		origin: "bundled"
	}));
	const raw = params.fetch && "provider" in params.fetch ? normalizeLowercaseStringOrEmpty(params.fetch.provider) : "";
	if (raw) {
		const explicit = providers.find((provider) => provider.id === raw);
		if (explicit) return explicit.id;
	}
	for (const provider of providers) {
		if (!providerRequiresCredential(provider)) {
			logVerbose(`web_fetch: ${raw ? `invalid configured provider "${raw}", ` : ""}auto-detected keyless provider "${provider.id}"`);
			return provider.id;
		}
		if (!hasEntryCredential(provider, params.config, params.fetch)) continue;
		logVerbose(`web_fetch: ${raw ? `invalid configured provider "${raw}", ` : ""}auto-detected "${provider.id}" from available API keys`);
		return provider.id;
	}
	return "";
}
function resolveWebFetchDefinition(options) {
	const fetch = resolveWebProviderConfig(options?.config, "fetch");
	const runtimeWebFetch = options?.runtimeWebFetch ?? getActiveRuntimeWebToolsMetadata()?.fetch;
	const providers = sortWebFetchProvidersForAutoDetect(resolvePluginWebFetchProviders({
		config: options?.config,
		bundledAllowlistCompat: true,
		origin: "bundled"
	}));
	return resolveWebProviderDefinition({
		config: options?.config,
		toolConfig: fetch,
		runtimeMetadata: runtimeWebFetch,
		sandboxed: options?.sandboxed,
		providerId: options?.providerId,
		providers,
		resolveEnabled: ({ toolConfig, sandboxed }) => resolveWebFetchEnabled({
			fetch: toolConfig,
			sandboxed
		}),
		resolveAutoProviderId: ({ config, toolConfig, providers }) => resolveWebFetchProviderId({
			config,
			fetch: toolConfig,
			providers
		}),
		createTool: ({ provider, config, toolConfig, runtimeMetadata }) => provider.createTool({
			config,
			fetchConfig: toolConfig,
			runtimeMetadata
		})
	});
}
//#endregion
export { listWebFetchProviders as n, resolveWebFetchDefinition as r, isWebFetchProviderConfigured as t };
