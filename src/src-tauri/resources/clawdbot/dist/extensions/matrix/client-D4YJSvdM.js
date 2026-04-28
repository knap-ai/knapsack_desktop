import { t as __exportAll } from "./rolldown-runtime-DUslC3ob.js";
import { t as getMatrixScopedEnvVarNames } from "./env-vars-KF01E9CM.js";
import { i as resolveScopedMatrixEnvConfig, r as resolveMatrixEnvAuthReadiness, t as hasReadyMatrixEnvAuth } from "./env-auth-CZGZEhLW.js";
import { n as validateMatrixHomeserverUrl, t as resolveValidatedMatrixHomeserverUrl } from "./url-validation-BVkbI4aP.js";
import { t as isBunRuntime } from "./runtime-tgnRzJQh.js";
import { i as resolveMatrixConfigForAccount, n as resolveMatrixAuth, r as resolveMatrixAuthContext, t as backfillMatrixAuthDeviceIdAfterStartup } from "./config-DBfNTyCf.js";
import { t as createMatrixClient } from "./create-client-lS0LIYJD.js";
import { i as resolveSharedMatrixClient, n as releaseSharedClientInstance, o as stopSharedClientForAccount, r as removeSharedClientInstance, s as stopSharedClientInstance, t as acquireSharedMatrixClient } from "./shared-cGjGh9kB.js";
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
