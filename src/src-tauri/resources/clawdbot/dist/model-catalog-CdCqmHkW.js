import { i as normalizeLowercaseStringOrEmpty, s as normalizeOptionalString } from "./string-coerce-BUSzWgUA.js";
import { t as createSubsystemLogger } from "./subsystem-Cgmckbux.js";
import { a as loadConfig } from "./io-5pxHCi7V.js";
import { r as normalizeProviderId } from "./provider-id-KaStHhRz.js";
import "./config-Q9XZc_2I.js";
import { t as resolveOpenClawAgentDir } from "./agent-paths-JWlHCT48.js";
import { t as augmentModelCatalogWithProviderPlugins } from "./provider-runtime.runtime-CA-FBfBB.js";
import { t as ensureOpenClawModelsJson } from "./models-config-CkfuLe-V.js";
//#region src/agents/model-catalog.ts
const log = createSubsystemLogger("model-catalog");
let modelCatalogPromise = null;
let hasLoggedModelCatalogError = false;
const defaultImportPiSdk = () => import("./agents/pi-model-discovery-runtime.js");
let importPiSdk = defaultImportPiSdk;
let modelSuppressionPromise;
function shouldLogModelCatalogTiming() {
	return process.env.OPENCLAW_DEBUG_INGRESS_TIMING === "1";
}
function loadModelSuppression() {
	modelSuppressionPromise ??= import("./model-suppression.runtime-CBASwNzB.js");
	return modelSuppressionPromise;
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
				const id = normalizeOptionalString(entry?.id) ?? "";
				if (!id) continue;
				const provider = normalizeOptionalString(entry?.provider) ?? "";
				if (!provider) continue;
				if (shouldSuppressBuiltInModel({
					provider,
					id,
					config: cfg
				})) continue;
				const name = normalizeOptionalString(entry?.name ?? id) || id;
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
				const seen = new Set(models.map((entry) => `${normalizeLowercaseStringOrEmpty(entry.provider)}::${normalizeLowercaseStringOrEmpty(entry.id)}`));
				for (const entry of supplemental) {
					const key = `${normalizeLowercaseStringOrEmpty(entry.provider)}::${normalizeLowercaseStringOrEmpty(entry.id)}`;
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
	const normalizedModelId = normalizeLowercaseStringOrEmpty(modelId);
	return catalog.find((entry) => normalizeProviderId(entry.provider) === normalizedProvider && normalizeLowercaseStringOrEmpty(entry.id) === normalizedModelId);
}
//#endregion
export { modelSupportsVision as a, modelSupportsDocument as i, findModelInCatalog as n, resetModelCatalogCacheForTest as o, loadModelCatalog as r, __setModelCatalogImportForTest as t };
