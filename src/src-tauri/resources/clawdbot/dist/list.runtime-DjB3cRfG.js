import { i as formatErrorMessage } from "./errors-Jbvi20TW.js";
import { t as createSubsystemLogger } from "./subsystem-CWI_MDy_.js";
import { r as normalizeProviderId } from "./provider-id-BLh32HP1.js";
import "./store-CfHec0eX.js";
import { h as resolveOwningPluginIdsForProvider, s as resolveBundledProviderCompatPluginIds } from "./plugin-auto-enable-BKDUQLPR.js";
import "./agent-paths-Df60yWjf.js";
import { a as normalizePluginDiscoveryResult, i as groupPluginDiscoveryProvidersByOrder, o as resolvePluginDiscoveryProviders, s as runProviderStaticCatalog } from "./models-config-BVdekRwH.js";
import "./model-catalog-CcBUIGOS.js";
import "./pi-model-discovery-BQ5UBGfb.js";
import "./auth-profiles-DFHxywz9.js";
import "./model-auth-Di2YDk33.js";
import "./model-8YSRxxGm.js";
//#region src/commands/models/list.provider-catalog.ts
const DISCOVERY_ORDERS = [
	"simple",
	"profile",
	"paired",
	"late"
];
const SELF_HOSTED_DISCOVERY_PROVIDER_IDS = new Set([
	"lmstudio",
	"ollama",
	"sglang",
	"vllm"
]);
const log = createSubsystemLogger("models/list-provider-catalog");
function providerMatchesFilter(params) {
	return [
		params.provider.id,
		...params.provider.aliases ?? [],
		...params.provider.hookAliases ?? []
	].some((providerId) => normalizeProviderId(providerId) === params.providerFilter);
}
async function resolveProviderCatalogPluginIdsForFilter(params) {
	const providerFilter = normalizeProviderId(params.providerFilter);
	if (!providerFilter) return;
	const manifestPluginIds = resolveOwningPluginIdsForProvider({
		provider: providerFilter,
		config: params.cfg,
		env: params.env
	});
	if (manifestPluginIds) return manifestPluginIds;
	const { resolveProviderContractPluginIdsForProviderAlias } = await import("./registry-BF6KAAsl.js");
	const bundledAliasPluginIds = resolveProviderContractPluginIdsForProviderAlias(providerFilter);
	if (bundledAliasPluginIds) return bundledAliasPluginIds;
}
async function hasProviderStaticCatalogForFilter(params) {
	const env = params.env ?? process.env;
	const providerFilter = normalizeProviderId(params.providerFilter);
	if (!providerFilter) return false;
	const pluginIds = await resolveProviderCatalogPluginIdsForFilter({
		...params,
		env
	});
	if (!pluginIds || pluginIds.length === 0) return false;
	const bundledPluginIds = resolveBundledProviderCompatPluginIds({
		config: params.cfg,
		env
	});
	const bundledPluginIdSet = new Set(bundledPluginIds);
	const scopedPluginIds = pluginIds.filter((pluginId) => bundledPluginIdSet.has(pluginId));
	if (scopedPluginIds.length === 0) return false;
	return (await resolvePluginDiscoveryProviders({
		config: params.cfg,
		env,
		onlyPluginIds: scopedPluginIds,
		includeUntrustedWorkspacePlugins: false,
		requireCompleteDiscoveryEntryCoverage: true,
		discoveryEntriesOnly: true
	})).some((provider) => typeof provider.staticCatalog?.run === "function" && providerMatchesFilter({
		provider,
		providerFilter
	}));
}
function modelFromProviderCatalog(params) {
	return {
		id: params.model.id,
		name: params.model.name || params.model.id,
		provider: params.provider,
		api: params.model.api ?? params.providerConfig.api ?? "openai-responses",
		baseUrl: params.model.baseUrl ?? params.providerConfig.baseUrl,
		reasoning: params.model.reasoning,
		input: params.model.input ?? ["text"],
		cost: params.model.cost,
		contextWindow: params.model.contextWindow,
		contextTokens: params.model.contextTokens,
		maxTokens: params.model.maxTokens,
		headers: params.model.headers,
		compat: params.model.compat
	};
}
async function loadProviderCatalogModelsForList(params) {
	const env = params.env ?? process.env;
	const providerFilter = params.providerFilter ? normalizeProviderId(params.providerFilter) : "";
	const onlyPluginIds = providerFilter ? await resolveProviderCatalogPluginIdsForFilter({
		cfg: params.cfg,
		env,
		providerFilter
	}) : void 0;
	if (providerFilter && !onlyPluginIds) return [];
	const bundledPluginIds = resolveBundledProviderCompatPluginIds({
		config: params.cfg,
		env
	});
	const bundledPluginIdSet = new Set(bundledPluginIds);
	const scopedPluginIds = onlyPluginIds ? onlyPluginIds.filter((pluginId) => bundledPluginIdSet.has(pluginId)) : bundledPluginIds;
	if (scopedPluginIds.length === 0) return [];
	const byOrder = groupPluginDiscoveryProvidersByOrder((await resolvePluginDiscoveryProviders({
		config: params.cfg,
		env,
		onlyPluginIds: scopedPluginIds,
		includeUntrustedWorkspacePlugins: false,
		requireCompleteDiscoveryEntryCoverage: params.staticOnly === true,
		discoveryEntriesOnly: params.staticOnly === true
	})).filter((provider) => typeof provider.pluginId === "string" && bundledPluginIdSet.has(provider.pluginId)));
	const rows = [];
	const seen = /* @__PURE__ */ new Set();
	for (const order of DISCOVERY_ORDERS) for (const provider of byOrder[order] ?? []) {
		if (!providerFilter && SELF_HOSTED_DISCOVERY_PROVIDER_IDS.has(provider.id)) continue;
		let result;
		try {
			result = await runProviderStaticCatalog({
				provider,
				config: params.cfg,
				agentDir: params.agentDir,
				env
			});
		} catch (error) {
			log.warn(`provider static catalog failed for ${provider.id}: ${formatErrorMessage(error)}`);
			result = null;
		}
		const normalized = normalizePluginDiscoveryResult({
			provider,
			result
		});
		for (const [providerIdRaw, providerConfig] of Object.entries(normalized)) {
			const providerId = normalizeProviderId(providerIdRaw);
			if (providerFilter && providerId !== providerFilter) continue;
			if (!providerId || !Array.isArray(providerConfig.models)) continue;
			for (const model of providerConfig.models) {
				const key = `${providerId}/${model.id}`;
				if (seen.has(key)) continue;
				seen.add(key);
				rows.push(modelFromProviderCatalog({
					provider: providerId,
					providerConfig,
					model
				}));
			}
		}
	}
	return rows.toSorted((left, right) => {
		const provider = left.provider.localeCompare(right.provider);
		if (provider !== 0) return provider;
		return left.id.localeCompare(right.id);
	});
}
//#endregion
export { loadProviderCatalogModelsForList as n, hasProviderStaticCatalogForFilter as t };
