import { _ as normalizeAccountId, g as DEFAULT_ACCOUNT_ID } from "./session-key-DAhnzjyr.js";
import { l as normalizeSecretInputString } from "./types.secrets-DgX397vI.js";
import { c as prepareScopedSetupConfig, o as moveSingleAccountChannelSectionToDefaultAccount, t as applyAccountNameToChannelSection } from "./setup-helpers-B2gYys18.js";
import { G as resolveMatrixEnvAuthReadiness, R as resolveMatrixAccountConfig, rt as hasExplicitMatrixAccountConfig, tt as updateMatrixAccountConfig } from "./send-C-3t8GKS.js";
import { n as bootstrapMatrixVerification } from "./verification-BeSB_N0Z.js";
//#region extensions/matrix/src/setup-bootstrap.ts
async function maybeBootstrapNewEncryptedMatrixAccount(params) {
	const accountConfig = resolveMatrixAccountConfig({
		cfg: params.cfg,
		accountId: params.accountId
	});
	if (hasExplicitMatrixAccountConfig(params.previousCfg, params.accountId) || accountConfig.encryption !== true) return {
		attempted: false,
		success: false,
		recoveryKeyCreatedAt: null,
		backupVersion: null
	};
	try {
		const bootstrap = await bootstrapMatrixVerification({ accountId: params.accountId });
		return {
			attempted: true,
			success: bootstrap.success === true,
			recoveryKeyCreatedAt: bootstrap.verification.recoveryKeyCreatedAt,
			backupVersion: bootstrap.verification.backupVersion,
			...bootstrap.success ? {} : { error: bootstrap.error ?? "Matrix verification bootstrap failed" }
		};
	} catch (err) {
		return {
			attempted: true,
			success: false,
			recoveryKeyCreatedAt: null,
			backupVersion: null,
			error: err instanceof Error ? err.message : String(err)
		};
	}
}
async function runMatrixSetupBootstrapAfterConfigWrite(params) {
	if (resolveMatrixAccountConfig({
		cfg: params.cfg,
		accountId: params.accountId
	}).encryption !== true) return;
	const bootstrap = await maybeBootstrapNewEncryptedMatrixAccount({
		previousCfg: params.previousCfg,
		cfg: params.cfg,
		accountId: params.accountId
	});
	if (!bootstrap.attempted) return;
	if (bootstrap.success) {
		params.runtime.log(`Matrix verification bootstrap: complete for "${params.accountId}".`);
		if (bootstrap.backupVersion) params.runtime.log(`Matrix backup version for "${params.accountId}": ${bootstrap.backupVersion}`);
		return;
	}
	params.runtime.error(`Matrix verification bootstrap warning for "${params.accountId}": ${bootstrap.error ?? "unknown bootstrap failure"}`);
}
//#endregion
//#region extensions/matrix/src/setup-config.ts
const channel$1 = "matrix";
function validateMatrixSetupInput(params) {
	if (params.input.useEnv) {
		const envReadiness = resolveMatrixEnvAuthReadiness(params.accountId, process.env);
		return envReadiness.ready ? null : envReadiness.missingMessage;
	}
	if (!params.input.homeserver?.trim()) return "Matrix requires --homeserver";
	const accessToken = params.input.accessToken?.trim();
	const password = normalizeSecretInputString(params.input.password);
	const userId = params.input.userId?.trim();
	if (!accessToken && !password) return "Matrix requires --access-token or --password";
	if (!accessToken) {
		if (!userId) return "Matrix requires --user-id when using --password";
		if (!password) return "Matrix requires --password when using --user-id";
	}
	return null;
}
function applyMatrixSetupAccountConfig(params) {
	const normalizedAccountId = normalizeAccountId(params.accountId);
	const next = applyAccountNameToChannelSection({
		cfg: normalizedAccountId !== "default" ? moveSingleAccountChannelSectionToDefaultAccount({
			cfg: params.cfg,
			channelKey: channel$1
		}) : params.cfg,
		channelKey: channel$1,
		accountId: normalizedAccountId,
		name: params.input.name
	});
	if (params.input.useEnv) return updateMatrixAccountConfig(next, normalizedAccountId, {
		enabled: true,
		homeserver: null,
		allowPrivateNetwork: null,
		userId: null,
		accessToken: null,
		password: null,
		deviceId: null,
		deviceName: null
	});
	const accessToken = params.input.accessToken?.trim();
	const password = normalizeSecretInputString(params.input.password);
	const userId = params.input.userId?.trim();
	return updateMatrixAccountConfig(next, normalizedAccountId, {
		enabled: true,
		homeserver: params.input.homeserver?.trim(),
		allowPrivateNetwork: typeof params.input.allowPrivateNetwork === "boolean" ? params.input.allowPrivateNetwork : void 0,
		userId: password && !userId ? null : userId,
		accessToken: accessToken || (password ? null : void 0),
		password: password || (accessToken ? null : void 0),
		deviceName: params.input.deviceName?.trim(),
		avatarUrl: params.avatarUrl,
		initialSyncLimit: params.input.initialSyncLimit
	});
}
//#endregion
//#region extensions/matrix/src/setup-core.ts
const channel = "matrix";
function resolveMatrixSetupAccountId(params) {
	return normalizeAccountId(params.accountId?.trim() || params.name?.trim() || "default");
}
function buildMatrixConfigUpdate(cfg, input) {
	return updateMatrixAccountConfig(cfg, DEFAULT_ACCOUNT_ID, {
		enabled: true,
		homeserver: input.homeserver,
		allowPrivateNetwork: input.allowPrivateNetwork,
		userId: input.userId,
		accessToken: input.accessToken,
		password: input.password,
		deviceName: input.deviceName,
		initialSyncLimit: input.initialSyncLimit
	});
}
const matrixSetupAdapter = {
	resolveAccountId: ({ accountId, input }) => resolveMatrixSetupAccountId({
		accountId,
		name: input?.name
	}),
	resolveBindingAccountId: ({ accountId, agentId }) => resolveMatrixSetupAccountId({
		accountId,
		name: agentId
	}),
	applyAccountName: ({ cfg, accountId, name }) => prepareScopedSetupConfig({
		cfg,
		channelKey: channel,
		accountId,
		name
	}),
	validateInput: ({ accountId, input }) => validateMatrixSetupInput({
		accountId,
		input
	}),
	applyAccountConfig: ({ cfg, accountId, input }) => applyMatrixSetupAccountConfig({
		cfg,
		accountId,
		input
	}),
	afterAccountConfigWritten: async ({ previousCfg, cfg, accountId, runtime }) => {
		await runMatrixSetupBootstrapAfterConfigWrite({
			previousCfg,
			cfg,
			accountId,
			runtime
		});
	}
};
//#endregion
export { runMatrixSetupBootstrapAfterConfigWrite as i, matrixSetupAdapter as n, maybeBootstrapNewEncryptedMatrixAccount as r, buildMatrixConfigUpdate as t };
