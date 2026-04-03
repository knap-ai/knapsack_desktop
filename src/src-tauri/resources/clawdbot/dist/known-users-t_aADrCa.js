import { Q as getQQBotDataDir, ot as debugError, st as debugLog } from "./outbound-DE5EbLPn.js";
import fsSync from "node:fs";
import path from "node:path";
//#region extensions/qqbot/src/known-users.ts
const KNOWN_USERS_DIR = getQQBotDataDir("data");
const KNOWN_USERS_FILE = path.join(KNOWN_USERS_DIR, "known-users.json");
let usersCache = null;
const SAVE_THROTTLE_MS = 5e3;
let saveTimer = null;
let isDirty = false;
/** Ensure the data directory exists. */
function ensureDir() {
	if (!fsSync.existsSync(KNOWN_USERS_DIR)) fsSync.mkdirSync(KNOWN_USERS_DIR, { recursive: true });
}
/** Load persisted users into the in-memory cache. */
function loadUsersFromFile() {
	if (usersCache !== null) return usersCache;
	usersCache = /* @__PURE__ */ new Map();
	try {
		if (fsSync.existsSync(KNOWN_USERS_FILE)) {
			const data = fsSync.readFileSync(KNOWN_USERS_FILE, "utf-8");
			const users = JSON.parse(data);
			for (const user of users) {
				const key = makeUserKey(user);
				usersCache.set(key, user);
			}
			debugLog(`[known-users] Loaded ${usersCache.size} users`);
		}
	} catch (err) {
		debugError(`[known-users] Failed to load users: ${err}`);
		usersCache = /* @__PURE__ */ new Map();
	}
	return usersCache;
}
/** Schedule a throttled write to disk. */
function saveUsersToFile() {
	if (!isDirty) return;
	if (saveTimer) return;
	saveTimer = setTimeout(() => {
		saveTimer = null;
		doSaveUsersToFile();
	}, SAVE_THROTTLE_MS);
}
/** Perform the actual write to disk. */
function doSaveUsersToFile() {
	if (!usersCache || !isDirty) return;
	try {
		ensureDir();
		const users = Array.from(usersCache.values());
		fsSync.writeFileSync(KNOWN_USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
		isDirty = false;
	} catch (err) {
		debugError(`[known-users] Failed to save users: ${err}`);
	}
}
/** Flush pending writes immediately, typically during shutdown. */
function flushKnownUsers() {
	if (saveTimer) {
		clearTimeout(saveTimer);
		saveTimer = null;
	}
	doSaveUsersToFile();
}
/** Build a stable composite key for one user record. */
function makeUserKey(user) {
	const base = `${user.accountId}:${user.type}:${user.openid}`;
	if (user.type === "group" && user.groupOpenid) return `${base}:${user.groupOpenid}`;
	return base;
}
/** Record a known user whenever a message is received. */
function recordKnownUser(user) {
	const cache = loadUsersFromFile();
	const key = makeUserKey(user);
	const now = Date.now();
	const existing = cache.get(key);
	if (existing) {
		existing.lastSeenAt = now;
		existing.interactionCount++;
		if (user.nickname && user.nickname !== existing.nickname) existing.nickname = user.nickname;
	} else {
		const newUser = {
			openid: user.openid,
			type: user.type,
			nickname: user.nickname,
			groupOpenid: user.groupOpenid,
			accountId: user.accountId,
			firstSeenAt: now,
			lastSeenAt: now,
			interactionCount: 1
		};
		cache.set(key, newUser);
		debugLog(`[known-users] New user: ${user.openid} (${user.type})`);
	}
	isDirty = true;
	saveUsersToFile();
}
/** Look up one known user. */
function getKnownUser(accountId, openid, type = "c2c", groupOpenid) {
	const cache = loadUsersFromFile();
	const key = makeUserKey({
		accountId,
		openid,
		type,
		groupOpenid
	});
	return cache.get(key);
}
/** List known users with optional filtering and sorting. */
function listKnownUsers(options) {
	const cache = loadUsersFromFile();
	let users = Array.from(cache.values());
	if (options?.accountId) users = users.filter((u) => u.accountId === options.accountId);
	if (options?.type) users = users.filter((u) => u.type === options.type);
	if (options?.activeWithin) {
		const cutoff = Date.now() - options.activeWithin;
		users = users.filter((u) => u.lastSeenAt >= cutoff);
	}
	const sortBy = options?.sortBy ?? "lastSeenAt";
	const sortOrder = options?.sortOrder ?? "desc";
	users.sort((a, b) => {
		const aVal = a[sortBy] ?? 0;
		const bVal = b[sortBy] ?? 0;
		return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
	});
	if (options?.limit && options.limit > 0) users = users.slice(0, options.limit);
	return users;
}
/** Remove one user record. */
function removeKnownUser(accountId, openid, type = "c2c", groupOpenid) {
	const cache = loadUsersFromFile();
	const key = makeUserKey({
		accountId,
		openid,
		type,
		groupOpenid
	});
	if (cache.has(key)) {
		cache.delete(key);
		isDirty = true;
		saveUsersToFile();
		debugLog(`[known-users] Removed user ${openid}`);
		return true;
	}
	return false;
}
/** Clear all user records, optionally scoped to one account. */
function clearKnownUsers(accountId) {
	const cache = loadUsersFromFile();
	let count = 0;
	if (accountId) {
		for (const [key, user] of cache.entries()) if (user.accountId === accountId) {
			cache.delete(key);
			count++;
		}
	} else {
		count = cache.size;
		cache.clear();
	}
	if (count > 0) {
		isDirty = true;
		doSaveUsersToFile();
		debugLog(`[known-users] Cleared ${count} users`);
	}
	return count;
}
//#endregion
export { recordKnownUser as a, listKnownUsers as i, flushKnownUsers as n, removeKnownUser as o, getKnownUser as r, clearKnownUsers as t };
