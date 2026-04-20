import { i as loadBundledPluginPublicSurfaceModuleSync } from "./facade-loader-CGu7k8Om.js";
//#region src/plugin-sdk/ollama-runtime.ts
function loadFacadeModule() {
	return loadBundledPluginPublicSurfaceModuleSync({
		dirName: "ollama",
		artifactBasename: "runtime-api.js"
	});
}
const DEFAULT_OLLAMA_EMBEDDING_MODEL = "nomic-embed-text";
const createOllamaEmbeddingProvider = ((...args) => loadFacadeModule().createOllamaEmbeddingProvider(...args));
//#endregion
export { createOllamaEmbeddingProvider as n, DEFAULT_OLLAMA_EMBEDDING_MODEL as t };
