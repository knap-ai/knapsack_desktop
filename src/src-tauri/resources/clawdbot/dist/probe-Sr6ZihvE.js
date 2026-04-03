import { _ as normalizeAccountId, g as DEFAULT_ACCOUNT_ID, v as normalizeOptionalAccountId } from "./session-key-D7XpmyVq.js";
import { i as coerceSecretRef } from "./types.secrets-DTXJhyWe.js";
import { s as resolveMergedAccountConfig, t as createAccountListHelpers } from "./account-helpers-DqNwQN08.js";
import "./config-runtime-CmISCurQ.js";
import "./account-resolution-CahYTlaB.js";
import { HttpsProxyAgent } from "https-proxy-agent";
import * as Lark from "@larksuiteoapi/node-sdk";
//#region extensions/feishu/src/accounts.ts
const { listConfiguredAccountIds, listAccountIds: listFeishuAccountIds, resolveDefaultAccountId } = createAccountListHelpers("feishu", { allowUnlistedDefaultAccount: true });
function normalizeString(value) {
	if (typeof value !== "string") return;
	const trimmed = value.trim();
	return trimmed ? trimmed : void 0;
}
function formatSecretRefLabel(ref) {
	return `${ref.source}:${ref.provider}:${ref.id}`;
}
var FeishuSecretRefUnavailableError = class extends Error {
	constructor(path, ref) {
		super(`${path}: unresolved SecretRef "${formatSecretRefLabel(ref)}". Resolve this command against an active gateway runtime snapshot before reading it.`);
		this.name = "FeishuSecretRefUnavailableError";
		this.path = path;
	}
};
function resolveFeishuSecretLike(params) {
	const asString = normalizeString(params.value);
	if (asString) return asString;
	const ref = coerceSecretRef(params.value);
	if (!ref) return;
	if (params.mode === "inspect") {
		if (params.allowEnvSecretRefRead && ref.source === "env") {
			const envValue = normalizeString(process.env[ref.id]);
			if (envValue) return envValue;
		}
		return;
	}
	throw new FeishuSecretRefUnavailableError(params.path, ref);
}
function resolveFeishuBaseCredentials(cfg, mode) {
	const appId = resolveFeishuSecretLike({
		value: cfg?.appId,
		path: "channels.feishu.appId",
		mode,
		allowEnvSecretRefRead: true
	});
	const appSecret = resolveFeishuSecretLike({
		value: cfg?.appSecret,
		path: "channels.feishu.appSecret",
		mode,
		allowEnvSecretRefRead: true
	});
	if (!appId || !appSecret) return null;
	return {
		appId,
		appSecret,
		domain: cfg?.domain ?? "feishu"
	};
}
function resolveFeishuEventSecrets(cfg, mode) {
	return {
		encryptKey: (cfg?.connectionMode ?? "websocket") === "webhook" ? resolveFeishuSecretLike({
			value: cfg?.encryptKey,
			path: "channels.feishu.encryptKey",
			mode,
			allowEnvSecretRefRead: true
		}) : normalizeString(cfg?.encryptKey),
		verificationToken: resolveFeishuSecretLike({
			value: cfg?.verificationToken,
			path: "channels.feishu.verificationToken",
			mode,
			allowEnvSecretRefRead: true
		})
	};
}
/**
* Resolve the default account selection and its source.
*/
function resolveDefaultFeishuAccountSelection(cfg) {
	const preferred = normalizeOptionalAccountId((cfg.channels?.feishu)?.defaultAccount);
	if (preferred) return {
		accountId: preferred,
		source: "explicit-default"
	};
	const ids = listFeishuAccountIds(cfg);
	if (ids.includes("default")) return {
		accountId: DEFAULT_ACCOUNT_ID,
		source: "mapped-default"
	};
	return {
		accountId: ids[0] ?? "default",
		source: "fallback"
	};
}
/**
* Resolve the default account ID.
*/
function resolveDefaultFeishuAccountId(cfg) {
	return resolveDefaultAccountId(cfg);
}
/**
* Merge top-level config with account-specific config.
* Account-specific fields override top-level fields.
*/
function mergeFeishuAccountConfig(cfg, accountId) {
	const feishuCfg = cfg.channels?.feishu;
	return resolveMergedAccountConfig({
		channelConfig: feishuCfg,
		accounts: feishuCfg?.accounts,
		accountId,
		omitKeys: ["defaultAccount"]
	});
}
function resolveFeishuCredentials(cfg, options) {
	const mode = options?.mode ?? (options?.allowUnresolvedSecretRef ? "inspect" : "strict");
	const base = resolveFeishuBaseCredentials(cfg, mode);
	if (!base) return null;
	const eventSecrets = resolveFeishuEventSecrets(cfg, mode);
	return {
		...base,
		...eventSecrets
	};
}
function inspectFeishuCredentials(cfg) {
	return resolveFeishuCredentials(cfg, { mode: "inspect" });
}
function buildResolvedFeishuAccount(params) {
	const hasExplicitAccountId = typeof params.accountId === "string" && params.accountId.trim() !== "";
	const defaultSelection = hasExplicitAccountId ? null : resolveDefaultFeishuAccountSelection(params.cfg);
	const accountId = hasExplicitAccountId ? normalizeAccountId(params.accountId) : defaultSelection?.accountId ?? "default";
	const selectionSource = hasExplicitAccountId ? "explicit" : defaultSelection?.source ?? "fallback";
	const baseEnabled = (params.cfg.channels?.feishu)?.enabled !== false;
	const merged = mergeFeishuAccountConfig(params.cfg, accountId);
	const accountEnabled = merged.enabled !== false;
	const enabled = baseEnabled && accountEnabled;
	const baseCreds = resolveFeishuBaseCredentials(merged, params.baseMode);
	const eventSecrets = resolveFeishuEventSecrets(merged, params.eventSecretMode);
	const accountName = merged.name;
	return {
		accountId,
		selectionSource,
		enabled,
		configured: Boolean(baseCreds),
		name: typeof accountName === "string" ? accountName.trim() || void 0 : void 0,
		appId: baseCreds?.appId,
		appSecret: baseCreds?.appSecret,
		encryptKey: eventSecrets.encryptKey,
		verificationToken: eventSecrets.verificationToken,
		domain: baseCreds?.domain ?? "feishu",
		config: merged
	};
}
/**
* Resolve a read-only Feishu account snapshot for CLI/config surfaces.
* Unresolved SecretRefs are treated as unavailable instead of throwing.
*/
function resolveFeishuAccount(params) {
	return buildResolvedFeishuAccount({
		...params,
		baseMode: "inspect",
		eventSecretMode: "inspect"
	});
}
/**
* Resolve a runtime Feishu account.
* Required app credentials stay strict; event-only secrets can be required by callers.
*/
function resolveFeishuRuntimeAccount(params, options) {
	return buildResolvedFeishuAccount({
		...params,
		baseMode: "strict",
		eventSecretMode: options?.requireEventSecrets ? "strict" : "inspect"
	});
}
/**
* List all enabled and configured accounts.
*/
function listEnabledFeishuAccounts(cfg) {
	return listFeishuAccountIds(cfg).map((accountId) => resolveFeishuAccount({
		cfg,
		accountId
	})).filter((account) => account.enabled && account.configured);
}
let feishuClientSdk = {
	AppType: Lark.AppType,
	Client: Lark.Client,
	defaultHttpInstance: Lark.defaultHttpInstance,
	Domain: Lark.Domain,
	EventDispatcher: Lark.EventDispatcher,
	LoggerLevel: Lark.LoggerLevel,
	WSClient: Lark.WSClient
};
let httpsProxyAgentCtor = HttpsProxyAgent;
/** Default HTTP timeout for Feishu API requests (30 seconds). */
const FEISHU_HTTP_TIMEOUT_MS = 3e4;
const FEISHU_HTTP_TIMEOUT_MAX_MS = 3e5;
const FEISHU_HTTP_TIMEOUT_ENV_VAR = "OPENCLAW_FEISHU_HTTP_TIMEOUT_MS";
function getWsProxyAgent() {
	const proxyUrl = process.env.https_proxy || process.env.HTTPS_PROXY || process.env.http_proxy || process.env.HTTP_PROXY;
	if (!proxyUrl) return void 0;
	return new httpsProxyAgentCtor(proxyUrl);
}
const clientCache = /* @__PURE__ */ new Map();
function resolveDomain(domain) {
	if (domain === "lark") return feishuClientSdk.Domain.Lark;
	if (domain === "feishu" || !domain) return feishuClientSdk.Domain.Feishu;
	return domain.replace(/\/+$/, "");
}
/**
* Create an HTTP instance that delegates to the Lark SDK's default instance
* but injects a default request timeout to prevent indefinite hangs
* (e.g. when the Feishu API is slow, causing per-chat queue deadlocks).
*/
function createTimeoutHttpInstance(defaultTimeoutMs) {
	const base = feishuClientSdk.defaultHttpInstance;
	function injectTimeout(opts) {
		return {
			timeout: defaultTimeoutMs,
			...opts
		};
	}
	return {
		request: (opts) => base.request(injectTimeout(opts)),
		get: (url, opts) => base.get(url, injectTimeout(opts)),
		post: (url, data, opts) => base.post(url, data, injectTimeout(opts)),
		put: (url, data, opts) => base.put(url, data, injectTimeout(opts)),
		patch: (url, data, opts) => base.patch(url, data, injectTimeout(opts)),
		delete: (url, opts) => base.delete(url, injectTimeout(opts)),
		head: (url, opts) => base.head(url, injectTimeout(opts)),
		options: (url, opts) => base.options(url, injectTimeout(opts))
	};
}
function resolveConfiguredHttpTimeoutMs(creds) {
	const clampTimeout = (value) => {
		return Math.min(Math.max(Math.floor(value), 1), FEISHU_HTTP_TIMEOUT_MAX_MS);
	};
	const fromDirectField = creds.httpTimeoutMs;
	if (typeof fromDirectField === "number" && Number.isFinite(fromDirectField) && fromDirectField > 0) return clampTimeout(fromDirectField);
	const envRaw = process.env[FEISHU_HTTP_TIMEOUT_ENV_VAR];
	if (envRaw) {
		const envValue = Number(envRaw);
		if (Number.isFinite(envValue) && envValue > 0) return clampTimeout(envValue);
	}
	const timeout = creds.config?.httpTimeoutMs;
	if (typeof timeout !== "number" || !Number.isFinite(timeout) || timeout <= 0) return FEISHU_HTTP_TIMEOUT_MS;
	return clampTimeout(timeout);
}
/**
* Create or get a cached Feishu client for an account.
* Accepts any object with appId, appSecret, and optional domain/accountId.
*/
function createFeishuClient(creds) {
	const { accountId = "default", appId, appSecret, domain } = creds;
	const defaultHttpTimeoutMs = resolveConfiguredHttpTimeoutMs(creds);
	if (!appId || !appSecret) throw new Error(`Feishu credentials not configured for account "${accountId}"`);
	const cached = clientCache.get(accountId);
	if (cached && cached.config.appId === appId && cached.config.appSecret === appSecret && cached.config.domain === domain && cached.config.httpTimeoutMs === defaultHttpTimeoutMs) return cached.client;
	const client = new feishuClientSdk.Client({
		appId,
		appSecret,
		appType: feishuClientSdk.AppType.SelfBuild,
		domain: resolveDomain(domain),
		httpInstance: createTimeoutHttpInstance(defaultHttpTimeoutMs)
	});
	clientCache.set(accountId, {
		client,
		config: {
			appId,
			appSecret,
			domain,
			httpTimeoutMs: defaultHttpTimeoutMs
		}
	});
	return client;
}
/**
* Create a Feishu WebSocket client for an account.
* Note: WSClient is not cached since each call creates a new connection.
*/
function createFeishuWSClient(account) {
	const { accountId, appId, appSecret, domain } = account;
	if (!appId || !appSecret) throw new Error(`Feishu credentials not configured for account "${accountId}"`);
	const agent = getWsProxyAgent();
	return new feishuClientSdk.WSClient({
		appId,
		appSecret,
		domain: resolveDomain(domain),
		loggerLevel: feishuClientSdk.LoggerLevel.info,
		...agent ? { agent } : {}
	});
}
/**
* Create an event dispatcher for an account.
*/
function createEventDispatcher(account) {
	return new feishuClientSdk.EventDispatcher({
		encryptKey: account.encryptKey,
		verificationToken: account.verificationToken
	});
}
//#endregion
//#region extensions/feishu/src/async.ts
const RACE_TIMEOUT = Symbol("race-timeout");
const RACE_ABORT = Symbol("race-abort");
async function raceWithTimeoutAndAbort(promise, options = {}) {
	if (options.abortSignal?.aborted) return { status: "aborted" };
	if (options.timeoutMs === void 0 && !options.abortSignal) return {
		status: "resolved",
		value: await promise
	};
	let timeoutHandle;
	let abortHandler;
	const contenders = [promise];
	if (options.timeoutMs !== void 0) contenders.push(new Promise((resolve) => {
		timeoutHandle = setTimeout(() => resolve(RACE_TIMEOUT), options.timeoutMs);
	}));
	if (options.abortSignal) contenders.push(new Promise((resolve) => {
		abortHandler = () => resolve(RACE_ABORT);
		options.abortSignal?.addEventListener("abort", abortHandler, { once: true });
	}));
	try {
		const result = await Promise.race(contenders);
		if (result === RACE_TIMEOUT) return { status: "timeout" };
		if (result === RACE_ABORT) return { status: "aborted" };
		return {
			status: "resolved",
			value: result
		};
	} finally {
		if (timeoutHandle) clearTimeout(timeoutHandle);
		if (abortHandler) options.abortSignal?.removeEventListener("abort", abortHandler);
	}
}
function waitForAbortableDelay(delayMs, abortSignal) {
	if (abortSignal?.aborted) return Promise.resolve(false);
	return new Promise((resolve) => {
		const handleAbort = () => {
			clearTimeout(timer);
			resolve(false);
		};
		const timer = setTimeout(() => {
			abortSignal?.removeEventListener("abort", handleAbort);
			resolve(true);
		}, delayMs);
		timer.unref?.();
		abortSignal?.addEventListener("abort", handleAbort, { once: true });
	});
}
//#endregion
//#region extensions/feishu/src/probe.ts
/** Cache probe results to reduce repeated health-check calls.
* Gateway health checks call probeFeishu() every minute; without caching this
* burns ~43,200 calls/month, easily exceeding Feishu's free-tier quota.
* Successful bot info is effectively static, while failures are cached briefly
* to avoid hammering the API during transient outages. */
const probeCache = /* @__PURE__ */ new Map();
const PROBE_SUCCESS_TTL_MS = 600 * 1e3;
const PROBE_ERROR_TTL_MS = 60 * 1e3;
const MAX_PROBE_CACHE_SIZE = 64;
function setCachedProbeResult(cacheKey, result, ttlMs) {
	probeCache.set(cacheKey, {
		result,
		expiresAt: Date.now() + ttlMs
	});
	if (probeCache.size > MAX_PROBE_CACHE_SIZE) {
		const oldest = probeCache.keys().next().value;
		if (oldest !== void 0) probeCache.delete(oldest);
	}
	return result;
}
async function probeFeishu(creds, options = {}) {
	if (!creds?.appId || !creds?.appSecret) return {
		ok: false,
		error: "missing credentials (appId, appSecret)"
	};
	if (options.abortSignal?.aborted) return {
		ok: false,
		appId: creds.appId,
		error: "probe aborted"
	};
	const timeoutMs = options.timeoutMs ?? 1e4;
	const cacheKey = creds.accountId ?? `${creds.appId}:${creds.appSecret.slice(0, 8)}`;
	const cached = probeCache.get(cacheKey);
	if (cached && cached.expiresAt > Date.now()) return cached.result;
	try {
		const responseResult = await raceWithTimeoutAndAbort(createFeishuClient(creds).request({
			method: "GET",
			url: "/open-apis/bot/v3/info",
			data: {},
			timeout: timeoutMs
		}), {
			timeoutMs,
			abortSignal: options.abortSignal
		});
		if (responseResult.status === "aborted") return {
			ok: false,
			appId: creds.appId,
			error: "probe aborted"
		};
		if (responseResult.status === "timeout") return setCachedProbeResult(cacheKey, {
			ok: false,
			appId: creds.appId,
			error: `probe timed out after ${timeoutMs}ms`
		}, PROBE_ERROR_TTL_MS);
		const response = responseResult.value;
		if (options.abortSignal?.aborted) return {
			ok: false,
			appId: creds.appId,
			error: "probe aborted"
		};
		if (response.code !== 0) return setCachedProbeResult(cacheKey, {
			ok: false,
			appId: creds.appId,
			error: `API error: ${response.msg || `code ${response.code}`}`
		}, PROBE_ERROR_TTL_MS);
		const bot = response.bot || response.data?.bot;
		return setCachedProbeResult(cacheKey, {
			ok: true,
			appId: creds.appId,
			botName: bot?.bot_name,
			botOpenId: bot?.open_id
		}, PROBE_SUCCESS_TTL_MS);
	} catch (err) {
		return setCachedProbeResult(cacheKey, {
			ok: false,
			appId: creds.appId,
			error: err instanceof Error ? err.message : String(err)
		}, PROBE_ERROR_TTL_MS);
	}
}
//#endregion
export { createFeishuClient as a, listEnabledFeishuAccounts as c, resolveFeishuAccount as d, resolveFeishuRuntimeAccount as f, createEventDispatcher as i, listFeishuAccountIds as l, raceWithTimeoutAndAbort as n, createFeishuWSClient as o, waitForAbortableDelay as r, inspectFeishuCredentials as s, probeFeishu as t, resolveDefaultFeishuAccountId as u };
