import { _ as normalizeAccountId } from "./session-key-D7XpmyVq.js";
import { i as coerceSecretRef, l as normalizeSecretInputString } from "./types.secrets-DTXJhyWe.js";
import "./setup-CPpe7OZc.js";
import "./config-runtime-CmISCurQ.js";
import { i as findMatrixAccountConfig, r as shouldStoreMatrixAccountAtTopLevel } from "./config-paths-TkWX6drG.js";
//#region extensions/matrix/src/matrix/config-update.ts
function applyNullableStringField(target, key, value) {
	if (value === void 0) return;
	if (value === null) {
		delete target[key];
		return;
	}
	const trimmed = value.trim();
	if (!trimmed) {
		delete target[key];
		return;
	}
	target[key] = trimmed;
}
function applyNullableSecretInputField(target, key, value, defaults) {
	if (value === void 0) return;
	if (value === null) {
		delete target[key];
		return;
	}
	if (typeof value === "string") {
		const normalized = normalizeSecretInputString(value);
		if (normalized) target[key] = normalized;
		else delete target[key];
		return;
	}
	const ref = coerceSecretRef(value, defaults);
	if (!ref) throw new Error(`Invalid Matrix ${key} SecretInput.`);
	target[key] = ref;
}
function cloneMatrixDmConfig(dm) {
	if (!dm) return dm;
	return {
		...dm,
		...dm.allowFrom ? { allowFrom: [...dm.allowFrom] } : {}
	};
}
function cloneMatrixRoomMap(rooms) {
	if (!rooms) return rooms;
	return Object.fromEntries(Object.entries(rooms).map(([roomId, roomCfg]) => [roomId, roomCfg ? { ...roomCfg } : roomCfg]));
}
function applyNullableArrayField(target, key, value) {
	if (value === void 0) return;
	if (value === null) {
		delete target[key];
		return;
	}
	target[key] = [...value];
}
function updateMatrixAccountConfig(cfg, accountId, patch) {
	const matrix = cfg.channels?.matrix ?? {};
	const normalizedAccountId = normalizeAccountId(accountId);
	const nextAccount = { ...findMatrixAccountConfig(cfg, normalizedAccountId) ?? (normalizedAccountId === "default" ? matrix : {}) };
	if (patch.name !== void 0) if (patch.name === null) delete nextAccount.name;
	else {
		const trimmed = patch.name.trim();
		if (trimmed) nextAccount.name = trimmed;
		else delete nextAccount.name;
	}
	if (typeof patch.enabled === "boolean") nextAccount.enabled = patch.enabled;
	else if (typeof nextAccount.enabled !== "boolean") nextAccount.enabled = true;
	applyNullableStringField(nextAccount, "homeserver", patch.homeserver);
	applyNullableStringField(nextAccount, "proxy", patch.proxy);
	applyNullableStringField(nextAccount, "userId", patch.userId);
	applyNullableSecretInputField(nextAccount, "accessToken", patch.accessToken, cfg.secrets?.defaults);
	applyNullableSecretInputField(nextAccount, "password", patch.password, cfg.secrets?.defaults);
	applyNullableStringField(nextAccount, "deviceId", patch.deviceId);
	applyNullableStringField(nextAccount, "deviceName", patch.deviceName);
	applyNullableStringField(nextAccount, "avatarUrl", patch.avatarUrl);
	if (patch.allowPrivateNetwork !== void 0) if (patch.allowPrivateNetwork === null) delete nextAccount.allowPrivateNetwork;
	else nextAccount.allowPrivateNetwork = patch.allowPrivateNetwork;
	if (patch.initialSyncLimit !== void 0) if (patch.initialSyncLimit === null) delete nextAccount.initialSyncLimit;
	else nextAccount.initialSyncLimit = Math.max(0, Math.floor(patch.initialSyncLimit));
	if (patch.encryption !== void 0) if (patch.encryption === null) delete nextAccount.encryption;
	else nextAccount.encryption = patch.encryption;
	if (patch.allowBots !== void 0) if (patch.allowBots === null) delete nextAccount.allowBots;
	else nextAccount.allowBots = patch.allowBots;
	if (patch.dm !== void 0) if (patch.dm === null) delete nextAccount.dm;
	else nextAccount.dm = cloneMatrixDmConfig({
		...nextAccount.dm ?? {},
		...patch.dm
	});
	if (patch.groupPolicy !== void 0) if (patch.groupPolicy === null) delete nextAccount.groupPolicy;
	else nextAccount.groupPolicy = patch.groupPolicy;
	applyNullableArrayField(nextAccount, "groupAllowFrom", patch.groupAllowFrom);
	if (patch.groups !== void 0) if (patch.groups === null) delete nextAccount.groups;
	else nextAccount.groups = cloneMatrixRoomMap(patch.groups);
	if (patch.rooms !== void 0) if (patch.rooms === null) delete nextAccount.rooms;
	else nextAccount.rooms = cloneMatrixRoomMap(patch.rooms);
	const nextAccounts = Object.fromEntries(Object.entries(matrix.accounts ?? {}).filter(([rawAccountId]) => rawAccountId === normalizedAccountId || normalizeAccountId(rawAccountId) !== normalizedAccountId));
	if (shouldStoreMatrixAccountAtTopLevel(cfg, normalizedAccountId)) {
		const { accounts: _ignoredAccounts, defaultAccount, ...baseMatrix } = matrix;
		return {
			...cfg,
			channels: {
				...cfg.channels,
				matrix: {
					...baseMatrix,
					...defaultAccount ? { defaultAccount } : {},
					enabled: true,
					...nextAccount
				}
			}
		};
	}
	return {
		...cfg,
		channels: {
			...cfg.channels,
			matrix: {
				...matrix,
				enabled: true,
				accounts: {
					...nextAccounts,
					[normalizedAccountId]: nextAccount
				}
			}
		}
	};
}
//#endregion
export { updateMatrixAccountConfig as t };
