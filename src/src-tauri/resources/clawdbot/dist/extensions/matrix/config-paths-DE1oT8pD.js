import { DEFAULT_ACCOUNT_ID, normalizeAccountId } from "openclaw/plugin-sdk/account-id";
import { hasConfiguredSecretInput } from "openclaw/plugin-sdk/secret-input";
import { listConfiguredAccountIds, resolveMergedAccountConfig, resolveNormalizedAccountEntry } from "openclaw/plugin-sdk/account-resolution";
//#region extensions/matrix/src/matrix/account-config.ts
function resolveMatrixBaseConfig(cfg) {
	return cfg.channels?.matrix ?? {};
}
function resolveMatrixAccountsMap(cfg) {
	const accounts = resolveMatrixBaseConfig(cfg).accounts;
	if (!accounts || typeof accounts !== "object") return {};
	return accounts;
}
function selectInheritedMatrixRoomEntries(params) {
	const entries = params.entries;
	if (!entries) return;
	const selected = Object.fromEntries(Object.entries(entries).filter(([, value]) => {
		const scopedAccount = typeof value?.account === "string" ? normalizeAccountId(value.account) : void 0;
		return scopedAccount === void 0 || scopedAccount === params.accountId;
	}));
	return Object.keys(selected).length > 0 ? selected : void 0;
}
function mergeMatrixRoomEntries(inherited, accountEntries, hasAccountOverride) {
	if (!inherited && !accountEntries) return;
	if (hasAccountOverride && Object.keys(accountEntries ?? {}).length === 0) return;
	const merged = { ...inherited };
	for (const [key, value] of Object.entries(accountEntries ?? {})) {
		const inheritedValue = merged[key];
		merged[key] = inheritedValue && value ? {
			...inheritedValue,
			...value
		} : value ?? inheritedValue;
	}
	return Object.keys(merged).length > 0 ? merged : void 0;
}
function listNormalizedMatrixAccountIds(cfg) {
	return listConfiguredAccountIds({
		accounts: resolveMatrixAccountsMap(cfg),
		normalizeAccountId
	});
}
function findMatrixAccountConfig(cfg, accountId) {
	return resolveNormalizedAccountEntry(resolveMatrixAccountsMap(cfg), accountId, normalizeAccountId);
}
function hasExplicitMatrixAccountConfig(cfg, accountId) {
	const normalized = normalizeAccountId(accountId);
	if (findMatrixAccountConfig(cfg, normalized)) return true;
	if (normalized !== DEFAULT_ACCOUNT_ID) return false;
	const matrix = resolveMatrixBaseConfig(cfg);
	return typeof matrix.enabled === "boolean" || typeof matrix.name === "string" || typeof matrix.homeserver === "string" || typeof matrix.userId === "string" || hasConfiguredSecretInput(matrix.accessToken) || hasConfiguredSecretInput(matrix.password) || typeof matrix.deviceId === "string" || typeof matrix.deviceName === "string" || typeof matrix.avatarUrl === "string";
}
function resolveMatrixAccountConfig(params) {
	const accountId = normalizeAccountId(params.accountId);
	const base = resolveMatrixBaseConfig(params.cfg);
	const merged = resolveMergedAccountConfig({
		channelConfig: base,
		accounts: params.cfg.channels?.matrix?.accounts,
		accountId,
		normalizeAccountId,
		nestedObjectKeys: [
			"dm",
			"actions",
			"execApprovals"
		]
	});
	const accountConfig = findMatrixAccountConfig(params.cfg, accountId);
	const groups = mergeMatrixRoomEntries(selectInheritedMatrixRoomEntries({
		entries: base.groups,
		accountId
	}), accountConfig?.groups, Boolean(accountConfig && Object.hasOwn(accountConfig, "groups")));
	const rooms = mergeMatrixRoomEntries(selectInheritedMatrixRoomEntries({
		entries: base.rooms,
		accountId
	}), accountConfig?.rooms, Boolean(accountConfig && Object.hasOwn(accountConfig, "rooms")));
	const { groups: _ignoredGroups, rooms: _ignoredRooms, ...rest } = merged;
	return {
		...rest,
		...groups ? { groups } : {},
		...rooms ? { rooms } : {}
	};
}
//#endregion
//#region extensions/matrix/src/matrix/config-paths.ts
function shouldStoreMatrixAccountAtTopLevel(cfg, accountId) {
	if (normalizeAccountId(accountId) !== DEFAULT_ACCOUNT_ID) return false;
	const accounts = cfg.channels?.matrix?.accounts;
	return !accounts || Object.keys(accounts).length === 0;
}
function resolveMatrixConfigPath(cfg, accountId) {
	const normalizedAccountId = normalizeAccountId(accountId);
	if (shouldStoreMatrixAccountAtTopLevel(cfg, normalizedAccountId)) return "channels.matrix";
	return `channels.matrix.accounts.${normalizedAccountId}`;
}
function resolveMatrixConfigFieldPath(cfg, accountId, fieldPath) {
	const suffix = fieldPath.trim().replace(/^\.+/, "");
	if (!suffix) return resolveMatrixConfigPath(cfg, accountId);
	return `${resolveMatrixConfigPath(cfg, accountId)}.${suffix}`;
}
//#endregion
export { hasExplicitMatrixAccountConfig as a, resolveMatrixBaseConfig as c, findMatrixAccountConfig as i, resolveMatrixConfigPath as n, listNormalizedMatrixAccountIds as o, shouldStoreMatrixAccountAtTopLevel as r, resolveMatrixAccountConfig as s, resolveMatrixConfigFieldPath as t };
