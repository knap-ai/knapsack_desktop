import { i as loadBundledPluginPublicSurfaceModuleSync, t as createLazyFacadeArrayValue } from "./facade-loader-CGu7k8Om.js";
//#region src/plugin-sdk/matrix-surface.ts
function loadFacadeModule() {
	return loadBundledPluginPublicSurfaceModuleSync({
		dirName: "matrix",
		artifactBasename: "api.js"
	});
}
const createMatrixThreadBindingManager = ((...args) => loadFacadeModule()["createMatrixThreadBindingManager"](...args));
const matrixSessionBindingAdapterChannels = createLazyFacadeArrayValue(() => loadFacadeModule()["matrixSessionBindingAdapterChannels"]);
const resetMatrixThreadBindingsForTests = ((...args) => loadFacadeModule()["resetMatrixThreadBindingsForTests"](...args));
//#endregion
export { matrixSessionBindingAdapterChannels as n, resetMatrixThreadBindingsForTests as r, createMatrixThreadBindingManager as t };
