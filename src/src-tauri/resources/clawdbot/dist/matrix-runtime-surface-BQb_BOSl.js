import { i as loadActivatedBundledPluginPublicSurfaceModuleSync } from "./facade-runtime-D_0VC8Qr.js";
//#region src/plugin-sdk/matrix-runtime-surface.ts
function loadFacadeModule() {
	return loadActivatedBundledPluginPublicSurfaceModuleSync({
		dirName: "matrix",
		artifactBasename: "runtime-api.js"
	});
}
const resolveMatrixAccountStringValues = ((...args) => loadFacadeModule()["resolveMatrixAccountStringValues"](...args));
const setMatrixRuntime = ((...args) => loadFacadeModule()["setMatrixRuntime"](...args));
//#endregion
export { setMatrixRuntime as n, resolveMatrixAccountStringValues as t };
