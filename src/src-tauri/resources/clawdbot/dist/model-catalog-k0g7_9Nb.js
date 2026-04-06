import { t as createSubsystemLogger } from "./subsystem-CJEvHE2o.js";
import { t as augmentModelCatalogWithProviderPlugins } from "./provider-runtime.runtime-BC4qq-IN.js";
import { r as normalizeProviderId } from "./provider-id-CTiEzT1T.js";
import { c as loadConfig } from "./io-DhtVmzAJ.js";
import "./config-CJQx-9zo.js";
import { t as resolveOpenClawAgentDir } from "./agent-paths-BiYMSfDv.js";
import { t as ensureOpenClawModelsJson } from "./models-config-DtEglJiL.js";
//#region src/agents/model-catalog.ts
const log = createSubsystemLogger("model-catalog");
let modelCatalogPromise = null;
let hasLoggedModelCatalogError = false;
const defaultImportPiSdk = () => import("./agents/pi-model-discovery-runtime.js");
let importPiSdk = defaultImportPiSdk;
let modelSuppressionPromise;
const NON_PI_NATIVE_MODEL_PROVIDERS = new Set([
	"deepseek",
	"kilocode",
	"ollama"
]);
function shouldLogModelCatalogTiming() {
	return process.env.OPENCLAW_DEBUG_INGRESS_TIMING === "1";
}
function loadModelSuppression() {
	modelSuppressionPromise ??= import("./model-suppression.runtime-DLxqvp7l.js");
	return modelSuppressionPromise;
}
function normalizeConfiguredModelInput(input) {
	if (!Array.isArray(input)) return;
	const normalized = input.filter((item) => item === "text" || item === "image" || item === "document");
	return normalized.length > 0 ? normalized : void 0;
}
function readConfiguredOptInProviderModels(config) {
	const providers = config.models?.providers;
	if (!providers || typeof providers !== "object") return [];
	const out = [];
	for (const [providerRaw, providerValue] of Object.entries(providers)) {
		const provider = providerRaw.toLowerCase().trim();
		if (!NON_PI_NATIVE_MODEL_PROVIDERS.has(provider)) continue;
		if (!providerValue || typeof providerValue !== "object") continue;
		const configuredModels = providerValue.models;
		if (!Array.isArray(configuredModels)) continue;
		for (const configuredModel of configuredModels) {
			if (!configuredModel || typeof configuredModel !== "object") continue;
			const idRaw = configuredModel.id;
			if (typeof idRaw !== "string") continue;
			const id = idRaw.trim();
			if (!id) continue;
			const rawName = configuredModel.name;
			const name = (typeof rawName === "string" ? rawName : id).trim() || id;
			const contextWindowRaw = configuredModel.contextWindow;
			const contextWindow = typeof contextWindowRaw === "number" && contextWindowRaw > 0 ? contextWindowRaw : void 0;
			const reasoningRaw = configuredModel.reasoning;
			const reasoning = typeof reasoningRaw === "boolean" ? reasoningRaw : void 0;
			const input = normalizeConfiguredModelInput(configuredModel.input);
			out.push({
				id,
				name,
				provider,
				contextWindow,
				reasoning,
				input
			});
		}
	}
	return out;
}
function mergeConfiguredOptInProviderModels(params) {
	const configured = readConfiguredOptInProviderModels(params.config);
	if (configured.length === 0) return;
	const seen = new Set(params.models.map((entry) => `${entry.provider.toLowerCase().trim()}::${entry.id.toLowerCase().trim()}`));
	for (const entry of configured) {
		const key = `${entry.provider.toLowerCase().trim()}::${entry.id.toLowerCase().trim()}`;
		if (seen.has(key)) continue;
		params.models.push(entry);
		seen.add(key);
	}
}
function resetModelCatalogCacheForTest() {
	modelCatalogPromise = null;
	hasLoggedModelCatalogError = false;
	importPiSdk = defaultImportPiSdk;
}
function __setModelCatalogImportForTest(loader) {
	importPiSdk = loader ?? defaultImportPiSdk;
}
function instantiatePiModelRegistry(piSdk, authStorage, modelsFile) {
	const Registry = piSdk.ModelRegistry;
	if (typeof Registry.create === "function") return Registry.create(authStorage, modelsFile);
	return new Registry(authStorage, modelsFile);
}
async function loadModelCatalog(params) {
	if (params?.useCache === false) modelCatalogPromise = null;
	if (modelCatalogPromise) return modelCatalogPromise;
	modelCatalogPromise = (async () => {
		const models = [];
		const timingEnabled = shouldLogModelCatalogTiming();
		const startMs = timingEnabled ? Date.now() : 0;
		const logStage = (stage, extra) => {
			if (!timingEnabled) return;
			const suffix = extra ? ` ${extra}` : "";
			log.info(`model-catalog stage=${stage} elapsedMs=${Date.now() - startMs}${suffix}`);
		};
		const sortModels = (entries) => entries.sort((a, b) => {
			const p = a.provider.localeCompare(b.provider);
			if (p !== 0) return p;
			return a.name.localeCompare(b.name);
		});
		try {
			const cfg = params?.config ?? loadConfig();
			await ensureOpenClawModelsJson(cfg);
			logStage("models-json-ready");
			const piSdk = await importPiSdk();
			logStage("pi-sdk-imported");
			const agentDir = resolveOpenClawAgentDir();
			const { shouldSuppressBuiltInModel } = await loadModelSuppression();
			logStage("catalog-deps-ready");
			const { join } = await import("node:path");
			const authStorage = piSdk.discoverAuthStorage(agentDir);
			logStage("auth-storage-ready");
			const registry = instantiatePiModelRegistry(piSdk, authStorage, join(agentDir, "models.json"));
			logStage("registry-ready");
			const entries = Array.isArray(registry) ? registry : registry.getAll();
			logStage("registry-read", `entries=${entries.length}`);
			for (const entry of entries) {
				const id = String(entry?.id ?? "").trim();
				if (!id) continue;
				const provider = String(entry?.provider ?? "").trim();
				if (!provider) continue;
				if (shouldSuppressBuiltInModel({
					provider,
					id
				})) continue;
				const name = String(entry?.name ?? id).trim() || id;
				const contextWindow = typeof entry?.contextWindow === "number" && entry.contextWindow > 0 ? entry.contextWindow : void 0;
				const reasoning = typeof entry?.reasoning === "boolean" ? entry.reasoning : void 0;
				const input = Array.isArray(entry?.input) ? entry.input : void 0;
				models.push({
					id,
					name,
					provider,
					contextWindow,
					reasoning,
					input
				});
			}
			mergeConfiguredOptInProviderModels({
				config: cfg,
				models
			});
			logStage("configured-models-merged", `entries=${models.length}`);
			const supplemental = await augmentModelCatalogWithProviderPlugins({
				config: cfg,
				env: process.env,
				context: {
					config: cfg,
					agentDir,
					env: process.env,
					entries: [...models]
				}
			});
			if (supplemental.length > 0) {
				const seen = new Set(models.map((entry) => `${entry.provider.toLowerCase().trim()}::${entry.id.toLowerCase().trim()}`));
				for (const entry of supplemental) {
					const key = `${entry.provider.toLowerCase().trim()}::${entry.id.toLowerCase().trim()}`;
					if (seen.has(key)) continue;
					models.push(entry);
					seen.add(key);
				}
			}
			logStage("plugin-models-merged", `entries=${models.length}`);
			if (models.length === 0) modelCatalogPromise = null;
			const sorted = sortModels(models);
			logStage("complete", `entries=${sorted.length}`);
			return sorted;
		} catch (error) {
			if (!hasLoggedModelCatalogError) {
				hasLoggedModelCatalogError = true;
				log.warn(`Failed to load model catalog: ${String(error)}`);
			}
			modelCatalogPromise = null;
			if (models.length > 0) return sortModels(models);
			return [];
		}
	})();
	return modelCatalogPromise;
}
/**
* Check if a model supports image input based on its catalog entry.
*/
function modelSupportsVision(entry) {
	return entry?.input?.includes("image") ?? false;
}
/**
* Check if a model supports native document/PDF input based on its catalog entry.
*/
function modelSupportsDocument(entry) {
	return entry?.input?.includes("document") ?? false;
}
/**
* Find a model in the catalog by provider and model ID.
*/
function findModelInCatalog(catalog, provider, modelId) {
	const normalizedProvider = normalizeProviderId(provider);
	const normalizedModelId = modelId.toLowerCase().trim();
	return catalog.find((entry) => normalizeProviderId(entry.provider) === normalizedProvider && entry.id.toLowerCase() === normalizedModelId);
}
//#endregion
export { modelSupportsVision as a, modelSupportsDocument as i, findModelInCatalog as n, resetModelCatalogCacheForTest as o, loadModelCatalog as r, __setModelCatalogImportForTest as t };
