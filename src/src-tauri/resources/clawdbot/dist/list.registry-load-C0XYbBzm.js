import { t as resolveOpenClawAgentDir } from "./agent-paths-Cvhc4iGK.js";
import { v as modelKey } from "./model-selection-shared-VQV3de71.js";
import "./synthetic-auth.runtime-rpW-oSFo.js";
import { i as discoverModels, r as discoverAuthStorage } from "./pi-model-discovery-CsMq3g6_.js";
import "./profile-list-zV5Cv5VC.js";
import "./model-auth-Bic7ggHC.js";
import { n as shouldSuppressBuiltInModel } from "./model-suppression-B1h4tGqT.js";
import "./shared-CbfwZExx.js";
import { n as formatErrorWithStack, r as shouldFallbackToAuthHeuristics, t as MODEL_AVAILABILITY_UNAVAILABLE_CODE } from "./list.errors-CGI8gPmx.js";
import "./list.model-row-BDzxqVh1.js";
//#region src/commands/models/list.registry.ts
function createAvailabilityUnavailableError(message) {
	const err = new Error(message);
	err.code = MODEL_AVAILABILITY_UNAVAILABLE_CODE;
	return err;
}
function normalizeAvailabilityError(err) {
	if (shouldFallbackToAuthHeuristics(err) && err instanceof Error) return err;
	return createAvailabilityUnavailableError(`Model availability unavailable: getAvailable() failed.\n${formatErrorWithStack(err)}`);
}
function validateAvailableModels(availableModels) {
	if (!Array.isArray(availableModels)) throw createAvailabilityUnavailableError("Model availability unavailable: getAvailable() returned a non-array value.");
	for (const model of availableModels) if (!model || typeof model !== "object" || typeof model.provider !== "string" || typeof model.id !== "string") throw createAvailabilityUnavailableError("Model availability unavailable: getAvailable() returned invalid model entries.");
	return availableModels;
}
function loadAvailableModels(registry, cfg) {
	let availableModels;
	try {
		availableModels = registry.getAvailable();
	} catch (err) {
		throw normalizeAvailabilityError(err);
	}
	try {
		return validateAvailableModels(availableModels).filter((model) => !shouldSuppressBuiltInModel({
			provider: model.provider,
			id: model.id,
			baseUrl: model.baseUrl,
			config: cfg
		}));
	} catch (err) {
		throw normalizeAvailabilityError(err);
	}
}
async function loadModelRegistry(cfg, opts) {
	const agentDir = resolveOpenClawAgentDir();
	const registry = discoverModels(discoverAuthStorage(agentDir, { readOnly: true }), agentDir, { providerFilter: opts?.providerFilter });
	const models = registry.getAll().filter((model) => !shouldSuppressBuiltInModel({
		provider: model.provider,
		id: model.id,
		baseUrl: model.baseUrl,
		config: cfg
	}));
	let availableKeys;
	let availabilityErrorMessage;
	try {
		const availableModels = loadAvailableModels(registry, cfg);
		availableKeys = new Set(availableModels.map((model) => modelKey(model.provider, model.id)));
	} catch (err) {
		if (!shouldFallbackToAuthHeuristics(err)) throw err;
		availableKeys = void 0;
		if (!availabilityErrorMessage) availabilityErrorMessage = formatErrorWithStack(err);
	}
	return {
		registry,
		models,
		availableKeys,
		availabilityErrorMessage
	};
}
//#endregion
//#region src/commands/models/list.registry-load.ts
async function loadListModelRegistry(cfg, opts) {
	const loaded = await loadModelRegistry(cfg, opts);
	return {
		...loaded,
		discoveredKeys: new Set(loaded.models.map((model) => modelKey(model.provider, model.id)))
	};
}
function findConfiguredRegistryModel(params) {
	const model = params.registry.find(params.entry.ref.provider, params.entry.ref.model);
	if (!model) return;
	if (shouldSuppressBuiltInModel({
		provider: model.provider,
		id: model.id,
		baseUrl: model.baseUrl,
		config: params.cfg
	})) return;
	return model;
}
function loadConfiguredListModelRegistry(cfg, entries, opts) {
	const agentDir = resolveOpenClawAgentDir();
	const registry = discoverModels(discoverAuthStorage(agentDir, { readOnly: true }), agentDir, { providerFilter: opts?.providerFilter });
	const discoveredKeys = /* @__PURE__ */ new Set();
	const availableKeys = /* @__PURE__ */ new Set();
	for (const entry of entries) {
		const model = findConfiguredRegistryModel({
			registry,
			entry,
			cfg
		});
		if (!model) continue;
		const key = modelKey(model.provider, model.id);
		discoveredKeys.add(key);
		if (registry.hasConfiguredAuth(model)) availableKeys.add(key);
	}
	return {
		registry,
		discoveredKeys,
		availableKeys
	};
}
//#endregion
export { loadConfiguredListModelRegistry, loadListModelRegistry };
