import { t as loadActivatedBundledPluginPublicSurfaceModuleSync } from "./facade-runtime-gSGchfr7.js";
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
