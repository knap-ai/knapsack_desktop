import { i as loadBundledPluginPublicSurfaceModuleSync } from "./facade-loader-CGu7k8Om.js";
//#region src/plugin-sdk/matrix-helper.ts
function loadFacadeModule() {
	return loadBundledPluginPublicSurfaceModuleSync({
		dirName: "matrix",
		artifactBasename: "api.js"
	});
}
const findMatrixAccountEntry = ((...args) => loadFacadeModule()["findMatrixAccountEntry"](...args));
const getMatrixScopedEnvVarNames = ((...args) => loadFacadeModule()["getMatrixScopedEnvVarNames"](...args));
const requiresExplicitMatrixDefaultAccount = ((...args) => loadFacadeModule()["requiresExplicitMatrixDefaultAccount"](...args));
const resolveConfiguredMatrixAccountIds = ((...args) => loadFacadeModule()["resolveConfiguredMatrixAccountIds"](...args));
const resolveMatrixAccountStorageRoot = ((...args) => loadFacadeModule()["resolveMatrixAccountStorageRoot"](...args));
const resolveMatrixChannelConfig = ((...args) => loadFacadeModule()["resolveMatrixChannelConfig"](...args));
const resolveMatrixCredentialsDir = ((...args) => loadFacadeModule()["resolveMatrixCredentialsDir"](...args));
const resolveMatrixCredentialsPath = ((...args) => loadFacadeModule()["resolveMatrixCredentialsPath"](...args));
const resolveMatrixDefaultOrOnlyAccountId = ((...args) => loadFacadeModule()["resolveMatrixDefaultOrOnlyAccountId"](...args));
const resolveMatrixLegacyFlatStoragePaths = ((...args) => loadFacadeModule()["resolveMatrixLegacyFlatStoragePaths"](...args));
//#endregion
export { resolveMatrixAccountStorageRoot as a, resolveMatrixCredentialsPath as c, resolveConfiguredMatrixAccountIds as i, resolveMatrixDefaultOrOnlyAccountId as l, getMatrixScopedEnvVarNames as n, resolveMatrixChannelConfig as o, requiresExplicitMatrixDefaultAccount as r, resolveMatrixCredentialsDir as s, findMatrixAccountEntry as t, resolveMatrixLegacyFlatStoragePaths as u };
