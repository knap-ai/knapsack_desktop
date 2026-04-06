import { a as loadBundledPluginPublicSurfaceModuleSync, n as createLazyFacadeObjectValue } from "../facade-runtime-D_0VC8Qr.js";
//#region src/plugin-sdk/ollama-surface.ts
function loadFacadeModule() {
	return loadBundledPluginPublicSurfaceModuleSync({
		dirName: "ollama",
		artifactBasename: "api.js"
	});
}
const buildOllamaModelDefinition = ((...args) => loadFacadeModule()["buildOllamaModelDefinition"](...args));
const buildOllamaProvider = ((...args) => loadFacadeModule()["buildOllamaProvider"](...args));
const configureOllamaNonInteractive = ((...args) => loadFacadeModule()["configureOllamaNonInteractive"](...args));
const ensureOllamaModelPulled = ((...args) => loadFacadeModule()["ensureOllamaModelPulled"](...args));
const enrichOllamaModelsWithContext = ((...args) => loadFacadeModule()["enrichOllamaModelsWithContext"](...args));
const fetchOllamaModels = ((...args) => loadFacadeModule()["fetchOllamaModels"](...args));
const OLLAMA_DEFAULT_BASE_URL = loadFacadeModule()["OLLAMA_DEFAULT_BASE_URL"];
const OLLAMA_DEFAULT_CONTEXT_WINDOW = loadFacadeModule()["OLLAMA_DEFAULT_CONTEXT_WINDOW"];
const OLLAMA_DEFAULT_COST = createLazyFacadeObjectValue(() => loadFacadeModule()["OLLAMA_DEFAULT_COST"]);
const OLLAMA_DEFAULT_MAX_TOKENS = loadFacadeModule()["OLLAMA_DEFAULT_MAX_TOKENS"];
const OLLAMA_DEFAULT_MODEL = loadFacadeModule()["OLLAMA_DEFAULT_MODEL"];
const promptAndConfigureOllama = ((...args) => loadFacadeModule()["promptAndConfigureOllama"](...args));
const queryOllamaContextWindow = ((...args) => loadFacadeModule()["queryOllamaContextWindow"](...args));
const resolveOllamaApiBase = ((...args) => loadFacadeModule()["resolveOllamaApiBase"](...args));
//#endregion
export { OLLAMA_DEFAULT_BASE_URL, OLLAMA_DEFAULT_CONTEXT_WINDOW, OLLAMA_DEFAULT_COST, OLLAMA_DEFAULT_MAX_TOKENS, OLLAMA_DEFAULT_MODEL, buildOllamaModelDefinition, buildOllamaProvider, configureOllamaNonInteractive, enrichOllamaModelsWithContext, ensureOllamaModelPulled, fetchOllamaModels, promptAndConfigureOllama, queryOllamaContextWindow, resolveOllamaApiBase };
