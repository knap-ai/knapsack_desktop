import { DEFAULT_ACCOUNT_ID, normalizeAccountId } from "openclaw/plugin-sdk/account-id";
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
export { resolveMatrixConfigPath as n, shouldStoreMatrixAccountAtTopLevel as r, resolveMatrixConfigFieldPath as t };
