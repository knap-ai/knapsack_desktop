import { c as normalizeOptionalString } from "./string-coerce-Bje8XVt9.js";
import { a as resolveAllowFromAccountId, n as dedupePreserveOrder, o as resolveAllowFromFilePath, r as readAllowFromFileSyncWithExists, u as shouldIncludeLegacyAllowFromEntries } from "./allow-from-store-file-Ba3LW_Sl.js";
//#region src/pairing/allow-from-store-read.ts
const ALLOW_FROM_STORE_READ_CACHE_NAMESPACE = "allow-from-store-read";
function normalizeRawAllowFromList(store) {
	return dedupePreserveOrder((Array.isArray(store.allowFrom) ? store.allowFrom : []).map((entry) => normalizeOptionalString(entry) ?? "").filter(Boolean));
}
function readAllowFromEntriesForPathSyncWithExists(filePath) {
	return readAllowFromFileSyncWithExists({
		cacheNamespace: ALLOW_FROM_STORE_READ_CACHE_NAMESPACE,
		filePath,
		normalizeStore: normalizeRawAllowFromList
	});
}
function resolveChannelAllowFromPath(channel, env = process.env, accountId) {
	return resolveAllowFromFilePath(channel, env, accountId);
}
function readChannelAllowFromStoreEntriesSync(channel, env = process.env, accountId) {
	const resolvedAccountId = resolveAllowFromAccountId(accountId);
	if (!shouldIncludeLegacyAllowFromEntries(resolvedAccountId)) return readAllowFromEntriesForPathSyncWithExists(resolveAllowFromFilePath(channel, env, resolvedAccountId)).entries;
	const scopedEntries = readAllowFromEntriesForPathSyncWithExists(resolveAllowFromFilePath(channel, env, resolvedAccountId)).entries;
	const legacyEntries = readAllowFromEntriesForPathSyncWithExists(resolveAllowFromFilePath(channel, env)).entries;
	return dedupePreserveOrder([...scopedEntries, ...legacyEntries]);
}
//#endregion
export { resolveChannelAllowFromPath as n, readChannelAllowFromStoreEntriesSync as t };
