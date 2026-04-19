import { t as __exportAll } from "./rolldown-runtime-DUslC3ob.js";
import { t as getMatrixRuntime } from "./runtime-D_K9vUaM.js";
import { r as withStartedActionClient, t as withResolvedActionClient } from "./client-FqUC3skt.js";
import { n as formatMatrixEncryptionUnavailableError } from "./encryption-guidance-BWUu_Ms2.js";
import { normalizeOptionalString } from "openclaw/plugin-sdk/text-runtime";
//#region extensions/matrix/src/matrix/actions/verification.ts
var verification_exports = /* @__PURE__ */ __exportAll({
	acceptMatrixVerification: () => acceptMatrixVerification,
	bootstrapMatrixVerification: () => bootstrapMatrixVerification,
	cancelMatrixVerification: () => cancelMatrixVerification,
	confirmMatrixVerificationReciprocateQr: () => confirmMatrixVerificationReciprocateQr,
	confirmMatrixVerificationSas: () => confirmMatrixVerificationSas,
	generateMatrixVerificationQr: () => generateMatrixVerificationQr,
	getMatrixEncryptionStatus: () => getMatrixEncryptionStatus,
	getMatrixRoomKeyBackupStatus: () => getMatrixRoomKeyBackupStatus,
	getMatrixVerificationSas: () => getMatrixVerificationSas,
	getMatrixVerificationStatus: () => getMatrixVerificationStatus,
	listMatrixVerifications: () => listMatrixVerifications,
	mismatchMatrixVerificationSas: () => mismatchMatrixVerificationSas,
	requestMatrixVerification: () => requestMatrixVerification,
	resetMatrixRoomKeyBackup: () => resetMatrixRoomKeyBackup,
	restoreMatrixRoomKeyBackup: () => restoreMatrixRoomKeyBackup,
	scanMatrixVerificationQr: () => scanMatrixVerificationQr,
	startMatrixVerification: () => startMatrixVerification,
	verifyMatrixRecoveryKey: () => verifyMatrixRecoveryKey
});
function requireCrypto(client, opts) {
	if (!client.crypto) {
		const cfg = opts.cfg ?? getMatrixRuntime().config.loadConfig();
		throw new Error(formatMatrixEncryptionUnavailableError(cfg, opts.accountId));
	}
	return client.crypto;
}
function resolveVerificationId(input) {
	const normalized = input.trim();
	if (!normalized) throw new Error("Matrix verification request id is required");
	return normalized;
}
async function listMatrixVerifications(opts = {}) {
	return await withStartedActionClient(opts, async (client) => {
		return await requireCrypto(client, opts).listVerifications();
	});
}
async function requestMatrixVerification(params = {}) {
	return await withStartedActionClient(params, async (client) => {
		const crypto = requireCrypto(client, params);
		const ownUser = params.ownUser ?? (!params.userId && !params.deviceId && !params.roomId);
		return await crypto.requestVerification({
			ownUser,
			userId: normalizeOptionalString(params.userId),
			deviceId: normalizeOptionalString(params.deviceId),
			roomId: normalizeOptionalString(params.roomId)
		});
	});
}
async function acceptMatrixVerification(requestId, opts = {}) {
	return await withStartedActionClient(opts, async (client) => {
		return await requireCrypto(client, opts).acceptVerification(resolveVerificationId(requestId));
	});
}
async function cancelMatrixVerification(requestId, opts = {}) {
	return await withStartedActionClient(opts, async (client) => {
		return await requireCrypto(client, opts).cancelVerification(resolveVerificationId(requestId), {
			reason: normalizeOptionalString(opts.reason),
			code: normalizeOptionalString(opts.code)
		});
	});
}
async function startMatrixVerification(requestId, opts = {}) {
	return await withStartedActionClient(opts, async (client) => {
		return await requireCrypto(client, opts).startVerification(resolveVerificationId(requestId), opts.method ?? "sas");
	});
}
async function generateMatrixVerificationQr(requestId, opts = {}) {
	return await withStartedActionClient(opts, async (client) => {
		return await requireCrypto(client, opts).generateVerificationQr(resolveVerificationId(requestId));
	});
}
async function scanMatrixVerificationQr(requestId, qrDataBase64, opts = {}) {
	return await withStartedActionClient(opts, async (client) => {
		const crypto = requireCrypto(client, opts);
		const payload = qrDataBase64.trim();
		if (!payload) throw new Error("Matrix QR data is required");
		return await crypto.scanVerificationQr(resolveVerificationId(requestId), payload);
	});
}
async function getMatrixVerificationSas(requestId, opts = {}) {
	return await withStartedActionClient(opts, async (client) => {
		return await requireCrypto(client, opts).getVerificationSas(resolveVerificationId(requestId));
	});
}
async function confirmMatrixVerificationSas(requestId, opts = {}) {
	return await withStartedActionClient(opts, async (client) => {
		return await requireCrypto(client, opts).confirmVerificationSas(resolveVerificationId(requestId));
	});
}
async function mismatchMatrixVerificationSas(requestId, opts = {}) {
	return await withStartedActionClient(opts, async (client) => {
		return await requireCrypto(client, opts).mismatchVerificationSas(resolveVerificationId(requestId));
	});
}
async function confirmMatrixVerificationReciprocateQr(requestId, opts = {}) {
	return await withStartedActionClient(opts, async (client) => {
		return await requireCrypto(client, opts).confirmVerificationReciprocateQr(resolveVerificationId(requestId));
	});
}
async function getMatrixEncryptionStatus(opts = {}) {
	return await withResolvedActionClient(opts, async (client) => {
		const crypto = requireCrypto(client, opts);
		const recoveryKey = await crypto.getRecoveryKey();
		return {
			encryptionEnabled: true,
			recoveryKeyStored: Boolean(recoveryKey),
			recoveryKeyCreatedAt: recoveryKey?.createdAt ?? null,
			...opts.includeRecoveryKey ? { recoveryKey: recoveryKey?.encodedPrivateKey ?? null } : {},
			pendingVerifications: (await crypto.listVerifications()).length
		};
	});
}
async function getMatrixVerificationStatus(opts = {}) {
	return await withResolvedActionClient(opts, async (client) => {
		const payload = {
			...await client.getOwnDeviceVerificationStatus(),
			pendingVerifications: client.crypto ? (await client.crypto.listVerifications()).length : 0
		};
		if (!opts.includeRecoveryKey) return payload;
		const recoveryKey = client.crypto ? await client.crypto.getRecoveryKey() : null;
		return {
			...payload,
			recoveryKey: recoveryKey?.encodedPrivateKey ?? null
		};
	});
}
async function getMatrixRoomKeyBackupStatus(opts = {}) {
	return await withResolvedActionClient(opts, async (client) => await client.getRoomKeyBackupStatus());
}
async function verifyMatrixRecoveryKey(recoveryKey, opts = {}) {
	return await withStartedActionClient(opts, async (client) => await client.verifyWithRecoveryKey(recoveryKey));
}
async function restoreMatrixRoomKeyBackup(opts = {}) {
	return await withStartedActionClient(opts, async (client) => await client.restoreRoomKeyBackup({ recoveryKey: normalizeOptionalString(opts.recoveryKey) }));
}
async function resetMatrixRoomKeyBackup(opts = {}) {
	return await withStartedActionClient(opts, async (client) => await client.resetRoomKeyBackup());
}
async function bootstrapMatrixVerification(opts = {}) {
	return await withStartedActionClient(opts, async (client) => await client.bootstrapOwnDeviceVerification({
		recoveryKey: normalizeOptionalString(opts.recoveryKey),
		forceResetCrossSigning: opts.forceResetCrossSigning === true
	}));
}
//#endregion
export { startMatrixVerification as _, confirmMatrixVerificationSas as a, getMatrixRoomKeyBackupStatus as c, listMatrixVerifications as d, mismatchMatrixVerificationSas as f, scanMatrixVerificationQr as g, restoreMatrixRoomKeyBackup as h, confirmMatrixVerificationReciprocateQr as i, getMatrixVerificationSas as l, resetMatrixRoomKeyBackup as m, bootstrapMatrixVerification as n, generateMatrixVerificationQr as o, requestMatrixVerification as p, cancelMatrixVerification as r, getMatrixEncryptionStatus as s, acceptMatrixVerification as t, getMatrixVerificationStatus as u, verification_exports as v, verifyMatrixRecoveryKey as y };
