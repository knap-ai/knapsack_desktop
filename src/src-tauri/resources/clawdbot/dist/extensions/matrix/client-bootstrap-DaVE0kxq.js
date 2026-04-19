import { t as __exportAll } from "./rolldown-runtime-DUslC3ob.js";
import { t as getMatrixRuntime } from "./runtime-D_K9vUaM.js";
import { t as isBunRuntime } from "./runtime-BPhQDz3d.js";
import { t as getActiveMatrixClient } from "./active-client-CaJPILsr.js";
//#region extensions/matrix/src/matrix/client-bootstrap.ts
var client_bootstrap_exports = /* @__PURE__ */ __exportAll({
	resolveRuntimeMatrixClientWithReadiness: () => resolveRuntimeMatrixClientWithReadiness,
	stopResolvedRuntimeMatrixClient: () => stopResolvedRuntimeMatrixClient,
	withResolvedRuntimeMatrixClient: () => withResolvedRuntimeMatrixClient
});
let matrixSharedClientRuntimeDepsPromise;
async function loadMatrixSharedClientRuntimeDeps() {
	matrixSharedClientRuntimeDepsPromise ??= Promise.all([import("./client-DqoFZ3x6.js").then((n) => n.t), import("./shared-Di_gEwBE.js").then((n) => n.a)]).then(([clientModule, sharedModule]) => ({
		acquireSharedMatrixClient: clientModule.acquireSharedMatrixClient,
		resolveMatrixAuthContext: clientModule.resolveMatrixAuthContext,
		releaseSharedClientInstance: sharedModule.releaseSharedClientInstance
	}));
	return await matrixSharedClientRuntimeDepsPromise;
}
async function ensureResolvedClientReadiness(params) {
	if (params.readiness === "started") {
		await params.client.start();
		return;
	}
	if (params.readiness === "prepared" || !params.readiness && params.preparedByDefault) await params.client.prepareForOneOff();
}
function ensureMatrixNodeRuntime() {
	if (isBunRuntime()) throw new Error("Matrix support requires Node (bun runtime not supported)");
}
async function resolveRuntimeMatrixClient(opts) {
	ensureMatrixNodeRuntime();
	if (opts.client) {
		await opts.onResolved?.(opts.client, { preparedByDefault: false });
		return {
			client: opts.client,
			stopOnDone: false
		};
	}
	const cfg = opts.cfg ?? getMatrixRuntime().config.loadConfig();
	const { acquireSharedMatrixClient, releaseSharedClientInstance, resolveMatrixAuthContext } = await loadMatrixSharedClientRuntimeDeps();
	const authContext = resolveMatrixAuthContext({
		cfg,
		accountId: opts.accountId
	});
	const active = getActiveMatrixClient(authContext.accountId);
	if (active) {
		await opts.onResolved?.(active, { preparedByDefault: false });
		return {
			client: active,
			stopOnDone: false
		};
	}
	const client = await acquireSharedMatrixClient({
		cfg,
		timeoutMs: opts.timeoutMs,
		accountId: authContext.accountId,
		startClient: false
	});
	try {
		await opts.onResolved?.(client, { preparedByDefault: true });
	} catch (err) {
		await releaseSharedClientInstance(client, "stop");
		throw err;
	}
	return {
		client,
		stopOnDone: true,
		cleanup: async (mode) => {
			await releaseSharedClientInstance(client, mode);
		}
	};
}
async function resolveRuntimeMatrixClientWithReadiness(opts) {
	return await resolveRuntimeMatrixClient({
		client: opts.client,
		cfg: opts.cfg,
		timeoutMs: opts.timeoutMs,
		accountId: opts.accountId,
		onResolved: async (client, context) => {
			await ensureResolvedClientReadiness({
				client,
				readiness: opts.readiness,
				preparedByDefault: context.preparedByDefault
			});
		}
	});
}
async function stopResolvedRuntimeMatrixClient(resolved, mode = "stop") {
	if (!resolved.stopOnDone) return;
	if (resolved.cleanup) {
		await resolved.cleanup(mode);
		return;
	}
	if (mode === "persist") {
		await resolved.client.stopAndPersist();
		return;
	}
	resolved.client.stop();
}
async function withResolvedRuntimeMatrixClient(opts, run, stopMode = "stop") {
	const resolved = await resolveRuntimeMatrixClientWithReadiness(opts);
	try {
		return await run(resolved.client);
	} finally {
		await stopResolvedRuntimeMatrixClient(resolved, stopMode);
	}
}
//#endregion
export { withResolvedRuntimeMatrixClient as n, client_bootstrap_exports as t };
