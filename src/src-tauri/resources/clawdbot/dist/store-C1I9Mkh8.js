import { i as formatErrorMessage } from "./errors-D8p6rxH8.js";
import { s as normalizeOptionalString } from "./string-coerce-BUSzWgUA.js";
import { m as resolveUserPath } from "./utils-D5DtWkEu.js";
import { t as createSubsystemLogger } from "./subsystem-Cgmckbux.js";
import { g as resolveOAuthPath } from "./paths-Dvv9VRAc.js";
import { i as coerceSecretRef } from "./types.secrets-CeL3gSMO.js";
import { i as withFileLock } from "./file-lock-ByJeCMLs.js";
import "./file-lock-BMw37VAn.js";
import { n as saveJsonFile, t as loadJsonFile } from "./json-file-DAv7R9GL.js";
import { a as replaceRuntimeAuthProfileStoreSnapshots$1, d as resolveLegacyAuthStorePath, i as hasRuntimeAuthProfileStoreSnapshot, l as resolveAuthStorePath, n as clearRuntimeAuthProfileStoreSnapshots$1, o as setRuntimeAuthProfileStoreSnapshot, r as getRuntimeAuthProfileStoreSnapshot, s as resolveAuthStatePath } from "./source-check-D7Bxh6-e.js";
import { C as resolveExternalAuthProfilesWithPlugins } from "./provider-runtime-khVgWetm.js";
import fs from "node:fs";
import path from "node:path";
import { execFileSync, execSync } from "node:child_process";
import { createHash } from "node:crypto";
//#region src/agents/auth-profiles/constants.ts
const CLAUDE_CLI_PROFILE_ID = "anthropic:claude-cli";
const CODEX_CLI_PROFILE_ID = "openai-codex:codex-cli";
const OPENAI_CODEX_DEFAULT_PROFILE_ID = "openai-codex:default";
const MINIMAX_CLI_PROFILE_ID = "minimax-portal:minimax-cli";
const AUTH_STORE_LOCK_OPTIONS = {
	retries: {
		retries: 10,
		factor: 2,
		minTimeout: 100,
		maxTimeout: 1e4,
		randomize: true
	},
	stale: 3e4
};
const EXTERNAL_CLI_SYNC_TTL_MS = 900 * 1e3;
const log$1 = createSubsystemLogger("agents/auth-profiles");
//#endregion
//#region src/agents/auth-profiles/external-auth.ts
let resolveExternalAuthProfilesForRuntime;
function normalizeExternalAuthProfile(profile) {
	if (!profile?.profileId || !profile.credential) return null;
	return {
		...profile,
		persistence: profile.persistence ?? "runtime-only"
	};
}
function resolveExternalAuthProfileMap(params) {
	const env = params.env ?? process.env;
	const profiles = (resolveExternalAuthProfilesForRuntime ?? resolveExternalAuthProfilesWithPlugins)({
		env,
		context: {
			config: void 0,
			agentDir: params.agentDir,
			workspaceDir: void 0,
			env,
			store: params.store
		}
	});
	const resolved = /* @__PURE__ */ new Map();
	for (const rawProfile of profiles) {
		const profile = normalizeExternalAuthProfile(rawProfile);
		if (!profile) continue;
		resolved.set(profile.profileId, profile);
	}
	return resolved;
}
function oauthCredentialMatches(a, b) {
	return a.type === b.type && a.provider === b.provider && a.access === b.access && a.refresh === b.refresh && a.expires === b.expires && a.clientId === b.clientId && a.email === b.email && a.displayName === b.displayName && a.enterpriseUrl === b.enterpriseUrl && a.projectId === b.projectId && a.accountId === b.accountId;
}
function overlayExternalAuthProfiles(store, params) {
	const profiles = resolveExternalAuthProfileMap({
		store,
		agentDir: params?.agentDir,
		env: params?.env
	});
	if (profiles.size === 0) return store;
	const next = structuredClone(store);
	for (const [profileId, profile] of profiles) next.profiles[profileId] = profile.credential;
	return next;
}
function shouldPersistExternalAuthProfile(params) {
	const external = resolveExternalAuthProfileMap({
		store: params.store,
		agentDir: params.agentDir,
		env: params.env
	}).get(params.profileId);
	if (!external || external.persistence === "persisted") return true;
	return !oauthCredentialMatches(external.credential, params.credential);
}
//#endregion
//#region src/agents/cli-credentials.ts
const log = createSubsystemLogger("agents/auth-profiles");
const CLAUDE_CLI_CREDENTIALS_RELATIVE_PATH = ".claude/.credentials.json";
const CODEX_CLI_AUTH_FILENAME = "auth.json";
const MINIMAX_CLI_CREDENTIALS_RELATIVE_PATH = ".minimax/oauth_creds.json";
const CLAUDE_CLI_KEYCHAIN_SERVICE = "Claude Code-credentials";
let claudeCliCache = null;
let codexCliCache = null;
let minimaxCliCache = null;
function resolveClaudeCliCredentialsPath(homeDir) {
	const baseDir = homeDir ?? resolveUserPath("~");
	return path.join(baseDir, CLAUDE_CLI_CREDENTIALS_RELATIVE_PATH);
}
function parseClaudeCliOauthCredential(claudeOauth) {
	if (!claudeOauth || typeof claudeOauth !== "object") return null;
	const accessToken = claudeOauth.accessToken;
	const refreshToken = claudeOauth.refreshToken;
	const expiresAt = claudeOauth.expiresAt;
	if (typeof accessToken !== "string" || !accessToken) return null;
	if (typeof expiresAt !== "number" || !Number.isFinite(expiresAt) || expiresAt <= 0) return null;
	if (typeof refreshToken === "string" && refreshToken) return {
		type: "oauth",
		provider: "anthropic",
		access: accessToken,
		refresh: refreshToken,
		expires: expiresAt
	};
	return {
		type: "token",
		provider: "anthropic",
		token: accessToken,
		expires: expiresAt
	};
}
function resolveCodexHomePath(codexHome) {
	const configured = codexHome ?? process.env.CODEX_HOME;
	const home = configured ? resolveUserPath(configured) : resolveUserPath("~/.codex");
	try {
		return fs.realpathSync.native(home);
	} catch {
		return home;
	}
}
function resolveMiniMaxCliCredentialsPath(homeDir) {
	const baseDir = homeDir ?? resolveUserPath("~");
	return path.join(baseDir, MINIMAX_CLI_CREDENTIALS_RELATIVE_PATH);
}
function readFileMtimeMs(filePath) {
	try {
		return fs.statSync(filePath).mtimeMs;
	} catch {
		return null;
	}
}
function readCachedCliCredential(options) {
	const { ttlMs, cache, cacheKey, read, setCache, readSourceFingerprint } = options;
	if (ttlMs <= 0) return read();
	const now = Date.now();
	const sourceFingerprint = readSourceFingerprint?.();
	if (cache && cache.cacheKey === cacheKey && cache.sourceFingerprint === sourceFingerprint && now - cache.readAt < ttlMs) return cache.value;
	const value = read();
	const cachedSourceFingerprint = readSourceFingerprint?.();
	if (!readSourceFingerprint || cachedSourceFingerprint === sourceFingerprint) setCache({
		value,
		readAt: now,
		cacheKey,
		sourceFingerprint: cachedSourceFingerprint
	});
	else setCache(null);
	return value;
}
function computeCodexKeychainAccount(codexHome) {
	return `cli|${createHash("sha256").update(codexHome).digest("hex").slice(0, 16)}`;
}
function resolveCodexKeychainParams(options) {
	return {
		platform: options?.platform ?? process.platform,
		execSyncImpl: options?.execSync ?? execSync,
		codexHome: resolveCodexHomePath(options?.codexHome)
	};
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
function readCodexKeychainAuthRecord(options) {
	const { platform, execSyncImpl, codexHome } = resolveCodexKeychainParams(options);
	if (platform !== "darwin") return null;
	const account = computeCodexKeychainAccount(codexHome);
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
		return JSON.parse(secret);
	} catch {
		return null;
	}
}
function readCodexKeychainCredentials(options) {
	const parsed = readCodexKeychainAuthRecord(options);
	if (!parsed) return null;
	const tokens = parsed.tokens;
	try {
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
function readClaudeCliKeychainCredentials(execSyncImpl = execSync) {
	try {
		const result = execSyncImpl(`security find-generic-password -s "${CLAUDE_CLI_KEYCHAIN_SERVICE}" -w`, {
			encoding: "utf8",
			timeout: 5e3,
			stdio: [
				"pipe",
				"pipe",
				"pipe"
			]
		});
		return parseClaudeCliOauthCredential(JSON.parse(result.trim())?.claudeAiOauth);
	} catch {
		return null;
	}
}
function readClaudeCliCredentials(options) {
	if ((options?.platform ?? process.platform) === "darwin" && options?.allowKeychainPrompt !== false) {
		const keychainCreds = readClaudeCliKeychainCredentials(options?.execSync);
		if (keychainCreds) {
			log.info("read anthropic credentials from claude cli keychain", { type: keychainCreds.type });
			return keychainCreds;
		}
	}
	const raw = loadJsonFile(resolveClaudeCliCredentialsPath(options?.homeDir));
	if (!raw || typeof raw !== "object") return null;
	return parseClaudeCliOauthCredential(raw.claudeAiOauth);
}
function readClaudeCliCredentialsCached(options) {
	return readCachedCliCredential({
		ttlMs: options?.ttlMs ?? 0,
		cache: claudeCliCache,
		cacheKey: resolveClaudeCliCredentialsPath(options?.homeDir),
		read: () => readClaudeCliCredentials({
			allowKeychainPrompt: options?.allowKeychainPrompt,
			platform: options?.platform,
			homeDir: options?.homeDir,
			execSync: options?.execSync
		}),
		setCache: (next) => {
			claudeCliCache = next;
		}
	});
}
function buildUpdatedCodexAuthRecord(existing, newCredentials) {
	const next = existing ? { ...existing } : {};
	const existingTokens = next.tokens && typeof next.tokens === "object" ? next.tokens : {};
	next.auth_mode = next.auth_mode ?? "chatgpt";
	next.tokens = {
		...existingTokens,
		access_token: newCredentials.access,
		refresh_token: newCredentials.refresh,
		...typeof newCredentials.accountId === "string" && newCredentials.accountId.trim().length > 0 ? { account_id: newCredentials.accountId } : {}
	};
	next.last_refresh = (/* @__PURE__ */ new Date()).toISOString();
	return next;
}
function writeCodexCliKeychainCredentials(newCredentials, options) {
	const { platform, codexHome } = resolveCodexKeychainParams(options);
	if (platform !== "darwin") return false;
	const existing = readCodexKeychainAuthRecord(options);
	if (!existing) return false;
	const execFileSyncImpl = options?.execFileSync ?? execFileSync;
	const account = computeCodexKeychainAccount(codexHome);
	const next = buildUpdatedCodexAuthRecord(existing, newCredentials);
	try {
		execFileSyncImpl("security", [
			"add-generic-password",
			"-U",
			"-s",
			"Codex Auth",
			"-a",
			account,
			"-w",
			JSON.stringify(next)
		], {
			encoding: "utf8",
			timeout: 5e3,
			stdio: [
				"pipe",
				"pipe",
				"pipe"
			]
		});
		codexCliCache = null;
		log.info("wrote refreshed credentials to codex cli keychain", { expires: new Date(newCredentials.expires).toISOString() });
		return true;
	} catch (error) {
		log.warn("failed to write credentials to codex cli keychain", { error: formatErrorMessage(error) });
		return false;
	}
}
function writeCodexCliFileCredentials(newCredentials, options) {
	const codexHome = resolveCodexHomePath(options?.codexHome);
	const authPath = path.join(codexHome, CODEX_CLI_AUTH_FILENAME);
	if (!fs.existsSync(authPath)) return false;
	try {
		const raw = loadJsonFile(authPath);
		if (!raw || typeof raw !== "object") return false;
		saveJsonFile(authPath, buildUpdatedCodexAuthRecord(raw, newCredentials));
		codexCliCache = null;
		log.info("wrote refreshed credentials to codex cli file", { expires: new Date(newCredentials.expires).toISOString() });
		return true;
	} catch (error) {
		log.warn("failed to write credentials to codex cli file", { error: formatErrorMessage(error) });
		return false;
	}
}
function writeCodexCliCredentials(newCredentials, options) {
	const platform = options?.platform ?? process.platform;
	const writeKeychain = options?.writeKeychain ?? writeCodexCliKeychainCredentials;
	const writeFile = options?.writeFile ?? ((credentials, fileOptions) => writeCodexCliFileCredentials(credentials, fileOptions));
	if (platform === "darwin" && writeKeychain(newCredentials, {
		codexHome: options?.codexHome,
		platform,
		execSync: options?.execSync,
		execFileSync: options?.execFileSync
	})) return true;
	return writeFile(newCredentials, { codexHome: options?.codexHome });
}
function readCodexCliCredentials(options) {
	const keychain = readCodexKeychainCredentials({
		codexHome: options?.codexHome,
		platform: options?.platform,
		execSync: options?.execSync
	});
	if (keychain) return keychain;
	const authPath = path.join(resolveCodexHomePath(options?.codexHome), CODEX_CLI_AUTH_FILENAME);
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
	const authPath = path.join(resolveCodexHomePath(options?.codexHome), CODEX_CLI_AUTH_FILENAME);
	return readCachedCliCredential({
		ttlMs: options?.ttlMs ?? 0,
		cache: codexCliCache,
		cacheKey: `${options?.platform ?? process.platform}|${authPath}`,
		read: () => readCodexCliCredentials({
			codexHome: options?.codexHome,
			platform: options?.platform,
			execSync: options?.execSync
		}),
		setCache: (next) => {
			codexCliCache = next;
		},
		readSourceFingerprint: () => readFileMtimeMs(authPath)
	});
}
function readMiniMaxCliCredentialsCached(options) {
	const credPath = resolveMiniMaxCliCredentialsPath(options?.homeDir);
	return readCachedCliCredential({
		ttlMs: options?.ttlMs ?? 0,
		cache: minimaxCliCache,
		cacheKey: credPath,
		read: () => readMiniMaxCliCredentials({ homeDir: options?.homeDir }),
		setCache: (next) => {
			minimaxCliCache = next;
		},
		readSourceFingerprint: () => readFileMtimeMs(credPath)
	});
}
//#endregion
//#region src/agents/auth-profiles/external-cli-sync.ts
function areOAuthCredentialsEquivalent(a, b) {
	if (!a) return false;
	if (a.type !== "oauth") return false;
	return a.provider === b.provider && a.access === b.access && a.refresh === b.refresh && a.expires === b.expires && a.email === b.email && a.enterpriseUrl === b.enterpriseUrl && a.projectId === b.projectId && a.accountId === b.accountId && a.managedBy === b.managedBy;
}
function hasNewerStoredOAuthCredential(existing, incoming) {
	return Boolean(existing && existing.provider === incoming.provider && Number.isFinite(existing.expires) && (!Number.isFinite(incoming.expires) || existing.expires > incoming.expires));
}
function shouldReplaceStoredOAuthCredential(existing, incoming) {
	if (!existing || existing.type !== "oauth") return true;
	if (areOAuthCredentialsEquivalent(existing, incoming)) return false;
	return !hasNewerStoredOAuthCredential(existing, incoming);
}
const EXTERNAL_CLI_SYNC_PROVIDERS = [{
	profileId: MINIMAX_CLI_PROFILE_ID,
	provider: "minimax-portal",
	managedBy: "minimax-cli",
	readCredentials: () => readMiniMaxCliCredentialsCached({ ttlMs: EXTERNAL_CLI_SYNC_TTL_MS })
}, {
	profileId: OPENAI_CODEX_DEFAULT_PROFILE_ID,
	provider: "openai-codex",
	managedBy: "codex-cli",
	readCredentials: () => readCodexCliCredentialsCached({ ttlMs: EXTERNAL_CLI_SYNC_TTL_MS })
}];
function withExternalCliManager(creds, managedBy) {
	return {
		...creds,
		managedBy
	};
}
function resolveExternalCliSyncProvider(params) {
	const byProfileId = typeof params.profileId === "string" ? EXTERNAL_CLI_SYNC_PROVIDERS.find((entry) => entry.profileId === params.profileId) : void 0;
	if (byProfileId) return byProfileId;
	const managedBy = params.credential?.managedBy;
	if (!managedBy) return null;
	return EXTERNAL_CLI_SYNC_PROVIDERS.find((entry) => entry.managedBy === managedBy && (!params.credential || entry.provider === params.credential.provider)) ?? null;
}
function readManagedExternalCliCredential(params) {
	const provider = resolveExternalCliSyncProvider(params);
	if (!provider) return null;
	const creds = provider.readCredentials();
	if (!creds) return null;
	return withExternalCliManager(creds, provider.managedBy);
}
/** Sync external CLI credentials into the store for a given provider. */
function syncExternalCliCredentialsForProvider(store, providerConfig, options) {
	const { profileId, provider, managedBy, readCredentials } = providerConfig;
	const existing = store.profiles[profileId];
	const creds = readCredentials();
	if (!creds) return false;
	const managedCreds = withExternalCliManager(creds, managedBy);
	const existingOAuth = existing?.type === "oauth" ? existing : void 0;
	if (!shouldReplaceStoredOAuthCredential(existingOAuth, managedCreds)) {
		if (options.log !== false) {
			if (!areOAuthCredentialsEquivalent(existingOAuth, managedCreds) && existingOAuth) log$1.debug(`kept newer stored ${provider} credentials over external cli sync`, {
				profileId,
				storedExpires: new Date(existingOAuth.expires).toISOString(),
				externalExpires: Number.isFinite(managedCreds.expires) ? new Date(managedCreds.expires).toISOString() : null
			});
		}
		return false;
	}
	store.profiles[profileId] = managedCreds;
	if (options.log !== false) log$1.info(`synced ${provider} credentials from external cli`, {
		profileId,
		expires: new Date(managedCreds.expires).toISOString(),
		managedBy
	});
	return true;
}
/**
* Sync OAuth credentials from external CLI tools (MiniMax CLI, Codex CLI)
* into the store.
*
* Returns true if any credentials were updated.
*/
function syncExternalCliCredentials(store, options = {}) {
	let mutated = false;
	for (const provider of EXTERNAL_CLI_SYNC_PROVIDERS) if (syncExternalCliCredentialsForProvider(store, provider, options)) mutated = true;
	return mutated;
}
//#endregion
//#region src/agents/auth-profiles/paths.ts
function ensureAuthStoreFile(pathname) {
	if (fs.existsSync(pathname)) return;
	saveJsonFile(pathname, {
		version: 1,
		profiles: {}
	});
}
//#endregion
//#region src/agents/auth-profiles/state.ts
function normalizeAuthProfileOrder(raw) {
	if (!raw || typeof raw !== "object") return;
	const normalized = Object.entries(raw).reduce((acc, [provider, value]) => {
		if (!Array.isArray(value)) return acc;
		const list = value.map((entry) => normalizeOptionalString(entry) ?? "").filter(Boolean);
		if (list.length > 0) acc[provider] = list;
		return acc;
	}, {});
	return Object.keys(normalized).length > 0 ? normalized : void 0;
}
function coerceAuthProfileState(raw) {
	if (!raw || typeof raw !== "object") return {};
	const record = raw;
	return {
		order: normalizeAuthProfileOrder(record.order),
		lastGood: record.lastGood && typeof record.lastGood === "object" ? record.lastGood : void 0,
		usageStats: record.usageStats && typeof record.usageStats === "object" ? record.usageStats : void 0
	};
}
function mergeAuthProfileState(base, override) {
	const mergeRecord = (left, right) => {
		if (!left && !right) return;
		if (!left) return { ...right };
		if (!right) return { ...left };
		return {
			...left,
			...right
		};
	};
	return {
		order: mergeRecord(base.order, override.order),
		lastGood: mergeRecord(base.lastGood, override.lastGood),
		usageStats: mergeRecord(base.usageStats, override.usageStats)
	};
}
function loadPersistedAuthProfileState(agentDir) {
	return coerceAuthProfileState(loadJsonFile(resolveAuthStatePath(agentDir)));
}
function buildPersistedAuthProfileState(store) {
	const state = coerceAuthProfileState(store);
	if (!state.order && !state.lastGood && !state.usageStats) return null;
	return {
		version: 1,
		...state.order ? { order: state.order } : {},
		...state.lastGood ? { lastGood: state.lastGood } : {},
		...state.usageStats ? { usageStats: state.usageStats } : {}
	};
}
function savePersistedAuthProfileState(store, agentDir) {
	const payload = buildPersistedAuthProfileState(store);
	const statePath = resolveAuthStatePath(agentDir);
	if (!payload) {
		try {
			fs.unlinkSync(statePath);
		} catch (error) {
			if (error?.code !== "ENOENT") throw error;
		}
		return null;
	}
	saveJsonFile(statePath, payload);
	return payload;
}
//#endregion
//#region src/agents/auth-profiles/persisted.ts
const AUTH_PROFILE_TYPES = new Set([
	"api_key",
	"oauth",
	"token"
]);
function normalizeSecretBackedField(params) {
	const value = params.entry[params.valueField];
	if (value == null || typeof value === "string") return;
	const ref = coerceSecretRef(value);
	if (ref && !coerceSecretRef(params.entry[params.refField])) params.entry[params.refField] = ref;
	delete params.entry[params.valueField];
}
function normalizeRawCredentialEntry(raw) {
	const entry = { ...raw };
	if (!("type" in entry) && typeof entry["mode"] === "string") entry["type"] = entry["mode"];
	if (!("key" in entry) && typeof entry["apiKey"] === "string") entry["key"] = entry["apiKey"];
	normalizeSecretBackedField({
		entry,
		valueField: "key",
		refField: "keyRef"
	});
	normalizeSecretBackedField({
		entry,
		valueField: "token",
		refField: "tokenRef"
	});
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
function coerceLegacyAuthStore(raw) {
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
function coercePersistedAuthProfileStore(raw) {
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
	return {
		version: Number(record.version ?? 1),
		profiles: normalized,
		...coerceAuthProfileState(record)
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
function buildPersistedAuthProfileSecretsStore(store, shouldPersistProfile) {
	return {
		version: 1,
		profiles: Object.fromEntries(Object.entries(store.profiles).flatMap(([profileId, credential]) => {
			if (shouldPersistProfile && !shouldPersistProfile({
				profileId,
				credential
			})) return [];
			if (credential.type === "api_key" && credential.keyRef && credential.key !== void 0) {
				const sanitized = { ...credential };
				delete sanitized.key;
				return [[profileId, sanitized]];
			}
			if (credential.type === "token" && credential.tokenRef && credential.token !== void 0) {
				const sanitized = { ...credential };
				delete sanitized.token;
				return [[profileId, sanitized]];
			}
			return [[profileId, credential]];
		}))
	};
}
function applyLegacyAuthStore(store, legacy) {
	for (const [provider, cred] of Object.entries(legacy)) {
		const profileId = `${provider}:default`;
		const credentialProvider = cred.provider ?? provider;
		if (cred.type === "api_key") {
			store.profiles[profileId] = {
				type: "api_key",
				provider: credentialProvider,
				key: cred.key,
				...cred.email ? { email: cred.email } : {}
			};
			continue;
		}
		if (cred.type === "token") {
			store.profiles[profileId] = {
				type: "token",
				provider: credentialProvider,
				token: cred.token,
				...typeof cred.expires === "number" ? { expires: cred.expires } : {},
				...cred.email ? { email: cred.email } : {}
			};
			continue;
		}
		store.profiles[profileId] = {
			type: "oauth",
			provider: credentialProvider,
			access: cred.access,
			refresh: cred.refresh,
			expires: cred.expires,
			...cred.enterpriseUrl ? { enterpriseUrl: cred.enterpriseUrl } : {},
			...cred.projectId ? { projectId: cred.projectId } : {},
			...cred.accountId ? { accountId: cred.accountId } : {},
			...cred.email ? { email: cred.email } : {},
			...cred.managedBy ? { managedBy: cred.managedBy } : {}
		};
	}
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
function loadPersistedAuthProfileStore(agentDir) {
	const raw = loadJsonFile(resolveAuthStorePath(agentDir));
	const store = coercePersistedAuthProfileStore(raw);
	if (!store) return null;
	return {
		...store,
		...mergeAuthProfileState(coerceAuthProfileState(raw), loadPersistedAuthProfileState(agentDir))
	};
}
function loadLegacyAuthProfileStore(agentDir) {
	return coerceLegacyAuthStore(loadJsonFile(resolveLegacyAuthStorePath(agentDir)));
}
//#endregion
//#region src/agents/auth-profiles/store.ts
const loadedAuthStoreCache = /* @__PURE__ */ new Map();
function cloneAuthProfileStore(store) {
	return structuredClone(store);
}
function resolveRuntimeAuthProfileStore(agentDir) {
	const mainKey = resolveAuthStorePath(void 0);
	const requestedKey = resolveAuthStorePath(agentDir);
	const mainStore = getRuntimeAuthProfileStoreSnapshot(void 0);
	const requestedStore = getRuntimeAuthProfileStoreSnapshot(agentDir);
	if (!agentDir || requestedKey === mainKey) {
		if (!mainStore) return null;
		return mainStore;
	}
	if (mainStore && requestedStore) return mergeAuthProfileStores(mainStore, requestedStore);
	if (requestedStore) return requestedStore;
	if (mainStore) return mainStore;
	return null;
}
function readAuthStoreMtimeMs(authPath) {
	try {
		return fs.statSync(authPath).mtimeMs;
	} catch {
		return null;
	}
}
function readCachedAuthProfileStore(params) {
	const cached = loadedAuthStoreCache.get(params.authPath);
	if (!cached || cached.authMtimeMs !== params.authMtimeMs || cached.stateMtimeMs !== params.stateMtimeMs) return null;
	if (Date.now() - cached.syncedAtMs >= 9e5) return null;
	return cloneAuthProfileStore(cached.store);
}
function writeCachedAuthProfileStore(params) {
	loadedAuthStoreCache.set(params.authPath, {
		authMtimeMs: params.authMtimeMs,
		stateMtimeMs: params.stateMtimeMs,
		syncedAtMs: Date.now(),
		store: cloneAuthProfileStore(params.store)
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
function shouldSyncExternalCliCredentials(options) {
	return options?.syncExternalCli !== false;
}
function loadAuthProfileStore() {
	const asStore = loadPersistedAuthProfileStore();
	if (asStore) {
		syncExternalCliCredentialsTimed(asStore);
		return overlayExternalAuthProfiles(asStore);
	}
	const legacy = loadLegacyAuthProfileStore();
	if (legacy) {
		const store = {
			version: 1,
			profiles: {}
		};
		applyLegacyAuthStore(store, legacy);
		syncExternalCliCredentialsTimed(store);
		return overlayExternalAuthProfiles(store);
	}
	const store = {
		version: 1,
		profiles: {}
	};
	syncExternalCliCredentialsTimed(store);
	return overlayExternalAuthProfiles(store);
}
function loadAuthProfileStoreForAgent(agentDir, options) {
	const readOnly = options?.readOnly === true;
	const authPath = resolveAuthStorePath(agentDir);
	const statePath = resolveAuthStatePath(agentDir);
	const authMtimeMs = readAuthStoreMtimeMs(authPath);
	const stateMtimeMs = readAuthStoreMtimeMs(statePath);
	if (!readOnly) {
		const cached = readCachedAuthProfileStore({
			authPath,
			authMtimeMs,
			stateMtimeMs
		});
		if (cached) return cached;
	}
	const asStore = loadPersistedAuthProfileStore(agentDir);
	if (asStore) {
		if (shouldSyncExternalCliCredentials(options)) syncExternalCliCredentialsTimed(asStore, { log: !readOnly });
		if (!readOnly) writeCachedAuthProfileStore({
			authPath,
			authMtimeMs: readAuthStoreMtimeMs(authPath),
			stateMtimeMs: readAuthStoreMtimeMs(statePath),
			store: asStore
		});
		return asStore;
	}
	if (agentDir && !readOnly) {
		const mainStore = loadPersistedAuthProfileStore();
		if (mainStore && Object.keys(mainStore.profiles).length > 0) {
			saveJsonFile(authPath, buildPersistedAuthProfileSecretsStore(mainStore));
			log$1.info("inherited auth-profiles from main agent", { agentDir });
			const inherited = {
				version: mainStore.version,
				profiles: { ...mainStore.profiles }
			};
			writeCachedAuthProfileStore({
				authPath,
				authMtimeMs: readAuthStoreMtimeMs(authPath),
				stateMtimeMs: readAuthStoreMtimeMs(statePath),
				store: inherited
			});
			return inherited;
		}
	}
	const legacy = loadLegacyAuthProfileStore(agentDir);
	const store = {
		version: 1,
		profiles: {}
	};
	if (legacy) applyLegacyAuthStore(store, legacy);
	const mergedOAuth = mergeOAuthFileIntoStore(store);
	if (shouldSyncExternalCliCredentials(options)) syncExternalCliCredentialsTimed(store, { log: !readOnly });
	const forceReadOnly = process.env.OPENCLAW_AUTH_STORE_READONLY === "1";
	const shouldWrite = !readOnly && !forceReadOnly && (legacy !== null || mergedOAuth);
	if (shouldWrite) saveAuthProfileStore(store, agentDir);
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
	if (!readOnly) writeCachedAuthProfileStore({
		authPath,
		authMtimeMs: readAuthStoreMtimeMs(authPath),
		stateMtimeMs: readAuthStoreMtimeMs(statePath),
		store
	});
	return store;
}
function loadAuthProfileStoreForRuntime(agentDir, options) {
	const store = loadAuthProfileStoreForAgent(agentDir, options);
	const authPath = resolveAuthStorePath(agentDir);
	const mainAuthPath = resolveAuthStorePath();
	if (!agentDir || authPath === mainAuthPath) return overlayExternalAuthProfiles(store, { agentDir });
	return overlayExternalAuthProfiles(mergeAuthProfileStores(loadAuthProfileStoreForAgent(void 0, options), store), { agentDir });
}
function loadAuthProfileStoreForSecretsRuntime(agentDir) {
	return loadAuthProfileStoreForRuntime(agentDir, {
		readOnly: true,
		allowKeychainPrompt: false
	});
}
function ensureAuthProfileStore(agentDir, options) {
	const runtimeStore = resolveRuntimeAuthProfileStore(agentDir);
	if (runtimeStore) return overlayExternalAuthProfiles(runtimeStore, { agentDir });
	const store = loadAuthProfileStoreForAgent(agentDir, options);
	const authPath = resolveAuthStorePath(agentDir);
	const mainAuthPath = resolveAuthStorePath();
	if (!agentDir || authPath === mainAuthPath) return overlayExternalAuthProfiles(store, { agentDir });
	return overlayExternalAuthProfiles(mergeAuthProfileStores(loadAuthProfileStoreForAgent(void 0, options), store), { agentDir });
}
function ensureAuthProfileStoreForLocalUpdate(agentDir) {
	const store = loadAuthProfileStoreForAgent(agentDir, { syncExternalCli: false });
	const authPath = resolveAuthStorePath(agentDir);
	const mainAuthPath = resolveAuthStorePath();
	if (!agentDir || authPath === mainAuthPath) return store;
	return mergeAuthProfileStores(loadAuthProfileStoreForAgent(void 0, {
		readOnly: true,
		syncExternalCli: false
	}), store);
}
function replaceRuntimeAuthProfileStoreSnapshots(entries) {
	replaceRuntimeAuthProfileStoreSnapshots$1(entries);
}
function clearRuntimeAuthProfileStoreSnapshots() {
	clearRuntimeAuthProfileStoreSnapshots$1();
	loadedAuthStoreCache.clear();
}
function saveAuthProfileStore(store, agentDir, options) {
	const authPath = resolveAuthStorePath(agentDir);
	const statePath = resolveAuthStatePath(agentDir);
	saveJsonFile(authPath, buildPersistedAuthProfileSecretsStore(store, ({ profileId, credential }) => {
		if (credential.type !== "oauth") return true;
		if (options?.filterExternalAuthProfiles === false) return true;
		return shouldPersistExternalAuthProfile({
			store,
			profileId,
			credential,
			agentDir
		});
	}));
	savePersistedAuthProfileState(store, agentDir);
	const runtimeStore = cloneAuthProfileStore(store);
	if (shouldSyncExternalCliCredentials(options)) syncExternalCliCredentialsTimed(runtimeStore, { log: false });
	writeCachedAuthProfileStore({
		authPath,
		authMtimeMs: readAuthStoreMtimeMs(authPath),
		stateMtimeMs: readAuthStoreMtimeMs(statePath),
		store: runtimeStore
	});
	if (hasRuntimeAuthProfileStoreSnapshot(agentDir)) setRuntimeAuthProfileStoreSnapshot(runtimeStore, agentDir);
}
//#endregion
export { writeCodexCliCredentials as _, loadAuthProfileStoreForRuntime as a, CODEX_CLI_PROFILE_ID as b, saveAuthProfileStore as c, loadPersistedAuthProfileStore as d, ensureAuthStoreFile as f, readCodexCliCredentialsCached as g, readClaudeCliCredentialsCached as h, loadAuthProfileStore as i, updateAuthProfileStoreWithLock as l, readManagedExternalCliCredential as m, ensureAuthProfileStore as n, loadAuthProfileStoreForSecretsRuntime as o, areOAuthCredentialsEquivalent as p, ensureAuthProfileStoreForLocalUpdate as r, replaceRuntimeAuthProfileStoreSnapshots as s, clearRuntimeAuthProfileStoreSnapshots as t, coercePersistedAuthProfileStore as u, AUTH_STORE_LOCK_OPTIONS as v, log$1 as x, CLAUDE_CLI_PROFILE_ID as y };
