import { i as loadBundledPluginPublicSurfaceModuleSync } from "../facade-loader-CGu7k8Om.js";
//#region src/plugin-sdk/matrix-runtime-heavy.ts
function loadFacadeModule() {
	return loadBundledPluginPublicSurfaceModuleSync({
		dirName: "matrix",
		artifactBasename: "runtime-heavy-api.js"
	});
}
const autoPrepareLegacyMatrixCrypto = ((...args) => loadFacadeModule().autoPrepareLegacyMatrixCrypto(...args));
const detectLegacyMatrixCrypto = ((...args) => loadFacadeModule().detectLegacyMatrixCrypto(...args));
const autoMigrateLegacyMatrixState = ((...args) => loadFacadeModule().autoMigrateLegacyMatrixState(...args));
const detectLegacyMatrixState = ((...args) => loadFacadeModule().detectLegacyMatrixState(...args));
const hasActionableMatrixMigration = ((...args) => loadFacadeModule().hasActionableMatrixMigration(...args));
const hasPendingMatrixMigration = ((...args) => loadFacadeModule().hasPendingMatrixMigration(...args));
const maybeCreateMatrixMigrationSnapshot = ((...args) => loadFacadeModule().maybeCreateMatrixMigrationSnapshot(...args));
//#endregion
export { autoMigrateLegacyMatrixState, autoPrepareLegacyMatrixCrypto, detectLegacyMatrixCrypto, detectLegacyMatrixState, hasActionableMatrixMigration, hasPendingMatrixMigration, maybeCreateMatrixMigrationSnapshot };
