import { r as normalizeProviderId } from "./provider-id-DRW5WMbW.js";
import "./defaults-CRz26M83.js";
import { v as modelKey } from "./model-selection-shared-VQV3de71.js";
import { t as resolveEnvApiKey } from "./model-auth-env-D8dQbXPk.js";
import { n as resolveAwsSdkEnvVarName } from "./model-auth-runtime-shared-BQozaooK.js";
import { o as hasUsableCustomProviderApiKey } from "./model-auth-Bic7ggHC.js";
import { n as shouldSuppressBuiltInModel, r as shouldSuppressBuiltInModelFromManifest } from "./model-suppression-B1h4tGqT.js";
import { f as isLocalBaseUrl } from "./shared-CbfwZExx.js";
import { t as toModelRow } from "./list.model-row-BDzxqVh1.js";
//#region src/commands/models/list.rows.ts
let modelCatalogModulePromise;
let modelResolverModulePromise;
let profileListModulePromise;
let providerCatalogModulePromise;
let syntheticAuthModulePromise;
function loadModelCatalogModule() {
	modelCatalogModulePromise ??= import("./model-catalog-Bb7i0Ftu.js");
	return modelCatalogModulePromise;
}
function loadModelResolverModule() {
	modelResolverModulePromise ??= import("./model-BUkvKH2S.js");
	return modelResolverModulePromise;
}
function loadProfileListModule() {
	profileListModulePromise ??= import("./profile-list-DXd7dUje.js");
	return profileListModulePromise;
}
function loadProviderCatalogModule() {
	providerCatalogModulePromise ??= import("./list.provider-catalog-BBi-Rw7l.js");
	return providerCatalogModulePromise;
}
function loadSyntheticAuthModule() {
	syntheticAuthModulePromise ??= import("./synthetic-auth.runtime-CX1LU5c2.js");
	return syntheticAuthModulePromise;
}
function matchesRowFilter(filter, model) {
	if (filter.provider && normalizeProviderId(model.provider) !== filter.provider) return false;
	if (filter.local && !isLocalBaseUrl(model.baseUrl ?? "")) return false;
	return true;
}
async function hasAuthForProvider(params) {
	const { listProfilesForProvider } = await loadProfileListModule();
	if (listProfilesForProvider(params.authStore, params.provider).length > 0) return true;
	if (params.provider === "amazon-bedrock" && resolveAwsSdkEnvVarName()) return true;
	if (resolveEnvApiKey(params.provider)) return true;
	if (hasUsableCustomProviderApiKey(params.cfg, params.provider)) return true;
	const { resolveRuntimeSyntheticAuthProviderRefs } = await loadSyntheticAuthModule();
	return resolveRuntimeSyntheticAuthProviderRefs().includes(params.provider);
}
async function buildRow(params) {
	const configured = params.context.configuredByKey.get(params.key);
	const shouldResolveProviderAuth = params.context.availableKeys === void 0 || params.allowProviderAvailabilityFallback === true;
	const hasProviderAuth = shouldResolveProviderAuth ? await hasAuthForProvider({
		provider: params.model.provider,
		cfg: params.context.cfg,
		authStore: params.context.authStore
	}) : false;
	return toModelRow({
		model: params.model,
		key: params.key,
		tags: configured ? Array.from(configured.tags) : [],
		aliases: configured?.aliases ?? [],
		availableKeys: params.context.availableKeys,
		cfg: params.context.cfg,
		authStore: params.context.authStore,
		allowProviderAvailabilityFallback: params.allowProviderAvailabilityFallback ?? false,
		hasAuthForProvider: shouldResolveProviderAuth ? () => hasProviderAuth : void 0
	});
}
function shouldSuppressListModel(params) {
	if (params.context.skipRuntimeModelSuppression) return shouldSuppressBuiltInModelFromManifest({
		provider: params.model.provider,
		id: params.model.id,
		config: params.context.cfg
	});
	return shouldSuppressBuiltInModel({
		provider: params.model.provider,
		id: params.model.id,
		baseUrl: params.model.baseUrl,
		config: params.context.cfg
	});
}
async function appendVisibleRow(params) {
	if (params.seenKeys?.has(params.key)) return false;
	if (!matchesRowFilter(params.context.filter, params.model)) return false;
	if (shouldSuppressListModel({
		model: params.model,
		context: params.context
	})) return false;
	params.rows.push(await buildRow({
		model: params.model,
		key: params.key,
		context: params.context,
		allowProviderAvailabilityFallback: params.allowProviderAvailabilityFallback
	}));
	params.seenKeys?.add(params.key);
	return true;
}
function resolveConfiguredModelInput(params) {
	const input = Array.isArray(params.model.input) ? params.model.input.filter((item) => item === "text" || item === "image") : [];
	return input.length > 0 ? input : ["text"];
}
function toConfiguredProviderListModel(params) {
	return {
		provider: params.provider,
		id: params.model.id,
		name: params.model.name ?? params.model.id,
		baseUrl: params.model.baseUrl ?? params.providerConfig.baseUrl,
		input: resolveConfiguredModelInput({ model: params.model }),
		contextWindow: params.model.contextWindow ?? 2e5,
		contextTokens: params.model.contextTokens
	};
}
function toManifestCatalogListModel(row) {
	return {
		provider: row.provider,
		id: row.id,
		name: row.name,
		baseUrl: row.baseUrl,
		input: [...row.input],
		contextWindow: row.contextWindow ?? 2e5
	};
}
function shouldListConfiguredProviderModel(params) {
	return params.providerConfig.api !== void 0 || params.model.api !== void 0;
}
function findConfiguredProviderModel(params) {
	const providerConfig = params.cfg.models?.providers?.[params.provider];
	const configuredModel = providerConfig?.models?.find((model) => model.id === params.modelId);
	if (!providerConfig || !configuredModel) return;
	return toConfiguredProviderListModel({
		provider: params.provider,
		providerConfig,
		model: configuredModel
	});
}
function toFallbackConfiguredListModel(entry, cfg) {
	return findConfiguredProviderModel({
		cfg,
		provider: entry.ref.provider,
		modelId: entry.ref.model
	}) ?? {
		provider: entry.ref.provider,
		id: entry.ref.model,
		name: entry.ref.model,
		input: ["text"],
		contextWindow: 2e5
	};
}
async function appendDiscoveredRows(params) {
	const seenKeys = /* @__PURE__ */ new Set();
	const modelResolver = params.modelRegistry ? (await loadModelResolverModule()).resolveModelWithRegistry : void 0;
	const sorted = [...params.models].toSorted((a, b) => {
		const providerCompare = a.provider.localeCompare(b.provider);
		if (providerCompare !== 0) return providerCompare;
		return a.id.localeCompare(b.id);
	});
	for (const model of sorted) {
		const key = modelKey(model.provider, model.id);
		const resolvedModel = params.modelRegistry && modelResolver ? modelResolver({
			provider: model.provider,
			modelId: model.id,
			modelRegistry: params.modelRegistry,
			cfg: params.context.cfg,
			agentDir: params.context.agentDir
		}) : void 0;
		const rowModel = resolvedModel && modelKey(resolvedModel.provider, resolvedModel.id) === key ? resolvedModel : model;
		await appendVisibleRow({
			rows: params.rows,
			model: rowModel,
			key,
			context: params.context,
			seenKeys
		});
	}
	return seenKeys;
}
async function appendConfiguredProviderRows(params) {
	for (const [provider, providerConfig] of Object.entries(params.context.cfg.models?.providers ?? {})) for (const configuredModel of providerConfig.models ?? []) {
		if (!shouldListConfiguredProviderModel({
			providerConfig,
			model: configuredModel
		})) continue;
		const key = modelKey(provider, configuredModel.id);
		const model = toConfiguredProviderListModel({
			provider,
			providerConfig,
			model: configuredModel
		});
		await appendVisibleRow({
			rows: params.rows,
			model,
			key,
			context: params.context,
			seenKeys: params.seenKeys,
			allowProviderAvailabilityFallback: !params.context.discoveredKeys.has(key)
		});
	}
}
async function appendModelCatalogRows(params) {
	let appended = 0;
	for (const catalogRow of params.catalogRows) {
		const key = modelKey(catalogRow.provider, catalogRow.id);
		if (await appendVisibleRow({
			rows: params.rows,
			model: toManifestCatalogListModel(catalogRow),
			key,
			context: params.context,
			seenKeys: params.seenKeys,
			allowProviderAvailabilityFallback: true
		})) appended += 1;
	}
	return appended;
}
function appendManifestCatalogRows(params) {
	return appendModelCatalogRows({
		...params,
		catalogRows: params.manifestRows
	});
}
async function appendCatalogSupplementRows(params) {
	const [{ loadModelCatalog }, { resolveModelWithRegistry }] = await Promise.all([loadModelCatalogModule(), loadModelResolverModule()]);
	const catalog = await loadModelCatalog({
		config: params.context.cfg,
		readOnly: true
	});
	for (const entry of catalog) {
		if (params.context.filter.provider && normalizeProviderId(entry.provider) !== params.context.filter.provider) continue;
		const key = modelKey(entry.provider, entry.id);
		const model = resolveModelWithRegistry({
			provider: entry.provider,
			modelId: entry.id,
			modelRegistry: params.modelRegistry,
			cfg: params.context.cfg
		});
		if (!model) continue;
		await appendVisibleRow({
			rows: params.rows,
			model,
			key,
			context: params.context,
			seenKeys: params.seenKeys,
			allowProviderAvailabilityFallback: !params.context.discoveredKeys.has(key)
		});
	}
	if (params.context.filter.local) return;
	await appendProviderCatalogRows({
		rows: params.rows,
		context: params.context,
		seenKeys: params.seenKeys
	});
}
async function appendProviderCatalogRows(params) {
	let appended = 0;
	const { loadProviderCatalogModelsForList } = await loadProviderCatalogModule();
	for (const model of await loadProviderCatalogModelsForList({
		cfg: params.context.cfg,
		agentDir: params.context.agentDir,
		providerFilter: params.context.filter.provider,
		staticOnly: params.staticOnly
	})) {
		const key = modelKey(model.provider, model.id);
		if (await appendVisibleRow({
			rows: params.rows,
			model,
			key,
			context: params.context,
			seenKeys: params.seenKeys,
			allowProviderAvailabilityFallback: !params.context.discoveredKeys.has(key)
		})) appended += 1;
	}
	return appended;
}
async function appendConfiguredRows(params) {
	const resolveModelWithRegistry = params.modelRegistry ? (await loadModelResolverModule()).resolveModelWithRegistry : void 0;
	for (const entry of params.entries) {
		if (params.context.filter.provider && normalizeProviderId(entry.ref.provider) !== params.context.filter.provider) continue;
		const model = params.modelRegistry && resolveModelWithRegistry ? resolveModelWithRegistry({
			provider: entry.ref.provider,
			modelId: entry.ref.model,
			modelRegistry: params.modelRegistry,
			cfg: params.context.cfg
		}) : toFallbackConfiguredListModel(entry, params.context.cfg);
		if (params.context.filter.local && model && !isLocalBaseUrl(model.baseUrl ?? "")) continue;
		if (params.context.filter.local && !model) continue;
		if (model && shouldSuppressListModel({
			model,
			context: params.context
		})) continue;
		const shouldResolveProviderAuth = model && (params.context.availableKeys === void 0 || !params.context.discoveredKeys.has(modelKey(model.provider, model.id)));
		const hasProviderAuth = shouldResolveProviderAuth ? await hasAuthForProvider({
			provider: model.provider,
			cfg: params.context.cfg,
			authStore: params.context.authStore
		}) : false;
		params.rows.push(toModelRow({
			model,
			key: entry.key,
			tags: Array.from(entry.tags),
			aliases: entry.aliases,
			availableKeys: params.context.availableKeys,
			cfg: params.context.cfg,
			authStore: params.context.authStore,
			allowProviderAvailabilityFallback: model ? !params.context.discoveredKeys.has(modelKey(model.provider, model.id)) : false,
			hasAuthForProvider: shouldResolveProviderAuth ? () => hasProviderAuth : void 0
		}));
	}
}
//#endregion
//#region src/commands/models/list.row-sources.ts
async function appendAllModelRowSources(params) {
	if (params.context.filter.provider && params.sourcePlan.kind !== "registry") {
		let seenKeys = /* @__PURE__ */ new Set();
		await appendConfiguredProviderRows({
			rows: params.rows,
			context: params.context,
			seenKeys
		});
		let catalogRows = 0;
		if (params.sourcePlan.kind === "manifest") catalogRows = await appendManifestCatalogRows({
			rows: params.rows,
			context: params.context,
			seenKeys,
			manifestRows: params.sourcePlan.manifestCatalogRows
		});
		if (catalogRows === 0 && params.sourcePlan.kind === "provider-index") catalogRows = await appendModelCatalogRows({
			rows: params.rows,
			context: params.context,
			seenKeys,
			catalogRows: params.sourcePlan.providerIndexCatalogRows
		});
		if (catalogRows === 0 && (params.sourcePlan.kind === "provider-runtime-static" || params.sourcePlan.kind === "provider-runtime-scoped")) catalogRows = await appendProviderCatalogRows({
			rows: params.rows,
			context: params.context,
			seenKeys,
			staticOnly: params.sourcePlan.kind === "provider-runtime-static"
		});
		if (catalogRows === 0 && params.sourcePlan.fallbackToRegistryWhenEmpty) {
			if (!params.modelRegistry) return { requiresRegistryFallback: true };
			await appendDiscoveredRows({
				rows: params.rows,
				models: params.modelRegistry.getAll(),
				modelRegistry: params.modelRegistry,
				context: params.context
			});
		}
		return { requiresRegistryFallback: false };
	}
	const seenKeys = await appendDiscoveredRows({
		rows: params.rows,
		models: params.modelRegistry?.getAll() ?? [],
		modelRegistry: params.modelRegistry,
		context: params.context
	});
	await appendConfiguredProviderRows({
		rows: params.rows,
		context: params.context,
		seenKeys
	});
	if (params.modelRegistry) {
		await appendCatalogSupplementRows({
			rows: params.rows,
			modelRegistry: params.modelRegistry,
			context: params.context,
			seenKeys
		});
		return { requiresRegistryFallback: false };
	}
	await appendProviderCatalogRows({
		rows: params.rows,
		context: params.context,
		seenKeys
	});
	return { requiresRegistryFallback: false };
}
async function appendConfiguredModelRowSources(params) {
	await appendConfiguredRows(params);
	if (params.context.filter.provider) await appendConfiguredProviderRows({
		rows: params.rows,
		context: params.context,
		seenKeys: new Set(params.rows.map((row) => row.key))
	});
}
//#endregion
export { appendAllModelRowSources, appendConfiguredModelRowSources };
