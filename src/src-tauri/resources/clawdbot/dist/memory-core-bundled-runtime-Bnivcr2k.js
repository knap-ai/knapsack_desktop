import { i as loadBundledPluginPublicSurfaceModuleSync } from "./facade-loader-CGu7k8Om.js";
//#region src/plugin-sdk/memory-core-bundled-runtime.ts
function loadApiFacadeModule() {
	return loadBundledPluginPublicSurfaceModuleSync({
		dirName: "memory-core",
		artifactBasename: "api.js"
	});
}
function loadRuntimeFacadeModule() {
	return loadBundledPluginPublicSurfaceModuleSync({
		dirName: "memory-core",
		artifactBasename: "runtime-api.js"
	});
}
const createEmbeddingProvider = ((...args) => loadRuntimeFacadeModule().createEmbeddingProvider(...args));
const registerBuiltInMemoryEmbeddingProviders = ((...args) => loadRuntimeFacadeModule().registerBuiltInMemoryEmbeddingProviders(...args));
const removeGroundedShortTermCandidates = ((...args) => loadRuntimeFacadeModule().removeGroundedShortTermCandidates(...args));
const repairDreamingArtifacts = ((...args) => loadRuntimeFacadeModule().repairDreamingArtifacts(...args));
const previewGroundedRemMarkdown = ((...args) => loadApiFacadeModule().previewGroundedRemMarkdown(...args));
const dedupeDreamDiaryEntries = ((...args) => loadApiFacadeModule().dedupeDreamDiaryEntries(...args));
const writeBackfillDiaryEntries = ((...args) => loadApiFacadeModule().writeBackfillDiaryEntries(...args));
const removeBackfillDiaryEntries = ((...args) => loadApiFacadeModule().removeBackfillDiaryEntries(...args));
//#endregion
export { removeBackfillDiaryEntries as a, writeBackfillDiaryEntries as c, registerBuiltInMemoryEmbeddingProviders as i, dedupeDreamDiaryEntries as n, removeGroundedShortTermCandidates as o, previewGroundedRemMarkdown as r, repairDreamingArtifacts as s, createEmbeddingProvider as t };
