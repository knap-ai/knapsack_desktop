import { g as resolveOAuthPath } from "./paths-ViKUYWUK.js";
import { t as createSubsystemLogger } from "./subsystem-DISldKSB.js";
import { y as resolveUserPath } from "./utils-CS0Ikux6.js";
import { f as log$1, i as resolveLegacyAuthStorePath, n as resolveAuthStorePath, o as AUTH_STORE_LOCK_OPTIONS, t as ensureAuthStoreFile } from "./paths-C4Oy7wjk.js";
import { r as normalizeStringEntries } from "./string-normalization-CohoSMRS.js";
import { i as normalizeProviderIdForAuth, r as normalizeProviderId } from "./provider-id-Cjha-r0T.js";
import { r as withFileLock } from "./file-lock-DEiVq2ow.js";
import { n as saveJsonFile, t as loadJsonFile } from "./json-file-Dl3Z1jL1.js";
import { n as normalizeSecretInput } from "./normalize-secret-input-BsX1agd_.js";
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { createHash } from "node:crypto";
//#region src/agents/cli-credentials.ts
const log = createSubsystemLogger("agents/auth-profiles");
const CODEX_CLI_AUTH_FILENAME = "auth.json";
const QWEN_CLI_CREDENTIALS_RELATIVE_PATH = ".qwen/oauth_creds.json";
const MINIMAX_CLI_CREDENTIALS_RELATIVE_PATH = ".minimax/oauth_creds.json";
let codexCliCache = null;
let qwenCliCache = null;
let minimaxCliCache = null;
function resolveCodexCliAuthPath() {
	return path.join(resolveCodexHomePath(), CODEX_CLI_AUTH_FILENAME);
}
function resolveCodexHomePath() {
	const configured = process.env.CODEX_HOME;
	const home = configured ? resolveUserPath(configured) : resolveUserPath("~/.codex");
	try {
		return fs.realpathSync.native(home);
	} catch {
		return home;
	}
}
function resolveQwenCliCredentialsPath(homeDir) {
	const baseDir = homeDir ?? resolveUserPath("~");
	return path.join(baseDir, QWEN_CLI_CREDENTIALS_RELATIVE_PATH);
}
function resolveMiniMaxCliCredentialsPath(homeDir) {
	const baseDir = homeDir ?? resolveUserPath("~");
	return path.join(baseDir, MINIMAX_CLI_CREDENTIALS_RELATIVE_PATH);
}
function computeCodexKeychainAccount(codexHome) {
	return `cli|${createHash("sha256").update(codexHome).digest("hex").slice(0, 16)}`;
}
function decodeJwtExpiryMs(token) {
	const parts = token.split(".");
	if (parts.length < 2) return null;
	try {
		const payloadRaw = Buffer.from(parts[1], "base64url").toString("utf8");
		const payload = JSON.parse(payloadRaw);
		return typeof payload.exp === "number" && Number.isFinite(payload.exp) && payload.exp > 0 ? payload.exp * 1e3 : null;
	} catch {
		return null;
	}
}
function readCodexKeychainCredentials(options) {
	if ((options?.platform ?? process.platform) !== "darwin") return null;
	const execSyncImpl = options?.execSync ?? execSync;
	const account = computeCodexKeychainAccount(resolveCodexHomePath());
	try {
		const secret = execSyncImpl(`security find-generic-password -s "Codex Auth" -a "${account}" -w`, {
			encoding: "utf8",
			timeout: 5e3,
			stdio: [
				"pipe",
				"pipe",
				"pipe"
			]
		}).trim();
		const parsed = JSON.parse(secret);
		const tokens = parsed.tokens;
		const accessToken = tokens?.access_token;
		const refreshToken = tokens?.refresh_token;
		if (typeof accessToken !== "string" || !accessToken) return null;
		if (typeof refreshToken !== "string" || !refreshToken) return null;
		const lastRefreshRaw = parsed.last_refresh;
		const lastRefresh = typeof lastRefreshRaw === "string" || typeof lastRefreshRaw === "number" ? new Date(lastRefreshRaw).getTime() : Date.now();
		const fallbackExpiry = Number.isFinite(lastRefresh) ? lastRefresh + 3600 * 1e3 : Date.now() + 3600 * 1e3;
		const expires = decodeJwtExpiryMs(accessToken) ?? fallbackExpiry;
		const accountId = typeof tokens?.account_id === "string" ? tokens.account_id : void 0;
		log.info("read codex credentials from keychain", {
			source: "keychain",
			expires: new Date(expires).toISOString()
		});
		return {
			type: "oauth",
			provider: "openai-codex",
			access: accessToken,
			refresh: refreshToken,
			expires,
			accountId
		};
	} catch {
		return null;
	}
}
function readQwenCliCredentials(options) {
	return readPortalCliOauthCredentials(resolveQwenCliCredentialsPath(options?.homeDir), "qwen-portal");
}
function readPortalCliOauthCredentials(credPath, provider) {
	const raw = loadJsonFile(credPath);
	if (!raw || typeof raw !== "object") return null;
	const data = raw;
	const accessToken = data.access_token;
	const refreshToken = data.refresh_token;
	const expiresAt = data.expiry_date;
	if (typeof accessToken !== "string" || !accessToken) return null;
	if (typeof refreshToken !== "string" || !refreshToken) return null;
	if (typeof expiresAt !== "number" || !Number.isFinite(expiresAt)) return null;
	return {
		type: "oauth",
		provider,
		access: accessToken,
		refresh: refreshToken,
		expires: expiresAt
	};
}
function readMiniMaxCliCredentials(options) {
	return readPortalCliOauthCredentials(resolveMiniMaxCliCredentialsPath(options?.homeDir), "minimax-portal");
}
function readCodexCliCredentials(options) {
	const keychain = readCodexKeychainCredentials({
		platform: options?.platform,
		execSync: options?.execSync
	});
	if (keychain) return keychain;
	const authPath = resolveCodexCliAuthPath();
	const raw = loadJsonFile(authPath);
	if (!raw || typeof raw !== "object") return null;
	const tokens = raw.tokens;
	if (!tokens || typeof tokens !== "object") return null;
	const accessToken = tokens.access_token;
	const refreshToken = tokens.refresh_token;
	if (typeof accessToken !== "string" || !accessToken) return null;
	if (typeof refreshToken !== "string" || !refreshToken) return null;
	let fallbackExpiry;
	try {
		fallbackExpiry = fs.statSync(authPath).mtimeMs + 3600 * 1e3;
	} catch {
		fallbackExpiry = Date.now() + 3600 * 1e3;
	}
	return {
		type: "oauth",
		provider: "openai-codex",
		access: accessToken,
		refresh: refreshToken,
		expires: decodeJwtExpiryMs(accessToken) ?? fallbackExpiry,
		accountId: typeof tokens.account_id === "string" ? tokens.account_id : void 0
	};
}
function readCodexCliCredentialsCached(options) {
	const ttlMs = options?.ttlMs ?? 0;
	const now = Date.now();
	const cacheKey = `${options?.platform ?? process.platform}|${resolveCodexCliAuthPath()}`;
	if (ttlMs > 0 && codexCliCache && codexCliCache.cacheKey === cacheKey && now - codexCliCache.readAt < ttlMs) return codexCliCache.value;
	const value = readCodexCliCredentials({
		platform: options?.platform,
		execSync: options?.execSync
	});
	if (ttlMs > 0) codexCliCache = {
		value,
		readAt: now,
		cacheKey
	};
	return value;
}
function readQwenCliCredentialsCached(options) {
	const ttlMs = options?.ttlMs ?? 0;
	const now = Date.now();
	const cacheKey = resolveQwenCliCredentialsPath(options?.homeDir);
	if (ttlMs > 0 && qwenCliCache && qwenCliCache.cacheKey === cacheKey && now - qwenCliCache.readAt < ttlMs) return qwenCliCache.value;
	const value = readQwenCliCredentials({ homeDir: options?.homeDir });
	if (ttlMs > 0) qwenCliCache = {
		value,
		readAt: now,
		cacheKey
	};
	return value;
}
function readMiniMaxCliCredentialsCached(options) {
	const ttlMs = options?.ttlMs ?? 0;
	const now = Date.now();
	const cacheKey = resolveMiniMaxCliCredentialsPath(options?.homeDir);
	if (ttlMs > 0 && minimaxCliCache && minimaxCliCache.cacheKey === cacheKey && now - minimaxCliCache.readAt < ttlMs) return minimaxCliCache.value;
	const value = readMiniMaxCliCredentials({ homeDir: options?.homeDir });
	if (ttlMs > 0) minimaxCliCache = {
		value,
		readAt: now,
		cacheKey
	};
	return value;
}
//#endregion
//#region src/agents/auth-profiles/external-cli-sync.ts
const OPENAI_CODEX_DEFAULT_PROFILE_ID = "openai-codex:default";
function shallowEqualOAuthCredentials(a, b) {
	if (!a) return false;
	if (a.type !== "oauth") return false;
	return a.provider === b.provider && a.access === b.access && a.refresh === b.refresh && a.expires === b.expires && a.email === b.email && a.enterpriseUrl === b.enterpriseUrl && a.projectId === b.projectId && a.accountId === b.accountId;
}
/** Sync external CLI credentials into the store for a given provider. */
function syncExternalCliCredentialsForProvider(store, profileId, provider, readCredentials, options) {
	const existing = store.profiles[profileId];
	const creds = readCredentials();
	if (!creds) return false;
	if (shallowEqualOAuthCredentials(existing?.type === "oauth" ? existing : void 0, creds)) return false;
	store.profiles[profileId] = creds;
	if (options.log !== false) log$1.info(`synced ${provider} credentials from external cli`, {
		profileId,
		expires: new Date(creds.expires).toISOString()
	});
	return true;
}
/**
* Sync OAuth credentials from external CLI tools (Qwen Code CLI, MiniMax CLI, Codex CLI)
* into the store.
*
* Returns true if any credentials were updated.
*/
function syncExternalCliCredentials(store, options = {}) {
	let mutated = false;
	if (syncExternalCliCredentialsForProvider(store, "qwen-portal:qwen-cli", "qwen-portal", () => readQwenCliCredentialsCached({ ttlMs: 9e5 }), options)) mutated = true;
	if (syncExternalCliCredentialsForProvider(store, "minimax-portal:minimax-cli", "minimax-portal", () => readMiniMaxCliCredentialsCached({ ttlMs: 9e5 }), options)) mutated = true;
	if (syncExternalCliCredentialsForProvider(store, OPENAI_CODEX_DEFAULT_PROFILE_ID, "openai-codex", () => readCodexCliCredentialsCached({ ttlMs: 9e5 }), options)) mutated = true;
	return mutated;
}
//#endregion
//#region src/agents/auth-profiles/store.ts
const AUTH_PROFILE_TYPES = new Set([
	"api_key",
	"oauth",
	"token"
]);
const runtimeAuthStoreSnapshots = /* @__PURE__ */ new Map();
const loadedAuthStoreCache = /* @__PURE__ */ new Map();
function resolveRuntimeStoreKey(agentDir) {
	return resolveAuthStorePath(agentDir);
}
function cloneAuthProfileStore(store) {
	return structuredClone(store);
}
function resolveRuntimeAuthProfileStore(agentDir) {
	if (runtimeAuthStoreSnapshots.size === 0) return null;
	const mainKey = resolveRuntimeStoreKey(void 0);
	const requestedKey = resolveRuntimeStoreKey(agentDir);
	const mainStore = runtimeAuthStoreSnapshots.get(mainKey);
	const requestedStore = runtimeAuthStoreSnapshots.get(requestedKey);
	if (!agentDir || requestedKey === mainKey) {
		if (!mainStore) return null;
		return cloneAuthProfileStore(mainStore);
	}
	if (mainStore && requestedStore) return mergeAuthProfileStores(cloneAuthProfileStore(mainStore), cloneAuthProfileStore(requestedStore));
	if (requestedStore) return cloneAuthProfileStore(requestedStore);
	if (mainStore) return cloneAuthProfileStore(mainStore);
	return null;
}
function replaceRuntimeAuthProfileStoreSnapshots(entries) {
	runtimeAuthStoreSnapshots.clear();
	for (const entry of entries) runtimeAuthStoreSnapshots.set(resolveRuntimeStoreKey(entry.agentDir), cloneAuthProfileStore(entry.store));
}
function clearRuntimeAuthProfileStoreSnapshots() {
	runtimeAuthStoreSnapshots.clear();
	loadedAuthStoreCache.clear();
}
function readAuthStoreMtimeMs(authPath) {
	try {
		return fs.statSync(authPath).mtimeMs;
	} catch {
		return null;
	}
}
function readCachedAuthProfileStore(authPath, mtimeMs) {
	const cached = loadedAuthStoreCache.get(authPath);
	if (!cached || cached.mtimeMs !== mtimeMs) return null;
	if (Date.now() - cached.syncedAtMs >= 9e5) return null;
	return cloneAuthProfileStore(cached.store);
}
function writeCachedAuthProfileStore(authPath, mtimeMs, store) {
	loadedAuthStoreCache.set(authPath, {
		mtimeMs,
		syncedAtMs: Date.now(),
		store: cloneAuthProfileStore(store)
	});
}
async function updateAuthProfileStoreWithLock(params) {
	const authPath = resolveAuthStorePath(params.agentDir);
	ensureAuthStoreFile(authPath);
	try {
		return await withFileLock(authPath, AUTH_STORE_LOCK_OPTIONS, async () => {
			const store = loadAuthProfileStoreForAgent(params.agentDir);
			if (params.updater(store)) saveAuthProfileStore(store, params.agentDir);
			return store;
		});
	} catch {
		return null;
	}
}
/**
* Normalise a raw auth-profiles.json credential entry.
*
* The official format uses `type` and (for api_key credentials) `key`.
* A common mistake — caused by the similarity with the `openclaw.json`
* `auth.profiles` section which uses `mode` — is to write `mode` instead of
* `type` and `apiKey` instead of `key`.  Accept both spellings so users don't
* silently lose their credentials.
*/
function normalizeRawCredentialEntry(raw) {
	const entry = { ...raw };
	if (!("type" in entry) && typeof entry["mode"] === "string") entry["type"] = entry["mode"];
	if (!("key" in entry) && typeof entry["apiKey"] === "string") entry["key"] = entry["apiKey"];
	return entry;
}
function parseCredentialEntry(raw, fallbackProvider) {
	if (!raw || typeof raw !== "object") return {
		ok: false,
		reason: "non_object"
	};
	const typed = normalizeRawCredentialEntry(raw);
	if (!AUTH_PROFILE_TYPES.has(typed.type)) return {
		ok: false,
		reason: "invalid_type"
	};
	const provider = typed.provider ?? fallbackProvider;
	if (typeof provider !== "string" || provider.trim().length === 0) return {
		ok: false,
		reason: "missing_provider"
	};
	return {
		ok: true,
		credential: {
			...typed,
			provider
		}
	};
}
function warnRejectedCredentialEntries(source, rejected) {
	if (rejected.length === 0) return;
	const reasons = rejected.reduce((acc, current) => {
		acc[current.reason] = (acc[current.reason] ?? 0) + 1;
		return acc;
	}, {});
	log$1.warn("ignored invalid auth profile entries during store load", {
		source,
		dropped: rejected.length,
		reasons,
		keys: rejected.slice(0, 10).map((entry) => entry.key)
	});
}
function coerceLegacyStore(raw) {
	if (!raw || typeof raw !== "object") return null;
	const record = raw;
	if ("profiles" in record) return null;
	const entries = {};
	const rejected = [];
	for (const [key, value] of Object.entries(record)) {
		const parsed = parseCredentialEntry(value, key);
		if (!parsed.ok) {
			rejected.push({
				key,
				reason: parsed.reason
			});
			continue;
		}
		entries[key] = parsed.credential;
	}
	warnRejectedCredentialEntries("auth.json", rejected);
	return Object.keys(entries).length > 0 ? entries : null;
}
function coerceAuthStore(raw) {
	if (!raw || typeof raw !== "object") return null;
	const record = raw;
	if (!record.profiles || typeof record.profiles !== "object") return null;
	const profiles = record.profiles;
	const normalized = {};
	const rejected = [];
	for (const [key, value] of Object.entries(profiles)) {
		const parsed = parseCredentialEntry(value);
		if (!parsed.ok) {
			rejected.push({
				key,
				reason: parsed.reason
			});
			continue;
		}
		normalized[key] = parsed.credential;
	}
	warnRejectedCredentialEntries("auth-profiles.json", rejected);
	const order = record.order && typeof record.order === "object" ? Object.entries(record.order).reduce((acc, [provider, value]) => {
		if (!Array.isArray(value)) return acc;
		const list = value.map((entry) => typeof entry === "string" ? entry.trim() : "").filter(Boolean);
		if (list.length === 0) return acc;
		acc[provider] = list;
		return acc;
	}, {}) : void 0;
	return {
		version: Number(record.version ?? 1),
		profiles: normalized,
		order,
		lastGood: record.lastGood && typeof record.lastGood === "object" ? record.lastGood : void 0,
		usageStats: record.usageStats && typeof record.usageStats === "object" ? record.usageStats : void 0
	};
}
function mergeRecord(base, override) {
	if (!base && !override) return;
	if (!base) return { ...override };
	if (!override) return { ...base };
	return {
		...base,
		...override
	};
}
function mergeAuthProfileStores(base, override) {
	if (Object.keys(override.profiles).length === 0 && !override.order && !override.lastGood && !override.usageStats) return base;
	return {
		version: Math.max(base.version, override.version ?? base.version),
		profiles: {
			...base.profiles,
			...override.profiles
		},
		order: mergeRecord(base.order, override.order),
		lastGood: mergeRecord(base.lastGood, override.lastGood),
		usageStats: mergeRecord(base.usageStats, override.usageStats)
	};
}
function mergeOAuthFileIntoStore(store) {
	const oauthRaw = loadJsonFile(resolveOAuthPath());
	if (!oauthRaw || typeof oauthRaw !== "object") return false;
	const oauthEntries = oauthRaw;
	let mutated = false;
	for (const [provider, creds] of Object.entries(oauthEntries)) {
		if (!creds || typeof creds !== "object") continue;
		const profileId = `${provider}:default`;
		if (store.profiles[profileId]) continue;
		store.profiles[profileId] = {
			type: "oauth",
			provider,
			...creds
		};
		mutated = true;
	}
	return mutated;
}
function applyLegacyStore(store, legacy) {
	for (const [provider, cred] of Object.entries(legacy)) {
		const profileId = `${provider}:default`;
		if (cred.type === "api_key") {
			store.profiles[profileId] = {
				type: "api_key",
				provider: String(cred.provider ?? provider),
				key: cred.key,
				...cred.email ? { email: cred.email } : {}
			};
			continue;
		}
		if (cred.type === "token") {
			store.profiles[profileId] = {
				type: "token",
				provider: String(cred.provider ?? provider),
				token: cred.token,
				...typeof cred.expires === "number" ? { expires: cred.expires } : {},
				...cred.email ? { email: cred.email } : {}
			};
			continue;
		}
		store.profiles[profileId] = {
			type: "oauth",
			provider: String(cred.provider ?? provider),
			access: cred.access,
			refresh: cred.refresh,
			expires: cred.expires,
			...cred.enterpriseUrl ? { enterpriseUrl: cred.enterpriseUrl } : {},
			...cred.projectId ? { projectId: cred.projectId } : {},
			...cred.accountId ? { accountId: cred.accountId } : {},
			...cred.email ? { email: cred.email } : {}
		};
	}
}
function loadCoercedStore(authPath) {
	return coerceAuthStore(loadJsonFile(authPath));
}
function shouldLogAuthStoreTiming() {
	return process.env.OPENCLAW_DEBUG_INGRESS_TIMING === "1";
}
function syncExternalCliCredentialsTimed(store, options) {
	if (!shouldLogAuthStoreTiming()) return syncExternalCliCredentials(store, options);
	const startMs = Date.now();
	const mutated = syncExternalCliCredentials(store, options);
	log$1.info(`auth-store stage=external-cli-sync elapsedMs=${Date.now() - startMs} mutated=${mutated}`);
	return mutated;
}
function loadAuthProfileStore() {
	const authPath = resolveAuthStorePath();
	const asStore = loadCoercedStore(authPath);
	if (asStore) {
		if (syncExternalCliCredentialsTimed(asStore)) saveJsonFile(authPath, asStore);
		return asStore;
	}
	const legacy = coerceLegacyStore(loadJsonFile(resolveLegacyAuthStorePath()));
	if (legacy) {
		const store = {
			version: 1,
			profiles: {}
		};
		applyLegacyStore(store, legacy);
		syncExternalCliCredentialsTimed(store);
		return store;
	}
	const store = {
		version: 1,
		profiles: {}
	};
	syncExternalCliCredentialsTimed(store);
	return store;
}
function loadAuthProfileStoreForAgent(agentDir, options) {
	const readOnly = options?.readOnly === true;
	const authPath = resolveAuthStorePath(agentDir);
	if (!readOnly) {
		const cached = readCachedAuthProfileStore(authPath, readAuthStoreMtimeMs(authPath));
		if (cached) return cached;
	}
	const asStore = loadCoercedStore(authPath);
	if (asStore) {
		if (syncExternalCliCredentialsTimed(asStore, { log: !readOnly }) && !readOnly) saveJsonFile(authPath, asStore);
		if (!readOnly) writeCachedAuthProfileStore(authPath, readAuthStoreMtimeMs(authPath), asStore);
		return asStore;
	}
	if (agentDir && !readOnly) {
		const mainStore = coerceAuthStore(loadJsonFile(resolveAuthStorePath()));
		if (mainStore && Object.keys(mainStore.profiles).length > 0) {
			saveJsonFile(authPath, mainStore);
			log$1.info("inherited auth-profiles from main agent", { agentDir });
			writeCachedAuthProfileStore(authPath, readAuthStoreMtimeMs(authPath), mainStore);
			return mainStore;
		}
	}
	const legacy = coerceLegacyStore(loadJsonFile(resolveLegacyAuthStorePath(agentDir)));
	const store = {
		version: 1,
		profiles: {}
	};
	if (legacy) applyLegacyStore(store, legacy);
	const mergedOAuth = mergeOAuthFileIntoStore(store);
	const syncedCli = syncExternalCliCredentialsTimed(store, { log: !readOnly });
	const forceReadOnly = process.env.OPENCLAW_AUTH_STORE_READONLY === "1";
	const shouldWrite = !readOnly && !forceReadOnly && (legacy !== null || mergedOAuth || syncedCli);
	if (shouldWrite) saveJsonFile(authPath, store);
	if (shouldWrite && legacy !== null) {
		const legacyPath = resolveLegacyAuthStorePath(agentDir);
		try {
			fs.unlinkSync(legacyPath);
		} catch (err) {
			if (err?.code !== "ENOENT") log$1.warn("failed to delete legacy auth.json after migration", {
				err,
				legacyPath
			});
		}
	}
	if (!readOnly) writeCachedAuthProfileStore(authPath, readAuthStoreMtimeMs(authPath), store);
	return store;
}
function loadAuthProfileStoreForRuntime(agentDir, options) {
	const store = loadAuthProfileStoreForAgent(agentDir, options);
	const authPath = resolveAuthStorePath(agentDir);
	const mainAuthPath = resolveAuthStorePath();
	if (!agentDir || authPath === mainAuthPath) return store;
	return mergeAuthProfileStores(loadAuthProfileStoreForAgent(void 0, options), store);
}
function loadAuthProfileStoreForSecretsRuntime(agentDir) {
	return loadAuthProfileStoreForRuntime(agentDir, {
		readOnly: true,
		allowKeychainPrompt: false
	});
}
function ensureAuthProfileStore(agentDir, options) {
	const runtimeStore = resolveRuntimeAuthProfileStore(agentDir);
	if (runtimeStore) return runtimeStore;
	const store = loadAuthProfileStoreForAgent(agentDir, options);
	const authPath = resolveAuthStorePath(agentDir);
	const mainAuthPath = resolveAuthStorePath();
	if (!agentDir || authPath === mainAuthPath) return store;
	return mergeAuthProfileStores(loadAuthProfileStoreForAgent(void 0, options), store);
}
function saveAuthProfileStore(store, agentDir) {
	const authPath = resolveAuthStorePath(agentDir);
	const payload = {
		version: 1,
		profiles: Object.fromEntries(Object.entries(store.profiles).map(([profileId, credential]) => {
			if (credential.type === "api_key" && credential.keyRef && credential.key !== void 0) {
				const sanitized = { ...credential };
				delete sanitized.key;
				return [profileId, sanitized];
			}
			if (credential.type === "token" && credential.tokenRef && credential.token !== void 0) {
				const sanitized = { ...credential };
				delete sanitized.token;
				return [profileId, sanitized];
			}
			return [profileId, credential];
		})),
		order: store.order ?? void 0,
		lastGood: store.lastGood ?? void 0,
		usageStats: store.usageStats ?? void 0
	};
	saveJsonFile(authPath, payload);
	writeCachedAuthProfileStore(authPath, readAuthStoreMtimeMs(authPath), payload);
}
//#endregion
//#region src/agents/auth-profiles/profiles.ts
function dedupeProfileIds(profileIds) {
	return [...new Set(profileIds)];
}
async function setAuthProfileOrder(params) {
	const providerKey = normalizeProviderId(params.provider);
	const deduped = dedupeProfileIds(params.order && Array.isArray(params.order) ? normalizeStringEntries(params.order) : []);
	return await updateAuthProfileStoreWithLock({
		agentDir: params.agentDir,
		updater: (store) => {
			store.order = store.order ?? {};
			if (deduped.length === 0) {
				if (!store.order[providerKey]) return false;
				delete store.order[providerKey];
				if (Object.keys(store.order).length === 0) store.order = void 0;
				return true;
			}
			store.order[providerKey] = deduped;
			return true;
		}
	});
}
function upsertAuthProfile(params) {
	const credential = params.credential.type === "api_key" ? {
		...params.credential,
		...typeof params.credential.key === "string" ? { key: normalizeSecretInput(params.credential.key) } : {}
	} : params.credential.type === "token" ? {
		...params.credential,
		token: normalizeSecretInput(params.credential.token)
	} : params.credential;
	const store = ensureAuthProfileStore(params.agentDir);
	store.profiles[params.profileId] = credential;
	saveAuthProfileStore(store, params.agentDir);
}
async function upsertAuthProfileWithLock(params) {
	return await updateAuthProfileStoreWithLock({
		agentDir: params.agentDir,
		updater: (store) => {
			store.profiles[params.profileId] = params.credential;
			return true;
		}
	});
}
function listProfilesForProvider(store, provider) {
	const providerKey = normalizeProviderIdForAuth(provider);
	return Object.entries(store.profiles).filter(([, cred]) => normalizeProviderIdForAuth(cred.provider) === providerKey).map(([id]) => id);
}
async function markAuthProfileGood(params) {
	const { store, provider, profileId, agentDir } = params;
	const updated = await updateAuthProfileStoreWithLock({
		agentDir,
		updater: (freshStore) => {
			const profile = freshStore.profiles[profileId];
			if (!profile || profile.provider !== provider) return false;
			freshStore.lastGood = {
				...freshStore.lastGood,
				[provider]: profileId
			};
			return true;
		}
	});
	if (updated) {
		store.lastGood = updated.lastGood;
		return;
	}
	const profile = store.profiles[profileId];
	if (!profile || profile.provider !== provider) return;
	store.lastGood = {
		...store.lastGood,
		[provider]: profileId
	};
	saveAuthProfileStore(store, agentDir);
}
//#endregion
export { upsertAuthProfile as a, ensureAuthProfileStore as c, loadAuthProfileStoreForSecretsRuntime as d, replaceRuntimeAuthProfileStoreSnapshots as f, setAuthProfileOrder as i, loadAuthProfileStore as l, updateAuthProfileStoreWithLock as m, listProfilesForProvider as n, upsertAuthProfileWithLock as o, saveAuthProfileStore as p, markAuthProfileGood as r, clearRuntimeAuthProfileStoreSnapshots as s, dedupeProfileIds as t, loadAuthProfileStoreForRuntime as u };
