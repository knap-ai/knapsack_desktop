//#region extensions/matrix/src/plugin-entry.runtime.ts
function sendError(respond, err) {
	respond(false, { error: err instanceof Error ? err.message : String(err) });
}
async function ensureMatrixCryptoRuntime(...args) {
	const { ensureMatrixCryptoRuntime: ensureRuntime } = await import("../../deps-DsQivsIm.js");
	await ensureRuntime(...args);
}
async function handleVerifyRecoveryKey({ params, respond }) {
	try {
		const { verifyMatrixRecoveryKey } = await import("../../verification-CmOJWxZI.js");
		const key = typeof params?.key === "string" ? params.key : "";
		if (!key.trim()) {
			respond(false, { error: "key required" });
			return;
		}
		const result = await verifyMatrixRecoveryKey(key, { accountId: typeof params?.accountId === "string" ? params.accountId.trim() || void 0 : void 0 });
		respond(result.success, result);
	} catch (err) {
		sendError(respond, err);
	}
}
async function handleVerificationBootstrap({ params, respond }) {
	try {
		const { bootstrapMatrixVerification } = await import("../../verification-CmOJWxZI.js");
		const result = await bootstrapMatrixVerification({
			accountId: typeof params?.accountId === "string" ? params.accountId.trim() || void 0 : void 0,
			recoveryKey: typeof params?.recoveryKey === "string" ? params.recoveryKey : void 0,
			forceResetCrossSigning: params?.forceResetCrossSigning === true
		});
		respond(result.success, result);
	} catch (err) {
		sendError(respond, err);
	}
}
async function handleVerificationStatus({ params, respond }) {
	try {
		const { getMatrixVerificationStatus } = await import("../../verification-CmOJWxZI.js");
		respond(true, await getMatrixVerificationStatus({
			accountId: typeof params?.accountId === "string" ? params.accountId.trim() || void 0 : void 0,
			includeRecoveryKey: params?.includeRecoveryKey === true
		}));
	} catch (err) {
		sendError(respond, err);
	}
}
//#endregion
export { ensureMatrixCryptoRuntime, handleVerificationBootstrap, handleVerificationStatus, handleVerifyRecoveryKey };
