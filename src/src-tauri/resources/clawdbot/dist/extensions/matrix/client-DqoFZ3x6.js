import { t as __exportAll } from "./rolldown-runtime-DUslC3ob.js";
import { t as getMatrixScopedEnvVarNames } from "./env-vars-CpXNsTJq.js";
import { a as resolveMatrixAuthContext, c as resolveScopedMatrixEnvConfig, i as resolveMatrixAuth, l as resolveValidatedMatrixHomeserverUrl, n as hasReadyMatrixEnvAuth, o as resolveMatrixConfigForAccount, s as resolveMatrixEnvAuthReadiness, t as backfillMatrixAuthDeviceIdAfterStartup, u as validateMatrixHomeserverUrl } from "./config-CjEkxZYF.js";
import { t as isBunRuntime } from "./runtime-BPhQDz3d.js";
import { t as createMatrixClient } from "./create-client-CAWMMpr_.js";
import { i as resolveSharedMatrixClient, n as releaseSharedClientInstance, o as stopSharedClientForAccount, r as removeSharedClientInstance, s as stopSharedClientInstance, t as acquireSharedMatrixClient } from "./shared-Di_gEwBE.js";
//#region extensions/matrix/src/matrix/client.ts
var client_exports = /* @__PURE__ */ __exportAll({
	acquireSharedMatrixClient: () => acquireSharedMatrixClient,
	backfillMatrixAuthDeviceIdAfterStartup: () => backfillMatrixAuthDeviceIdAfterStartup,
	createMatrixClient: () => createMatrixClient,
	getMatrixScopedEnvVarNames: () => getMatrixScopedEnvVarNames,
	hasReadyMatrixEnvAuth: () => hasReadyMatrixEnvAuth,
	isBunRuntime: () => isBunRuntime,
	releaseSharedClientInstance: () => releaseSharedClientInstance,
	removeSharedClientInstance: () => removeSharedClientInstance,
	resolveMatrixAuth: () => resolveMatrixAuth,
	resolveMatrixAuthContext: () => resolveMatrixAuthContext,
	resolveMatrixConfigForAccount: () => resolveMatrixConfigForAccount,
	resolveMatrixEnvAuthReadiness: () => resolveMatrixEnvAuthReadiness,
	resolveScopedMatrixEnvConfig: () => resolveScopedMatrixEnvConfig,
	resolveSharedMatrixClient: () => resolveSharedMatrixClient,
	resolveValidatedMatrixHomeserverUrl: () => resolveValidatedMatrixHomeserverUrl,
	stopSharedClientForAccount: () => stopSharedClientForAccount,
	stopSharedClientInstance: () => stopSharedClientInstance,
	validateMatrixHomeserverUrl: () => validateMatrixHomeserverUrl
});
//#endregion
export { client_exports as t };
