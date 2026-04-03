import { i as loadActivatedBundledPluginPublicSurfaceModuleSync, n as createLazyFacadeObjectValue } from "./facade-runtime-D_0VC8Qr.js";
//#region src/plugin-sdk/memory-core-engine-runtime.ts
function loadFacadeModule() {
	return loadActivatedBundledPluginPublicSurfaceModuleSync({
		dirName: "memory-core",
		artifactBasename: "runtime-api.js"
	});
}
const getBuiltinMemoryEmbeddingProviderDoctorMetadata = ((...args) => loadFacadeModule()["getBuiltinMemoryEmbeddingProviderDoctorMetadata"](...args));
const getMemorySearchManager = ((...args) => loadFacadeModule()["getMemorySearchManager"](...args));
const listBuiltinAutoSelectMemoryEmbeddingProviderDoctorMetadata = ((...args) => loadFacadeModule()["listBuiltinAutoSelectMemoryEmbeddingProviderDoctorMetadata"](...args));
const MemoryIndexManager = createLazyFacadeObjectValue(() => loadFacadeModule()["MemoryIndexManager"]);
//#endregion
export { listBuiltinAutoSelectMemoryEmbeddingProviderDoctorMetadata as i, getBuiltinMemoryEmbeddingProviderDoctorMetadata as n, getMemorySearchManager as r, MemoryIndexManager as t };
