import { a as loadBundledPluginPublicSurfaceModuleSync } from "./facade-runtime-D_0VC8Qr.js";
//#region src/plugin-sdk/ollama.ts
function loadFacadeModule() {
	return loadBundledPluginPublicSurfaceModuleSync({
		dirName: "ollama",
		artifactBasename: "runtime-api.js"
	});
}
const buildAssistantMessage = ((...args) => loadFacadeModule()["buildAssistantMessage"](...args));
const buildOllamaChatRequest = ((...args) => loadFacadeModule()["buildOllamaChatRequest"](...args));
const convertToOllamaMessages = ((...args) => loadFacadeModule()["convertToOllamaMessages"](...args));
const createOllamaEmbeddingProvider = ((...args) => loadFacadeModule()["createOllamaEmbeddingProvider"](...args));
const createConfiguredOllamaCompatNumCtxWrapper = ((...args) => loadFacadeModule()["createConfiguredOllamaCompatNumCtxWrapper"](...args));
const createConfiguredOllamaCompatStreamWrapper = ((...args) => loadFacadeModule()["createConfiguredOllamaCompatStreamWrapper"](...args));
const createConfiguredOllamaStreamFn = ((...args) => loadFacadeModule()["createConfiguredOllamaStreamFn"](...args));
const createOllamaStreamFn = ((...args) => loadFacadeModule()["createOllamaStreamFn"](...args));
const DEFAULT_OLLAMA_EMBEDDING_MODEL = loadFacadeModule()["DEFAULT_OLLAMA_EMBEDDING_MODEL"];
const isOllamaCompatProvider = ((...args) => loadFacadeModule()["isOllamaCompatProvider"](...args));
const OLLAMA_NATIVE_BASE_URL = loadFacadeModule()["OLLAMA_NATIVE_BASE_URL"];
const parseNdjsonStream = ((...args) => loadFacadeModule()["parseNdjsonStream"](...args));
const resolveOllamaBaseUrlForRun = ((...args) => loadFacadeModule()["resolveOllamaBaseUrlForRun"](...args));
const resolveOllamaCompatNumCtxEnabled = ((...args) => loadFacadeModule()["resolveOllamaCompatNumCtxEnabled"](...args));
const shouldInjectOllamaCompatNumCtx = ((...args) => loadFacadeModule()["shouldInjectOllamaCompatNumCtx"](...args));
const wrapOllamaCompatNumCtx = ((...args) => loadFacadeModule()["wrapOllamaCompatNumCtx"](...args));
//#endregion
export { convertToOllamaMessages as a, createConfiguredOllamaStreamFn as c, isOllamaCompatProvider as d, parseNdjsonStream as f, wrapOllamaCompatNumCtx as g, shouldInjectOllamaCompatNumCtx as h, buildOllamaChatRequest as i, createOllamaEmbeddingProvider as l, resolveOllamaCompatNumCtxEnabled as m, OLLAMA_NATIVE_BASE_URL as n, createConfiguredOllamaCompatNumCtxWrapper as o, resolveOllamaBaseUrlForRun as p, buildAssistantMessage as r, createConfiguredOllamaCompatStreamWrapper as s, DEFAULT_OLLAMA_EMBEDDING_MODEL as t, createOllamaStreamFn as u };
