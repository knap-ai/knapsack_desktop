import { n as redactSensitiveText } from "./redact-BDinS1q9.js";
import { n as extractErrorCode, r as formatErrorMessage } from "./errors-BxyFnvP3.js";
import { n as resolvePreferredOpenClawTmpDir } from "./tmp-openclaw-dir-idKIOMmb.js";
import { t as createSubsystemLogger } from "./subsystem-DISldKSB.js";
import { t as parseBooleanValue } from "./boolean-C3GkJetE.js";
import { g as resolveConfigDir, l as escapeRegExp, t as CONFIG_DIR, y as resolveUserPath } from "./utils-CS0Ikux6.js";
import { o as isNotFoundPathError, s as isPathInside } from "./boundary-path-Dm0QJ7-y.js";
import { r as runExec } from "./exec-B5_AYfQG.js";
import { a as getRuntimeConfigSnapshot, g as writeConfigFile, i as createConfigIO, s as loadConfig } from "./io-y3Az_Onx.js";
import { a as hasConfiguredSecretInput, d as resolveSecretInputRef } from "./types.secrets-DgX397vI.js";
import { u as secretRefKey } from "./ref-contract-D3ri29cK.js";
import { o as resolveSecretRefValues } from "./resolve-B7S4PlnO.js";
import { t as formatCliCommand } from "./command-format-DBQUhADm.js";
import { t as assertExplicitGatewayAuthModeWhenBothConfigured } from "./auth-mode-policy-D0EmeFk_.js";
import { r as isLoopbackHost } from "./net-JAg9zL0G.js";
import { a as resolveGatewayAuth } from "./auth-Buq0Niri.js";
import { c as hasGatewayPasswordEnvCandidate, d as readGatewayTokenEnv, l as hasGatewayTokenEnvCandidate } from "./credentials-D8pfRimu.js";
import { t as rawDataToString } from "./ws-B_hsocKt.js";
import { r as ensurePortAvailable } from "./ports-FldL_Lhq.js";
import { t as generateSecureToken } from "./secure-random-2W4K8IQm.js";
import { c as resizeToJpeg, i as getImageMetadata, n as buildImageResizeSideGrid, t as IMAGE_REDUCE_QUALITY_STEPS } from "./image-ops-By4YfyWa.js";
import { n as extensionForMime, t as detectMime } from "./mime-CsUtzcn2.js";
import { r as hasProxyEnvConfigured } from "./proxy-env-BHEDx2JD.js";
import { d as resolvePinnedHostnameWithPolicy, l as isPrivateNetworkAllowedByPolicy, t as SsrFBlockedError, u as resolvePinnedHostname } from "./ssrf-0bPJMoZR.js";
import { a as openFileWithinRoot, c as readLocalFileSafely, t as SafeOpenError } from "./fs-safe-DZyOgpPN.js";
import { a as allocateColor, c as isValidProfileName, d as DEFAULT_AI_SNAPSHOT_MAX_CHARS, i as allocateCdpPort, l as deriveDefaultBrowserCdpPortRange, n as resolveBrowserConfig, o as getUsedColors, p as DEFAULT_OPENCLAW_BROWSER_PROFILE_NAME, r as resolveProfile, s as getUsedPorts, t as parseHttpUrl, u as DEFAULT_AI_SNAPSHOT_EFFICIENT_MAX_CHARS } from "./config-CLRQPUSt.js";
import fs, { createWriteStream } from "node:fs";
import path from "node:path";
import { execFileSync, spawn } from "node:child_process";
import os from "node:os";
import fs$1 from "node:fs/promises";
import crypto, { randomUUID } from "node:crypto";
import WebSocket from "ws";
import https, { request } from "node:https";
import { pipeline } from "node:stream/promises";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import http, { request as request$1 } from "node:http";
//#region src/gateway/resolve-configured-secret-input-string.ts
function trimToUndefined(value) {
	if (typeof value !== "string") return;
	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : void 0;
}
function buildUnresolvedReason(params) {
	if (params.style === "generic") return `${params.path} SecretRef is unresolved (${params.refLabel}).`;
	if (params.kind === "non-string") return `${params.path} SecretRef resolved to a non-string value.`;
	if (params.kind === "empty") return `${params.path} SecretRef resolved to an empty value.`;
	return `${params.path} SecretRef is unresolved (${params.refLabel}).`;
}
async function resolveConfiguredSecretInputString(params) {
	const style = params.unresolvedReasonStyle ?? "generic";
	const { ref } = resolveSecretInputRef({
		value: params.value,
		defaults: params.config.secrets?.defaults
	});
	if (!ref) return { value: trimToUndefined(params.value) };
	const refLabel = `${ref.source}:${ref.provider}:${ref.id}`;
	try {
		const resolvedValue = (await resolveSecretRefValues([ref], {
			config: params.config,
			env: params.env
		})).get(secretRefKey(ref));
		if (typeof resolvedValue !== "string") return { unresolvedRefReason: buildUnresolvedReason({
			path: params.path,
			style,
			kind: "non-string",
			refLabel
		}) };
		const trimmed = resolvedValue.trim();
		if (trimmed.length === 0) return { unresolvedRefReason: buildUnresolvedReason({
			path: params.path,
			style,
			kind: "empty",
			refLabel
		}) };
		return { value: trimmed };
	} catch {
		return { unresolvedRefReason: buildUnresolvedReason({
			path: params.path,
			style,
			kind: "unresolved",
			refLabel
		}) };
	}
}
async function resolveConfiguredSecretInputWithFallback(params) {
	const { ref } = resolveSecretInputRef({
		value: params.value,
		defaults: params.config.secrets?.defaults
	});
	const configValue = !ref ? trimToUndefined(params.value) : void 0;
	if (configValue) return {
		value: configValue,
		source: "config",
		secretRefConfigured: false
	};
	if (!ref) {
		const fallback = params.readFallback?.();
		if (fallback) return {
			value: fallback,
			source: "fallback",
			secretRefConfigured: false
		};
		return { secretRefConfigured: false };
	}
	const resolved = await resolveConfiguredSecretInputString({
		config: params.config,
		env: params.env,
		value: params.value,
		path: params.path,
		unresolvedReasonStyle: params.unresolvedReasonStyle
	});
	if (resolved.value) return {
		value: resolved.value,
		source: "secretRef",
		secretRefConfigured: true
	};
	const fallback = params.readFallback?.();
	if (fallback) return {
		value: fallback,
		source: "fallback",
		secretRefConfigured: true
	};
	return {
		unresolvedRefReason: resolved.unresolvedRefReason,
		secretRefConfigured: true
	};
}
async function resolveRequiredConfiguredSecretRefInputString(params) {
	const { ref } = resolveSecretInputRef({
		value: params.value,
		defaults: params.config.secrets?.defaults
	});
	if (!ref) return;
	const resolved = await resolveConfiguredSecretInputString({
		config: params.config,
		env: params.env,
		value: params.value,
		path: params.path,
		unresolvedReasonStyle: params.unresolvedReasonStyle
	});
	if (resolved.value) return resolved.value;
	throw new Error(resolved.unresolvedRefReason ?? `${params.path} resolved to an empty value.`);
}
//#endregion
//#region src/gateway/startup-auth.ts
function mergeGatewayAuthConfig(base, override) {
	const merged = { ...base };
	if (!override) return merged;
	if (override.mode !== void 0) merged.mode = override.mode;
	if (override.token !== void 0) merged.token = override.token;
	if (override.password !== void 0) merged.password = override.password;
	if (override.allowTailscale !== void 0) merged.allowTailscale = override.allowTailscale;
	if (override.rateLimit !== void 0) merged.rateLimit = override.rateLimit;
	if (override.trustedProxy !== void 0) merged.trustedProxy = override.trustedProxy;
	return merged;
}
function mergeGatewayTailscaleConfig(base, override) {
	const merged = { ...base };
	if (!override) return merged;
	if (override.mode !== void 0) merged.mode = override.mode;
	if (override.resetOnExit !== void 0) merged.resetOnExit = override.resetOnExit;
	return merged;
}
function resolveGatewayAuthFromConfig(params) {
	const tailscaleConfig = mergeGatewayTailscaleConfig(params.cfg.gateway?.tailscale, params.tailscaleOverride);
	return resolveGatewayAuth({
		authConfig: params.cfg.gateway?.auth,
		authOverride: params.authOverride,
		env: params.env,
		tailscaleMode: tailscaleConfig.mode ?? "off"
	});
}
function shouldPersistGeneratedToken(params) {
	if (!params.persistRequested) return false;
	if (params.resolvedAuth.modeSource === "override") return false;
	return true;
}
function hasGatewayTokenCandidate(params) {
	if (readGatewayTokenEnv(params.env)) return true;
	if (typeof params.authOverride?.token === "string" && params.authOverride.token.trim().length > 0) return true;
	return hasConfiguredSecretInput(params.cfg.gateway?.auth?.token, params.cfg.secrets?.defaults);
}
function hasGatewayTokenOverrideCandidate(params) {
	return Boolean(typeof params.authOverride?.token === "string" && params.authOverride.token.trim().length > 0);
}
function hasGatewayPasswordOverrideCandidate(params) {
	if (hasGatewayPasswordEnvCandidate(params.env)) return true;
	return Boolean(typeof params.authOverride?.password === "string" && params.authOverride.password.trim().length > 0);
}
function shouldResolveGatewayTokenSecretRef(params) {
	if (hasGatewayTokenOverrideCandidate({ authOverride: params.authOverride })) return false;
	if (hasGatewayTokenEnvCandidate(params.env)) return false;
	const explicitMode = params.authOverride?.mode ?? params.cfg.gateway?.auth?.mode;
	if (explicitMode === "token") return true;
	if (explicitMode === "password" || explicitMode === "none" || explicitMode === "trusted-proxy") return false;
	if (hasGatewayPasswordOverrideCandidate(params)) return false;
	return !hasConfiguredSecretInput(params.cfg.gateway?.auth?.password, params.cfg.secrets?.defaults);
}
async function resolveGatewayTokenSecretRef(cfg, env, authOverride) {
	if (!shouldResolveGatewayTokenSecretRef({
		cfg,
		env,
		authOverride
	})) return;
	return await resolveRequiredConfiguredSecretRefInputString({
		config: cfg,
		env,
		value: cfg.gateway?.auth?.token,
		path: "gateway.auth.token"
	});
}
function shouldResolveGatewayPasswordSecretRef(params) {
	if (hasGatewayPasswordOverrideCandidate(params)) return false;
	const explicitMode = params.authOverride?.mode ?? params.cfg.gateway?.auth?.mode;
	if (explicitMode === "password") return true;
	if (explicitMode === "token" || explicitMode === "none" || explicitMode === "trusted-proxy") return false;
	if (hasGatewayTokenCandidate(params)) return false;
	return true;
}
async function resolveGatewayPasswordSecretRef(cfg, env, authOverride) {
	if (!shouldResolveGatewayPasswordSecretRef({
		cfg,
		env,
		authOverride
	})) return;
	return await resolveRequiredConfiguredSecretRefInputString({
		config: cfg,
		env,
		value: cfg.gateway?.auth?.password,
		path: "gateway.auth.password"
	});
}
async function ensureGatewayStartupAuth(params) {
	assertExplicitGatewayAuthModeWhenBothConfigured(params.cfg);
	const env = params.env ?? process.env;
	const persistRequested = params.persist === true;
	const [resolvedTokenRefValue, resolvedPasswordRefValue] = await Promise.all([resolveGatewayTokenSecretRef(params.cfg, env, params.authOverride), resolveGatewayPasswordSecretRef(params.cfg, env, params.authOverride)]);
	const authOverride = params.authOverride || resolvedTokenRefValue || resolvedPasswordRefValue ? {
		...params.authOverride,
		...resolvedTokenRefValue ? { token: resolvedTokenRefValue } : {},
		...resolvedPasswordRefValue ? { password: resolvedPasswordRefValue } : {}
	} : void 0;
	const resolved = resolveGatewayAuthFromConfig({
		cfg: params.cfg,
		env,
		authOverride,
		tailscaleOverride: params.tailscaleOverride
	});
	if (resolved.mode !== "token" || (resolved.token?.trim().length ?? 0) > 0) {
		assertHooksTokenSeparateFromGatewayAuth({
			cfg: params.cfg,
			auth: resolved
		});
		return {
			cfg: params.cfg,
			auth: resolved,
			persistedGeneratedToken: false
		};
	}
	const generatedToken = crypto.randomBytes(24).toString("hex");
	const nextCfg = {
		...params.cfg,
		gateway: {
			...params.cfg.gateway,
			auth: {
				...params.cfg.gateway?.auth,
				mode: "token",
				token: generatedToken
			}
		}
	};
	const persist = shouldPersistGeneratedToken({
		persistRequested,
		resolvedAuth: resolved
	});
	if (persist) await writeConfigFile(nextCfg);
	const nextAuth = resolveGatewayAuthFromConfig({
		cfg: nextCfg,
		env,
		authOverride: params.authOverride,
		tailscaleOverride: params.tailscaleOverride
	});
	assertHooksTokenSeparateFromGatewayAuth({
		cfg: nextCfg,
		auth: nextAuth
	});
	return {
		cfg: nextCfg,
		auth: nextAuth,
		generatedToken,
		persistedGeneratedToken: persist
	};
}
function assertHooksTokenSeparateFromGatewayAuth(params) {
	if (params.cfg.hooks?.enabled !== true) return;
	const hooksToken = typeof params.cfg.hooks.token === "string" ? params.cfg.hooks.token.trim() : "";
	if (!hooksToken) return;
	const gatewayToken = params.auth.mode === "token" && typeof params.auth.token === "string" ? params.auth.token.trim() : "";
	if (!gatewayToken) return;
	if (hooksToken !== gatewayToken) return;
	throw new Error("Invalid config: hooks.token must not match gateway auth token. Set a distinct hooks.token for hook ingress.");
}
//#endregion
//#region src/browser/control-auth.ts
function resolveBrowserControlAuth(cfg, env = process.env) {
	const auth = resolveGatewayAuth({
		authConfig: cfg?.gateway?.auth,
		env,
		tailscaleMode: cfg?.gateway?.tailscale?.mode
	});
	const token = typeof auth.token === "string" ? auth.token.trim() : "";
	const password = typeof auth.password === "string" ? auth.password.trim() : "";
	return {
		token: token || void 0,
		password: password || void 0
	};
}
function shouldAutoGenerateBrowserAuth(env) {
	if ((env.NODE_ENV ?? "").trim().toLowerCase() === "test") return false;
	const vitest = (env.VITEST ?? "").trim().toLowerCase();
	if (vitest && vitest !== "0" && vitest !== "false" && vitest !== "off") return false;
	return true;
}
async function ensureBrowserControlAuth(params) {
	const env = params.env ?? process.env;
	const auth = resolveBrowserControlAuth(params.cfg, env);
	if (auth.token || auth.password) return { auth };
	if (!shouldAutoGenerateBrowserAuth(env)) return { auth };
	if (params.cfg.gateway?.auth?.mode === "password") return { auth };
	if (params.cfg.gateway?.auth?.mode === "none") return { auth };
	if (params.cfg.gateway?.auth?.mode === "trusted-proxy") return { auth };
	const latestCfg = loadConfig();
	const latestAuth = resolveBrowserControlAuth(latestCfg, env);
	if (latestAuth.token || latestAuth.password) return { auth: latestAuth };
	if (latestCfg.gateway?.auth?.mode === "password") return { auth: latestAuth };
	if (latestCfg.gateway?.auth?.mode === "none") return { auth: latestAuth };
	if (latestCfg.gateway?.auth?.mode === "trusted-proxy") return { auth: latestAuth };
	const ensured = await ensureGatewayStartupAuth({
		cfg: latestCfg,
		env,
		persist: true
	});
	return {
		auth: {
			token: ensured.auth.token,
			password: ensured.auth.password
		},
		generatedToken: ensured.generatedToken
	};
}
//#endregion
//#region src/browser/bridge-auth-registry.ts
const authByPort = /* @__PURE__ */ new Map();
function setBridgeAuthForPort(port, auth) {
	if (!Number.isFinite(port) || port <= 0) return;
	const token = typeof auth.token === "string" ? auth.token.trim() : "";
	const password = typeof auth.password === "string" ? auth.password.trim() : "";
	authByPort.set(port, {
		token: token || void 0,
		password: password || void 0
	});
}
function getBridgeAuthForPort(port) {
	if (!Number.isFinite(port) || port <= 0) return;
	return authByPort.get(port);
}
function deleteBridgeAuthForPort(port) {
	if (!Number.isFinite(port) || port <= 0) return;
	authByPort.delete(port);
}
//#endregion
//#region src/browser/navigation-guard.ts
const NETWORK_NAVIGATION_PROTOCOLS = new Set(["http:", "https:"]);
const SAFE_NON_NETWORK_URLS = new Set(["about:blank"]);
function isAllowedNonNetworkNavigationUrl(parsed) {
	return SAFE_NON_NETWORK_URLS.has(parsed.href);
}
var InvalidBrowserNavigationUrlError = class extends Error {
	constructor(message) {
		super(message);
		this.name = "InvalidBrowserNavigationUrlError";
	}
};
function withBrowserNavigationPolicy(ssrfPolicy) {
	return ssrfPolicy ? { ssrfPolicy } : {};
}
function requiresInspectableBrowserNavigationRedirects(ssrfPolicy) {
	return !isPrivateNetworkAllowedByPolicy(ssrfPolicy);
}
async function assertBrowserNavigationAllowed(opts) {
	const rawUrl = String(opts.url ?? "").trim();
	if (!rawUrl) throw new InvalidBrowserNavigationUrlError("url is required");
	let parsed;
	try {
		parsed = new URL(rawUrl);
	} catch {
		throw new InvalidBrowserNavigationUrlError(`Invalid URL: ${rawUrl}`);
	}
	if (!NETWORK_NAVIGATION_PROTOCOLS.has(parsed.protocol)) {
		if (isAllowedNonNetworkNavigationUrl(parsed)) return;
		throw new InvalidBrowserNavigationUrlError(`Navigation blocked: unsupported protocol "${parsed.protocol}"`);
	}
	if (hasProxyEnvConfigured() && !isPrivateNetworkAllowedByPolicy(opts.ssrfPolicy)) throw new InvalidBrowserNavigationUrlError("Navigation blocked: strict browser SSRF policy cannot be enforced while env proxy variables are set");
	await resolvePinnedHostnameWithPolicy(parsed.hostname, {
		lookupFn: opts.lookupFn,
		policy: opts.ssrfPolicy
	});
}
/**
* Best-effort post-navigation guard for final page URLs.
* Only validates network URLs (http/https) and about:blank to avoid false
* positives on browser-internal error pages (e.g. chrome-error://).
*/
async function assertBrowserNavigationResultAllowed(opts) {
	const rawUrl = String(opts.url ?? "").trim();
	if (!rawUrl) return;
	let parsed;
	try {
		parsed = new URL(rawUrl);
	} catch {
		return;
	}
	if (NETWORK_NAVIGATION_PROTOCOLS.has(parsed.protocol) || isAllowedNonNetworkNavigationUrl(parsed)) await assertBrowserNavigationAllowed(opts);
}
async function assertBrowserNavigationRedirectChainAllowed(opts) {
	const chain = [];
	let current = opts.request ?? null;
	while (current) {
		chain.push(current.url());
		current = current.redirectedFrom();
	}
	for (const url of chain.toReversed()) await assertBrowserNavigationAllowed({
		url,
		lookupFn: opts.lookupFn,
		ssrfPolicy: opts.ssrfPolicy
	});
}
//#endregion
//#region src/browser/errors.ts
var BrowserError = class extends Error {
	constructor(message, status = 500, options) {
		super(message, options);
		this.name = new.target.name;
		this.status = status;
	}
};
var BrowserValidationError = class extends BrowserError {
	constructor(message, options) {
		super(message, 400, options);
	}
};
var BrowserTargetAmbiguousError = class extends BrowserError {
	constructor(message = "ambiguous target id prefix", options) {
		super(message, 409, options);
	}
};
var BrowserTabNotFoundError = class extends BrowserError {
	constructor(message = "tab not found", options) {
		super(message, 404, options);
	}
};
var BrowserProfileNotFoundError = class extends BrowserError {
	constructor(message, options) {
		super(message, 404, options);
	}
};
var BrowserConflictError = class extends BrowserError {
	constructor(message, options) {
		super(message, 409, options);
	}
};
var BrowserResetUnsupportedError = class extends BrowserError {
	constructor(message, options) {
		super(message, 400, options);
	}
};
var BrowserProfileUnavailableError = class extends BrowserError {
	constructor(message, options) {
		super(message, 409, options);
	}
};
var BrowserResourceExhaustedError = class extends BrowserError {
	constructor(message, options) {
		super(message, 507, options);
	}
};
function toBrowserErrorResponse(err) {
	if (err instanceof BrowserError) return {
		status: err.status,
		message: err.message
	};
	if (err instanceof SsrFBlockedError) return {
		status: 400,
		message: err.message
	};
	if (err instanceof InvalidBrowserNavigationUrlError || err instanceof Error && err.name === "InvalidBrowserNavigationUrlError") return {
		status: 400,
		message: err.message
	};
	return null;
}
//#endregion
//#region src/browser/chrome-mcp.ts
const DEFAULT_CHROME_MCP_COMMAND = "npx";
const DEFAULT_CHROME_MCP_ARGS = [
	"-y",
	"chrome-devtools-mcp@latest",
	"--autoConnect",
	"--experimentalStructuredContent",
	"--experimental-page-id-routing"
];
const sessions = /* @__PURE__ */ new Map();
const pendingSessions = /* @__PURE__ */ new Map();
let sessionFactory = null;
function asRecord(value) {
	return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}
function asPages(value) {
	if (!Array.isArray(value)) return [];
	const out = [];
	for (const entry of value) {
		const record = asRecord(entry);
		if (!record || typeof record.id !== "number") continue;
		out.push({
			id: record.id,
			url: typeof record.url === "string" ? record.url : void 0,
			selected: record.selected === true
		});
	}
	return out;
}
function parsePageId(targetId) {
	const parsed = Number.parseInt(targetId.trim(), 10);
	if (!Number.isFinite(parsed)) throw new BrowserTabNotFoundError();
	return parsed;
}
function toBrowserTabs(pages) {
	return pages.map((page) => ({
		targetId: String(page.id),
		title: "",
		url: page.url ?? "",
		type: "page"
	}));
}
function extractStructuredContent(result) {
	return asRecord(result.structuredContent) ?? {};
}
function extractTextContent(result) {
	return (Array.isArray(result.content) ? result.content : []).map((entry) => {
		const record = asRecord(entry);
		return record && typeof record.text === "string" ? record.text : "";
	}).filter(Boolean);
}
function extractTextPages(result) {
	const pages = [];
	for (const block of extractTextContent(result)) for (const line of block.split(/\r?\n/)) {
		const match = line.match(/^\s*(\d+):\s+(.+?)(?:\s+\[(selected)\])?\s*$/i);
		if (!match) continue;
		pages.push({
			id: Number.parseInt(match[1] ?? "", 10),
			url: match[2]?.trim() || void 0,
			selected: Boolean(match[3])
		});
	}
	return pages;
}
function extractStructuredPages(result) {
	const structured = asPages(extractStructuredContent(result).pages);
	return structured.length > 0 ? structured : extractTextPages(result);
}
function extractSnapshot(result) {
	const snapshot = asRecord(extractStructuredContent(result).snapshot);
	if (!snapshot) throw new Error("Chrome MCP snapshot response was missing structured snapshot data.");
	return snapshot;
}
function extractJsonBlock(text) {
	const raw = text.match(/```json\s*([\s\S]*?)\s*```/i)?.[1]?.trim() || text.trim();
	return raw ? JSON.parse(raw) : null;
}
function extractMessageText(result) {
	const message = extractStructuredContent(result).message;
	if (typeof message === "string" && message.trim()) return message;
	return extractTextContent(result).find((block) => block.trim()) ?? "";
}
function extractToolErrorMessage(result, name) {
	return extractMessageText(result).trim() || `Chrome MCP tool "${name}" failed.`;
}
function extractJsonMessage(result) {
	const candidates = [extractMessageText(result), ...extractTextContent(result)].filter((text) => text.trim());
	let lastError;
	for (const candidate of candidates) try {
		return extractJsonBlock(candidate);
	} catch (err) {
		lastError = err;
	}
	if (lastError) throw lastError;
	return null;
}
function normalizeChromeMcpUserDataDir(userDataDir) {
	const trimmed = userDataDir?.trim();
	return trimmed ? trimmed : void 0;
}
function buildChromeMcpSessionCacheKey(profileName, userDataDir) {
	return JSON.stringify([profileName, normalizeChromeMcpUserDataDir(userDataDir) ?? ""]);
}
function cacheKeyMatchesProfileName(cacheKey, profileName) {
	try {
		const parsed = JSON.parse(cacheKey);
		return Array.isArray(parsed) && parsed[0] === profileName;
	} catch {
		return false;
	}
}
async function closeChromeMcpSessionsForProfile(profileName, keepKey) {
	let closed = false;
	for (const key of Array.from(pendingSessions.keys())) if (key !== keepKey && cacheKeyMatchesProfileName(key, profileName)) {
		pendingSessions.delete(key);
		closed = true;
	}
	for (const [key, session] of Array.from(sessions.entries())) if (key !== keepKey && cacheKeyMatchesProfileName(key, profileName)) {
		sessions.delete(key);
		closed = true;
		await session.client.close().catch(() => {});
	}
	return closed;
}
function buildChromeMcpArgs(userDataDir) {
	const normalizedUserDataDir = normalizeChromeMcpUserDataDir(userDataDir);
	return normalizedUserDataDir ? [
		...DEFAULT_CHROME_MCP_ARGS,
		"--userDataDir",
		normalizedUserDataDir
	] : [...DEFAULT_CHROME_MCP_ARGS];
}
async function createRealSession(profileName, userDataDir) {
	const transport = new StdioClientTransport({
		command: DEFAULT_CHROME_MCP_COMMAND,
		args: buildChromeMcpArgs(userDataDir),
		stderr: "pipe"
	});
	const client = new Client({
		name: "openclaw-browser",
		version: "0.0.0"
	}, {});
	return {
		client,
		transport,
		ready: (async () => {
			try {
				await client.connect(transport);
				if (!(await client.listTools()).tools.some((tool) => tool.name === "list_pages")) throw new Error("Chrome MCP server did not expose the expected navigation tools.");
			} catch (err) {
				await client.close().catch(() => {});
				throw new BrowserProfileUnavailableError(`Chrome MCP existing-session attach failed for profile "${profileName}". Make sure ${userDataDir ? `the configured Chromium user data dir (${userDataDir})` : "Google Chrome's default profile"} is running locally with remote debugging enabled. Details: ${String(err)}`);
			}
		})()
	};
}
async function getSession(profileName, userDataDir) {
	const cacheKey = buildChromeMcpSessionCacheKey(profileName, userDataDir);
	await closeChromeMcpSessionsForProfile(profileName, cacheKey);
	let session = sessions.get(cacheKey);
	if (session && session.transport.pid === null) {
		sessions.delete(cacheKey);
		session = void 0;
	}
	if (!session) {
		let pending = pendingSessions.get(cacheKey);
		if (!pending) {
			pending = (async () => {
				const created = await (sessionFactory ?? createRealSession)(profileName, userDataDir);
				if (pendingSessions.get(cacheKey) === pending) sessions.set(cacheKey, created);
				else await created.client.close().catch(() => {});
				return created;
			})();
			pendingSessions.set(cacheKey, pending);
		}
		try {
			session = await pending;
		} finally {
			if (pendingSessions.get(cacheKey) === pending) pendingSessions.delete(cacheKey);
		}
	}
	try {
		await session.ready;
		return session;
	} catch (err) {
		if (sessions.get(cacheKey)?.transport === session.transport) sessions.delete(cacheKey);
		throw err;
	}
}
async function callTool(profileName, userDataDir, name, args = {}) {
	const cacheKey = buildChromeMcpSessionCacheKey(profileName, userDataDir);
	const session = await getSession(profileName, userDataDir);
	let result;
	try {
		result = await session.client.callTool({
			name,
			arguments: args
		});
	} catch (err) {
		sessions.delete(cacheKey);
		await session.client.close().catch(() => {});
		throw err;
	}
	if (result.isError) throw new Error(extractToolErrorMessage(result, name));
	return result;
}
async function withTempFile(fn) {
	const dir = await fs$1.mkdtemp(path.join(os.tmpdir(), "openclaw-chrome-mcp-"));
	const filePath = path.join(dir, randomUUID());
	try {
		return await fn(filePath);
	} finally {
		await fs$1.rm(dir, {
			recursive: true,
			force: true
		}).catch(() => {});
	}
}
async function findPageById(profileName, pageId, userDataDir) {
	const page = (await listChromeMcpPages(profileName, userDataDir)).find((entry) => entry.id === pageId);
	if (!page) throw new BrowserTabNotFoundError();
	return page;
}
async function ensureChromeMcpAvailable(profileName, userDataDir) {
	await getSession(profileName, userDataDir);
}
function getChromeMcpPid(profileName) {
	for (const [key, session] of sessions.entries()) if (cacheKeyMatchesProfileName(key, profileName)) return session.transport.pid ?? null;
	return null;
}
async function closeChromeMcpSession(profileName) {
	return await closeChromeMcpSessionsForProfile(profileName);
}
async function listChromeMcpPages(profileName, userDataDir) {
	return extractStructuredPages(await callTool(profileName, userDataDir, "list_pages"));
}
async function listChromeMcpTabs(profileName, userDataDir) {
	return toBrowserTabs(await listChromeMcpPages(profileName, userDataDir));
}
async function openChromeMcpTab(profileName, url, userDataDir) {
	const pages = extractStructuredPages(await callTool(profileName, userDataDir, "new_page", { url }));
	const chosen = pages.find((page) => page.selected) ?? pages.at(-1);
	if (!chosen) throw new Error("Chrome MCP did not return the created page.");
	return {
		targetId: String(chosen.id),
		title: "",
		url: chosen.url ?? url,
		type: "page"
	};
}
async function focusChromeMcpTab(profileName, targetId, userDataDir) {
	await callTool(profileName, userDataDir, "select_page", {
		pageId: parsePageId(targetId),
		bringToFront: true
	});
}
async function closeChromeMcpTab(profileName, targetId, userDataDir) {
	await callTool(profileName, userDataDir, "close_page", { pageId: parsePageId(targetId) });
}
async function navigateChromeMcpPage(params) {
	await callTool(params.profileName, params.userDataDir, "navigate_page", {
		pageId: parsePageId(params.targetId),
		type: "url",
		url: params.url,
		...typeof params.timeoutMs === "number" ? { timeout: params.timeoutMs } : {}
	});
	return { url: (await findPageById(params.profileName, parsePageId(params.targetId), params.userDataDir)).url ?? params.url };
}
async function takeChromeMcpSnapshot(params) {
	return extractSnapshot(await callTool(params.profileName, params.userDataDir, "take_snapshot", { pageId: parsePageId(params.targetId) }));
}
async function takeChromeMcpScreenshot(params) {
	return await withTempFile(async (filePath) => {
		await callTool(params.profileName, params.userDataDir, "take_screenshot", {
			pageId: parsePageId(params.targetId),
			filePath,
			format: params.format ?? "png",
			...params.uid ? { uid: params.uid } : {},
			...params.fullPage ? { fullPage: true } : {}
		});
		return await fs$1.readFile(filePath);
	});
}
async function clickChromeMcpElement(params) {
	await callTool(params.profileName, params.userDataDir, "click", {
		pageId: parsePageId(params.targetId),
		uid: params.uid,
		...params.doubleClick ? { dblClick: true } : {}
	});
}
async function fillChromeMcpElement(params) {
	await callTool(params.profileName, params.userDataDir, "fill", {
		pageId: parsePageId(params.targetId),
		uid: params.uid,
		value: params.value
	});
}
async function fillChromeMcpForm(params) {
	await callTool(params.profileName, params.userDataDir, "fill_form", {
		pageId: parsePageId(params.targetId),
		elements: params.elements
	});
}
async function hoverChromeMcpElement(params) {
	await callTool(params.profileName, params.userDataDir, "hover", {
		pageId: parsePageId(params.targetId),
		uid: params.uid
	});
}
async function dragChromeMcpElement(params) {
	await callTool(params.profileName, params.userDataDir, "drag", {
		pageId: parsePageId(params.targetId),
		from_uid: params.fromUid,
		to_uid: params.toUid
	});
}
async function uploadChromeMcpFile(params) {
	await callTool(params.profileName, params.userDataDir, "upload_file", {
		pageId: parsePageId(params.targetId),
		uid: params.uid,
		filePath: params.filePath
	});
}
async function pressChromeMcpKey(params) {
	await callTool(params.profileName, params.userDataDir, "press_key", {
		pageId: parsePageId(params.targetId),
		key: params.key
	});
}
async function resizeChromeMcpPage(params) {
	await callTool(params.profileName, params.userDataDir, "resize_page", {
		pageId: parsePageId(params.targetId),
		width: params.width,
		height: params.height
	});
}
async function evaluateChromeMcpScript(params) {
	return extractJsonMessage(await callTool(params.profileName, params.userDataDir, "evaluate_script", {
		pageId: parsePageId(params.targetId),
		function: params.fn,
		...params.args?.length ? { args: params.args } : {}
	}));
}
//#endregion
//#region src/browser/form-fields.ts
const DEFAULT_FILL_FIELD_TYPE = "text";
function normalizeBrowserFormFieldRef(value) {
	return typeof value === "string" ? value.trim() : "";
}
function normalizeBrowserFormFieldType(value) {
	return (typeof value === "string" ? value.trim() : "") || "text";
}
function normalizeBrowserFormFieldValue(value) {
	return typeof value === "string" || typeof value === "number" || typeof value === "boolean" ? value : void 0;
}
function normalizeBrowserFormField(record) {
	const ref = normalizeBrowserFormFieldRef(record.ref);
	if (!ref) return null;
	const type = normalizeBrowserFormFieldType(record.type);
	const value = normalizeBrowserFormFieldValue(record.value);
	return value === void 0 ? {
		ref,
		type
	} : {
		ref,
		type,
		value
	};
}
//#endregion
//#region src/browser/profile-capabilities.ts
function getBrowserProfileCapabilities(profile) {
	if (profile.driver === "existing-session") return {
		mode: "local-existing-session",
		isRemote: false,
		usesChromeMcp: true,
		usesPersistentPlaywright: false,
		supportsPerTabWs: false,
		supportsJsonTabEndpoints: false,
		supportsReset: false,
		supportsManagedTabLimit: false
	};
	if (!profile.cdpIsLoopback) return {
		mode: "remote-cdp",
		isRemote: true,
		usesChromeMcp: false,
		usesPersistentPlaywright: true,
		supportsPerTabWs: false,
		supportsJsonTabEndpoints: false,
		supportsReset: false,
		supportsManagedTabLimit: false
	};
	return {
		mode: "local-managed",
		isRemote: false,
		usesChromeMcp: false,
		usesPersistentPlaywright: false,
		supportsPerTabWs: true,
		supportsJsonTabEndpoints: true,
		supportsReset: true,
		supportsManagedTabLimit: true
	};
}
function resolveDefaultSnapshotFormat(params) {
	if (params.explicitFormat) return params.explicitFormat;
	if (params.mode === "efficient") return "ai";
	if (getBrowserProfileCapabilities(params.profile).mode === "local-existing-session") return "ai";
	return params.hasPlaywright ? "ai" : "aria";
}
function shouldUsePlaywrightForScreenshot(params) {
	return !params.wsUrl || Boolean(params.ref) || Boolean(params.element);
}
function shouldUsePlaywrightForAriaSnapshot(params) {
	return !params.wsUrl;
}
//#endregion
//#region src/browser/url-pattern.ts
function matchBrowserUrlPattern(pattern, url) {
	const trimmedPattern = pattern.trim();
	if (!trimmedPattern) return false;
	if (trimmedPattern === url) return true;
	if (trimmedPattern.includes("*")) {
		const escaped = trimmedPattern.replace(/[|\\{}()[\]^$+?.]/g, "\\$&");
		return new RegExp(`^${escaped.replace(/\*\*/g, ".*").replace(/\*/g, ".*")}$`).test(url);
	}
	return url.includes(trimmedPattern);
}
//#endregion
//#region src/browser/pw-ai-module.ts
let pwAiModuleSoft = null;
let pwAiModuleStrict = null;
function isModuleNotFoundError(err) {
	if (extractErrorCode(err) === "ERR_MODULE_NOT_FOUND") return true;
	const msg = formatErrorMessage(err);
	return msg.includes("Cannot find module") || msg.includes("Cannot find package") || msg.includes("Failed to resolve import") || msg.includes("Failed to resolve entry for package") || msg.includes("Failed to load url");
}
async function loadPwAiModule(mode) {
	try {
		return await import("./pw-ai-BVCS_79_.js");
	} catch (err) {
		if (mode === "soft") return null;
		if (isModuleNotFoundError(err)) return null;
		throw err;
	}
}
async function getPwAiModule$1(opts) {
	if ((opts?.mode ?? "soft") === "soft") {
		if (!pwAiModuleSoft) pwAiModuleSoft = loadPwAiModule("soft");
		return await pwAiModuleSoft;
	}
	if (!pwAiModuleStrict) pwAiModuleStrict = loadPwAiModule("strict");
	return await pwAiModuleStrict;
}
//#endregion
//#region src/browser/routes/utils.ts
/**
* Extract profile name from query string or body and get profile context.
* Query string takes precedence over body for consistency with GET routes.
*/
function getProfileContext(req, ctx) {
	let profileName;
	if (typeof req.query.profile === "string") profileName = req.query.profile.trim() || void 0;
	if (!profileName && req.body && typeof req.body === "object") {
		const body = req.body;
		if (typeof body.profile === "string") profileName = body.profile.trim() || void 0;
	}
	try {
		return ctx.forProfile(profileName);
	} catch (err) {
		return {
			error: String(err),
			status: 404
		};
	}
}
function jsonError(res, status, message) {
	res.status(status).json({ error: message });
}
function toStringOrEmpty(value) {
	if (typeof value === "string") return value.trim();
	if (typeof value === "number" || typeof value === "boolean") return String(value).trim();
	return "";
}
function toNumber(value) {
	if (typeof value === "number" && Number.isFinite(value)) return value;
	if (typeof value === "string" && value.trim()) {
		const parsed = Number(value);
		return Number.isFinite(parsed) ? parsed : void 0;
	}
}
function toBoolean(value) {
	return parseBooleanValue(value, {
		truthy: [
			"true",
			"1",
			"yes"
		],
		falsy: [
			"false",
			"0",
			"no"
		]
	});
}
function toStringArray(value) {
	if (!Array.isArray(value)) return;
	const strings = value.map((v) => toStringOrEmpty(v)).filter(Boolean);
	return strings.length ? strings : void 0;
}
//#endregion
//#region src/browser/routes/agent.shared.ts
const SELECTOR_UNSUPPORTED_MESSAGE = [
	"Error: 'selector' is not supported. Use 'ref' from snapshot instead.",
	"",
	"Example workflow:",
	"1. snapshot action to get page state with refs",
	"2. act with ref: \"e123\" to interact with element",
	"",
	"This is more reliable for modern SPAs."
].join("\n");
function readBody(req) {
	const body = req.body;
	if (!body || typeof body !== "object" || Array.isArray(body)) return {};
	return body;
}
function resolveTargetIdFromBody(body) {
	return (typeof body.targetId === "string" ? body.targetId.trim() : "") || void 0;
}
function resolveTargetIdFromQuery(query) {
	return (typeof query.targetId === "string" ? query.targetId.trim() : "") || void 0;
}
function handleRouteError(ctx, res, err) {
	const mapped = ctx.mapTabError(err);
	if (mapped) return jsonError(res, mapped.status, mapped.message);
	const browserMapped = toBrowserErrorResponse(err);
	if (browserMapped) return jsonError(res, browserMapped.status, browserMapped.message);
	jsonError(res, 500, String(err));
}
function resolveProfileContext(req, res, ctx) {
	const profileCtx = getProfileContext(req, ctx);
	if ("error" in profileCtx) {
		jsonError(res, profileCtx.status, profileCtx.error);
		return null;
	}
	return profileCtx;
}
async function getPwAiModule() {
	return await getPwAiModule$1({ mode: "soft" });
}
async function requirePwAi(res, feature) {
	const mod = await getPwAiModule();
	if (mod) return mod;
	jsonError(res, 501, [
		`Playwright is not available in this gateway build; '${feature}' is unsupported.`,
		"Install the full Playwright package (not playwright-core) and restart the gateway, or reinstall with browser support.",
		"Docs: /tools/browser#playwright-requirement"
	].join("\n"));
	return null;
}
async function withRouteTabContext(params) {
	const profileCtx = resolveProfileContext(params.req, params.res, params.ctx);
	if (!profileCtx) return;
	try {
		const tab = await profileCtx.ensureTabAvailable(params.targetId);
		return await params.run({
			profileCtx,
			tab,
			cdpUrl: profileCtx.profile.cdpUrl
		});
	} catch (err) {
		handleRouteError(params.ctx, params.res, err);
		return;
	}
}
async function withPlaywrightRouteContext(params) {
	return await withRouteTabContext({
		req: params.req,
		res: params.res,
		ctx: params.ctx,
		targetId: params.targetId,
		run: async ({ profileCtx, tab, cdpUrl }) => {
			const pw = await requirePwAi(params.res, params.feature);
			if (!pw) return;
			return await params.run({
				profileCtx,
				tab,
				cdpUrl,
				pw
			});
		}
	});
}
//#endregion
//#region src/browser/paths.ts
const DEFAULT_BROWSER_TMP_DIR = resolvePreferredOpenClawTmpDir();
const DEFAULT_TRACE_DIR = DEFAULT_BROWSER_TMP_DIR;
const DEFAULT_DOWNLOAD_DIR = path.join(DEFAULT_BROWSER_TMP_DIR, "downloads");
const DEFAULT_UPLOAD_DIR = path.join(DEFAULT_BROWSER_TMP_DIR, "uploads");
function invalidPath(scopeLabel) {
	return {
		ok: false,
		error: `Invalid path: must stay within ${scopeLabel}`
	};
}
async function resolveRealPathIfExists(targetPath) {
	try {
		return await fs$1.realpath(targetPath);
	} catch {
		return;
	}
}
async function resolveTrustedRootRealPath(rootDir) {
	try {
		const rootLstat = await fs$1.lstat(rootDir);
		if (!rootLstat.isDirectory() || rootLstat.isSymbolicLink()) return;
		return await fs$1.realpath(rootDir);
	} catch {
		return;
	}
}
async function validateCanonicalPathWithinRoot(params) {
	try {
		const candidateLstat = await fs$1.lstat(params.candidatePath);
		if (candidateLstat.isSymbolicLink()) return "invalid";
		if (params.expect === "directory" && !candidateLstat.isDirectory()) return "invalid";
		if (params.expect === "file" && !candidateLstat.isFile()) return "invalid";
		if (params.expect === "file" && candidateLstat.nlink > 1) return "invalid";
		const candidateRealPath = await fs$1.realpath(params.candidatePath);
		return isPathInside(params.rootRealPath, candidateRealPath) ? "ok" : "invalid";
	} catch (err) {
		return isNotFoundPathError(err) ? "not-found" : "invalid";
	}
}
function resolvePathWithinRoot(params) {
	const root = path.resolve(params.rootDir);
	const raw = params.requestedPath.trim();
	if (!raw) {
		if (!params.defaultFileName) return {
			ok: false,
			error: "path is required"
		};
		return {
			ok: true,
			path: path.join(root, params.defaultFileName)
		};
	}
	const resolved = path.resolve(root, raw);
	const rel = path.relative(root, resolved);
	if (!rel || rel.startsWith("..") || path.isAbsolute(rel)) return {
		ok: false,
		error: `Invalid path: must stay within ${params.scopeLabel}`
	};
	return {
		ok: true,
		path: resolved
	};
}
async function resolveWritablePathWithinRoot(params) {
	const lexical = resolvePathWithinRoot(params);
	if (!lexical.ok) return lexical;
	const rootRealPath = await resolveTrustedRootRealPath(path.resolve(params.rootDir));
	if (!rootRealPath) return invalidPath(params.scopeLabel);
	const requestedPath = lexical.path;
	if (await validateCanonicalPathWithinRoot({
		rootRealPath,
		candidatePath: path.dirname(requestedPath),
		expect: "directory"
	}) !== "ok") return invalidPath(params.scopeLabel);
	if (await validateCanonicalPathWithinRoot({
		rootRealPath,
		candidatePath: requestedPath,
		expect: "file"
	}) === "invalid") return invalidPath(params.scopeLabel);
	return lexical;
}
async function resolveExistingPathsWithinRoot(params) {
	return await resolveCheckedPathsWithinRoot({
		...params,
		allowMissingFallback: true
	});
}
async function resolveStrictExistingPathsWithinRoot(params) {
	return await resolveCheckedPathsWithinRoot({
		...params,
		allowMissingFallback: false
	});
}
async function resolveCheckedPathsWithinRoot(params) {
	const rootDir = path.resolve(params.rootDir);
	const rootRealPath = await resolveRealPathIfExists(rootDir);
	const isInRoot = (relativePath) => Boolean(relativePath) && !relativePath.startsWith("..") && !path.isAbsolute(relativePath);
	const resolveExistingRelativePath = async (requestedPath) => {
		const raw = requestedPath.trim();
		const lexicalPathResult = resolvePathWithinRoot({
			rootDir,
			requestedPath,
			scopeLabel: params.scopeLabel
		});
		if (lexicalPathResult.ok) return {
			ok: true,
			relativePath: path.relative(rootDir, lexicalPathResult.path),
			fallbackPath: lexicalPathResult.path
		};
		if (!rootRealPath || !raw || !path.isAbsolute(raw)) return lexicalPathResult;
		try {
			const resolvedExistingPath = await fs$1.realpath(raw);
			const relativePath = path.relative(rootRealPath, resolvedExistingPath);
			if (!isInRoot(relativePath)) return lexicalPathResult;
			return {
				ok: true,
				relativePath,
				fallbackPath: resolvedExistingPath
			};
		} catch {
			return lexicalPathResult;
		}
	};
	const resolvedPaths = [];
	for (const raw of params.requestedPaths) {
		const pathResult = await resolveExistingRelativePath(raw);
		if (!pathResult.ok) return {
			ok: false,
			error: pathResult.error
		};
		let opened;
		try {
			opened = await openFileWithinRoot({
				rootDir,
				relativePath: pathResult.relativePath
			});
			resolvedPaths.push(opened.realPath);
		} catch (err) {
			if (params.allowMissingFallback && err instanceof SafeOpenError && err.code === "not-found") {
				resolvedPaths.push(pathResult.fallbackPath);
				continue;
			}
			if (err instanceof SafeOpenError && err.code === "outside-workspace") return {
				ok: false,
				error: `File is outside ${params.scopeLabel}`
			};
			return {
				ok: false,
				error: `Invalid path: must stay within ${params.scopeLabel} and be a regular non-symlink file`
			};
		} finally {
			await opened?.handle.close().catch(() => {});
		}
	}
	return {
		ok: true,
		paths: resolvedPaths
	};
}
//#endregion
//#region src/browser/routes/output-paths.ts
async function ensureOutputRootDir(rootDir) {
	await fs$1.mkdir(rootDir, { recursive: true });
}
async function resolveWritableOutputPathOrRespond(params) {
	if (params.ensureRootDir) await ensureOutputRootDir(params.rootDir);
	const pathResult = await resolveWritablePathWithinRoot({
		rootDir: params.rootDir,
		requestedPath: params.requestedPath,
		scopeLabel: params.scopeLabel,
		defaultFileName: params.defaultFileName
	});
	if (!pathResult.ok) {
		params.res.status(400).json({ error: pathResult.error });
		return null;
	}
	return pathResult.path;
}
//#endregion
//#region src/browser/routes/agent.act.download.ts
function buildDownloadRequestBase(cdpUrl, targetId, timeoutMs) {
	return {
		cdpUrl,
		targetId,
		timeoutMs: timeoutMs ?? void 0
	};
}
function registerBrowserAgentActDownloadRoutes(app, ctx) {
	app.post("/wait/download", async (req, res) => {
		const body = readBody(req);
		const targetId = resolveTargetIdFromBody(body);
		const out = toStringOrEmpty(body.path) || "";
		const timeoutMs = toNumber(body.timeoutMs);
		await withRouteTabContext({
			req,
			res,
			ctx,
			targetId,
			run: async ({ profileCtx, cdpUrl, tab }) => {
				if (getBrowserProfileCapabilities(profileCtx.profile).usesChromeMcp) return jsonError(res, 501, "download waiting is not supported for existing-session profiles yet.");
				const pw = await requirePwAi(res, "wait for download");
				if (!pw) return;
				await ensureOutputRootDir(DEFAULT_DOWNLOAD_DIR);
				let downloadPath;
				if (out.trim()) {
					const resolvedDownloadPath = await resolveWritableOutputPathOrRespond({
						res,
						rootDir: DEFAULT_DOWNLOAD_DIR,
						requestedPath: out,
						scopeLabel: "downloads directory"
					});
					if (!resolvedDownloadPath) return;
					downloadPath = resolvedDownloadPath;
				}
				const requestBase = buildDownloadRequestBase(cdpUrl, tab.targetId, timeoutMs);
				const result = await pw.waitForDownloadViaPlaywright({
					...requestBase,
					path: downloadPath
				});
				res.json({
					ok: true,
					targetId: tab.targetId,
					download: result
				});
			}
		});
	});
	app.post("/download", async (req, res) => {
		const body = readBody(req);
		const targetId = resolveTargetIdFromBody(body);
		const ref = toStringOrEmpty(body.ref);
		const out = toStringOrEmpty(body.path);
		const timeoutMs = toNumber(body.timeoutMs);
		if (!ref) return jsonError(res, 400, "ref is required");
		if (!out) return jsonError(res, 400, "path is required");
		await withRouteTabContext({
			req,
			res,
			ctx,
			targetId,
			run: async ({ profileCtx, cdpUrl, tab }) => {
				if (getBrowserProfileCapabilities(profileCtx.profile).usesChromeMcp) return jsonError(res, 501, "downloads are not supported for existing-session profiles yet.");
				const pw = await requirePwAi(res, "download");
				if (!pw) return;
				await ensureOutputRootDir(DEFAULT_DOWNLOAD_DIR);
				const downloadPath = await resolveWritableOutputPathOrRespond({
					res,
					rootDir: DEFAULT_DOWNLOAD_DIR,
					requestedPath: out,
					scopeLabel: "downloads directory"
				});
				if (!downloadPath) return;
				const requestBase = buildDownloadRequestBase(cdpUrl, tab.targetId, timeoutMs);
				const result = await pw.downloadViaPlaywright({
					...requestBase,
					ref,
					path: downloadPath
				});
				res.json({
					ok: true,
					targetId: tab.targetId,
					download: result
				});
			}
		});
	});
}
//#endregion
//#region src/browser/routes/agent.act.hooks.ts
function registerBrowserAgentActHookRoutes(app, ctx) {
	app.post("/hooks/file-chooser", async (req, res) => {
		const body = readBody(req);
		const targetId = resolveTargetIdFromBody(body);
		const ref = toStringOrEmpty(body.ref) || void 0;
		const inputRef = toStringOrEmpty(body.inputRef) || void 0;
		const element = toStringOrEmpty(body.element) || void 0;
		const paths = toStringArray(body.paths) ?? [];
		const timeoutMs = toNumber(body.timeoutMs);
		if (!paths.length) return jsonError(res, 400, "paths are required");
		await withRouteTabContext({
			req,
			res,
			ctx,
			targetId,
			run: async ({ profileCtx, cdpUrl, tab }) => {
				const uploadPathsResult = await resolveExistingPathsWithinRoot({
					rootDir: DEFAULT_UPLOAD_DIR,
					requestedPaths: paths,
					scopeLabel: `uploads directory (${DEFAULT_UPLOAD_DIR})`
				});
				if (!uploadPathsResult.ok) {
					res.status(400).json({ error: uploadPathsResult.error });
					return;
				}
				const resolvedPaths = uploadPathsResult.paths;
				if (getBrowserProfileCapabilities(profileCtx.profile).usesChromeMcp) {
					if (element) return jsonError(res, 501, "existing-session file uploads do not support element selectors; use ref/inputRef.");
					if (resolvedPaths.length !== 1) return jsonError(res, 501, "existing-session file uploads currently support one file at a time.");
					const uid = inputRef || ref;
					if (!uid) return jsonError(res, 501, "existing-session file uploads require ref or inputRef.");
					await uploadChromeMcpFile({
						profileName: profileCtx.profile.name,
						userDataDir: profileCtx.profile.userDataDir,
						targetId: tab.targetId,
						uid,
						filePath: resolvedPaths[0] ?? ""
					});
					return res.json({ ok: true });
				}
				const pw = await requirePwAi(res, "file chooser hook");
				if (!pw) return;
				if (inputRef || element) {
					if (ref) return jsonError(res, 400, "ref cannot be combined with inputRef/element");
					await pw.setInputFilesViaPlaywright({
						cdpUrl,
						targetId: tab.targetId,
						inputRef,
						element,
						paths: resolvedPaths
					});
				} else {
					await pw.armFileUploadViaPlaywright({
						cdpUrl,
						targetId: tab.targetId,
						paths: resolvedPaths,
						timeoutMs: timeoutMs ?? void 0
					});
					if (ref) await pw.clickViaPlaywright({
						cdpUrl,
						targetId: tab.targetId,
						ref
					});
				}
				res.json({ ok: true });
			}
		});
	});
	app.post("/hooks/dialog", async (req, res) => {
		const body = readBody(req);
		const targetId = resolveTargetIdFromBody(body);
		const accept = toBoolean(body.accept);
		const promptText = toStringOrEmpty(body.promptText) || void 0;
		const timeoutMs = toNumber(body.timeoutMs);
		if (accept === void 0) return jsonError(res, 400, "accept is required");
		await withRouteTabContext({
			req,
			res,
			ctx,
			targetId,
			run: async ({ profileCtx, cdpUrl, tab }) => {
				if (getBrowserProfileCapabilities(profileCtx.profile).usesChromeMcp) {
					if (timeoutMs) return jsonError(res, 501, "existing-session dialog handling does not support timeoutMs.");
					await evaluateChromeMcpScript({
						profileName: profileCtx.profile.name,
						userDataDir: profileCtx.profile.userDataDir,
						targetId: tab.targetId,
						fn: `() => {
              const state = (window.__openclawDialogHook ??= {});
              if (!state.originals) {
                state.originals = {
                  alert: window.alert.bind(window),
                  confirm: window.confirm.bind(window),
                  prompt: window.prompt.bind(window),
                };
              }
              const originals = state.originals;
              const restore = () => {
                window.alert = originals.alert;
                window.confirm = originals.confirm;
                window.prompt = originals.prompt;
                delete window.__openclawDialogHook;
              };
              window.alert = (...args) => {
                try {
                  return undefined;
                } finally {
                  restore();
                }
              };
              window.confirm = (...args) => {
                try {
                  return ${accept ? "true" : "false"};
                } finally {
                  restore();
                }
              };
              window.prompt = (...args) => {
                try {
                  return ${accept ? JSON.stringify(promptText ?? "") : "null"};
                } finally {
                  restore();
                }
              };
              return true;
            }`
					});
					return res.json({ ok: true });
				}
				const pw = await requirePwAi(res, "dialog hook");
				if (!pw) return;
				await pw.armDialogViaPlaywright({
					cdpUrl,
					targetId: tab.targetId,
					accept,
					promptText,
					timeoutMs: timeoutMs ?? void 0
				});
				res.json({ ok: true });
			}
		});
	});
}
//#endregion
//#region src/browser/routes/agent.act.shared.ts
const ACT_KINDS = [
	"batch",
	"click",
	"close",
	"drag",
	"evaluate",
	"fill",
	"hover",
	"scrollIntoView",
	"press",
	"resize",
	"select",
	"type",
	"wait"
];
function isActKind(value) {
	if (typeof value !== "string") return false;
	return ACT_KINDS.includes(value);
}
const ALLOWED_CLICK_MODIFIERS = new Set([
	"Alt",
	"Control",
	"ControlOrMeta",
	"Meta",
	"Shift"
]);
function parseClickButton(raw) {
	if (raw === "left" || raw === "right" || raw === "middle") return raw;
}
function parseClickModifiers(raw) {
	if (raw.filter((m) => !ALLOWED_CLICK_MODIFIERS.has(m)).length) return { error: "modifiers must be Alt|Control|ControlOrMeta|Meta|Shift" };
	return { modifiers: raw.length ? raw : void 0 };
}
//#endregion
//#region src/browser/routes/agent.act.ts
function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
function browserEvaluateDisabledMessage(action) {
	return [action === "wait" ? "wait --fn is disabled by config (browser.evaluateEnabled=false)." : "act:evaluate is disabled by config (browser.evaluateEnabled=false).", "Docs: /gateway/configuration#browser-openclaw-managed-browser"].join("\n");
}
function buildExistingSessionWaitPredicate(params) {
	const checks = [];
	if (params.text) checks.push(`Boolean(document.body?.innerText?.includes(${JSON.stringify(params.text)}))`);
	if (params.textGone) checks.push(`!document.body?.innerText?.includes(${JSON.stringify(params.textGone)})`);
	if (params.selector) checks.push(`Boolean(document.querySelector(${JSON.stringify(params.selector)}))`);
	if (params.loadState === "domcontentloaded") checks.push(`document.readyState === "interactive" || document.readyState === "complete"`);
	else if (params.loadState === "load") checks.push(`document.readyState === "complete"`);
	if (params.fn) checks.push(`Boolean(await (${params.fn})())`);
	if (checks.length === 0) return null;
	return checks.length === 1 ? checks[0] : checks.map((check) => `(${check})`).join(" && ");
}
async function waitForExistingSessionCondition(params) {
	if (params.timeMs && params.timeMs > 0) await sleep(params.timeMs);
	const predicate = buildExistingSessionWaitPredicate(params);
	if (!predicate && !params.url) return;
	const timeoutMs = Math.max(250, params.timeoutMs ?? 1e4);
	const deadline = Date.now() + timeoutMs;
	while (Date.now() < deadline) {
		let ready = true;
		if (predicate) ready = Boolean(await evaluateChromeMcpScript({
			profileName: params.profileName,
			userDataDir: params.userDataDir,
			targetId: params.targetId,
			fn: `async () => ${predicate}`
		}));
		if (ready && params.url) {
			const currentUrl = await evaluateChromeMcpScript({
				profileName: params.profileName,
				userDataDir: params.userDataDir,
				targetId: params.targetId,
				fn: "() => window.location.href"
			});
			ready = typeof currentUrl === "string" && matchBrowserUrlPattern(params.url, currentUrl);
		}
		if (ready) return;
		await sleep(250);
	}
	throw new Error("Timed out waiting for condition");
}
const SELECTOR_ALLOWED_KINDS = new Set([
	"batch",
	"click",
	"drag",
	"hover",
	"scrollIntoView",
	"select",
	"type",
	"wait"
]);
const MAX_BATCH_ACTIONS = 100;
const MAX_BATCH_CLICK_DELAY_MS = 5e3;
const MAX_BATCH_WAIT_TIME_MS = 3e4;
function normalizeBoundedNonNegativeMs(value, fieldName, maxMs) {
	const ms = toNumber(value);
	if (ms === void 0) return;
	if (ms < 0) throw new Error(`${fieldName} must be >= 0`);
	const normalized = Math.floor(ms);
	if (normalized > maxMs) throw new Error(`${fieldName} exceeds maximum of ${maxMs}ms`);
	return normalized;
}
function countBatchActions(actions) {
	let count = 0;
	for (const action of actions) {
		count += 1;
		if (action.kind === "batch") count += countBatchActions(action.actions);
	}
	return count;
}
function validateBatchTargetIds(actions, targetId) {
	for (const action of actions) {
		if (action.targetId && action.targetId !== targetId) return "batched action targetId must match request targetId";
		if (action.kind === "batch") {
			const nestedError = validateBatchTargetIds(action.actions, targetId);
			if (nestedError) return nestedError;
		}
	}
	return null;
}
function normalizeBatchAction(value) {
	if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("batch actions must be objects");
	const raw = value;
	const kind = toStringOrEmpty(raw.kind);
	if (!isActKind(kind)) throw new Error("batch actions must use a supported kind");
	switch (kind) {
		case "click": {
			const ref = toStringOrEmpty(raw.ref) || void 0;
			const selector = toStringOrEmpty(raw.selector) || void 0;
			if (!ref && !selector) throw new Error("click requires ref or selector");
			const buttonRaw = toStringOrEmpty(raw.button);
			const button = buttonRaw ? parseClickButton(buttonRaw) : void 0;
			if (buttonRaw && !button) throw new Error("click button must be left|right|middle");
			const parsedModifiers = parseClickModifiers(toStringArray(raw.modifiers) ?? []);
			if (parsedModifiers.error) throw new Error(parsedModifiers.error);
			const doubleClick = toBoolean(raw.doubleClick);
			const delayMs = normalizeBoundedNonNegativeMs(raw.delayMs, "click delayMs", MAX_BATCH_CLICK_DELAY_MS);
			const timeoutMs = toNumber(raw.timeoutMs);
			const targetId = toStringOrEmpty(raw.targetId) || void 0;
			return {
				kind,
				...ref ? { ref } : {},
				...selector ? { selector } : {},
				...targetId ? { targetId } : {},
				...doubleClick !== void 0 ? { doubleClick } : {},
				...button ? { button } : {},
				...parsedModifiers.modifiers ? { modifiers: parsedModifiers.modifiers } : {},
				...delayMs !== void 0 ? { delayMs } : {},
				...timeoutMs !== void 0 ? { timeoutMs } : {}
			};
		}
		case "type": {
			const ref = toStringOrEmpty(raw.ref) || void 0;
			const selector = toStringOrEmpty(raw.selector) || void 0;
			const text = raw.text;
			if (!ref && !selector) throw new Error("type requires ref or selector");
			if (typeof text !== "string") throw new Error("type requires text");
			const targetId = toStringOrEmpty(raw.targetId) || void 0;
			const submit = toBoolean(raw.submit);
			const slowly = toBoolean(raw.slowly);
			const timeoutMs = toNumber(raw.timeoutMs);
			return {
				kind,
				...ref ? { ref } : {},
				...selector ? { selector } : {},
				text,
				...targetId ? { targetId } : {},
				...submit !== void 0 ? { submit } : {},
				...slowly !== void 0 ? { slowly } : {},
				...timeoutMs !== void 0 ? { timeoutMs } : {}
			};
		}
		case "press": {
			const key = toStringOrEmpty(raw.key);
			if (!key) throw new Error("press requires key");
			const targetId = toStringOrEmpty(raw.targetId) || void 0;
			const delayMs = toNumber(raw.delayMs);
			return {
				kind,
				key,
				...targetId ? { targetId } : {},
				...delayMs !== void 0 ? { delayMs } : {}
			};
		}
		case "hover":
		case "scrollIntoView": {
			const ref = toStringOrEmpty(raw.ref) || void 0;
			const selector = toStringOrEmpty(raw.selector) || void 0;
			if (!ref && !selector) throw new Error(`${kind} requires ref or selector`);
			const targetId = toStringOrEmpty(raw.targetId) || void 0;
			const timeoutMs = toNumber(raw.timeoutMs);
			return {
				kind,
				...ref ? { ref } : {},
				...selector ? { selector } : {},
				...targetId ? { targetId } : {},
				...timeoutMs !== void 0 ? { timeoutMs } : {}
			};
		}
		case "drag": {
			const startRef = toStringOrEmpty(raw.startRef) || void 0;
			const startSelector = toStringOrEmpty(raw.startSelector) || void 0;
			const endRef = toStringOrEmpty(raw.endRef) || void 0;
			const endSelector = toStringOrEmpty(raw.endSelector) || void 0;
			if (!startRef && !startSelector) throw new Error("drag requires startRef or startSelector");
			if (!endRef && !endSelector) throw new Error("drag requires endRef or endSelector");
			const targetId = toStringOrEmpty(raw.targetId) || void 0;
			const timeoutMs = toNumber(raw.timeoutMs);
			return {
				kind,
				...startRef ? { startRef } : {},
				...startSelector ? { startSelector } : {},
				...endRef ? { endRef } : {},
				...endSelector ? { endSelector } : {},
				...targetId ? { targetId } : {},
				...timeoutMs !== void 0 ? { timeoutMs } : {}
			};
		}
		case "select": {
			const ref = toStringOrEmpty(raw.ref) || void 0;
			const selector = toStringOrEmpty(raw.selector) || void 0;
			const values = toStringArray(raw.values);
			if (!ref && !selector || !values?.length) throw new Error("select requires ref/selector and values");
			const targetId = toStringOrEmpty(raw.targetId) || void 0;
			const timeoutMs = toNumber(raw.timeoutMs);
			return {
				kind,
				...ref ? { ref } : {},
				...selector ? { selector } : {},
				values,
				...targetId ? { targetId } : {},
				...timeoutMs !== void 0 ? { timeoutMs } : {}
			};
		}
		case "fill": {
			const fields = (Array.isArray(raw.fields) ? raw.fields : []).map((field) => {
				if (!field || typeof field !== "object") return null;
				return normalizeBrowserFormField(field);
			}).filter((field) => field !== null);
			if (!fields.length) throw new Error("fill requires fields");
			const targetId = toStringOrEmpty(raw.targetId) || void 0;
			const timeoutMs = toNumber(raw.timeoutMs);
			return {
				kind,
				fields,
				...targetId ? { targetId } : {},
				...timeoutMs !== void 0 ? { timeoutMs } : {}
			};
		}
		case "resize": {
			const width = toNumber(raw.width);
			const height = toNumber(raw.height);
			if (width === void 0 || height === void 0) throw new Error("resize requires width and height");
			const targetId = toStringOrEmpty(raw.targetId) || void 0;
			return {
				kind,
				width,
				height,
				...targetId ? { targetId } : {}
			};
		}
		case "wait": {
			const loadStateRaw = toStringOrEmpty(raw.loadState);
			const loadState = loadStateRaw === "load" || loadStateRaw === "domcontentloaded" || loadStateRaw === "networkidle" ? loadStateRaw : void 0;
			const timeMs = normalizeBoundedNonNegativeMs(raw.timeMs, "wait timeMs", MAX_BATCH_WAIT_TIME_MS);
			const text = toStringOrEmpty(raw.text) || void 0;
			const textGone = toStringOrEmpty(raw.textGone) || void 0;
			const selector = toStringOrEmpty(raw.selector) || void 0;
			const url = toStringOrEmpty(raw.url) || void 0;
			const fn = toStringOrEmpty(raw.fn) || void 0;
			if (timeMs === void 0 && !text && !textGone && !selector && !url && !loadState && !fn) throw new Error("wait requires at least one of: timeMs, text, textGone, selector, url, loadState, fn");
			const targetId = toStringOrEmpty(raw.targetId) || void 0;
			const timeoutMs = toNumber(raw.timeoutMs);
			return {
				kind,
				...timeMs !== void 0 ? { timeMs } : {},
				...text ? { text } : {},
				...textGone ? { textGone } : {},
				...selector ? { selector } : {},
				...url ? { url } : {},
				...loadState ? { loadState } : {},
				...fn ? { fn } : {},
				...targetId ? { targetId } : {},
				...timeoutMs !== void 0 ? { timeoutMs } : {}
			};
		}
		case "evaluate": {
			const fn = toStringOrEmpty(raw.fn);
			if (!fn) throw new Error("evaluate requires fn");
			const ref = toStringOrEmpty(raw.ref) || void 0;
			const targetId = toStringOrEmpty(raw.targetId) || void 0;
			const timeoutMs = toNumber(raw.timeoutMs);
			return {
				kind,
				fn,
				...ref ? { ref } : {},
				...targetId ? { targetId } : {},
				...timeoutMs !== void 0 ? { timeoutMs } : {}
			};
		}
		case "close": {
			const targetId = toStringOrEmpty(raw.targetId) || void 0;
			return {
				kind,
				...targetId ? { targetId } : {}
			};
		}
		case "batch": {
			const actions = Array.isArray(raw.actions) ? raw.actions.map(normalizeBatchAction) : [];
			if (!actions.length) throw new Error("batch requires actions");
			if (countBatchActions(actions) > MAX_BATCH_ACTIONS) throw new Error(`batch exceeds maximum of ${MAX_BATCH_ACTIONS} actions`);
			const targetId = toStringOrEmpty(raw.targetId) || void 0;
			const stopOnError = toBoolean(raw.stopOnError);
			return {
				kind,
				actions,
				...targetId ? { targetId } : {},
				...stopOnError !== void 0 ? { stopOnError } : {}
			};
		}
	}
}
function registerBrowserAgentActRoutes(app, ctx) {
	app.post("/act", async (req, res) => {
		const body = readBody(req);
		const kindRaw = toStringOrEmpty(body.kind);
		if (!isActKind(kindRaw)) return jsonError(res, 400, "kind is required");
		const kind = kindRaw;
		const targetId = resolveTargetIdFromBody(body);
		if (Object.hasOwn(body, "selector") && !SELECTOR_ALLOWED_KINDS.has(kind)) return jsonError(res, 400, SELECTOR_UNSUPPORTED_MESSAGE);
		const earlyFn = kind === "wait" || kind === "evaluate" ? toStringOrEmpty(body.fn) : "";
		if ((kind === "evaluate" || kind === "wait" && earlyFn) && !ctx.state().resolved.evaluateEnabled) return jsonError(res, 403, browserEvaluateDisabledMessage(kind === "evaluate" ? "evaluate" : "wait"));
		await withRouteTabContext({
			req,
			res,
			ctx,
			targetId,
			run: async ({ profileCtx, cdpUrl, tab }) => {
				const evaluateEnabled = ctx.state().resolved.evaluateEnabled;
				const isExistingSession = getBrowserProfileCapabilities(profileCtx.profile).usesChromeMcp;
				const profileName = profileCtx.profile.name;
				switch (kind) {
					case "click": {
						const ref = toStringOrEmpty(body.ref) || void 0;
						const selector = toStringOrEmpty(body.selector) || void 0;
						if (!ref && !selector) return jsonError(res, 400, "ref or selector is required");
						const doubleClick = toBoolean(body.doubleClick) ?? false;
						const timeoutMs = toNumber(body.timeoutMs);
						const delayMs = toNumber(body.delayMs);
						const buttonRaw = toStringOrEmpty(body.button) || "";
						const button = buttonRaw ? parseClickButton(buttonRaw) : void 0;
						if (buttonRaw && !button) return jsonError(res, 400, "button must be left|right|middle");
						const parsedModifiers = parseClickModifiers(toStringArray(body.modifiers) ?? []);
						if (parsedModifiers.error) return jsonError(res, 400, parsedModifiers.error);
						const modifiers = parsedModifiers.modifiers;
						if (isExistingSession) {
							if (selector) return jsonError(res, 501, "existing-session click does not support selector targeting yet; use ref.");
							if (button && button !== "left" || modifiers && modifiers.length > 0) return jsonError(res, 501, "existing-session click currently supports left-click only (no button overrides/modifiers).");
							await clickChromeMcpElement({
								profileName,
								userDataDir: profileCtx.profile.userDataDir,
								targetId: tab.targetId,
								uid: ref,
								doubleClick
							});
							return res.json({
								ok: true,
								targetId: tab.targetId,
								url: tab.url
							});
						}
						const pw = await requirePwAi(res, `act:${kind}`);
						if (!pw) return;
						const clickRequest = {
							cdpUrl,
							targetId: tab.targetId,
							doubleClick
						};
						if (ref) clickRequest.ref = ref;
						if (selector) clickRequest.selector = selector;
						if (button) clickRequest.button = button;
						if (modifiers) clickRequest.modifiers = modifiers;
						if (delayMs) clickRequest.delayMs = delayMs;
						if (timeoutMs) clickRequest.timeoutMs = timeoutMs;
						await pw.clickViaPlaywright(clickRequest);
						return res.json({
							ok: true,
							targetId: tab.targetId,
							url: tab.url
						});
					}
					case "type": {
						const ref = toStringOrEmpty(body.ref) || void 0;
						const selector = toStringOrEmpty(body.selector) || void 0;
						if (!ref && !selector) return jsonError(res, 400, "ref or selector is required");
						if (typeof body.text !== "string") return jsonError(res, 400, "text is required");
						const text = body.text;
						const submit = toBoolean(body.submit) ?? false;
						const slowly = toBoolean(body.slowly) ?? false;
						const timeoutMs = toNumber(body.timeoutMs);
						if (isExistingSession) {
							if (selector) return jsonError(res, 501, "existing-session type does not support selector targeting yet; use ref.");
							if (slowly) return jsonError(res, 501, "existing-session type does not support slowly=true; use fill/press instead.");
							await fillChromeMcpElement({
								profileName,
								userDataDir: profileCtx.profile.userDataDir,
								targetId: tab.targetId,
								uid: ref,
								value: text
							});
							if (submit) await pressChromeMcpKey({
								profileName,
								userDataDir: profileCtx.profile.userDataDir,
								targetId: tab.targetId,
								key: "Enter"
							});
							return res.json({
								ok: true,
								targetId: tab.targetId
							});
						}
						const pw = await requirePwAi(res, `act:${kind}`);
						if (!pw) return;
						const typeRequest = {
							cdpUrl,
							targetId: tab.targetId,
							text,
							submit,
							slowly
						};
						if (ref) typeRequest.ref = ref;
						if (selector) typeRequest.selector = selector;
						if (timeoutMs) typeRequest.timeoutMs = timeoutMs;
						await pw.typeViaPlaywright(typeRequest);
						return res.json({
							ok: true,
							targetId: tab.targetId
						});
					}
					case "press": {
						const key = toStringOrEmpty(body.key);
						if (!key) return jsonError(res, 400, "key is required");
						const delayMs = toNumber(body.delayMs);
						if (isExistingSession) {
							if (delayMs) return jsonError(res, 501, "existing-session press does not support delayMs.");
							await pressChromeMcpKey({
								profileName,
								userDataDir: profileCtx.profile.userDataDir,
								targetId: tab.targetId,
								key
							});
							return res.json({
								ok: true,
								targetId: tab.targetId
							});
						}
						const pw = await requirePwAi(res, `act:${kind}`);
						if (!pw) return;
						await pw.pressKeyViaPlaywright({
							cdpUrl,
							targetId: tab.targetId,
							key,
							delayMs: delayMs ?? void 0
						});
						return res.json({
							ok: true,
							targetId: tab.targetId
						});
					}
					case "hover": {
						const ref = toStringOrEmpty(body.ref) || void 0;
						const selector = toStringOrEmpty(body.selector) || void 0;
						if (!ref && !selector) return jsonError(res, 400, "ref or selector is required");
						const timeoutMs = toNumber(body.timeoutMs);
						if (isExistingSession) {
							if (selector) return jsonError(res, 501, "existing-session hover does not support selector targeting yet; use ref.");
							if (timeoutMs) return jsonError(res, 501, "existing-session hover does not support timeoutMs overrides.");
							await hoverChromeMcpElement({
								profileName,
								userDataDir: profileCtx.profile.userDataDir,
								targetId: tab.targetId,
								uid: ref
							});
							return res.json({
								ok: true,
								targetId: tab.targetId
							});
						}
						const pw = await requirePwAi(res, `act:${kind}`);
						if (!pw) return;
						await pw.hoverViaPlaywright({
							cdpUrl,
							targetId: tab.targetId,
							ref,
							selector,
							timeoutMs: timeoutMs ?? void 0
						});
						return res.json({
							ok: true,
							targetId: tab.targetId
						});
					}
					case "scrollIntoView": {
						const ref = toStringOrEmpty(body.ref) || void 0;
						const selector = toStringOrEmpty(body.selector) || void 0;
						if (!ref && !selector) return jsonError(res, 400, "ref or selector is required");
						const timeoutMs = toNumber(body.timeoutMs);
						if (isExistingSession) {
							if (selector) return jsonError(res, 501, "existing-session scrollIntoView does not support selector targeting yet; use ref.");
							if (timeoutMs) return jsonError(res, 501, "existing-session scrollIntoView does not support timeoutMs overrides.");
							await evaluateChromeMcpScript({
								profileName,
								userDataDir: profileCtx.profile.userDataDir,
								targetId: tab.targetId,
								fn: `(el) => { el.scrollIntoView({ block: "center", inline: "center" }); return true; }`,
								args: [ref]
							});
							return res.json({
								ok: true,
								targetId: tab.targetId
							});
						}
						const pw = await requirePwAi(res, `act:${kind}`);
						if (!pw) return;
						const scrollRequest = {
							cdpUrl,
							targetId: tab.targetId
						};
						if (ref) scrollRequest.ref = ref;
						if (selector) scrollRequest.selector = selector;
						if (timeoutMs) scrollRequest.timeoutMs = timeoutMs;
						await pw.scrollIntoViewViaPlaywright(scrollRequest);
						return res.json({
							ok: true,
							targetId: tab.targetId
						});
					}
					case "drag": {
						const startRef = toStringOrEmpty(body.startRef) || void 0;
						const startSelector = toStringOrEmpty(body.startSelector) || void 0;
						const endRef = toStringOrEmpty(body.endRef) || void 0;
						const endSelector = toStringOrEmpty(body.endSelector) || void 0;
						if (!startRef && !startSelector) return jsonError(res, 400, "startRef or startSelector is required");
						if (!endRef && !endSelector) return jsonError(res, 400, "endRef or endSelector is required");
						const timeoutMs = toNumber(body.timeoutMs);
						if (isExistingSession) {
							if (startSelector || endSelector) return jsonError(res, 501, "existing-session drag does not support selector targeting yet; use startRef/endRef.");
							if (timeoutMs) return jsonError(res, 501, "existing-session drag does not support timeoutMs overrides.");
							await dragChromeMcpElement({
								profileName,
								userDataDir: profileCtx.profile.userDataDir,
								targetId: tab.targetId,
								fromUid: startRef,
								toUid: endRef
							});
							return res.json({
								ok: true,
								targetId: tab.targetId
							});
						}
						const pw = await requirePwAi(res, `act:${kind}`);
						if (!pw) return;
						await pw.dragViaPlaywright({
							cdpUrl,
							targetId: tab.targetId,
							startRef,
							startSelector,
							endRef,
							endSelector,
							timeoutMs: timeoutMs ?? void 0
						});
						return res.json({
							ok: true,
							targetId: tab.targetId
						});
					}
					case "select": {
						const ref = toStringOrEmpty(body.ref) || void 0;
						const selector = toStringOrEmpty(body.selector) || void 0;
						const values = toStringArray(body.values);
						if (!ref && !selector || !values?.length) return jsonError(res, 400, "ref/selector and values are required");
						const timeoutMs = toNumber(body.timeoutMs);
						if (isExistingSession) {
							if (selector) return jsonError(res, 501, "existing-session select does not support selector targeting yet; use ref.");
							if (values.length !== 1) return jsonError(res, 501, "existing-session select currently supports a single value only.");
							if (timeoutMs) return jsonError(res, 501, "existing-session select does not support timeoutMs overrides.");
							await fillChromeMcpElement({
								profileName,
								userDataDir: profileCtx.profile.userDataDir,
								targetId: tab.targetId,
								uid: ref,
								value: values[0] ?? ""
							});
							return res.json({
								ok: true,
								targetId: tab.targetId
							});
						}
						const pw = await requirePwAi(res, `act:${kind}`);
						if (!pw) return;
						await pw.selectOptionViaPlaywright({
							cdpUrl,
							targetId: tab.targetId,
							ref,
							selector,
							values,
							timeoutMs: timeoutMs ?? void 0
						});
						return res.json({
							ok: true,
							targetId: tab.targetId
						});
					}
					case "fill": {
						const fields = (Array.isArray(body.fields) ? body.fields : []).map((field) => {
							if (!field || typeof field !== "object") return null;
							return normalizeBrowserFormField(field);
						}).filter((field) => field !== null);
						if (!fields.length) return jsonError(res, 400, "fields are required");
						const timeoutMs = toNumber(body.timeoutMs);
						if (isExistingSession) {
							if (timeoutMs) return jsonError(res, 501, "existing-session fill does not support timeoutMs overrides.");
							await fillChromeMcpForm({
								profileName,
								userDataDir: profileCtx.profile.userDataDir,
								targetId: tab.targetId,
								elements: fields.map((field) => ({
									uid: field.ref,
									value: String(field.value ?? "")
								}))
							});
							return res.json({
								ok: true,
								targetId: tab.targetId
							});
						}
						const pw = await requirePwAi(res, `act:${kind}`);
						if (!pw) return;
						await pw.fillFormViaPlaywright({
							cdpUrl,
							targetId: tab.targetId,
							fields,
							timeoutMs: timeoutMs ?? void 0
						});
						return res.json({
							ok: true,
							targetId: tab.targetId
						});
					}
					case "resize": {
						const width = toNumber(body.width);
						const height = toNumber(body.height);
						if (!width || !height) return jsonError(res, 400, "width and height are required");
						if (isExistingSession) {
							await resizeChromeMcpPage({
								profileName,
								userDataDir: profileCtx.profile.userDataDir,
								targetId: tab.targetId,
								width,
								height
							});
							return res.json({
								ok: true,
								targetId: tab.targetId,
								url: tab.url
							});
						}
						const pw = await requirePwAi(res, `act:${kind}`);
						if (!pw) return;
						await pw.resizeViewportViaPlaywright({
							cdpUrl,
							targetId: tab.targetId,
							width,
							height
						});
						return res.json({
							ok: true,
							targetId: tab.targetId,
							url: tab.url
						});
					}
					case "wait": {
						const timeMs = toNumber(body.timeMs);
						const text = toStringOrEmpty(body.text) || void 0;
						const textGone = toStringOrEmpty(body.textGone) || void 0;
						const selector = toStringOrEmpty(body.selector) || void 0;
						const url = toStringOrEmpty(body.url) || void 0;
						const loadStateRaw = toStringOrEmpty(body.loadState);
						const loadState = loadStateRaw === "load" || loadStateRaw === "domcontentloaded" || loadStateRaw === "networkidle" ? loadStateRaw : void 0;
						const fn = toStringOrEmpty(body.fn) || void 0;
						const timeoutMs = toNumber(body.timeoutMs) ?? void 0;
						if (fn && !evaluateEnabled) return jsonError(res, 403, browserEvaluateDisabledMessage("wait"));
						if (timeMs === void 0 && !text && !textGone && !selector && !url && !loadState && !fn) return jsonError(res, 400, "wait requires at least one of: timeMs, text, textGone, selector, url, loadState, fn");
						if (isExistingSession) {
							if (loadState === "networkidle") return jsonError(res, 501, "existing-session wait does not support loadState=networkidle yet.");
							await waitForExistingSessionCondition({
								profileName,
								userDataDir: profileCtx.profile.userDataDir,
								targetId: tab.targetId,
								timeMs,
								text,
								textGone,
								selector,
								url,
								loadState,
								fn,
								timeoutMs
							});
							return res.json({
								ok: true,
								targetId: tab.targetId
							});
						}
						const pw = await requirePwAi(res, `act:${kind}`);
						if (!pw) return;
						await pw.waitForViaPlaywright({
							cdpUrl,
							targetId: tab.targetId,
							timeMs,
							text,
							textGone,
							selector,
							url,
							loadState,
							fn,
							timeoutMs
						});
						return res.json({
							ok: true,
							targetId: tab.targetId
						});
					}
					case "evaluate": {
						if (!evaluateEnabled) return jsonError(res, 403, browserEvaluateDisabledMessage("evaluate"));
						const fn = toStringOrEmpty(body.fn);
						if (!fn) return jsonError(res, 400, "fn is required");
						const ref = toStringOrEmpty(body.ref) || void 0;
						const evalTimeoutMs = toNumber(body.timeoutMs);
						if (isExistingSession) {
							if (evalTimeoutMs !== void 0) return jsonError(res, 501, "existing-session evaluate does not support timeoutMs overrides.");
							const result = await evaluateChromeMcpScript({
								profileName,
								userDataDir: profileCtx.profile.userDataDir,
								targetId: tab.targetId,
								fn,
								args: ref ? [ref] : void 0
							});
							return res.json({
								ok: true,
								targetId: tab.targetId,
								url: tab.url,
								result
							});
						}
						const pw = await requirePwAi(res, `act:${kind}`);
						if (!pw) return;
						const evalRequest = {
							cdpUrl,
							targetId: tab.targetId,
							fn,
							ref,
							signal: req.signal
						};
						if (evalTimeoutMs !== void 0) evalRequest.timeoutMs = evalTimeoutMs;
						const result = await pw.evaluateViaPlaywright(evalRequest);
						return res.json({
							ok: true,
							targetId: tab.targetId,
							url: tab.url,
							result
						});
					}
					case "close": {
						if (isExistingSession) {
							await closeChromeMcpTab(profileName, tab.targetId, profileCtx.profile.userDataDir);
							return res.json({
								ok: true,
								targetId: tab.targetId
							});
						}
						const pw = await requirePwAi(res, `act:${kind}`);
						if (!pw) return;
						await pw.closePageViaPlaywright({
							cdpUrl,
							targetId: tab.targetId
						});
						return res.json({
							ok: true,
							targetId: tab.targetId
						});
					}
					case "batch": {
						if (isExistingSession) return jsonError(res, 501, "existing-session batch is not supported yet; send actions individually.");
						const pw = await requirePwAi(res, `act:${kind}`);
						if (!pw) return;
						let actions;
						try {
							actions = Array.isArray(body.actions) ? body.actions.map(normalizeBatchAction) : [];
						} catch (err) {
							return jsonError(res, 400, err instanceof Error ? err.message : String(err));
						}
						if (!actions.length) return jsonError(res, 400, "actions are required");
						if (countBatchActions(actions) > MAX_BATCH_ACTIONS) return jsonError(res, 400, `batch exceeds maximum of ${MAX_BATCH_ACTIONS} actions`);
						const targetIdError = validateBatchTargetIds(actions, tab.targetId);
						if (targetIdError) return jsonError(res, 403, targetIdError);
						const stopOnError = toBoolean(body.stopOnError) ?? true;
						const result = await pw.batchViaPlaywright({
							cdpUrl,
							targetId: tab.targetId,
							actions,
							stopOnError,
							evaluateEnabled
						});
						return res.json({
							ok: true,
							targetId: tab.targetId,
							results: result.results
						});
					}
					default: return jsonError(res, 400, "unsupported kind");
				}
			}
		});
	});
	registerBrowserAgentActHookRoutes(app, ctx);
	registerBrowserAgentActDownloadRoutes(app, ctx);
	app.post("/response/body", async (req, res) => {
		const body = readBody(req);
		const targetId = resolveTargetIdFromBody(body);
		const url = toStringOrEmpty(body.url);
		const timeoutMs = toNumber(body.timeoutMs);
		const maxChars = toNumber(body.maxChars);
		if (!url) return jsonError(res, 400, "url is required");
		await withRouteTabContext({
			req,
			res,
			ctx,
			targetId,
			run: async ({ profileCtx, cdpUrl, tab }) => {
				if (getBrowserProfileCapabilities(profileCtx.profile).usesChromeMcp) return jsonError(res, 501, "response body is not supported for existing-session profiles yet.");
				const pw = await requirePwAi(res, "response body");
				if (!pw) return;
				const result = await pw.responseBodyViaPlaywright({
					cdpUrl,
					targetId: tab.targetId,
					url,
					timeoutMs: timeoutMs ?? void 0,
					maxChars: maxChars ?? void 0
				});
				res.json({
					ok: true,
					targetId: tab.targetId,
					response: result
				});
			}
		});
	});
	app.post("/highlight", async (req, res) => {
		const body = readBody(req);
		const targetId = resolveTargetIdFromBody(body);
		const ref = toStringOrEmpty(body.ref);
		if (!ref) return jsonError(res, 400, "ref is required");
		await withRouteTabContext({
			req,
			res,
			ctx,
			targetId,
			run: async ({ profileCtx, cdpUrl, tab }) => {
				if (getBrowserProfileCapabilities(profileCtx.profile).usesChromeMcp) {
					await evaluateChromeMcpScript({
						profileName: profileCtx.profile.name,
						userDataDir: profileCtx.profile.userDataDir,
						targetId: tab.targetId,
						args: [ref],
						fn: `(el) => {
              if (!(el instanceof Element)) {
                return false;
              }
              el.scrollIntoView({ block: "center", inline: "center" });
              const previousOutline = el.style.outline;
              const previousOffset = el.style.outlineOffset;
              el.style.outline = "3px solid #FF4500";
              el.style.outlineOffset = "2px";
              setTimeout(() => {
                el.style.outline = previousOutline;
                el.style.outlineOffset = previousOffset;
              }, 2000);
              return true;
            }`
					});
					return res.json({
						ok: true,
						targetId: tab.targetId
					});
				}
				const pw = await requirePwAi(res, "highlight");
				if (!pw) return;
				await pw.highlightViaPlaywright({
					cdpUrl,
					targetId: tab.targetId,
					ref
				});
				res.json({
					ok: true,
					targetId: tab.targetId
				});
			}
		});
	});
}
//#endregion
//#region src/browser/routes/agent.debug.ts
function registerBrowserAgentDebugRoutes(app, ctx) {
	app.get("/console", async (req, res) => {
		const targetId = resolveTargetIdFromQuery(req.query);
		const level = typeof req.query.level === "string" ? req.query.level : "";
		await withPlaywrightRouteContext({
			req,
			res,
			ctx,
			targetId,
			feature: "console messages",
			run: async ({ cdpUrl, tab, pw }) => {
				const messages = await pw.getConsoleMessagesViaPlaywright({
					cdpUrl,
					targetId: tab.targetId,
					level: level.trim() || void 0
				});
				res.json({
					ok: true,
					messages,
					targetId: tab.targetId
				});
			}
		});
	});
	app.get("/errors", async (req, res) => {
		const targetId = resolveTargetIdFromQuery(req.query);
		const clear = toBoolean(req.query.clear) ?? false;
		await withPlaywrightRouteContext({
			req,
			res,
			ctx,
			targetId,
			feature: "page errors",
			run: async ({ cdpUrl, tab, pw }) => {
				const result = await pw.getPageErrorsViaPlaywright({
					cdpUrl,
					targetId: tab.targetId,
					clear
				});
				res.json({
					ok: true,
					targetId: tab.targetId,
					...result
				});
			}
		});
	});
	app.get("/requests", async (req, res) => {
		const targetId = resolveTargetIdFromQuery(req.query);
		const filter = typeof req.query.filter === "string" ? req.query.filter : "";
		const clear = toBoolean(req.query.clear) ?? false;
		await withPlaywrightRouteContext({
			req,
			res,
			ctx,
			targetId,
			feature: "network requests",
			run: async ({ cdpUrl, tab, pw }) => {
				const result = await pw.getNetworkRequestsViaPlaywright({
					cdpUrl,
					targetId: tab.targetId,
					filter: filter.trim() || void 0,
					clear
				});
				res.json({
					ok: true,
					targetId: tab.targetId,
					...result
				});
			}
		});
	});
	app.post("/trace/start", async (req, res) => {
		const body = readBody(req);
		const targetId = resolveTargetIdFromBody(body);
		const screenshots = toBoolean(body.screenshots) ?? void 0;
		const snapshots = toBoolean(body.snapshots) ?? void 0;
		const sources = toBoolean(body.sources) ?? void 0;
		await withPlaywrightRouteContext({
			req,
			res,
			ctx,
			targetId,
			feature: "trace start",
			run: async ({ cdpUrl, tab, pw }) => {
				await pw.traceStartViaPlaywright({
					cdpUrl,
					targetId: tab.targetId,
					screenshots,
					snapshots,
					sources
				});
				res.json({
					ok: true,
					targetId: tab.targetId
				});
			}
		});
	});
	app.post("/trace/stop", async (req, res) => {
		const body = readBody(req);
		const targetId = resolveTargetIdFromBody(body);
		const out = toStringOrEmpty(body.path) || "";
		await withPlaywrightRouteContext({
			req,
			res,
			ctx,
			targetId,
			feature: "trace stop",
			run: async ({ cdpUrl, tab, pw }) => {
				const tracePath = await resolveWritableOutputPathOrRespond({
					res,
					rootDir: DEFAULT_TRACE_DIR,
					requestedPath: out,
					scopeLabel: "trace directory",
					defaultFileName: `browser-trace-${crypto.randomUUID()}.zip`,
					ensureRootDir: true
				});
				if (!tracePath) return;
				await pw.traceStopViaPlaywright({
					cdpUrl,
					targetId: tab.targetId,
					path: tracePath
				});
				res.json({
					ok: true,
					targetId: tab.targetId,
					path: path.resolve(tracePath)
				});
			}
		});
	});
}
//#endregion
//#region src/media/store.ts
const resolveMediaDir = () => path.join(resolveConfigDir(), "media");
const MEDIA_MAX_BYTES = 5 * 1024 * 1024;
const MAX_BYTES = MEDIA_MAX_BYTES;
const DEFAULT_TTL_MS = 120 * 1e3;
const MEDIA_FILE_MODE = 420;
const defaultHttpRequestImpl = request$1;
const defaultHttpsRequestImpl = request;
const defaultResolvePinnedHostnameImpl = resolvePinnedHostname;
let httpRequestImpl = defaultHttpRequestImpl;
let httpsRequestImpl = defaultHttpsRequestImpl;
let resolvePinnedHostnameImpl = defaultResolvePinnedHostnameImpl;
function setMediaStoreNetworkDepsForTest(deps) {
	httpRequestImpl = deps?.httpRequest ?? defaultHttpRequestImpl;
	httpsRequestImpl = deps?.httpsRequest ?? defaultHttpsRequestImpl;
	resolvePinnedHostnameImpl = deps?.resolvePinnedHostname ?? defaultResolvePinnedHostnameImpl;
}
/**
* Sanitize a filename for cross-platform safety.
* Removes chars unsafe on Windows/SharePoint/all platforms.
* Keeps: alphanumeric, dots, hyphens, underscores, Unicode letters/numbers.
*/
function sanitizeFilename(name) {
	const trimmed = name.trim();
	if (!trimmed) return "";
	return trimmed.replace(/[^\p{L}\p{N}._-]+/gu, "_").replace(/_+/g, "_").replace(/^_|_$/g, "").slice(0, 60);
}
/**
* Extract original filename from path if it matches the embedded format.
* Pattern: {original}---{uuid}.{ext} → returns "{original}.{ext}"
* Falls back to basename if no pattern match, or "file.bin" if empty.
*/
function extractOriginalFilename(filePath) {
	const basename = path.basename(filePath);
	if (!basename) return "file.bin";
	const ext = path.extname(basename);
	const match = path.basename(basename, ext).match(/^(.+)---[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i);
	if (match?.[1]) return `${match[1]}${ext}`;
	return basename;
}
function getMediaDir() {
	return resolveMediaDir();
}
async function ensureMediaDir() {
	const mediaDir = resolveMediaDir();
	await fs$1.mkdir(mediaDir, {
		recursive: true,
		mode: 448
	});
	return mediaDir;
}
function isMissingPathError(err) {
	return err instanceof Error && "code" in err && err.code === "ENOENT";
}
async function retryAfterRecreatingDir(dir, run) {
	try {
		return await run();
	} catch (err) {
		if (!isMissingPathError(err)) throw err;
		await fs$1.mkdir(dir, {
			recursive: true,
			mode: 448
		});
		return await run();
	}
}
async function cleanOldMedia(ttlMs = DEFAULT_TTL_MS, options = {}) {
	const mediaDir = await ensureMediaDir();
	const now = Date.now();
	const recursive = options.recursive ?? false;
	const pruneEmptyDirs = recursive && (options.pruneEmptyDirs ?? false);
	const removeExpiredFilesInDir = async (dir) => {
		const dirEntries = await fs$1.readdir(dir).catch(() => null);
		if (!dirEntries) return false;
		for (const entry of dirEntries) {
			const fullPath = path.join(dir, entry);
			const stat = await fs$1.lstat(fullPath).catch(() => null);
			if (!stat || stat.isSymbolicLink()) continue;
			if (stat.isDirectory()) {
				if (recursive) {
					if (await removeExpiredFilesInDir(fullPath)) await fs$1.rmdir(fullPath).catch(() => {});
				}
				continue;
			}
			if (!stat.isFile()) continue;
			if (now - stat.mtimeMs > ttlMs) await fs$1.rm(fullPath, { force: true }).catch(() => {});
		}
		if (!pruneEmptyDirs) return false;
		const remainingEntries = await fs$1.readdir(dir).catch(() => null);
		return remainingEntries !== null && remainingEntries.length === 0;
	};
	const entries = await fs$1.readdir(mediaDir).catch(() => []);
	for (const file of entries) {
		const full = path.join(mediaDir, file);
		const stat = await fs$1.lstat(full).catch(() => null);
		if (!stat || stat.isSymbolicLink()) continue;
		if (stat.isDirectory()) {
			if (await removeExpiredFilesInDir(full)) await fs$1.rmdir(full).catch(() => {});
			continue;
		}
		if (stat.isFile() && now - stat.mtimeMs > ttlMs) await fs$1.rm(full, { force: true }).catch(() => {});
	}
}
function looksLikeUrl(src) {
	return /^https?:\/\//i.test(src);
}
/**
* Download media to disk while capturing the first few KB for mime sniffing.
*/
async function downloadToFile(url, dest, headers, maxRedirects = 5) {
	return await new Promise((resolve, reject) => {
		let parsedUrl;
		try {
			parsedUrl = new URL(url);
		} catch {
			reject(/* @__PURE__ */ new Error("Invalid URL"));
			return;
		}
		if (!["http:", "https:"].includes(parsedUrl.protocol)) {
			reject(/* @__PURE__ */ new Error(`Invalid URL protocol: ${parsedUrl.protocol}. Only HTTP/HTTPS allowed.`));
			return;
		}
		const requestImpl = parsedUrl.protocol === "https:" ? httpsRequestImpl : httpRequestImpl;
		resolvePinnedHostnameImpl(parsedUrl.hostname).then((pinned) => {
			const req = requestImpl(parsedUrl, {
				headers,
				lookup: pinned.lookup
			}, (res) => {
				if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400) {
					const location = res.headers.location;
					if (!location || maxRedirects <= 0) {
						reject(/* @__PURE__ */ new Error(`Redirect loop or missing Location header`));
						return;
					}
					const redirectUrl = new URL(location, url).href;
					resolve(downloadToFile(redirectUrl, dest, headers, maxRedirects - 1));
					return;
				}
				if (!res.statusCode || res.statusCode >= 400) {
					reject(/* @__PURE__ */ new Error(`HTTP ${res.statusCode ?? "?"} downloading media`));
					return;
				}
				let total = 0;
				const sniffChunks = [];
				let sniffLen = 0;
				const out = createWriteStream(dest, { mode: MEDIA_FILE_MODE });
				res.on("data", (chunk) => {
					total += chunk.length;
					if (sniffLen < 16384) {
						sniffChunks.push(chunk);
						sniffLen += chunk.length;
					}
					if (total > MAX_BYTES) req.destroy(/* @__PURE__ */ new Error("Media exceeds 5MB limit"));
				});
				pipeline(res, out).then(() => {
					const sniffBuffer = Buffer.concat(sniffChunks, Math.min(sniffLen, 16384));
					const rawHeader = res.headers["content-type"];
					resolve({
						headerMime: Array.isArray(rawHeader) ? rawHeader[0] : rawHeader,
						sniffBuffer,
						size: total
					});
				}).catch(reject);
			});
			req.on("error", reject);
			req.end();
		}).catch(reject);
	});
}
function buildSavedMediaId(params) {
	if (!params.originalFilename) return params.ext ? `${params.baseId}${params.ext}` : params.baseId;
	const base = path.parse(params.originalFilename).name;
	const sanitized = sanitizeFilename(base);
	return sanitized ? `${sanitized}---${params.baseId}${params.ext}` : `${params.baseId}${params.ext}`;
}
function buildSavedMediaResult(params) {
	return {
		id: params.id,
		path: path.join(params.dir, params.id),
		size: params.size,
		contentType: params.contentType
	};
}
async function writeSavedMediaBuffer(params) {
	const dest = path.join(params.dir, params.id);
	await retryAfterRecreatingDir(params.dir, () => fs$1.writeFile(dest, params.buffer, { mode: MEDIA_FILE_MODE }));
	return dest;
}
var SaveMediaSourceError = class extends Error {
	constructor(code, message, options) {
		super(message, options);
		this.code = code;
		this.name = "SaveMediaSourceError";
	}
};
function toSaveMediaSourceError(err) {
	switch (err.code) {
		case "symlink": return new SaveMediaSourceError("invalid-path", "Media path must not be a symlink", { cause: err });
		case "not-file": return new SaveMediaSourceError("not-file", "Media path is not a file", { cause: err });
		case "path-mismatch": return new SaveMediaSourceError("path-mismatch", "Media path changed during read", { cause: err });
		case "too-large": return new SaveMediaSourceError("too-large", "Media exceeds 5MB limit", { cause: err });
		case "not-found": return new SaveMediaSourceError("not-found", "Media path does not exist", { cause: err });
		case "outside-workspace": return new SaveMediaSourceError("invalid-path", "Media path is outside workspace root", { cause: err });
		default: return new SaveMediaSourceError("invalid-path", "Media path is not safe to read", { cause: err });
	}
}
async function saveMediaSource(source, headers, subdir = "") {
	const baseDir = resolveMediaDir();
	const dir = subdir ? path.join(baseDir, subdir) : baseDir;
	await fs$1.mkdir(dir, {
		recursive: true,
		mode: 448
	});
	await cleanOldMedia(DEFAULT_TTL_MS, { recursive: false });
	const baseId = crypto.randomUUID();
	if (looksLikeUrl(source)) {
		const tempDest = path.join(dir, `${baseId}.tmp`);
		const { headerMime, sniffBuffer, size } = await retryAfterRecreatingDir(dir, () => downloadToFile(source, tempDest, headers));
		const mime = await detectMime({
			buffer: sniffBuffer,
			headerMime,
			filePath: source
		});
		const id = buildSavedMediaId({
			baseId,
			ext: extensionForMime(mime) ?? path.extname(new URL(source).pathname)
		});
		const finalDest = path.join(dir, id);
		await fs$1.rename(tempDest, finalDest);
		return buildSavedMediaResult({
			dir,
			id,
			size,
			contentType: mime
		});
	}
	try {
		const { buffer, stat } = await readLocalFileSafely({
			filePath: source,
			maxBytes: MAX_BYTES
		});
		const mime = await detectMime({
			buffer,
			filePath: source
		});
		const id = buildSavedMediaId({
			baseId,
			ext: extensionForMime(mime) ?? path.extname(source)
		});
		await writeSavedMediaBuffer({
			dir,
			id,
			buffer
		});
		return buildSavedMediaResult({
			dir,
			id,
			size: stat.size,
			contentType: mime
		});
	} catch (err) {
		if (err instanceof SafeOpenError) throw toSaveMediaSourceError(err);
		throw err;
	}
}
async function saveMediaBuffer(buffer, contentType, subdir = "inbound", maxBytes = MAX_BYTES, originalFilename) {
	if (buffer.byteLength > maxBytes) throw new Error(`Media exceeds ${(maxBytes / (1024 * 1024)).toFixed(0)}MB limit`);
	const dir = path.join(resolveMediaDir(), subdir);
	await fs$1.mkdir(dir, {
		recursive: true,
		mode: 448
	});
	const uuid = crypto.randomUUID();
	const headerExt = extensionForMime(contentType?.split(";")[0]?.trim() ?? void 0);
	const mime = await detectMime({
		buffer,
		headerMime: contentType
	});
	const id = buildSavedMediaId({
		baseId: uuid,
		ext: headerExt ?? extensionForMime(mime) ?? "",
		originalFilename
	});
	await writeSavedMediaBuffer({
		dir,
		id,
		buffer
	});
	return buildSavedMediaResult({
		dir,
		id,
		size: buffer.byteLength,
		contentType: mime
	});
}
//#endregion
//#region src/browser/cdp-proxy-bypass.ts
/**
* Proxy bypass for CDP (Chrome DevTools Protocol) localhost connections.
*
* When HTTP_PROXY / HTTPS_PROXY / ALL_PROXY environment variables are set,
* CDP connections to localhost/127.0.0.1 can be incorrectly routed through
* the proxy, causing browser control to fail.
*
* @see https://github.com/nicepkg/openclaw/issues/31219
*/
/** HTTP agent that never uses a proxy — for localhost CDP connections. */
const directHttpAgent = new http.Agent();
const directHttpsAgent = new https.Agent();
/**
* Returns a plain (non-proxy) agent for WebSocket or HTTP connections
* when the target is a loopback address. Returns `undefined` otherwise
* so callers fall through to their default behaviour.
*/
function getDirectAgentForCdp(url) {
	try {
		const parsed = new URL(url);
		if (isLoopbackHost(parsed.hostname)) return parsed.protocol === "https:" || parsed.protocol === "wss:" ? directHttpsAgent : directHttpAgent;
	} catch {}
}
/**
* Returns `true` when any proxy-related env var is set that could
* interfere with loopback connections.
*/
function hasProxyEnv() {
	return hasProxyEnvConfigured();
}
const LOOPBACK_ENTRIES = "localhost,127.0.0.1,[::1]";
function noProxyAlreadyCoversLocalhost() {
	const current = process.env.NO_PROXY || process.env.no_proxy || "";
	return current.includes("localhost") && current.includes("127.0.0.1") && current.includes("[::1]");
}
function isLoopbackCdpUrl(url) {
	try {
		return isLoopbackHost(new URL(url).hostname);
	} catch {
		return false;
	}
}
var NoProxyLeaseManager = class {
	constructor() {
		this.leaseCount = 0;
		this.snapshot = null;
	}
	acquire(url) {
		if (!isLoopbackCdpUrl(url) || !hasProxyEnv()) return null;
		if (this.leaseCount === 0 && !noProxyAlreadyCoversLocalhost()) {
			const noProxy = process.env.NO_PROXY;
			const noProxyLower = process.env.no_proxy;
			const current = noProxy || noProxyLower || "";
			const applied = current ? `${current},${LOOPBACK_ENTRIES}` : LOOPBACK_ENTRIES;
			process.env.NO_PROXY = applied;
			process.env.no_proxy = applied;
			this.snapshot = {
				noProxy,
				noProxyLower,
				applied
			};
		}
		this.leaseCount += 1;
		let released = false;
		return () => {
			if (released) return;
			released = true;
			this.release();
		};
	}
	release() {
		if (this.leaseCount <= 0) return;
		this.leaseCount -= 1;
		if (this.leaseCount > 0 || !this.snapshot) return;
		const { noProxy, noProxyLower, applied } = this.snapshot;
		const currentNoProxy = process.env.NO_PROXY;
		const currentNoProxyLower = process.env.no_proxy;
		if (currentNoProxy === applied && (currentNoProxyLower === applied || currentNoProxyLower === void 0)) {
			if (noProxy !== void 0) process.env.NO_PROXY = noProxy;
			else delete process.env.NO_PROXY;
			if (noProxyLower !== void 0) process.env.no_proxy = noProxyLower;
			else delete process.env.no_proxy;
		}
		this.snapshot = null;
	}
};
const noProxyLeaseManager = new NoProxyLeaseManager();
/**
* Scoped NO_PROXY bypass for loopback CDP URLs.
*
* This wrapper only mutates env vars for loopback destinations. On restore,
* it avoids clobbering external NO_PROXY changes that happened while calls
* were in-flight.
*/
async function withNoProxyForCdpUrl(url, fn) {
	const release = noProxyLeaseManager.acquire(url);
	try {
		return await fn();
	} finally {
		release?.();
	}
}
//#endregion
//#region src/browser/cdp-timeouts.ts
const CDP_HTTP_REQUEST_TIMEOUT_MS = 1500;
const CDP_WS_HANDSHAKE_TIMEOUT_MS = 5e3;
const CDP_JSON_NEW_TIMEOUT_MS = 1500;
const CHROME_BOOTSTRAP_PREFS_TIMEOUT_MS = 1e4;
const CHROME_BOOTSTRAP_EXIT_TIMEOUT_MS = 5e3;
const CHROME_LAUNCH_READY_WINDOW_MS = 15e3;
const CHROME_STOP_TIMEOUT_MS = 2500;
const CHROME_STDERR_HINT_MAX_CHARS = 2e3;
const PROFILE_WS_REACHABILITY_MAX_TIMEOUT_MS = 2e3;
const CHROME_MCP_ATTACH_READY_WINDOW_MS = 8e3;
function normalizeTimeoutMs(value) {
	if (typeof value !== "number" || !Number.isFinite(value)) return;
	return Math.max(1, Math.floor(value));
}
function resolveCdpReachabilityTimeouts(params) {
	const normalized = normalizeTimeoutMs(params.timeoutMs);
	if (params.profileIsLoopback) {
		const httpTimeoutMs = normalized ?? 300;
		return {
			httpTimeoutMs,
			wsTimeoutMs: Math.max(200, Math.min(PROFILE_WS_REACHABILITY_MAX_TIMEOUT_MS, httpTimeoutMs * 2))
		};
	}
	if (normalized !== void 0) return {
		httpTimeoutMs: Math.max(normalized, params.remoteHttpTimeoutMs),
		wsTimeoutMs: Math.max(normalized * 2, params.remoteHandshakeTimeoutMs)
	};
	return {
		httpTimeoutMs: params.remoteHttpTimeoutMs,
		wsTimeoutMs: params.remoteHandshakeTimeoutMs
	};
}
//#endregion
//#region src/browser/pw-ai-state.ts
let pwAiLoaded = false;
function markPwAiLoaded() {
	pwAiLoaded = true;
}
function isPwAiLoaded() {
	return pwAiLoaded;
}
//#endregion
//#region src/browser/chrome.executables.ts
const CHROME_VERSION_RE = /(\d+)(?:\.\d+){0,3}/;
const CHROMIUM_BUNDLE_IDS = new Set([
	"com.google.Chrome",
	"com.google.Chrome.beta",
	"com.google.Chrome.canary",
	"com.google.Chrome.dev",
	"com.brave.Browser",
	"com.brave.Browser.beta",
	"com.brave.Browser.nightly",
	"com.microsoft.Edge",
	"com.microsoft.EdgeBeta",
	"com.microsoft.EdgeDev",
	"com.microsoft.EdgeCanary",
	"org.chromium.Chromium",
	"com.vivaldi.Vivaldi",
	"com.operasoftware.Opera",
	"com.operasoftware.OperaGX",
	"com.yandex.desktop.yandex-browser",
	"company.thebrowser.Browser"
]);
const CHROMIUM_DESKTOP_IDS = new Set([
	"google-chrome.desktop",
	"google-chrome-beta.desktop",
	"google-chrome-unstable.desktop",
	"brave-browser.desktop",
	"microsoft-edge.desktop",
	"microsoft-edge-beta.desktop",
	"microsoft-edge-dev.desktop",
	"microsoft-edge-canary.desktop",
	"chromium.desktop",
	"chromium-browser.desktop",
	"vivaldi.desktop",
	"vivaldi-stable.desktop",
	"opera.desktop",
	"opera-gx.desktop",
	"yandex-browser.desktop",
	"org.chromium.Chromium.desktop"
]);
const CHROMIUM_EXE_NAMES = new Set([
	"chrome.exe",
	"msedge.exe",
	"brave.exe",
	"brave-browser.exe",
	"chromium.exe",
	"vivaldi.exe",
	"opera.exe",
	"launcher.exe",
	"yandex.exe",
	"yandexbrowser.exe",
	"google chrome",
	"google chrome canary",
	"brave browser",
	"microsoft edge",
	"chromium",
	"chrome",
	"brave",
	"msedge",
	"brave-browser",
	"google-chrome",
	"google-chrome-stable",
	"google-chrome-beta",
	"google-chrome-unstable",
	"microsoft-edge",
	"microsoft-edge-beta",
	"microsoft-edge-dev",
	"microsoft-edge-canary",
	"chromium-browser",
	"vivaldi",
	"vivaldi-stable",
	"opera",
	"opera-stable",
	"opera-gx",
	"yandex-browser"
]);
function exists$1(filePath) {
	try {
		return fs.existsSync(filePath);
	} catch {
		return false;
	}
}
function execText(command, args, timeoutMs = 1200, maxBuffer = 1024 * 1024) {
	try {
		const output = execFileSync(command, args, {
			timeout: timeoutMs,
			encoding: "utf8",
			maxBuffer
		});
		return String(output ?? "").trim() || null;
	} catch {
		return null;
	}
}
function inferKindFromIdentifier(identifier) {
	const id = identifier.toLowerCase();
	if (id.includes("brave")) return "brave";
	if (id.includes("edge")) return "edge";
	if (id.includes("chromium")) return "chromium";
	if (id.includes("canary")) return "canary";
	if (id.includes("opera") || id.includes("vivaldi") || id.includes("yandex") || id.includes("thebrowser")) return "chromium";
	return "chrome";
}
function inferKindFromExecutableName(name) {
	const lower = name.toLowerCase();
	if (lower.includes("brave")) return "brave";
	if (lower.includes("edge") || lower.includes("msedge")) return "edge";
	if (lower.includes("chromium")) return "chromium";
	if (lower.includes("canary") || lower.includes("sxs")) return "canary";
	if (lower.includes("opera") || lower.includes("vivaldi") || lower.includes("yandex")) return "chromium";
	return "chrome";
}
function detectDefaultChromiumExecutable(platform) {
	if (platform === "darwin") return detectDefaultChromiumExecutableMac();
	if (platform === "linux") return detectDefaultChromiumExecutableLinux();
	if (platform === "win32") return detectDefaultChromiumExecutableWindows();
	return null;
}
function detectDefaultChromiumExecutableMac() {
	const bundleId = detectDefaultBrowserBundleIdMac();
	if (!bundleId || !CHROMIUM_BUNDLE_IDS.has(bundleId)) return null;
	const appPathRaw = execText("/usr/bin/osascript", ["-e", `POSIX path of (path to application id "${bundleId}")`]);
	if (!appPathRaw) return null;
	const appPath = appPathRaw.trim().replace(/\/$/, "");
	const exeName = execText("/usr/bin/defaults", [
		"read",
		path.join(appPath, "Contents", "Info"),
		"CFBundleExecutable"
	]);
	if (!exeName) return null;
	const exePath = path.join(appPath, "Contents", "MacOS", exeName.trim());
	if (!exists$1(exePath)) return null;
	return {
		kind: inferKindFromIdentifier(bundleId),
		path: exePath
	};
}
function detectDefaultBrowserBundleIdMac() {
	const plistPath = path.join(os.homedir(), "Library/Preferences/com.apple.LaunchServices/com.apple.launchservices.secure.plist");
	if (!exists$1(plistPath)) return null;
	const handlersRaw = execText("/usr/bin/plutil", [
		"-extract",
		"LSHandlers",
		"json",
		"-o",
		"-",
		"--",
		plistPath
	], 2e3, 5 * 1024 * 1024);
	if (!handlersRaw) return null;
	let handlers;
	try {
		handlers = JSON.parse(handlersRaw);
	} catch {
		return null;
	}
	if (!Array.isArray(handlers)) return null;
	const resolveScheme = (scheme) => {
		let candidate = null;
		for (const entry of handlers) {
			if (!entry || typeof entry !== "object") continue;
			const record = entry;
			if (record.LSHandlerURLScheme !== scheme) continue;
			const role = typeof record.LSHandlerRoleAll === "string" && record.LSHandlerRoleAll || typeof record.LSHandlerRoleViewer === "string" && record.LSHandlerRoleViewer || null;
			if (role) candidate = role;
		}
		return candidate;
	};
	return resolveScheme("http") ?? resolveScheme("https");
}
function detectDefaultChromiumExecutableLinux() {
	const desktopId = execText("xdg-settings", ["get", "default-web-browser"]) || execText("xdg-mime", [
		"query",
		"default",
		"x-scheme-handler/http"
	]);
	if (!desktopId) return null;
	const trimmed = desktopId.trim();
	if (!CHROMIUM_DESKTOP_IDS.has(trimmed)) return null;
	const desktopPath = findDesktopFilePath(trimmed);
	if (!desktopPath) return null;
	const execLine = readDesktopExecLine(desktopPath);
	if (!execLine) return null;
	const command = extractExecutableFromExecLine(execLine);
	if (!command) return null;
	const resolved = resolveLinuxExecutablePath(command);
	if (!resolved) return null;
	const exeName = path.posix.basename(resolved).toLowerCase();
	if (!CHROMIUM_EXE_NAMES.has(exeName)) return null;
	return {
		kind: inferKindFromExecutableName(exeName),
		path: resolved
	};
}
function detectDefaultChromiumExecutableWindows() {
	const progId = readWindowsProgId();
	const command = (progId ? readWindowsCommandForProgId(progId) : null) || readWindowsCommandForProgId("http");
	if (!command) return null;
	const exePath = extractWindowsExecutablePath(expandWindowsEnvVars(command));
	if (!exePath) return null;
	if (!exists$1(exePath)) return null;
	const exeName = path.win32.basename(exePath).toLowerCase();
	if (!CHROMIUM_EXE_NAMES.has(exeName)) return null;
	return {
		kind: inferKindFromExecutableName(exeName),
		path: exePath
	};
}
function findDesktopFilePath(desktopId) {
	const candidates = [
		path.join(os.homedir(), ".local", "share", "applications", desktopId),
		path.join("/usr/local/share/applications", desktopId),
		path.join("/usr/share/applications", desktopId),
		path.join("/var/lib/snapd/desktop/applications", desktopId)
	];
	for (const candidate of candidates) if (exists$1(candidate)) return candidate;
	return null;
}
function readDesktopExecLine(desktopPath) {
	try {
		const lines = fs.readFileSync(desktopPath, "utf8").split(/\r?\n/);
		for (const line of lines) if (line.startsWith("Exec=")) return line.slice(5).trim();
	} catch {}
	return null;
}
function extractExecutableFromExecLine(execLine) {
	const tokens = splitExecLine(execLine);
	for (const token of tokens) {
		if (!token) continue;
		if (token === "env") continue;
		if (token.includes("=") && !token.startsWith("/") && !token.includes("\\")) continue;
		return token.replace(/^["']|["']$/g, "");
	}
	return null;
}
function splitExecLine(line) {
	const tokens = [];
	let current = "";
	let inQuotes = false;
	let quoteChar = "";
	for (let i = 0; i < line.length; i += 1) {
		const ch = line[i];
		if ((ch === "\"" || ch === "'") && (!inQuotes || ch === quoteChar)) {
			if (inQuotes) {
				inQuotes = false;
				quoteChar = "";
			} else {
				inQuotes = true;
				quoteChar = ch;
			}
			continue;
		}
		if (!inQuotes && /\s/.test(ch)) {
			if (current) {
				tokens.push(current);
				current = "";
			}
			continue;
		}
		current += ch;
	}
	if (current) tokens.push(current);
	return tokens;
}
function resolveLinuxExecutablePath(command) {
	const cleaned = command.trim().replace(/%[a-zA-Z]/g, "");
	if (!cleaned) return null;
	if (cleaned.startsWith("/")) return cleaned;
	const resolved = execText("which", [cleaned], 800);
	return resolved ? resolved.trim() : null;
}
function readWindowsProgId() {
	const output = execText("reg", [
		"query",
		"HKCU\\Software\\Microsoft\\Windows\\Shell\\Associations\\UrlAssociations\\http\\UserChoice",
		"/v",
		"ProgId"
	]);
	if (!output) return null;
	return output.match(/ProgId\s+REG_\w+\s+(.+)$/im)?.[1]?.trim() || null;
}
function readWindowsCommandForProgId(progId) {
	const output = execText("reg", [
		"query",
		progId === "http" ? "HKCR\\http\\shell\\open\\command" : `HKCR\\${progId}\\shell\\open\\command`,
		"/ve"
	]);
	if (!output) return null;
	return output.match(/REG_\w+\s+(.+)$/im)?.[1]?.trim() || null;
}
function expandWindowsEnvVars(value) {
	return value.replace(/%([^%]+)%/g, (_match, name) => {
		const key = String(name ?? "").trim();
		return key ? process.env[key] ?? `%${key}%` : _match;
	});
}
function extractWindowsExecutablePath(command) {
	const quoted = command.match(/"([^"]+\\.exe)"/i);
	if (quoted?.[1]) return quoted[1];
	const unquoted = command.match(/([^\\s]+\\.exe)/i);
	if (unquoted?.[1]) return unquoted[1];
	return null;
}
function findFirstExecutable(candidates) {
	for (const candidate of candidates) if (exists$1(candidate.path)) return candidate;
	return null;
}
function findFirstChromeExecutable(candidates) {
	for (const candidate of candidates) if (exists$1(candidate)) return {
		kind: candidate.toLowerCase().includes("sxs") || candidate.toLowerCase().includes("canary") ? "canary" : "chrome",
		path: candidate
	};
	return null;
}
function findChromeExecutableMac() {
	return findFirstExecutable([
		{
			kind: "chrome",
			path: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
		},
		{
			kind: "chrome",
			path: path.join(os.homedir(), "Applications/Google Chrome.app/Contents/MacOS/Google Chrome")
		},
		{
			kind: "brave",
			path: "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser"
		},
		{
			kind: "brave",
			path: path.join(os.homedir(), "Applications/Brave Browser.app/Contents/MacOS/Brave Browser")
		},
		{
			kind: "edge",
			path: "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge"
		},
		{
			kind: "edge",
			path: path.join(os.homedir(), "Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge")
		},
		{
			kind: "chromium",
			path: "/Applications/Chromium.app/Contents/MacOS/Chromium"
		},
		{
			kind: "chromium",
			path: path.join(os.homedir(), "Applications/Chromium.app/Contents/MacOS/Chromium")
		},
		{
			kind: "canary",
			path: "/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary"
		},
		{
			kind: "canary",
			path: path.join(os.homedir(), "Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary")
		}
	]);
}
function findGoogleChromeExecutableMac() {
	return findFirstChromeExecutable([
		"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
		path.join(os.homedir(), "Applications/Google Chrome.app/Contents/MacOS/Google Chrome"),
		"/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary",
		path.join(os.homedir(), "Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary")
	]);
}
function findChromeExecutableLinux() {
	return findFirstExecutable([
		{
			kind: "chrome",
			path: "/usr/bin/google-chrome"
		},
		{
			kind: "chrome",
			path: "/usr/bin/google-chrome-stable"
		},
		{
			kind: "chrome",
			path: "/usr/bin/chrome"
		},
		{
			kind: "brave",
			path: "/usr/bin/brave-browser"
		},
		{
			kind: "brave",
			path: "/usr/bin/brave-browser-stable"
		},
		{
			kind: "brave",
			path: "/usr/bin/brave"
		},
		{
			kind: "brave",
			path: "/snap/bin/brave"
		},
		{
			kind: "edge",
			path: "/usr/bin/microsoft-edge"
		},
		{
			kind: "edge",
			path: "/usr/bin/microsoft-edge-stable"
		},
		{
			kind: "chromium",
			path: "/usr/bin/chromium"
		},
		{
			kind: "chromium",
			path: "/usr/bin/chromium-browser"
		},
		{
			kind: "chromium",
			path: "/snap/bin/chromium"
		}
	]);
}
function findGoogleChromeExecutableLinux() {
	return findFirstChromeExecutable([
		"/usr/bin/google-chrome",
		"/usr/bin/google-chrome-stable",
		"/usr/bin/google-chrome-beta",
		"/usr/bin/google-chrome-unstable",
		"/snap/bin/google-chrome"
	]);
}
function findChromeExecutableWindows() {
	const localAppData = process.env.LOCALAPPDATA ?? "";
	const programFiles = process.env.ProgramFiles ?? "C:\\Program Files";
	const programFilesX86 = process.env["ProgramFiles(x86)"] ?? "C:\\Program Files (x86)";
	const joinWin = path.win32.join;
	const candidates = [];
	if (localAppData) {
		candidates.push({
			kind: "chrome",
			path: joinWin(localAppData, "Google", "Chrome", "Application", "chrome.exe")
		});
		candidates.push({
			kind: "brave",
			path: joinWin(localAppData, "BraveSoftware", "Brave-Browser", "Application", "brave.exe")
		});
		candidates.push({
			kind: "edge",
			path: joinWin(localAppData, "Microsoft", "Edge", "Application", "msedge.exe")
		});
		candidates.push({
			kind: "chromium",
			path: joinWin(localAppData, "Chromium", "Application", "chrome.exe")
		});
		candidates.push({
			kind: "canary",
			path: joinWin(localAppData, "Google", "Chrome SxS", "Application", "chrome.exe")
		});
	}
	candidates.push({
		kind: "chrome",
		path: joinWin(programFiles, "Google", "Chrome", "Application", "chrome.exe")
	});
	candidates.push({
		kind: "chrome",
		path: joinWin(programFilesX86, "Google", "Chrome", "Application", "chrome.exe")
	});
	candidates.push({
		kind: "brave",
		path: joinWin(programFiles, "BraveSoftware", "Brave-Browser", "Application", "brave.exe")
	});
	candidates.push({
		kind: "brave",
		path: joinWin(programFilesX86, "BraveSoftware", "Brave-Browser", "Application", "brave.exe")
	});
	candidates.push({
		kind: "edge",
		path: joinWin(programFiles, "Microsoft", "Edge", "Application", "msedge.exe")
	});
	candidates.push({
		kind: "edge",
		path: joinWin(programFilesX86, "Microsoft", "Edge", "Application", "msedge.exe")
	});
	return findFirstExecutable(candidates);
}
function findGoogleChromeExecutableWindows() {
	const localAppData = process.env.LOCALAPPDATA ?? "";
	const programFiles = process.env.ProgramFiles ?? "C:\\Program Files";
	const programFilesX86 = process.env["ProgramFiles(x86)"] ?? "C:\\Program Files (x86)";
	const joinWin = path.win32.join;
	const candidates = [];
	if (localAppData) {
		candidates.push(joinWin(localAppData, "Google", "Chrome", "Application", "chrome.exe"));
		candidates.push(joinWin(localAppData, "Google", "Chrome SxS", "Application", "chrome.exe"));
	}
	candidates.push(joinWin(programFiles, "Google", "Chrome", "Application", "chrome.exe"));
	candidates.push(joinWin(programFilesX86, "Google", "Chrome", "Application", "chrome.exe"));
	return findFirstChromeExecutable(candidates);
}
function resolveGoogleChromeExecutableForPlatform(platform) {
	if (platform === "darwin") return findGoogleChromeExecutableMac();
	if (platform === "linux") return findGoogleChromeExecutableLinux();
	if (platform === "win32") return findGoogleChromeExecutableWindows();
	return null;
}
function readBrowserVersion(executablePath) {
	const output = execText(executablePath, ["--version"], 2e3);
	if (!output) return null;
	return output.replace(/\s+/g, " ").trim();
}
function parseBrowserMajorVersion(rawVersion) {
	const match = String(rawVersion ?? "").match(CHROME_VERSION_RE);
	if (!match?.[1]) return null;
	const major = Number.parseInt(match[1], 10);
	return Number.isFinite(major) ? major : null;
}
function resolveBrowserExecutableForPlatform(resolved, platform) {
	if (resolved.executablePath) {
		if (!exists$1(resolved.executablePath)) throw new Error(`browser.executablePath not found: ${resolved.executablePath}`);
		return {
			kind: "custom",
			path: resolved.executablePath
		};
	}
	const detected = detectDefaultChromiumExecutable(platform);
	if (detected) return detected;
	if (platform === "darwin") return findChromeExecutableMac();
	if (platform === "linux") return findChromeExecutableLinux();
	if (platform === "win32") return findChromeExecutableWindows();
	return null;
}
//#endregion
//#region src/browser/chrome.profile-decoration.ts
function decoratedMarkerPath(userDataDir) {
	return path.join(userDataDir, ".openclaw-profile-decorated");
}
function safeReadJson(filePath) {
	try {
		if (!fs.existsSync(filePath)) return null;
		const raw = fs.readFileSync(filePath, "utf-8");
		const parsed = JSON.parse(raw);
		if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return null;
		return parsed;
	} catch {
		return null;
	}
}
function safeWriteJson(filePath, data) {
	fs.mkdirSync(path.dirname(filePath), { recursive: true });
	fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}
function setDeep(obj, keys, value) {
	let node = obj;
	for (const key of keys.slice(0, -1)) {
		const next = node[key];
		if (typeof next !== "object" || next === null || Array.isArray(next)) node[key] = {};
		node = node[key];
	}
	node[keys[keys.length - 1] ?? ""] = value;
}
function parseHexRgbToSignedArgbInt(hex) {
	const cleaned = hex.trim().replace(/^#/, "");
	if (!/^[0-9a-fA-F]{6}$/.test(cleaned)) return null;
	const argbUnsigned = 255 << 24 | Number.parseInt(cleaned, 16);
	return argbUnsigned > 2147483647 ? argbUnsigned - 4294967296 : argbUnsigned;
}
function isProfileDecorated(userDataDir, desiredName, desiredColorHex) {
	const desiredColorInt = parseHexRgbToSignedArgbInt(desiredColorHex);
	const localStatePath = path.join(userDataDir, "Local State");
	const preferencesPath = path.join(userDataDir, "Default", "Preferences");
	const profile = safeReadJson(localStatePath)?.profile;
	const infoCache = typeof profile === "object" && profile !== null && !Array.isArray(profile) ? profile.info_cache : null;
	const info = typeof infoCache === "object" && infoCache !== null && !Array.isArray(infoCache) && typeof infoCache.Default === "object" && infoCache.Default !== null && !Array.isArray(infoCache.Default) ? infoCache.Default : null;
	const prefs = safeReadJson(preferencesPath);
	const browserTheme = (() => {
		const browser = prefs?.browser;
		const theme = typeof browser === "object" && browser !== null && !Array.isArray(browser) ? browser.theme : null;
		return typeof theme === "object" && theme !== null && !Array.isArray(theme) ? theme : null;
	})();
	const autogeneratedTheme = (() => {
		const autogenerated = prefs?.autogenerated;
		const theme = typeof autogenerated === "object" && autogenerated !== null && !Array.isArray(autogenerated) ? autogenerated.theme : null;
		return typeof theme === "object" && theme !== null && !Array.isArray(theme) ? theme : null;
	})();
	const nameOk = typeof info?.name === "string" ? info.name === desiredName : true;
	if (desiredColorInt == null) return nameOk;
	const localSeedOk = typeof info?.profile_color_seed === "number" ? info.profile_color_seed === desiredColorInt : false;
	const prefOk = typeof browserTheme?.user_color2 === "number" && browserTheme.user_color2 === desiredColorInt || typeof autogeneratedTheme?.color === "number" && autogeneratedTheme.color === desiredColorInt;
	return nameOk && localSeedOk && prefOk;
}
/**
* Best-effort profile decoration (name + lobster-orange). Chrome preference keys
* vary by version; we keep this conservative and idempotent.
*/
function decorateOpenClawProfile(userDataDir, opts) {
	const desiredName = opts?.name ?? "openclaw";
	const desiredColor = (opts?.color ?? "#FF4500").toUpperCase();
	const desiredColorInt = parseHexRgbToSignedArgbInt(desiredColor);
	const localStatePath = path.join(userDataDir, "Local State");
	const preferencesPath = path.join(userDataDir, "Default", "Preferences");
	const localState = safeReadJson(localStatePath) ?? {};
	setDeep(localState, [
		"profile",
		"info_cache",
		"Default",
		"name"
	], desiredName);
	setDeep(localState, [
		"profile",
		"info_cache",
		"Default",
		"shortcut_name"
	], desiredName);
	setDeep(localState, [
		"profile",
		"info_cache",
		"Default",
		"user_name"
	], desiredName);
	setDeep(localState, [
		"profile",
		"info_cache",
		"Default",
		"profile_color"
	], desiredColor);
	setDeep(localState, [
		"profile",
		"info_cache",
		"Default",
		"user_color"
	], desiredColor);
	if (desiredColorInt != null) {
		setDeep(localState, [
			"profile",
			"info_cache",
			"Default",
			"profile_color_seed"
		], desiredColorInt);
		setDeep(localState, [
			"profile",
			"info_cache",
			"Default",
			"profile_highlight_color"
		], desiredColorInt);
		setDeep(localState, [
			"profile",
			"info_cache",
			"Default",
			"default_avatar_fill_color"
		], desiredColorInt);
		setDeep(localState, [
			"profile",
			"info_cache",
			"Default",
			"default_avatar_stroke_color"
		], desiredColorInt);
	}
	safeWriteJson(localStatePath, localState);
	const prefs = safeReadJson(preferencesPath) ?? {};
	setDeep(prefs, ["profile", "name"], desiredName);
	setDeep(prefs, ["profile", "profile_color"], desiredColor);
	setDeep(prefs, ["profile", "user_color"], desiredColor);
	if (desiredColorInt != null) {
		setDeep(prefs, [
			"autogenerated",
			"theme",
			"color"
		], desiredColorInt);
		setDeep(prefs, [
			"browser",
			"theme",
			"user_color2"
		], desiredColorInt);
	}
	safeWriteJson(preferencesPath, prefs);
	try {
		fs.writeFileSync(decoratedMarkerPath(userDataDir), `${Date.now()}\n`, "utf-8");
	} catch {}
}
function ensureProfileCleanExit(userDataDir) {
	const preferencesPath = path.join(userDataDir, "Default", "Preferences");
	const prefs = safeReadJson(preferencesPath) ?? {};
	setDeep(prefs, ["exit_type"], "Normal");
	setDeep(prefs, ["exited_cleanly"], true);
	safeWriteJson(preferencesPath, prefs);
}
//#endregion
//#region src/browser/chrome.ts
const log = createSubsystemLogger("browser").child("chrome");
function exists(filePath) {
	try {
		return fs.existsSync(filePath);
	} catch {
		return false;
	}
}
function resolveBrowserExecutable(resolved) {
	return resolveBrowserExecutableForPlatform(resolved, process.platform);
}
function resolveOpenClawUserDataDir(profileName = DEFAULT_OPENCLAW_BROWSER_PROFILE_NAME) {
	return path.join(CONFIG_DIR, "browser", profileName, "user-data");
}
function cdpUrlForPort(cdpPort) {
	return `http://127.0.0.1:${cdpPort}`;
}
function buildOpenClawChromeLaunchArgs(params) {
	const { resolved, profile, userDataDir } = params;
	const args = [
		`--remote-debugging-port=${profile.cdpPort}`,
		`--user-data-dir=${userDataDir}`,
		"--no-first-run",
		"--no-default-browser-check",
		"--disable-sync",
		"--disable-background-networking",
		"--disable-component-update",
		"--disable-features=Translate,MediaRouter",
		"--disable-session-crashed-bubble",
		"--hide-crash-restore-bubble",
		"--password-store=basic"
	];
	if (resolved.headless) {
		args.push("--headless=new");
		args.push("--disable-gpu");
	}
	if (resolved.noSandbox) {
		args.push("--no-sandbox");
		args.push("--disable-setuid-sandbox");
	}
	if (process.platform === "linux") args.push("--disable-dev-shm-usage");
	if (resolved.extraArgs.length > 0) args.push(...resolved.extraArgs);
	return args;
}
async function canOpenWebSocket(url, timeoutMs) {
	return new Promise((resolve) => {
		const ws = openCdpWebSocket(url, { handshakeTimeoutMs: timeoutMs });
		ws.once("open", () => {
			try {
				ws.close();
			} catch {}
			resolve(true);
		});
		ws.once("error", () => resolve(false));
	});
}
async function isChromeReachable(cdpUrl, timeoutMs = 500, ssrfPolicy) {
	try {
		await assertCdpEndpointAllowed(cdpUrl, ssrfPolicy);
		if (isWebSocketUrl(cdpUrl)) return await canOpenWebSocket(cdpUrl, timeoutMs);
		const version = await fetchChromeVersion(cdpUrl, timeoutMs, ssrfPolicy);
		return Boolean(version);
	} catch {
		return false;
	}
}
async function fetchChromeVersion(cdpUrl, timeoutMs = 500, ssrfPolicy) {
	const ctrl = new AbortController();
	const t = setTimeout(ctrl.abort.bind(ctrl), timeoutMs);
	try {
		await assertCdpEndpointAllowed(cdpUrl, ssrfPolicy);
		const data = await (await fetchCdpChecked(appendCdpPath(cdpUrl, "/json/version"), timeoutMs, { signal: ctrl.signal })).json();
		if (!data || typeof data !== "object") return null;
		return data;
	} catch {
		return null;
	} finally {
		clearTimeout(t);
	}
}
async function getChromeWebSocketUrl(cdpUrl, timeoutMs = 500, ssrfPolicy) {
	await assertCdpEndpointAllowed(cdpUrl, ssrfPolicy);
	if (isWebSocketUrl(cdpUrl)) return cdpUrl;
	const version = await fetchChromeVersion(cdpUrl, timeoutMs, ssrfPolicy);
	const wsUrl = String(version?.webSocketDebuggerUrl ?? "").trim();
	if (!wsUrl) return null;
	return normalizeCdpWsUrl(wsUrl, cdpUrl);
}
async function canRunCdpHealthCommand(wsUrl, timeoutMs = 800) {
	return await new Promise((resolve) => {
		const ws = openCdpWebSocket(wsUrl, { handshakeTimeoutMs: timeoutMs });
		let settled = false;
		const onMessage = (raw) => {
			if (settled) return;
			let parsed = null;
			try {
				parsed = JSON.parse(rawDataToString(raw));
			} catch {
				return;
			}
			if (parsed?.id !== 1) return;
			finish(Boolean(parsed.result && typeof parsed.result === "object"));
		};
		const finish = (value) => {
			if (settled) return;
			settled = true;
			clearTimeout(timer);
			ws.off("message", onMessage);
			try {
				ws.close();
			} catch {}
			resolve(value);
		};
		const timer = setTimeout(() => {
			try {
				ws.terminate();
			} catch {}
			finish(false);
		}, Math.max(50, timeoutMs + 25));
		ws.once("open", () => {
			try {
				ws.send(JSON.stringify({
					id: 1,
					method: "Browser.getVersion"
				}));
			} catch {
				finish(false);
			}
		});
		ws.on("message", onMessage);
		ws.once("error", () => {
			finish(false);
		});
		ws.once("close", () => {
			finish(false);
		});
	});
}
async function isChromeCdpReady(cdpUrl, timeoutMs = 500, handshakeTimeoutMs = 800, ssrfPolicy) {
	const wsUrl = await getChromeWebSocketUrl(cdpUrl, timeoutMs, ssrfPolicy).catch(() => null);
	if (!wsUrl) return false;
	return await canRunCdpHealthCommand(wsUrl, handshakeTimeoutMs);
}
async function launchOpenClawChrome(resolved, profile) {
	if (!profile.cdpIsLoopback) throw new Error(`Profile "${profile.name}" is remote; cannot launch local Chrome.`);
	await ensurePortAvailable(profile.cdpPort);
	const exe = resolveBrowserExecutable(resolved);
	if (!exe) throw new Error("No supported browser found (Chrome/Brave/Edge/Chromium on macOS, Linux, or Windows).");
	const userDataDir = resolveOpenClawUserDataDir(profile.name);
	fs.mkdirSync(userDataDir, { recursive: true });
	const needsDecorate = !isProfileDecorated(userDataDir, profile.name, (profile.color ?? "#FF4500").toUpperCase());
	const spawnOnce = () => {
		const args = buildOpenClawChromeLaunchArgs({
			resolved,
			profile,
			userDataDir
		});
		return spawn(exe.path, args, {
			stdio: [
				"ignore",
				"ignore",
				"pipe"
			],
			env: {
				...process.env,
				HOME: os.homedir()
			}
		});
	};
	const startedAt = Date.now();
	const localStatePath = path.join(userDataDir, "Local State");
	const preferencesPath = path.join(userDataDir, "Default", "Preferences");
	if (!exists(localStatePath) || !exists(preferencesPath)) {
		const bootstrap = spawnOnce();
		const deadline = Date.now() + CHROME_BOOTSTRAP_PREFS_TIMEOUT_MS;
		while (Date.now() < deadline) {
			if (exists(localStatePath) && exists(preferencesPath)) break;
			await new Promise((r) => setTimeout(r, 100));
		}
		try {
			bootstrap.kill("SIGTERM");
		} catch {}
		const exitDeadline = Date.now() + CHROME_BOOTSTRAP_EXIT_TIMEOUT_MS;
		while (Date.now() < exitDeadline) {
			if (bootstrap.exitCode != null) break;
			await new Promise((r) => setTimeout(r, 50));
		}
	}
	if (needsDecorate) try {
		decorateOpenClawProfile(userDataDir, {
			name: profile.name,
			color: profile.color
		});
		log.info(`🦞 openclaw browser profile decorated (${profile.color})`);
	} catch (err) {
		log.warn(`openclaw browser profile decoration failed: ${String(err)}`);
	}
	try {
		ensureProfileCleanExit(userDataDir);
	} catch (err) {
		log.warn(`openclaw browser clean-exit prefs failed: ${String(err)}`);
	}
	const proc = spawnOnce();
	const stderrChunks = [];
	const onStderr = (chunk) => {
		stderrChunks.push(chunk);
	};
	proc.stderr?.on("data", onStderr);
	const readyDeadline = Date.now() + CHROME_LAUNCH_READY_WINDOW_MS;
	while (Date.now() < readyDeadline) {
		if (await isChromeReachable(profile.cdpUrl)) break;
		await new Promise((r) => setTimeout(r, 200));
	}
	if (!await isChromeReachable(profile.cdpUrl)) {
		const stderrOutput = Buffer.concat(stderrChunks).toString("utf8").trim();
		const stderrHint = stderrOutput ? `\nChrome stderr:\n${stderrOutput.slice(0, CHROME_STDERR_HINT_MAX_CHARS)}` : "";
		const sandboxHint = process.platform === "linux" && !resolved.noSandbox ? "\nHint: If running in a container or as root, try setting browser.noSandbox: true in config." : "";
		try {
			proc.kill("SIGKILL");
		} catch {}
		throw new Error(`Failed to start Chrome CDP on port ${profile.cdpPort} for profile "${profile.name}".${sandboxHint}${stderrHint}`);
	}
	proc.stderr?.off("data", onStderr);
	stderrChunks.length = 0;
	const pid = proc.pid ?? -1;
	log.info(`🦞 openclaw browser started (${exe.kind}) profile "${profile.name}" on 127.0.0.1:${profile.cdpPort} (pid ${pid})`);
	return {
		pid,
		exe,
		userDataDir,
		cdpPort: profile.cdpPort,
		startedAt,
		proc
	};
}
async function stopOpenClawChrome(running, timeoutMs = CHROME_STOP_TIMEOUT_MS) {
	const proc = running.proc;
	if (proc.killed) return;
	try {
		proc.kill("SIGTERM");
	} catch {}
	const start = Date.now();
	while (Date.now() - start < timeoutMs) {
		if (!proc.exitCode && proc.killed) break;
		if (!await isChromeReachable(cdpUrlForPort(running.cdpPort), 200)) return;
		await new Promise((r) => setTimeout(r, 100));
	}
	try {
		proc.kill("SIGKILL");
	} catch {}
}
//#endregion
//#region src/browser/resolved-config-refresh.ts
function changedProfileInvariants(current, next) {
	const changed = [];
	if (current.cdpUrl !== next.cdpUrl) changed.push("cdpUrl");
	if (current.cdpPort !== next.cdpPort) changed.push("cdpPort");
	if (current.driver !== next.driver) changed.push("driver");
	if (current.attachOnly !== next.attachOnly) changed.push("attachOnly");
	if (current.cdpIsLoopback !== next.cdpIsLoopback) changed.push("cdpIsLoopback");
	if ((current.userDataDir ?? "") !== (next.userDataDir ?? "")) changed.push("userDataDir");
	return changed;
}
function applyResolvedConfig(current, freshResolved) {
	current.resolved = {
		...freshResolved,
		evaluateEnabled: current.resolved.evaluateEnabled
	};
	for (const [name, runtime] of current.profiles) {
		const nextProfile = resolveProfile(freshResolved, name);
		if (nextProfile) {
			const changed = changedProfileInvariants(runtime.profile, nextProfile);
			if (changed.length > 0) {
				runtime.reconcile = {
					previousProfile: runtime.profile,
					reason: `profile invariants changed: ${changed.join(", ")}`
				};
				runtime.lastTargetId = null;
			}
			runtime.profile = nextProfile;
			continue;
		}
		runtime.reconcile = {
			previousProfile: runtime.profile,
			reason: "profile removed from config"
		};
		runtime.lastTargetId = null;
		if (!runtime.running) current.profiles.delete(name);
	}
}
function refreshResolvedBrowserConfigFromDisk(params) {
	if (!params.refreshConfigFromDisk) return;
	const cfg = getRuntimeConfigSnapshot() ?? createConfigIO().loadConfig();
	const freshResolved = resolveBrowserConfig(cfg.browser, cfg);
	applyResolvedConfig(params.current, freshResolved);
}
function resolveBrowserProfileWithHotReload(params) {
	refreshResolvedBrowserConfigFromDisk({
		current: params.current,
		refreshConfigFromDisk: params.refreshConfigFromDisk,
		mode: "cached"
	});
	let profile = resolveProfile(params.current.resolved, params.name);
	if (profile) return profile;
	refreshResolvedBrowserConfigFromDisk({
		current: params.current,
		refreshConfigFromDisk: params.refreshConfigFromDisk,
		mode: "fresh"
	});
	profile = resolveProfile(params.current.resolved, params.name);
	return profile;
}
//#endregion
//#region src/browser/server-context.constants.ts
const OPEN_TAB_DISCOVERY_WINDOW_MS = 2e3;
const CDP_READY_AFTER_LAUNCH_WINDOW_MS = 8e3;
//#endregion
//#region src/browser/server-context.availability.ts
function createProfileAvailability({ opts, profile, state, getProfileState, setProfileRunning }) {
	const capabilities = getBrowserProfileCapabilities(profile);
	const resolveTimeouts = (timeoutMs) => resolveCdpReachabilityTimeouts({
		profileIsLoopback: profile.cdpIsLoopback,
		timeoutMs,
		remoteHttpTimeoutMs: state().resolved.remoteCdpTimeoutMs,
		remoteHandshakeTimeoutMs: state().resolved.remoteCdpHandshakeTimeoutMs
	});
	const isReachable = async (timeoutMs) => {
		if (capabilities.usesChromeMcp) {
			await listChromeMcpTabs(profile.name, profile.userDataDir);
			return true;
		}
		const { httpTimeoutMs, wsTimeoutMs } = resolveTimeouts(timeoutMs);
		return await isChromeCdpReady(profile.cdpUrl, httpTimeoutMs, wsTimeoutMs, state().resolved.ssrfPolicy);
	};
	const isHttpReachable = async (timeoutMs) => {
		if (capabilities.usesChromeMcp) return await isReachable(timeoutMs);
		const { httpTimeoutMs } = resolveTimeouts(timeoutMs);
		return await isChromeReachable(profile.cdpUrl, httpTimeoutMs, state().resolved.ssrfPolicy);
	};
	const attachRunning = (running) => {
		setProfileRunning(running);
		running.proc.on("exit", () => {
			if (!opts.getState()) return;
			if (getProfileState().running?.pid === running.pid) setProfileRunning(null);
		});
	};
	const closePlaywrightBrowserConnectionForProfile = async (cdpUrl) => {
		try {
			await (await import("./pw-ai-BVCS_79_.js")).closePlaywrightBrowserConnection(cdpUrl ? { cdpUrl } : void 0);
		} catch {}
	};
	const reconcileProfileRuntime = async () => {
		const profileState = getProfileState();
		const reconcile = profileState.reconcile;
		if (!reconcile) return;
		profileState.reconcile = null;
		profileState.lastTargetId = null;
		const previousProfile = reconcile.previousProfile;
		if (profileState.running) {
			await stopOpenClawChrome(profileState.running).catch(() => {});
			setProfileRunning(null);
		}
		if (getBrowserProfileCapabilities(previousProfile).usesChromeMcp) await closeChromeMcpSession(previousProfile.name).catch(() => false);
		await closePlaywrightBrowserConnectionForProfile(previousProfile.cdpUrl);
		if (previousProfile.cdpUrl !== profile.cdpUrl) await closePlaywrightBrowserConnectionForProfile(profile.cdpUrl);
	};
	const waitForCdpReadyAfterLaunch = async () => {
		const deadlineMs = Date.now() + CDP_READY_AFTER_LAUNCH_WINDOW_MS;
		while (Date.now() < deadlineMs) {
			const remainingMs = Math.max(0, deadlineMs - Date.now());
			if (await isReachable(Math.max(75, Math.min(250, remainingMs)))) return;
			await new Promise((r) => setTimeout(r, 100));
		}
		throw new Error(`Chrome CDP websocket for profile "${profile.name}" is not reachable after start.`);
	};
	const waitForChromeMcpReadyAfterAttach = async () => {
		const deadlineMs = Date.now() + CHROME_MCP_ATTACH_READY_WINDOW_MS;
		let lastError;
		while (Date.now() < deadlineMs) {
			try {
				await listChromeMcpTabs(profile.name, profile.userDataDir);
				return;
			} catch (err) {
				lastError = err;
			}
			await new Promise((r) => setTimeout(r, 200));
		}
		const detail = lastError instanceof Error ? ` Last error: ${lastError.message}` : "";
		throw new BrowserProfileUnavailableError(`Chrome MCP existing-session attach for profile "${profile.name}" timed out waiting for tabs to become available. Approve the browser attach prompt, keep the browser open, and retry.${detail}`);
	};
	const ensureBrowserAvailable = async () => {
		await reconcileProfileRuntime();
		if (capabilities.usesChromeMcp) {
			if (profile.userDataDir && !fs.existsSync(profile.userDataDir)) throw new BrowserProfileUnavailableError(`Browser user data directory not found for profile "${profile.name}": ${profile.userDataDir}`);
			await ensureChromeMcpAvailable(profile.name, profile.userDataDir);
			await waitForChromeMcpReadyAfterAttach();
			return;
		}
		const current = state();
		const remoteCdp = capabilities.isRemote;
		const attachOnly = profile.attachOnly;
		const profileState = getProfileState();
		if (!await isHttpReachable()) {
			if ((attachOnly || remoteCdp) && opts.onEnsureAttachTarget) {
				await opts.onEnsureAttachTarget(profile);
				if (await isHttpReachable(1200)) return;
			}
			if (!attachOnly && !remoteCdp && profile.cdpIsLoopback && !profileState.running) {
				if (await isHttpReachable(1200) && await isReachable(1200)) return;
			}
			if (attachOnly || remoteCdp) throw new BrowserProfileUnavailableError(remoteCdp ? `Remote CDP for profile "${profile.name}" is not reachable at ${profile.cdpUrl}.` : `Browser attachOnly is enabled and profile "${profile.name}" is not running.`);
			const launched = await launchOpenClawChrome(current.resolved, profile);
			attachRunning(launched);
			try {
				await waitForCdpReadyAfterLaunch();
			} catch (err) {
				await stopOpenClawChrome(launched).catch(() => {});
				setProfileRunning(null);
				throw err;
			}
			return;
		}
		if (await isReachable()) return;
		if (attachOnly || remoteCdp) {
			if (opts.onEnsureAttachTarget) {
				await opts.onEnsureAttachTarget(profile);
				if (await isReachable(1200)) return;
			}
			throw new BrowserProfileUnavailableError(remoteCdp ? `Remote CDP websocket for profile "${profile.name}" is not reachable.` : `Browser attachOnly is enabled and CDP websocket for profile "${profile.name}" is not reachable.`);
		}
		if (!profileState.running) throw new BrowserProfileUnavailableError(`Port ${profile.cdpPort} is in use for profile "${profile.name}" but not by openclaw. Run action=reset-profile profile=${profile.name} to kill the process.`);
		await stopOpenClawChrome(profileState.running);
		setProfileRunning(null);
		attachRunning(await launchOpenClawChrome(current.resolved, profile));
		if (!await isReachable(600)) throw new Error(`Chrome CDP websocket for profile "${profile.name}" is not reachable after restart.`);
	};
	const stopRunningBrowser = async () => {
		await reconcileProfileRuntime();
		if (capabilities.usesChromeMcp) return { stopped: await closeChromeMcpSession(profile.name) };
		const profileState = getProfileState();
		if (!profileState.running) return { stopped: false };
		await stopOpenClawChrome(profileState.running);
		setProfileRunning(null);
		return { stopped: true };
	};
	return {
		isHttpReachable,
		isReachable,
		ensureBrowserAvailable,
		stopRunningBrowser
	};
}
//#endregion
//#region src/browser/trash.ts
async function movePathToTrash(targetPath) {
	try {
		await runExec("trash", [targetPath], { timeoutMs: 1e4 });
		return targetPath;
	} catch {
		const trashDir = path.join(os.homedir(), ".Trash");
		fs.mkdirSync(trashDir, { recursive: true });
		const base = path.basename(targetPath);
		let dest = path.join(trashDir, `${base}-${Date.now()}`);
		if (fs.existsSync(dest)) dest = path.join(trashDir, `${base}-${Date.now()}-${generateSecureToken(6)}`);
		fs.renameSync(targetPath, dest);
		return dest;
	}
}
//#endregion
//#region src/browser/server-context.reset.ts
async function closePlaywrightBrowserConnectionForProfile(cdpUrl) {
	try {
		await (await import("./pw-ai-BVCS_79_.js")).closePlaywrightBrowserConnection(cdpUrl ? { cdpUrl } : void 0);
	} catch {}
}
function createProfileResetOps({ profile, getProfileState, stopRunningBrowser, isHttpReachable, resolveOpenClawUserDataDir }) {
	const capabilities = getBrowserProfileCapabilities(profile);
	const resetProfile = async () => {
		if (!capabilities.supportsReset) throw new BrowserResetUnsupportedError(`reset-profile is only supported for local profiles (profile "${profile.name}" is remote).`);
		const userDataDir = resolveOpenClawUserDataDir(profile.name);
		const profileState = getProfileState();
		if (await isHttpReachable(300) && !profileState.running) await closePlaywrightBrowserConnectionForProfile(profile.cdpUrl);
		if (profileState.running) await stopRunningBrowser();
		await closePlaywrightBrowserConnectionForProfile(profile.cdpUrl);
		if (!fs.existsSync(userDataDir)) return {
			moved: false,
			from: userDataDir
		};
		return {
			moved: true,
			from: userDataDir,
			to: await movePathToTrash(userDataDir)
		};
	};
	return { resetProfile };
}
//#endregion
//#region src/browser/target-id.ts
function resolveTargetIdFromTabs(input, tabs) {
	const needle = input.trim();
	if (!needle) return {
		ok: false,
		reason: "not_found"
	};
	const exact = tabs.find((t) => t.targetId === needle);
	if (exact) return {
		ok: true,
		targetId: exact.targetId
	};
	const lower = needle.toLowerCase();
	const matches = tabs.map((t) => t.targetId).filter((id) => id.toLowerCase().startsWith(lower));
	const only = matches.length === 1 ? matches[0] : void 0;
	if (only) return {
		ok: true,
		targetId: only
	};
	if (matches.length === 0) return {
		ok: false,
		reason: "not_found"
	};
	return {
		ok: false,
		reason: "ambiguous",
		matches
	};
}
//#endregion
//#region src/browser/server-context.selection.ts
function createProfileSelectionOps({ profile, getProfileState, ensureBrowserAvailable, listTabs, openTab }) {
	const cdpHttpBase = normalizeCdpHttpBaseForJsonEndpoints(profile.cdpUrl);
	const capabilities = getBrowserProfileCapabilities(profile);
	const ensureTabAvailable = async (targetId) => {
		await ensureBrowserAvailable();
		const profileState = getProfileState();
		if ((await listTabs()).length === 0) await openTab("about:blank");
		const tabs = await listTabs();
		const candidates = capabilities.supportsPerTabWs ? tabs.filter((t) => Boolean(t.wsUrl)) : tabs;
		const resolveById = (raw) => {
			const resolved = resolveTargetIdFromTabs(raw, candidates);
			if (!resolved.ok) {
				if (resolved.reason === "ambiguous") return "AMBIGUOUS";
				return null;
			}
			return candidates.find((t) => t.targetId === resolved.targetId) ?? null;
		};
		const pickDefault = () => {
			const last = profileState.lastTargetId?.trim() || "";
			const lastResolved = last ? resolveById(last) : null;
			if (lastResolved && lastResolved !== "AMBIGUOUS") return lastResolved;
			return candidates.find((t) => (t.type ?? "page") === "page") ?? candidates.at(0) ?? null;
		};
		const chosen = targetId ? resolveById(targetId) : pickDefault();
		if (chosen === "AMBIGUOUS") throw new BrowserTargetAmbiguousError();
		if (!chosen) throw new BrowserTabNotFoundError();
		profileState.lastTargetId = chosen.targetId;
		return chosen;
	};
	const resolveTargetIdOrThrow = async (targetId) => {
		const resolved = resolveTargetIdFromTabs(targetId, await listTabs());
		if (!resolved.ok) {
			if (resolved.reason === "ambiguous") throw new BrowserTargetAmbiguousError();
			throw new BrowserTabNotFoundError();
		}
		return resolved.targetId;
	};
	const focusTab = async (targetId) => {
		const resolvedTargetId = await resolveTargetIdOrThrow(targetId);
		if (capabilities.usesChromeMcp) {
			await focusChromeMcpTab(profile.name, resolvedTargetId, profile.userDataDir);
			const profileState = getProfileState();
			profileState.lastTargetId = resolvedTargetId;
			return;
		}
		if (capabilities.usesPersistentPlaywright) {
			const focusPageByTargetIdViaPlaywright = (await getPwAiModule$1({ mode: "strict" }))?.focusPageByTargetIdViaPlaywright;
			if (typeof focusPageByTargetIdViaPlaywright === "function") {
				await focusPageByTargetIdViaPlaywright({
					cdpUrl: profile.cdpUrl,
					targetId: resolvedTargetId
				});
				const profileState = getProfileState();
				profileState.lastTargetId = resolvedTargetId;
				return;
			}
		}
		await fetchOk(appendCdpPath(cdpHttpBase, `/json/activate/${resolvedTargetId}`));
		const profileState = getProfileState();
		profileState.lastTargetId = resolvedTargetId;
	};
	const closeTab = async (targetId) => {
		const resolvedTargetId = await resolveTargetIdOrThrow(targetId);
		if (capabilities.usesChromeMcp) {
			await closeChromeMcpTab(profile.name, resolvedTargetId, profile.userDataDir);
			return;
		}
		if (capabilities.usesPersistentPlaywright) {
			const closePageByTargetIdViaPlaywright = (await getPwAiModule$1({ mode: "strict" }))?.closePageByTargetIdViaPlaywright;
			if (typeof closePageByTargetIdViaPlaywright === "function") {
				await closePageByTargetIdViaPlaywright({
					cdpUrl: profile.cdpUrl,
					targetId: resolvedTargetId
				});
				return;
			}
		}
		await fetchOk(appendCdpPath(cdpHttpBase, `/json/close/${resolvedTargetId}`));
	};
	return {
		ensureTabAvailable,
		focusTab,
		closeTab
	};
}
//#endregion
//#region src/browser/server-context.tab-ops.ts
/**
* Normalize a CDP WebSocket URL to use the correct base URL.
*/
function normalizeWsUrl(raw, cdpBaseUrl) {
	if (!raw) return;
	try {
		return normalizeCdpWsUrl(raw, cdpBaseUrl);
	} catch {
		return raw;
	}
}
function createProfileTabOps({ profile, state, getProfileState }) {
	const cdpHttpBase = normalizeCdpHttpBaseForJsonEndpoints(profile.cdpUrl);
	const capabilities = getBrowserProfileCapabilities(profile);
	const listTabs = async () => {
		if (capabilities.usesChromeMcp) return await listChromeMcpTabs(profile.name, profile.userDataDir);
		if (capabilities.usesPersistentPlaywright) {
			const listPagesViaPlaywright = (await getPwAiModule$1({ mode: "strict" }))?.listPagesViaPlaywright;
			if (typeof listPagesViaPlaywright === "function") return (await listPagesViaPlaywright({ cdpUrl: profile.cdpUrl })).map((p) => ({
				targetId: p.targetId,
				title: p.title,
				url: p.url,
				type: p.type
			}));
		}
		return (await fetchJson(appendCdpPath(cdpHttpBase, "/json/list"))).map((t) => ({
			targetId: t.id ?? "",
			title: t.title ?? "",
			url: t.url ?? "",
			wsUrl: normalizeWsUrl(t.webSocketDebuggerUrl, profile.cdpUrl),
			type: t.type
		})).filter((t) => Boolean(t.targetId));
	};
	const enforceManagedTabLimit = async (keepTargetId) => {
		const profileState = getProfileState();
		if (!capabilities.supportsManagedTabLimit || state().resolved.attachOnly || !profileState.running) return;
		const pageTabs = await listTabs().then((tabs) => tabs.filter((tab) => (tab.type ?? "page") === "page")).catch(() => []);
		if (pageTabs.length <= 8) return;
		const candidates = pageTabs.filter((tab) => tab.targetId !== keepTargetId);
		const excessCount = pageTabs.length - 8;
		for (const tab of candidates.slice(0, excessCount)) fetchOk(appendCdpPath(cdpHttpBase, `/json/close/${tab.targetId}`)).catch(() => {});
	};
	const triggerManagedTabLimit = (keepTargetId) => {
		enforceManagedTabLimit(keepTargetId).catch(() => {});
	};
	const openTab = async (url) => {
		const ssrfPolicyOpts = withBrowserNavigationPolicy(state().resolved.ssrfPolicy);
		if (capabilities.usesChromeMcp) {
			await assertBrowserNavigationAllowed({
				url,
				...ssrfPolicyOpts
			});
			const page = await openChromeMcpTab(profile.name, url, profile.userDataDir);
			const profileState = getProfileState();
			profileState.lastTargetId = page.targetId;
			await assertBrowserNavigationResultAllowed({
				url: page.url,
				...ssrfPolicyOpts
			});
			return page;
		}
		if (capabilities.usesPersistentPlaywright) {
			const createPageViaPlaywright = (await getPwAiModule$1({ mode: "strict" }))?.createPageViaPlaywright;
			if (typeof createPageViaPlaywright === "function") {
				const page = await createPageViaPlaywright({
					cdpUrl: profile.cdpUrl,
					url,
					...ssrfPolicyOpts
				});
				const profileState = getProfileState();
				profileState.lastTargetId = page.targetId;
				triggerManagedTabLimit(page.targetId);
				return {
					targetId: page.targetId,
					title: page.title,
					url: page.url,
					type: page.type
				};
			}
		}
		if (requiresInspectableBrowserNavigationRedirects(state().resolved.ssrfPolicy)) throw new InvalidBrowserNavigationUrlError("Navigation blocked: strict browser SSRF policy requires Playwright-backed redirect-hop inspection");
		const createdViaCdp = await createTargetViaCdp({
			cdpUrl: profile.cdpUrl,
			url,
			...ssrfPolicyOpts
		}).then((r) => r.targetId).catch(() => null);
		if (createdViaCdp) {
			const profileState = getProfileState();
			profileState.lastTargetId = createdViaCdp;
			const deadline = Date.now() + OPEN_TAB_DISCOVERY_WINDOW_MS;
			while (Date.now() < deadline) {
				const found = (await listTabs().catch(() => [])).find((t) => t.targetId === createdViaCdp);
				if (found) {
					await assertBrowserNavigationResultAllowed({
						url: found.url,
						...ssrfPolicyOpts
					});
					triggerManagedTabLimit(found.targetId);
					return found;
				}
				await new Promise((r) => setTimeout(r, 100));
			}
			triggerManagedTabLimit(createdViaCdp);
			return {
				targetId: createdViaCdp,
				title: "",
				url,
				type: "page"
			};
		}
		const encoded = encodeURIComponent(url);
		const endpointUrl = new URL(appendCdpPath(cdpHttpBase, "/json/new"));
		await assertBrowserNavigationAllowed({
			url,
			...ssrfPolicyOpts
		});
		const endpoint = endpointUrl.search ? (() => {
			endpointUrl.searchParams.set("url", url);
			return endpointUrl.toString();
		})() : `${endpointUrl.toString()}?${encoded}`;
		const created = await fetchJson(endpoint, CDP_JSON_NEW_TIMEOUT_MS, { method: "PUT" }).catch(async (err) => {
			if (String(err).includes("HTTP 405")) return await fetchJson(endpoint, CDP_JSON_NEW_TIMEOUT_MS);
			throw err;
		});
		if (!created.id) throw new Error("Failed to open tab (missing id)");
		const profileState = getProfileState();
		profileState.lastTargetId = created.id;
		const resolvedUrl = created.url ?? url;
		await assertBrowserNavigationResultAllowed({
			url: resolvedUrl,
			...ssrfPolicyOpts
		});
		triggerManagedTabLimit(created.id);
		return {
			targetId: created.id,
			title: created.title ?? "",
			url: resolvedUrl,
			wsUrl: normalizeWsUrl(created.webSocketDebuggerUrl, profile.cdpUrl),
			type: created.type
		};
	};
	return {
		listTabs,
		openTab
	};
}
//#endregion
//#region src/browser/server-context.ts
function listKnownProfileNames(state) {
	const names = new Set(Object.keys(state.resolved.profiles));
	for (const name of state.profiles.keys()) names.add(name);
	return [...names];
}
/**
* Create a profile-scoped context for browser operations.
*/
function createProfileContext(opts, profile) {
	const state = () => {
		const current = opts.getState();
		if (!current) throw new Error("Browser server not started");
		return current;
	};
	const getProfileState = () => {
		const current = state();
		let profileState = current.profiles.get(profile.name);
		if (!profileState) {
			profileState = {
				profile,
				running: null,
				lastTargetId: null,
				reconcile: null
			};
			current.profiles.set(profile.name, profileState);
		}
		return profileState;
	};
	const setProfileRunning = (running) => {
		const profileState = getProfileState();
		profileState.running = running;
	};
	const { listTabs, openTab } = createProfileTabOps({
		profile,
		state,
		getProfileState
	});
	const { ensureBrowserAvailable, isHttpReachable, isReachable, stopRunningBrowser } = createProfileAvailability({
		opts,
		profile,
		state,
		getProfileState,
		setProfileRunning
	});
	const { ensureTabAvailable, focusTab, closeTab } = createProfileSelectionOps({
		profile,
		getProfileState,
		ensureBrowserAvailable,
		listTabs,
		openTab
	});
	const { resetProfile } = createProfileResetOps({
		profile,
		getProfileState,
		stopRunningBrowser,
		isHttpReachable,
		resolveOpenClawUserDataDir
	});
	return {
		profile,
		ensureBrowserAvailable,
		ensureTabAvailable,
		isHttpReachable,
		isReachable,
		listTabs,
		openTab,
		focusTab,
		closeTab,
		stopRunningBrowser,
		resetProfile
	};
}
function createBrowserRouteContext(opts) {
	const refreshConfigFromDisk = opts.refreshConfigFromDisk === true;
	const state = () => {
		const current = opts.getState();
		if (!current) throw new Error("Browser server not started");
		return current;
	};
	const forProfile = (profileName) => {
		const current = state();
		const name = profileName ?? current.resolved.defaultProfile;
		const profile = resolveBrowserProfileWithHotReload({
			current,
			refreshConfigFromDisk,
			name
		});
		if (!profile) throw new BrowserProfileNotFoundError(`Profile "${name}" not found. Available profiles: ${Object.keys(current.resolved.profiles).join(", ") || "(none)"}`);
		return createProfileContext(opts, profile);
	};
	const listProfiles = async () => {
		const current = state();
		refreshResolvedBrowserConfigFromDisk({
			current,
			refreshConfigFromDisk,
			mode: "cached"
		});
		const result = [];
		for (const name of listKnownProfileNames(current)) {
			const profileState = current.profiles.get(name);
			const profile = resolveProfile(current.resolved, name) ?? profileState?.profile;
			if (!profile) continue;
			const capabilities = getBrowserProfileCapabilities(profile);
			let tabCount = 0;
			let running = false;
			const profileCtx = createProfileContext(opts, profile);
			if (capabilities.usesChromeMcp) try {
				running = await profileCtx.isReachable(300);
				if (running) tabCount = (await profileCtx.listTabs()).filter((t) => t.type === "page").length;
			} catch {}
			else if (profileState?.running) {
				running = true;
				try {
					tabCount = (await profileCtx.listTabs()).filter((t) => t.type === "page").length;
				} catch {}
			} else try {
				if (await isChromeReachable(profile.cdpUrl, 200, current.resolved.ssrfPolicy)) {
					running = true;
					tabCount = (await profileCtx.listTabs().catch(() => [])).filter((t) => t.type === "page").length;
				}
			} catch {}
			result.push({
				name,
				transport: capabilities.usesChromeMcp ? "chrome-mcp" : "cdp",
				cdpPort: capabilities.usesChromeMcp ? null : profile.cdpPort,
				cdpUrl: capabilities.usesChromeMcp ? null : profile.cdpUrl,
				color: profile.color,
				driver: profile.driver,
				running,
				tabCount,
				isDefault: name === current.resolved.defaultProfile,
				isRemote: !profile.cdpIsLoopback,
				missingFromConfig: !(name in current.resolved.profiles) || void 0,
				reconcileReason: profileState?.reconcile?.reason ?? null
			});
		}
		return result;
	};
	const getDefaultContext = () => forProfile();
	const mapTabError = (err) => {
		const browserMapped = toBrowserErrorResponse(err);
		if (browserMapped) return browserMapped;
		if (err instanceof SsrFBlockedError) return {
			status: 400,
			message: err.message
		};
		if (err instanceof InvalidBrowserNavigationUrlError) return {
			status: 400,
			message: err.message
		};
		return null;
	};
	return {
		state,
		forProfile,
		listProfiles,
		ensureBrowserAvailable: () => getDefaultContext().ensureBrowserAvailable(),
		ensureTabAvailable: (targetId) => getDefaultContext().ensureTabAvailable(targetId),
		isHttpReachable: (timeoutMs) => getDefaultContext().isHttpReachable(timeoutMs),
		isReachable: (timeoutMs) => getDefaultContext().isReachable(timeoutMs),
		listTabs: () => getDefaultContext().listTabs(),
		openTab: (url) => getDefaultContext().openTab(url),
		focusTab: (targetId) => getDefaultContext().focusTab(targetId),
		closeTab: (targetId) => getDefaultContext().closeTab(targetId),
		stopRunningBrowser: () => getDefaultContext().stopRunningBrowser(),
		resetProfile: () => getDefaultContext().resetProfile(),
		mapTabError
	};
}
//#endregion
//#region src/browser/server-lifecycle.ts
async function ensureExtensionRelayForProfiles(_params) {}
async function stopKnownBrowserProfiles(params) {
	const current = params.getState();
	if (!current) return;
	const ctx = createBrowserRouteContext({
		getState: params.getState,
		refreshConfigFromDisk: true
	});
	try {
		for (const name of listKnownProfileNames(current)) try {
			const runtime = current.profiles.get(name);
			if (runtime?.running) {
				await stopOpenClawChrome(runtime.running);
				runtime.running = null;
				continue;
			}
			await ctx.forProfile(name).stopRunningBrowser();
		} catch {}
	} catch (err) {
		params.onWarn(`openclaw browser stop failed: ${String(err)}`);
	}
}
//#endregion
//#region src/browser/runtime-lifecycle.ts
async function createBrowserRuntimeState(params) {
	const state = {
		server: params.server ?? null,
		port: params.port,
		resolved: params.resolved,
		profiles: /* @__PURE__ */ new Map()
	};
	await ensureExtensionRelayForProfiles({
		resolved: params.resolved,
		onWarn: params.onWarn
	});
	return state;
}
async function stopBrowserRuntime(params) {
	if (!params.current) return;
	await stopKnownBrowserProfiles({
		getState: params.getState,
		onWarn: params.onWarn
	});
	if (params.closeServer && params.current.server) await new Promise((resolve) => {
		params.current?.server?.close(() => resolve());
	});
	params.clearState();
	if (!isPwAiLoaded()) return;
	try {
		await (await import("./pw-ai-BVCS_79_.js")).closePlaywrightBrowserConnection();
	} catch {}
}
//#endregion
//#region src/browser/control-service.ts
let state = null;
const logService = createSubsystemLogger("browser").child("service");
function createBrowserControlContext() {
	return createBrowserRouteContext({
		getState: () => state,
		refreshConfigFromDisk: true
	});
}
async function startBrowserControlServiceFromConfig() {
	if (state) return state;
	const cfg = loadConfig();
	const resolved = resolveBrowserConfig(cfg.browser, cfg);
	if (!resolved.enabled) return null;
	try {
		if ((await ensureBrowserControlAuth({ cfg })).generatedToken) logService.info("No browser auth configured; generated gateway.auth.token automatically.");
	} catch (err) {
		logService.warn(`failed to auto-configure browser auth: ${String(err)}`);
	}
	state = await createBrowserRuntimeState({
		server: null,
		port: resolved.controlPort,
		resolved,
		onWarn: (message) => logService.warn(message)
	});
	logService.info(`Browser control service ready (profiles=${Object.keys(resolved.profiles).length})`);
	return state;
}
//#endregion
//#region src/browser/routes/dispatcher.ts
function compileRoute(path) {
	const paramNames = [];
	const parts = path.split("/").map((part) => {
		if (part.startsWith(":")) {
			const name = part.slice(1);
			paramNames.push(name);
			return "([^/]+)";
		}
		return escapeRegExp(part);
	});
	return {
		regex: new RegExp(`^${parts.join("/")}$`),
		paramNames
	};
}
function createRegistry() {
	const routes = [];
	const register = (method) => (path, handler) => {
		const { regex, paramNames } = compileRoute(path);
		routes.push({
			method,
			path,
			regex,
			paramNames,
			handler
		});
	};
	return {
		routes,
		router: {
			get: register("GET"),
			post: register("POST"),
			delete: register("DELETE")
		}
	};
}
function normalizePath(path) {
	if (!path) return "/";
	return path.startsWith("/") ? path : `/${path}`;
}
function createBrowserRouteDispatcher(ctx) {
	const registry = createRegistry();
	registerBrowserRoutes(registry.router, ctx);
	return { dispatch: async (req) => {
		const method = req.method;
		const path = normalizePath(req.path);
		const query = req.query ?? {};
		const body = req.body;
		const signal = req.signal;
		const match = registry.routes.find((route) => {
			if (route.method !== method) return false;
			return route.regex.test(path);
		});
		if (!match) return {
			status: 404,
			body: { error: "Not Found" }
		};
		const exec = match.regex.exec(path);
		const params = {};
		if (exec) for (const [idx, name] of match.paramNames.entries()) {
			const value = exec[idx + 1];
			if (typeof value === "string") try {
				params[name] = decodeURIComponent(value);
			} catch {
				return {
					status: 400,
					body: { error: `invalid path parameter encoding: ${name}` }
				};
			}
		}
		let status = 200;
		let payload = void 0;
		const res = {
			status(code) {
				status = code;
				return res;
			},
			json(bodyValue) {
				payload = bodyValue;
			}
		};
		try {
			await match.handler({
				params,
				query,
				body,
				signal
			}, res);
		} catch (err) {
			return {
				status: 500,
				body: { error: String(err) }
			};
		}
		return {
			status,
			body: payload
		};
	} };
}
//#endregion
//#region src/browser/client-fetch.ts
var BrowserServiceError = class extends Error {
	constructor(message) {
		super(message);
		this.name = "BrowserServiceError";
	}
};
function isAbsoluteHttp(url) {
	return /^https?:\/\//i.test(url.trim());
}
function isLoopbackHttpUrl(url) {
	try {
		return isLoopbackHost(new URL(url).hostname);
	} catch {
		return false;
	}
}
function withLoopbackBrowserAuthImpl(url, init, deps) {
	const headers = new Headers(init?.headers ?? {});
	if (headers.has("authorization") || headers.has("x-openclaw-password")) return {
		...init,
		headers
	};
	if (!isLoopbackHttpUrl(url)) return {
		...init,
		headers
	};
	try {
		const cfg = deps.loadConfig();
		const auth = deps.resolveBrowserControlAuth(cfg);
		if (auth.token) {
			headers.set("Authorization", `Bearer ${auth.token}`);
			return {
				...init,
				headers
			};
		}
		if (auth.password) {
			headers.set("x-openclaw-password", auth.password);
			return {
				...init,
				headers
			};
		}
	} catch {}
	try {
		const parsed = new URL(url);
		const port = parsed.port && Number.parseInt(parsed.port, 10) > 0 ? Number.parseInt(parsed.port, 10) : parsed.protocol === "https:" ? 443 : 80;
		const bridgeAuth = deps.getBridgeAuthForPort(port);
		if (bridgeAuth?.token) headers.set("Authorization", `Bearer ${bridgeAuth.token}`);
		else if (bridgeAuth?.password) headers.set("x-openclaw-password", bridgeAuth.password);
	} catch {}
	return {
		...init,
		headers
	};
}
function withLoopbackBrowserAuth(url, init) {
	return withLoopbackBrowserAuthImpl(url, init, {
		loadConfig,
		resolveBrowserControlAuth,
		getBridgeAuthForPort
	});
}
const BROWSER_TOOL_MODEL_HINT = "Do NOT retry the browser tool — it will keep failing. Use an alternative approach or inform the user that the browser is currently unavailable.";
const BROWSER_SERVICE_RATE_LIMIT_MESSAGE = "Browser service rate limit reached. Wait for the current session to complete, or retry later.";
const BROWSERBASE_RATE_LIMIT_MESSAGE = "Browserbase rate limit reached (max concurrent sessions). Wait for the current session to complete, or upgrade your plan.";
function isRateLimitStatus(status) {
	return status === 429;
}
function isBrowserbaseUrl(url) {
	if (!isAbsoluteHttp(url)) return false;
	try {
		const host = new URL(url).hostname.toLowerCase();
		return host === "browserbase.com" || host.endsWith(".browserbase.com");
	} catch {
		return false;
	}
}
function resolveBrowserRateLimitMessage(url) {
	return isBrowserbaseUrl(url) ? BROWSERBASE_RATE_LIMIT_MESSAGE : BROWSER_SERVICE_RATE_LIMIT_MESSAGE;
}
function resolveBrowserFetchOperatorHint(url) {
	return !isAbsoluteHttp(url) ? `Restart the OpenClaw gateway (OpenClaw.app menubar, or \`${formatCliCommand("openclaw gateway")}\`).` : "If this is a sandboxed session, ensure the sandbox browser is running.";
}
function normalizeErrorMessage(err) {
	if (err instanceof Error && err.message.trim().length > 0) return err.message.trim();
	return String(err);
}
function appendBrowserToolModelHint(message) {
	if (message.includes(BROWSER_TOOL_MODEL_HINT)) return message;
	return `${message} ${BROWSER_TOOL_MODEL_HINT}`;
}
async function discardResponseBody(res) {
	try {
		await res.body?.cancel();
	} catch {}
}
function enhanceDispatcherPathError(url, err) {
	const msg = normalizeErrorMessage(err);
	const suffix = `${resolveBrowserFetchOperatorHint(url)} ${BROWSER_TOOL_MODEL_HINT}`;
	const normalized = msg.endsWith(".") ? msg : `${msg}.`;
	return new Error(`${normalized} ${suffix}`, err instanceof Error ? { cause: err } : void 0);
}
function enhanceBrowserFetchError(url, err, timeoutMs) {
	const operatorHint = resolveBrowserFetchOperatorHint(url);
	const msg = String(err);
	const msgLower = msg.toLowerCase();
	if (msgLower.includes("timed out") || msgLower.includes("timeout") || msgLower.includes("aborted") || msgLower.includes("abort") || msgLower.includes("aborterror")) return new Error(appendBrowserToolModelHint(`Can't reach the OpenClaw browser control service (timed out after ${timeoutMs}ms). ${operatorHint}`));
	return new Error(appendBrowserToolModelHint(`Can't reach the OpenClaw browser control service. ${operatorHint} (${msg})`));
}
async function fetchHttpJson(url, init) {
	const timeoutMs = init.timeoutMs ?? 5e3;
	const ctrl = new AbortController();
	const upstreamSignal = init.signal;
	let upstreamAbortListener;
	if (upstreamSignal) if (upstreamSignal.aborted) ctrl.abort(upstreamSignal.reason);
	else {
		upstreamAbortListener = () => ctrl.abort(upstreamSignal.reason);
		upstreamSignal.addEventListener("abort", upstreamAbortListener, { once: true });
	}
	const t = setTimeout(() => ctrl.abort(/* @__PURE__ */ new Error("timed out")), timeoutMs);
	try {
		const res = await fetch(url, {
			...init,
			signal: ctrl.signal
		});
		if (!res.ok) {
			if (isRateLimitStatus(res.status)) {
				await discardResponseBody(res);
				throw new BrowserServiceError(`${resolveBrowserRateLimitMessage(url)} ${BROWSER_TOOL_MODEL_HINT}`);
			}
			throw new BrowserServiceError(await res.text().catch(() => "") || `HTTP ${res.status}`);
		}
		return await res.json();
	} finally {
		clearTimeout(t);
		if (upstreamSignal && upstreamAbortListener) upstreamSignal.removeEventListener("abort", upstreamAbortListener);
	}
}
async function fetchBrowserJson(url, init) {
	const timeoutMs = init?.timeoutMs ?? 5e3;
	let isDispatcherPath = false;
	try {
		if (isAbsoluteHttp(url)) return await fetchHttpJson(url, {
			...withLoopbackBrowserAuth(url, init),
			timeoutMs
		});
		isDispatcherPath = true;
		if (!await startBrowserControlServiceFromConfig()) throw new Error("browser control disabled");
		const dispatcher = createBrowserRouteDispatcher(createBrowserControlContext());
		const parsed = new URL(url, "http://localhost");
		const query = {};
		for (const [key, value] of parsed.searchParams.entries()) query[key] = value;
		let body = init?.body;
		if (typeof body === "string") try {
			body = JSON.parse(body);
		} catch {}
		const abortCtrl = new AbortController();
		const upstreamSignal = init?.signal;
		let upstreamAbortListener;
		if (upstreamSignal) if (upstreamSignal.aborted) abortCtrl.abort(upstreamSignal.reason);
		else {
			upstreamAbortListener = () => abortCtrl.abort(upstreamSignal.reason);
			upstreamSignal.addEventListener("abort", upstreamAbortListener, { once: true });
		}
		let abortListener;
		const abortPromise = abortCtrl.signal.aborted ? Promise.reject(abortCtrl.signal.reason ?? /* @__PURE__ */ new Error("aborted")) : new Promise((_, reject) => {
			abortListener = () => reject(abortCtrl.signal.reason ?? /* @__PURE__ */ new Error("aborted"));
			abortCtrl.signal.addEventListener("abort", abortListener, { once: true });
		});
		let timer;
		if (timeoutMs) timer = setTimeout(() => abortCtrl.abort(/* @__PURE__ */ new Error("timed out")), timeoutMs);
		const dispatchPromise = dispatcher.dispatch({
			method: init?.method?.toUpperCase() === "DELETE" ? "DELETE" : init?.method?.toUpperCase() === "POST" ? "POST" : "GET",
			path: parsed.pathname,
			query,
			body,
			signal: abortCtrl.signal
		});
		const result = await Promise.race([dispatchPromise, abortPromise]).finally(() => {
			if (timer) clearTimeout(timer);
			if (abortListener) abortCtrl.signal.removeEventListener("abort", abortListener);
			if (upstreamSignal && upstreamAbortListener) upstreamSignal.removeEventListener("abort", upstreamAbortListener);
		});
		if (result.status >= 400) {
			if (isRateLimitStatus(result.status)) throw new BrowserServiceError(`${resolveBrowserRateLimitMessage(url)} ${BROWSER_TOOL_MODEL_HINT}`);
			throw new BrowserServiceError(result.body && typeof result.body === "object" && "error" in result.body ? String(result.body.error) : `HTTP ${result.status}`);
		}
		return result.body;
	} catch (err) {
		if (err instanceof BrowserServiceError) throw err;
		if (isDispatcherPath) throw enhanceDispatcherPathError(url, err);
		throw enhanceBrowserFetchError(url, err, timeoutMs);
	}
}
//#endregion
//#region src/browser/cdp.helpers.ts
/**
* Returns true when the URL uses a WebSocket protocol (ws: or wss:).
* Used to distinguish direct-WebSocket CDP endpoints
* from HTTP(S) endpoints that require /json/version discovery.
*/
function isWebSocketUrl(url) {
	try {
		const parsed = new URL(url);
		return parsed.protocol === "ws:" || parsed.protocol === "wss:";
	} catch {
		return false;
	}
}
async function assertCdpEndpointAllowed(cdpUrl, ssrfPolicy) {
	if (!ssrfPolicy) return;
	const parsed = new URL(cdpUrl);
	if (![
		"http:",
		"https:",
		"ws:",
		"wss:"
	].includes(parsed.protocol)) throw new Error(`Invalid CDP URL protocol: ${parsed.protocol.replace(":", "")}`);
	await resolvePinnedHostnameWithPolicy(parsed.hostname, { policy: ssrfPolicy });
}
function redactCdpUrl(cdpUrl) {
	if (typeof cdpUrl !== "string") return cdpUrl;
	const trimmed = cdpUrl.trim();
	if (!trimmed) return trimmed;
	try {
		const parsed = new URL(trimmed);
		parsed.username = "";
		parsed.password = "";
		return redactSensitiveText(parsed.toString().replace(/\/$/, ""));
	} catch {
		return redactSensitiveText(trimmed);
	}
}
function getHeadersWithAuth(url, headers = {}) {
	const mergedHeaders = { ...headers };
	try {
		const parsed = new URL(url);
		if (Object.keys(mergedHeaders).some((key) => key.toLowerCase() === "authorization")) return mergedHeaders;
		if (parsed.username || parsed.password) {
			const auth = Buffer.from(`${parsed.username}:${parsed.password}`).toString("base64");
			return {
				...mergedHeaders,
				Authorization: `Basic ${auth}`
			};
		}
	} catch {}
	return mergedHeaders;
}
function appendCdpPath(cdpUrl, path) {
	const url = new URL(cdpUrl);
	url.pathname = `${url.pathname.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
	return url.toString();
}
function normalizeCdpHttpBaseForJsonEndpoints(cdpUrl) {
	try {
		const url = new URL(cdpUrl);
		if (url.protocol === "ws:") url.protocol = "http:";
		else if (url.protocol === "wss:") url.protocol = "https:";
		url.pathname = url.pathname.replace(/\/devtools\/browser\/.*$/, "");
		url.pathname = url.pathname.replace(/\/cdp$/, "");
		return url.toString().replace(/\/$/, "");
	} catch {
		return cdpUrl.replace(/^ws:/, "http:").replace(/^wss:/, "https:").replace(/\/devtools\/browser\/.*$/, "").replace(/\/cdp$/, "").replace(/\/$/, "");
	}
}
function createCdpSender(ws) {
	let nextId = 1;
	const pending = /* @__PURE__ */ new Map();
	const send = (method, params, sessionId) => {
		const id = nextId++;
		const msg = {
			id,
			method,
			params,
			sessionId
		};
		ws.send(JSON.stringify(msg));
		return new Promise((resolve, reject) => {
			pending.set(id, {
				resolve,
				reject
			});
		});
	};
	const closeWithError = (err) => {
		for (const [, p] of pending) p.reject(err);
		pending.clear();
		try {
			ws.close();
		} catch {}
	};
	ws.on("error", (err) => {
		closeWithError(err instanceof Error ? err : new Error(String(err)));
	});
	ws.on("message", (data) => {
		try {
			const parsed = JSON.parse(rawDataToString(data));
			if (typeof parsed.id !== "number") return;
			const p = pending.get(parsed.id);
			if (!p) return;
			pending.delete(parsed.id);
			if (parsed.error?.message) {
				p.reject(new Error(parsed.error.message));
				return;
			}
			p.resolve(parsed.result);
		} catch {}
	});
	ws.on("close", () => {
		closeWithError(/* @__PURE__ */ new Error("CDP socket closed"));
	});
	return {
		send,
		closeWithError
	};
}
async function fetchJson(url, timeoutMs = CDP_HTTP_REQUEST_TIMEOUT_MS, init) {
	return await (await fetchCdpChecked(url, timeoutMs, init)).json();
}
async function fetchCdpChecked(url, timeoutMs = CDP_HTTP_REQUEST_TIMEOUT_MS, init) {
	const ctrl = new AbortController();
	const t = setTimeout(ctrl.abort.bind(ctrl), timeoutMs);
	try {
		const headers = getHeadersWithAuth(url, init?.headers || {});
		const res = await withNoProxyForCdpUrl(url, () => fetch(url, {
			...init,
			headers,
			signal: ctrl.signal
		}));
		if (!res.ok) {
			if (res.status === 429) throw new Error(`${resolveBrowserRateLimitMessage(url)} Do NOT retry the browser tool.`);
			throw new Error(`HTTP ${res.status}`);
		}
		return res;
	} finally {
		clearTimeout(t);
	}
}
async function fetchOk(url, timeoutMs = CDP_HTTP_REQUEST_TIMEOUT_MS, init) {
	await fetchCdpChecked(url, timeoutMs, init);
}
function openCdpWebSocket(wsUrl, opts) {
	const headers = getHeadersWithAuth(wsUrl, opts?.headers ?? {});
	const handshakeTimeoutMs = typeof opts?.handshakeTimeoutMs === "number" && Number.isFinite(opts.handshakeTimeoutMs) ? Math.max(1, Math.floor(opts.handshakeTimeoutMs)) : CDP_WS_HANDSHAKE_TIMEOUT_MS;
	const agent = getDirectAgentForCdp(wsUrl);
	return new WebSocket(wsUrl, {
		handshakeTimeout: handshakeTimeoutMs,
		...Object.keys(headers).length ? { headers } : {},
		...agent ? { agent } : {}
	});
}
async function withCdpSocket(wsUrl, fn, opts) {
	const ws = openCdpWebSocket(wsUrl, opts);
	const { send, closeWithError } = createCdpSender(ws);
	const openPromise = new Promise((resolve, reject) => {
		ws.once("open", () => resolve());
		ws.once("error", (err) => reject(err));
		ws.once("close", () => reject(/* @__PURE__ */ new Error("CDP socket closed")));
	});
	try {
		await openPromise;
	} catch (err) {
		closeWithError(err instanceof Error ? err : new Error(String(err)));
		throw err;
	}
	try {
		return await fn(send);
	} catch (err) {
		closeWithError(err instanceof Error ? err : new Error(String(err)));
		throw err;
	} finally {
		try {
			ws.close();
		} catch {}
	}
}
//#endregion
//#region src/browser/cdp.ts
function normalizeCdpWsUrl(wsUrl, cdpUrl) {
	const ws = new URL(wsUrl);
	const cdp = new URL(cdpUrl);
	const isWildcardBind = ws.hostname === "0.0.0.0" || ws.hostname === "[::]";
	if ((isLoopbackHost(ws.hostname) || isWildcardBind) && !isLoopbackHost(cdp.hostname)) {
		ws.hostname = cdp.hostname;
		const cdpPort = cdp.port || (cdp.protocol === "https:" ? "443" : "80");
		if (cdpPort) ws.port = cdpPort;
		ws.protocol = cdp.protocol === "https:" ? "wss:" : "ws:";
	}
	if (cdp.protocol === "https:" && ws.protocol === "ws:") ws.protocol = "wss:";
	if (!ws.username && !ws.password && (cdp.username || cdp.password)) {
		ws.username = cdp.username;
		ws.password = cdp.password;
	}
	for (const [key, value] of cdp.searchParams.entries()) if (!ws.searchParams.has(key)) ws.searchParams.append(key, value);
	return ws.toString();
}
async function captureScreenshot(opts) {
	return await withCdpSocket(opts.wsUrl, async (send) => {
		await send("Page.enable");
		let clip;
		if (opts.fullPage) {
			const metrics = await send("Page.getLayoutMetrics");
			const size = metrics?.cssContentSize ?? metrics?.contentSize;
			const width = Number(size?.width ?? 0);
			const height = Number(size?.height ?? 0);
			if (width > 0 && height > 0) clip = {
				x: 0,
				y: 0,
				width,
				height,
				scale: 1
			};
		}
		const format = opts.format ?? "png";
		const quality = format === "jpeg" ? Math.max(0, Math.min(100, Math.round(opts.quality ?? 85))) : void 0;
		const base64 = (await send("Page.captureScreenshot", {
			format,
			...quality !== void 0 ? { quality } : {},
			fromSurface: true,
			captureBeyondViewport: true,
			...clip ? { clip } : {}
		}))?.data;
		if (!base64) throw new Error("Screenshot failed: missing data");
		return Buffer.from(base64, "base64");
	});
}
async function createTargetViaCdp(opts) {
	await assertBrowserNavigationAllowed({
		url: opts.url,
		...withBrowserNavigationPolicy(opts.ssrfPolicy)
	});
	let wsUrl;
	if (isWebSocketUrl(opts.cdpUrl)) wsUrl = opts.cdpUrl;
	else {
		const version = await fetchJson(appendCdpPath(opts.cdpUrl, "/json/version"), 1500);
		const wsUrlRaw = String(version?.webSocketDebuggerUrl ?? "").trim();
		wsUrl = wsUrlRaw ? normalizeCdpWsUrl(wsUrlRaw, opts.cdpUrl) : "";
		if (!wsUrl) throw new Error("CDP /json/version missing webSocketDebuggerUrl");
	}
	return await withCdpSocket(wsUrl, async (send) => {
		const created = await send("Target.createTarget", { url: opts.url });
		const targetId = String(created?.targetId ?? "").trim();
		if (!targetId) throw new Error("CDP Target.createTarget returned no targetId");
		return { targetId };
	});
}
function axValue(v) {
	if (!v || typeof v !== "object") return "";
	const value = v.value;
	if (typeof value === "string") return value;
	if (typeof value === "number" || typeof value === "boolean") return String(value);
	return "";
}
function formatAriaSnapshot(nodes, limit) {
	const byId = /* @__PURE__ */ new Map();
	for (const n of nodes) if (n.nodeId) byId.set(n.nodeId, n);
	const referenced = /* @__PURE__ */ new Set();
	for (const n of nodes) for (const c of n.childIds ?? []) referenced.add(c);
	const root = nodes.find((n) => n.nodeId && !referenced.has(n.nodeId)) ?? nodes[0];
	if (!root?.nodeId) return [];
	const out = [];
	const stack = [{
		id: root.nodeId,
		depth: 0
	}];
	while (stack.length && out.length < limit) {
		const popped = stack.pop();
		if (!popped) break;
		const { id, depth } = popped;
		const n = byId.get(id);
		if (!n) continue;
		const role = axValue(n.role);
		const name = axValue(n.name);
		const value = axValue(n.value);
		const description = axValue(n.description);
		const ref = `ax${out.length + 1}`;
		out.push({
			ref,
			role: role || "unknown",
			name: name || "",
			...value ? { value } : {},
			...description ? { description } : {},
			...typeof n.backendDOMNodeId === "number" ? { backendDOMNodeId: n.backendDOMNodeId } : {},
			depth
		});
		const children = (n.childIds ?? []).filter((c) => byId.has(c));
		for (let i = children.length - 1; i >= 0; i--) {
			const child = children[i];
			if (child) stack.push({
				id: child,
				depth: depth + 1
			});
		}
	}
	return out;
}
async function snapshotAria(opts) {
	const limit = Math.max(1, Math.min(2e3, Math.floor(opts.limit ?? 500)));
	return await withCdpSocket(opts.wsUrl, async (send) => {
		await send("Accessibility.enable").catch(() => {});
		const res = await send("Accessibility.getFullAXTree");
		return { nodes: formatAriaSnapshot(Array.isArray(res?.nodes) ? res.nodes : [], limit) };
	});
}
//#endregion
//#region src/browser/snapshot-roles.ts
/**
* Shared ARIA role classification sets used by both the Playwright and Chrome MCP
* snapshot paths. Keep these in sync — divergence causes the two drivers to produce
* different snapshot output for the same page.
*/
/** Roles that represent user-interactive elements and always get a ref. */
const INTERACTIVE_ROLES = new Set([
	"button",
	"checkbox",
	"combobox",
	"link",
	"listbox",
	"menuitem",
	"menuitemcheckbox",
	"menuitemradio",
	"option",
	"radio",
	"searchbox",
	"slider",
	"spinbutton",
	"switch",
	"tab",
	"textbox",
	"treeitem"
]);
/** Roles that carry meaningful content and get a ref when named. */
const CONTENT_ROLES = new Set([
	"article",
	"cell",
	"columnheader",
	"gridcell",
	"heading",
	"listitem",
	"main",
	"navigation",
	"region",
	"rowheader"
]);
/** Structural/container roles — typically skipped in compact mode. */
const STRUCTURAL_ROLES = new Set([
	"application",
	"directory",
	"document",
	"generic",
	"grid",
	"group",
	"ignored",
	"list",
	"menu",
	"menubar",
	"none",
	"presentation",
	"row",
	"rowgroup",
	"table",
	"tablist",
	"toolbar",
	"tree",
	"treegrid"
]);
//#endregion
//#region src/browser/pw-role-snapshot.ts
function getRoleSnapshotStats(snapshot, refs) {
	const interactive = Object.values(refs).filter((r) => INTERACTIVE_ROLES.has(r.role)).length;
	return {
		lines: snapshot.split("\n").length,
		chars: snapshot.length,
		refs: Object.keys(refs).length,
		interactive
	};
}
function getIndentLevel(line) {
	const match = line.match(/^(\s*)/);
	return match ? Math.floor(match[1].length / 2) : 0;
}
function matchInteractiveSnapshotLine(line, options) {
	const depth = getIndentLevel(line);
	if (options.maxDepth !== void 0 && depth > options.maxDepth) return null;
	const match = line.match(/^(\s*-\s*)(\w+)(?:\s+"([^"]*)")?(.*)$/);
	if (!match) return null;
	const [, , roleRaw, name, suffix] = match;
	if (roleRaw.startsWith("/")) return null;
	return {
		roleRaw,
		role: roleRaw.toLowerCase(),
		...name ? { name } : {},
		suffix
	};
}
function createRoleNameTracker() {
	const counts = /* @__PURE__ */ new Map();
	const refsByKey = /* @__PURE__ */ new Map();
	return {
		counts,
		refsByKey,
		getKey(role, name) {
			return `${role}:${name ?? ""}`;
		},
		getNextIndex(role, name) {
			const key = this.getKey(role, name);
			const current = counts.get(key) ?? 0;
			counts.set(key, current + 1);
			return current;
		},
		trackRef(role, name, ref) {
			const key = this.getKey(role, name);
			const list = refsByKey.get(key) ?? [];
			list.push(ref);
			refsByKey.set(key, list);
		},
		getDuplicateKeys() {
			const out = /* @__PURE__ */ new Set();
			for (const [key, refs] of refsByKey) if (refs.length > 1) out.add(key);
			return out;
		}
	};
}
function removeNthFromNonDuplicates(refs, tracker) {
	const duplicates = tracker.getDuplicateKeys();
	for (const [ref, data] of Object.entries(refs)) {
		const key = tracker.getKey(data.role, data.name);
		if (!duplicates.has(key)) delete refs[ref]?.nth;
	}
}
function compactTree(tree) {
	const lines = tree.split("\n");
	const result = [];
	for (let i = 0; i < lines.length; i += 1) {
		const line = lines[i];
		if (line.includes("[ref=")) {
			result.push(line);
			continue;
		}
		if (line.includes(":") && !line.trimEnd().endsWith(":")) {
			result.push(line);
			continue;
		}
		const currentIndent = getIndentLevel(line);
		let hasRelevantChildren = false;
		for (let j = i + 1; j < lines.length; j += 1) {
			if (getIndentLevel(lines[j]) <= currentIndent) break;
			if (lines[j]?.includes("[ref=")) {
				hasRelevantChildren = true;
				break;
			}
		}
		if (hasRelevantChildren) result.push(line);
	}
	return result.join("\n");
}
function processLine(line, refs, options, tracker, nextRef) {
	const depth = getIndentLevel(line);
	if (options.maxDepth !== void 0 && depth > options.maxDepth) return null;
	const match = line.match(/^(\s*-\s*)(\w+)(?:\s+"([^"]*)")?(.*)$/);
	if (!match) return options.interactive ? null : line;
	const [, prefix, roleRaw, name, suffix] = match;
	if (roleRaw.startsWith("/")) return options.interactive ? null : line;
	const role = roleRaw.toLowerCase();
	const isInteractive = INTERACTIVE_ROLES.has(role);
	const isContent = CONTENT_ROLES.has(role);
	const isStructural = STRUCTURAL_ROLES.has(role);
	if (options.interactive && !isInteractive) return null;
	if (options.compact && isStructural && !name) return null;
	if (!(isInteractive || isContent && name)) return line;
	const ref = nextRef();
	const nth = tracker.getNextIndex(role, name);
	tracker.trackRef(role, name, ref);
	refs[ref] = {
		role,
		name,
		nth
	};
	let enhanced = `${prefix}${roleRaw}`;
	if (name) enhanced += ` "${name}"`;
	enhanced += ` [ref=${ref}]`;
	if (nth > 0) enhanced += ` [nth=${nth}]`;
	if (suffix) enhanced += suffix;
	return enhanced;
}
function buildInteractiveSnapshotLines(params) {
	const out = [];
	for (const line of params.lines) {
		const parsed = matchInteractiveSnapshotLine(line, params.options);
		if (!parsed) continue;
		if (!INTERACTIVE_ROLES.has(parsed.role)) continue;
		const resolved = params.resolveRef(parsed);
		if (!resolved?.ref) continue;
		params.recordRef(parsed, resolved.ref, resolved.nth);
		let enhanced = `- ${parsed.roleRaw}`;
		if (parsed.name) enhanced += ` "${parsed.name}"`;
		enhanced += ` [ref=${resolved.ref}]`;
		if ((resolved.nth ?? 0) > 0) enhanced += ` [nth=${resolved.nth}]`;
		if (params.includeSuffix(parsed.suffix)) enhanced += parsed.suffix;
		out.push(enhanced);
	}
	return out;
}
function parseRoleRef(raw) {
	const trimmed = raw.trim();
	if (!trimmed) return null;
	const normalized = trimmed.startsWith("@") ? trimmed.slice(1) : trimmed.startsWith("ref=") ? trimmed.slice(4) : trimmed;
	return /^e\d+$/.test(normalized) ? normalized : null;
}
function buildRoleSnapshotFromAriaSnapshot(ariaSnapshot, options = {}) {
	const lines = ariaSnapshot.split("\n");
	const refs = {};
	const tracker = createRoleNameTracker();
	let counter = 0;
	const nextRef = () => {
		counter += 1;
		return `e${counter}`;
	};
	if (options.interactive) {
		const result = buildInteractiveSnapshotLines({
			lines,
			options,
			resolveRef: ({ role, name }) => {
				const ref = nextRef();
				const nth = tracker.getNextIndex(role, name);
				tracker.trackRef(role, name, ref);
				return {
					ref,
					nth
				};
			},
			recordRef: ({ role, name }, ref, nth) => {
				refs[ref] = {
					role,
					name,
					nth
				};
			},
			includeSuffix: (suffix) => suffix.includes("[")
		});
		removeNthFromNonDuplicates(refs, tracker);
		return {
			snapshot: result.join("\n") || "(no interactive elements)",
			refs
		};
	}
	const result = [];
	for (const line of lines) {
		const processed = processLine(line, refs, options, tracker, nextRef);
		if (processed !== null) result.push(processed);
	}
	removeNthFromNonDuplicates(refs, tracker);
	const tree = result.join("\n") || "(empty)";
	return {
		snapshot: options.compact ? compactTree(tree) : tree,
		refs
	};
}
function parseAiSnapshotRef(suffix) {
	const match = suffix.match(/\[ref=(e\d+)\]/i);
	return match ? match[1] : null;
}
/**
* Build a role snapshot from Playwright's AI snapshot output while preserving Playwright's own
* aria-ref ids (e.g. ref=e13). This makes the refs self-resolving across calls.
*/
function buildRoleSnapshotFromAiSnapshot(aiSnapshot, options = {}) {
	const lines = String(aiSnapshot ?? "").split("\n");
	const refs = {};
	if (options.interactive) return {
		snapshot: buildInteractiveSnapshotLines({
			lines,
			options,
			resolveRef: ({ suffix }) => {
				const ref = parseAiSnapshotRef(suffix);
				return ref ? { ref } : null;
			},
			recordRef: ({ role, name }, ref) => {
				refs[ref] = {
					role,
					...name ? { name } : {}
				};
			},
			includeSuffix: () => true
		}).join("\n") || "(no interactive elements)",
		refs
	};
	const out = [];
	for (const line of lines) {
		const depth = getIndentLevel(line);
		if (options.maxDepth !== void 0 && depth > options.maxDepth) continue;
		const match = line.match(/^(\s*-\s*)(\w+)(?:\s+"([^"]*)")?(.*)$/);
		if (!match) {
			out.push(line);
			continue;
		}
		const [, , roleRaw, name, suffix] = match;
		if (roleRaw.startsWith("/")) {
			out.push(line);
			continue;
		}
		const role = roleRaw.toLowerCase();
		const isStructural = STRUCTURAL_ROLES.has(role);
		if (options.compact && isStructural && !name) continue;
		const ref = parseAiSnapshotRef(suffix);
		if (ref) refs[ref] = {
			role,
			...name ? { name } : {}
		};
		out.push(line);
	}
	const tree = out.join("\n") || "(empty)";
	return {
		snapshot: options.compact ? compactTree(tree) : tree,
		refs
	};
}
//#endregion
//#region src/browser/chrome-mcp.snapshot.ts
function normalizeRole(node) {
	return (typeof node.role === "string" ? node.role.trim().toLowerCase() : "") || "generic";
}
function normalizeString(value) {
	if (typeof value === "string") return value.trim() || void 0;
	if (typeof value === "number" || typeof value === "boolean") return String(value);
}
function escapeQuoted(value) {
	return value.replaceAll("\\", "\\\\").replaceAll("\"", "\\\"");
}
function shouldIncludeNode(params) {
	if (params.options?.interactive && !INTERACTIVE_ROLES.has(params.role)) return false;
	if (params.options?.compact && STRUCTURAL_ROLES.has(params.role) && !params.name) return false;
	return true;
}
function shouldCreateRef(role, name) {
	return INTERACTIVE_ROLES.has(role) || CONTENT_ROLES.has(role) && Boolean(name);
}
function createDuplicateTracker() {
	return {
		counts: /* @__PURE__ */ new Map(),
		keysByRef: /* @__PURE__ */ new Map(),
		duplicates: /* @__PURE__ */ new Set()
	};
}
function registerRef(tracker, ref, role, name) {
	const key = `${role}:${name ?? ""}`;
	const count = tracker.counts.get(key) ?? 0;
	tracker.counts.set(key, count + 1);
	tracker.keysByRef.set(ref, key);
	if (count > 0) {
		tracker.duplicates.add(key);
		return count;
	}
}
function flattenChromeMcpSnapshotToAriaNodes(root, limit = 500) {
	const boundedLimit = Math.max(1, Math.min(2e3, Math.floor(limit)));
	const out = [];
	const visit = (node, depth) => {
		if (out.length >= boundedLimit) return;
		const ref = normalizeString(node.id);
		if (ref) out.push({
			ref,
			role: normalizeRole(node),
			name: normalizeString(node.name) ?? "",
			value: normalizeString(node.value),
			description: normalizeString(node.description),
			depth
		});
		for (const child of node.children ?? []) {
			visit(child, depth + 1);
			if (out.length >= boundedLimit) return;
		}
	};
	visit(root, 0);
	return out;
}
function buildAiSnapshotFromChromeMcpSnapshot(params) {
	const refs = {};
	const tracker = createDuplicateTracker();
	const lines = [];
	const visit = (node, depth) => {
		const role = normalizeRole(node);
		const name = normalizeString(node.name);
		const value = normalizeString(node.value);
		const description = normalizeString(node.description);
		const maxDepth = params.options?.maxDepth;
		if (maxDepth !== void 0 && depth > maxDepth) return;
		if (shouldIncludeNode({
			role,
			name,
			options: params.options
		})) {
			let line = `${"  ".repeat(depth)}- ${role}`;
			if (name) line += ` "${escapeQuoted(name)}"`;
			const ref = normalizeString(node.id);
			if (ref && shouldCreateRef(role, name)) {
				const nth = registerRef(tracker, ref, role, name);
				refs[ref] = nth === void 0 ? {
					role,
					name
				} : {
					role,
					name,
					nth
				};
				line += ` [ref=${ref}]`;
			}
			if (value) line += ` value="${escapeQuoted(value)}"`;
			if (description) line += ` description="${escapeQuoted(description)}"`;
			lines.push(line);
		}
		for (const child of node.children ?? []) visit(child, depth + 1);
	};
	visit(params.root, 0);
	for (const [ref, data] of Object.entries(refs)) {
		const key = tracker.keysByRef.get(ref);
		if (key && !tracker.duplicates.has(key)) delete data.nth;
	}
	let snapshot = lines.join("\n");
	let truncated = false;
	const maxChars = typeof params.maxChars === "number" && Number.isFinite(params.maxChars) && params.maxChars > 0 ? Math.floor(params.maxChars) : void 0;
	if (maxChars && snapshot.length > maxChars) {
		snapshot = `${snapshot.slice(0, maxChars)}\n\n[...TRUNCATED - page too large]`;
		truncated = true;
	}
	const stats = getRoleSnapshotStats(snapshot, refs);
	return truncated ? {
		snapshot,
		truncated,
		refs,
		stats
	} : {
		snapshot,
		refs,
		stats
	};
}
//#endregion
//#region src/browser/screenshot.ts
const DEFAULT_BROWSER_SCREENSHOT_MAX_SIDE = 2e3;
const DEFAULT_BROWSER_SCREENSHOT_MAX_BYTES = 5 * 1024 * 1024;
async function normalizeBrowserScreenshot(buffer, opts) {
	const maxSide = Math.max(1, Math.round(opts?.maxSide ?? 2e3));
	const maxBytes = Math.max(1, Math.round(opts?.maxBytes ?? 5242880));
	const meta = await getImageMetadata(buffer);
	const width = Number(meta?.width ?? 0);
	const height = Number(meta?.height ?? 0);
	const maxDim = Math.max(width, height);
	if (buffer.byteLength <= maxBytes && (maxDim === 0 || width <= maxSide && height <= maxSide)) return { buffer };
	const sideGrid = buildImageResizeSideGrid(maxSide, maxDim > 0 ? Math.min(maxSide, maxDim) : maxSide);
	let smallest = null;
	for (const side of sideGrid) for (const quality of IMAGE_REDUCE_QUALITY_STEPS) {
		const out = await resizeToJpeg({
			buffer,
			maxSide: side,
			quality,
			withoutEnlargement: true
		});
		if (!smallest || out.byteLength < smallest.size) smallest = {
			buffer: out,
			size: out.byteLength
		};
		if (out.byteLength <= maxBytes) return {
			buffer: out,
			contentType: "image/jpeg"
		};
	}
	const best = smallest?.buffer ?? buffer;
	throw new Error(`Browser screenshot could not be reduced below ${(maxBytes / (1024 * 1024)).toFixed(0)}MB (got ${(best.byteLength / (1024 * 1024)).toFixed(2)}MB)`);
}
//#endregion
//#region src/browser/routes/agent.snapshot.plan.ts
function resolveSnapshotPlan(params) {
	const mode = params.query.mode === "efficient" ? "efficient" : void 0;
	const labels = toBoolean(params.query.labels) ?? void 0;
	const explicitFormat = params.query.format === "aria" ? "aria" : params.query.format === "ai" ? "ai" : void 0;
	const format = resolveDefaultSnapshotFormat({
		profile: params.profile,
		hasPlaywright: params.hasPlaywright,
		explicitFormat,
		mode
	});
	const limitRaw = typeof params.query.limit === "string" ? Number(params.query.limit) : void 0;
	const hasMaxChars = Object.hasOwn(params.query, "maxChars");
	const maxCharsRaw = typeof params.query.maxChars === "string" ? Number(params.query.maxChars) : void 0;
	const limit = Number.isFinite(limitRaw) ? limitRaw : void 0;
	const resolvedMaxChars = format === "ai" ? hasMaxChars ? typeof maxCharsRaw === "number" && Number.isFinite(maxCharsRaw) && maxCharsRaw > 0 ? Math.floor(maxCharsRaw) : void 0 : mode === "efficient" ? DEFAULT_AI_SNAPSHOT_EFFICIENT_MAX_CHARS : DEFAULT_AI_SNAPSHOT_MAX_CHARS : void 0;
	const interactiveRaw = toBoolean(params.query.interactive);
	const compactRaw = toBoolean(params.query.compact);
	const depthRaw = toNumber(params.query.depth);
	const refsModeRaw = toStringOrEmpty(params.query.refs).trim();
	const refsMode = refsModeRaw === "aria" ? "aria" : refsModeRaw === "role" ? "role" : void 0;
	const interactive = interactiveRaw ?? (mode === "efficient" ? true : void 0);
	const compact = compactRaw ?? (mode === "efficient" ? true : void 0);
	const depth = depthRaw ?? (mode === "efficient" ? 6 : void 0);
	const selectorValue = toStringOrEmpty(params.query.selector).trim() || void 0;
	const frameSelectorValue = toStringOrEmpty(params.query.frame).trim() || void 0;
	return {
		format,
		mode,
		labels,
		limit,
		resolvedMaxChars,
		interactive,
		compact,
		depth,
		refsMode,
		selectorValue,
		frameSelectorValue,
		wantsRoleSnapshot: labels === true || mode === "efficient" || interactive === true || compact === true || depth !== void 0 || Boolean(selectorValue) || Boolean(frameSelectorValue)
	};
}
//#endregion
//#region src/browser/routes/agent.snapshot.ts
const CHROME_MCP_OVERLAY_ATTR = "data-openclaw-mcp-overlay";
async function clearChromeMcpOverlay(params) {
	await evaluateChromeMcpScript({
		profileName: params.profileName,
		userDataDir: params.userDataDir,
		targetId: params.targetId,
		fn: `() => {
      document.querySelectorAll("[${CHROME_MCP_OVERLAY_ATTR}]").forEach((node) => node.remove());
      return true;
    }`
	}).catch(() => {});
}
async function renderChromeMcpLabels(params) {
	const refList = JSON.stringify(params.refs);
	const result = await evaluateChromeMcpScript({
		profileName: params.profileName,
		userDataDir: params.userDataDir,
		targetId: params.targetId,
		args: params.refs,
		fn: `(...elements) => {
      const refs = ${refList};
      document.querySelectorAll("[${CHROME_MCP_OVERLAY_ATTR}]").forEach((node) => node.remove());
      const root = document.createElement("div");
      root.setAttribute("${CHROME_MCP_OVERLAY_ATTR}", "labels");
      root.style.position = "fixed";
      root.style.inset = "0";
      root.style.pointerEvents = "none";
      root.style.zIndex = "2147483647";
      let labels = 0;
      let skipped = 0;
      elements.forEach((el, index) => {
        if (!(el instanceof Element)) {
          skipped += 1;
          return;
        }
        const rect = el.getBoundingClientRect();
        if (rect.width <= 0 && rect.height <= 0) {
          skipped += 1;
          return;
        }
        labels += 1;
        const badge = document.createElement("div");
        badge.setAttribute("${CHROME_MCP_OVERLAY_ATTR}", "label");
        badge.textContent = refs[index] || String(labels);
        badge.style.position = "fixed";
        badge.style.left = \`\${Math.max(0, rect.left)}px\`;
        badge.style.top = \`\${Math.max(0, rect.top)}px\`;
        badge.style.transform = "translateY(-100%)";
        badge.style.padding = "2px 6px";
        badge.style.borderRadius = "999px";
        badge.style.background = "#FF4500";
        badge.style.color = "#fff";
        badge.style.font = "600 12px ui-monospace, SFMono-Regular, Menlo, monospace";
        badge.style.boxShadow = "0 2px 6px rgba(0,0,0,0.35)";
        badge.style.whiteSpace = "nowrap";
        root.appendChild(badge);
      });
      document.documentElement.appendChild(root);
      return { labels, skipped };
    }`
	});
	return {
		labels: result && typeof result === "object" && typeof result.labels === "number" ? result.labels : 0,
		skipped: result && typeof result === "object" && typeof result.skipped === "number" ? result.skipped : 0
	};
}
async function saveNormalizedScreenshotResponse(params) {
	const normalized = await normalizeBrowserScreenshot(params.buffer, {
		maxSide: DEFAULT_BROWSER_SCREENSHOT_MAX_SIDE,
		maxBytes: DEFAULT_BROWSER_SCREENSHOT_MAX_BYTES
	});
	await saveBrowserMediaResponse({
		res: params.res,
		buffer: normalized.buffer,
		contentType: normalized.contentType ?? `image/${params.type}`,
		maxBytes: DEFAULT_BROWSER_SCREENSHOT_MAX_BYTES,
		targetId: params.targetId,
		url: params.url
	});
}
async function saveBrowserMediaResponse(params) {
	await ensureMediaDir();
	const saved = await saveMediaBuffer(params.buffer, params.contentType, "browser", params.maxBytes);
	params.res.json({
		ok: true,
		path: path.resolve(saved.path),
		targetId: params.targetId,
		url: params.url
	});
}
/** Resolve the correct targetId after a navigation that may trigger a renderer swap. */
async function resolveTargetIdAfterNavigate(opts) {
	let currentTargetId = opts.oldTargetId;
	try {
		const pickReplacement = (tabs, options) => {
			if (tabs.some((tab) => tab.targetId === opts.oldTargetId)) return opts.oldTargetId;
			const byUrl = tabs.filter((tab) => tab.url === opts.navigatedUrl);
			if (byUrl.length === 1) return byUrl[0]?.targetId ?? opts.oldTargetId;
			const uniqueReplacement = byUrl.filter((tab) => tab.targetId !== opts.oldTargetId);
			if (uniqueReplacement.length === 1) return uniqueReplacement[0]?.targetId ?? opts.oldTargetId;
			if (options?.allowSingleTabFallback && tabs.length === 1) return tabs[0]?.targetId ?? opts.oldTargetId;
			return opts.oldTargetId;
		};
		currentTargetId = pickReplacement(await opts.listTabs());
		if (currentTargetId === opts.oldTargetId) {
			await new Promise((r) => setTimeout(r, 800));
			currentTargetId = pickReplacement(await opts.listTabs(), { allowSingleTabFallback: true });
		}
	} catch {}
	return currentTargetId;
}
function registerBrowserAgentSnapshotRoutes(app, ctx) {
	app.post("/navigate", async (req, res) => {
		const body = readBody(req);
		const url = toStringOrEmpty(body.url);
		const targetId = toStringOrEmpty(body.targetId) || void 0;
		if (!url) return jsonError(res, 400, "url is required");
		await withRouteTabContext({
			req,
			res,
			ctx,
			targetId,
			run: async ({ profileCtx, tab, cdpUrl }) => {
				if (getBrowserProfileCapabilities(profileCtx.profile).usesChromeMcp) {
					const ssrfPolicyOpts = withBrowserNavigationPolicy(ctx.state().resolved.ssrfPolicy);
					await assertBrowserNavigationAllowed({
						url,
						...ssrfPolicyOpts
					});
					const result = await navigateChromeMcpPage({
						profileName: profileCtx.profile.name,
						userDataDir: profileCtx.profile.userDataDir,
						targetId: tab.targetId,
						url
					});
					await assertBrowserNavigationResultAllowed({
						url: result.url,
						...ssrfPolicyOpts
					});
					return res.json({
						ok: true,
						targetId: tab.targetId,
						...result
					});
				}
				const pw = await requirePwAi(res, "navigate");
				if (!pw) return;
				const result = await pw.navigateViaPlaywright({
					cdpUrl,
					targetId: tab.targetId,
					url,
					...withBrowserNavigationPolicy(ctx.state().resolved.ssrfPolicy)
				});
				const currentTargetId = await resolveTargetIdAfterNavigate({
					oldTargetId: tab.targetId,
					navigatedUrl: result.url,
					listTabs: () => profileCtx.listTabs()
				});
				res.json({
					ok: true,
					targetId: currentTargetId,
					...result
				});
			}
		});
	});
	app.post("/pdf", async (req, res) => {
		const targetId = toStringOrEmpty(readBody(req).targetId) || void 0;
		const profileCtx = resolveProfileContext(req, res, ctx);
		if (!profileCtx) return;
		if (getBrowserProfileCapabilities(profileCtx.profile).usesChromeMcp) return jsonError(res, 501, "pdf is not supported for existing-session profiles yet; use screenshot/snapshot instead.");
		await withPlaywrightRouteContext({
			req,
			res,
			ctx,
			targetId,
			feature: "pdf",
			run: async ({ cdpUrl, tab, pw }) => {
				const pdf = await pw.pdfViaPlaywright({
					cdpUrl,
					targetId: tab.targetId
				});
				await saveBrowserMediaResponse({
					res,
					buffer: pdf.buffer,
					contentType: "application/pdf",
					maxBytes: pdf.buffer.byteLength,
					targetId: tab.targetId,
					url: tab.url
				});
			}
		});
	});
	app.post("/screenshot", async (req, res) => {
		const body = readBody(req);
		const targetId = toStringOrEmpty(body.targetId) || void 0;
		const fullPage = toBoolean(body.fullPage) ?? false;
		const ref = toStringOrEmpty(body.ref) || void 0;
		const element = toStringOrEmpty(body.element) || void 0;
		const type = body.type === "jpeg" ? "jpeg" : "png";
		if (fullPage && (ref || element)) return jsonError(res, 400, "fullPage is not supported for element screenshots");
		await withRouteTabContext({
			req,
			res,
			ctx,
			targetId,
			run: async ({ profileCtx, tab, cdpUrl }) => {
				if (getBrowserProfileCapabilities(profileCtx.profile).usesChromeMcp) {
					if (element) return jsonError(res, 400, "element screenshots are not supported for existing-session profiles; use ref from snapshot.");
					await saveNormalizedScreenshotResponse({
						res,
						buffer: await takeChromeMcpScreenshot({
							profileName: profileCtx.profile.name,
							userDataDir: profileCtx.profile.userDataDir,
							targetId: tab.targetId,
							uid: ref,
							fullPage,
							format: type
						}),
						type,
						targetId: tab.targetId,
						url: tab.url
					});
					return;
				}
				let buffer;
				if (shouldUsePlaywrightForScreenshot({
					profile: profileCtx.profile,
					wsUrl: tab.wsUrl,
					ref,
					element
				})) {
					const pw = await requirePwAi(res, "screenshot");
					if (!pw) return;
					buffer = (await pw.takeScreenshotViaPlaywright({
						cdpUrl,
						targetId: tab.targetId,
						ref,
						element,
						fullPage,
						type
					})).buffer;
				} else buffer = await captureScreenshot({
					wsUrl: tab.wsUrl ?? "",
					fullPage,
					format: type,
					quality: type === "jpeg" ? 85 : void 0
				});
				await saveNormalizedScreenshotResponse({
					res,
					buffer,
					type,
					targetId: tab.targetId,
					url: tab.url
				});
			}
		});
	});
	app.get("/snapshot", async (req, res) => {
		const profileCtx = resolveProfileContext(req, res, ctx);
		if (!profileCtx) return;
		const targetId = typeof req.query.targetId === "string" ? req.query.targetId.trim() : "";
		const hasPlaywright = Boolean(await getPwAiModule());
		const plan = resolveSnapshotPlan({
			profile: profileCtx.profile,
			query: req.query,
			hasPlaywright
		});
		try {
			const tab = await profileCtx.ensureTabAvailable(targetId || void 0);
			if ((plan.labels || plan.mode === "efficient") && plan.format === "aria") return jsonError(res, 400, "labels/mode=efficient require format=ai");
			if (getBrowserProfileCapabilities(profileCtx.profile).usesChromeMcp) {
				if (plan.selectorValue || plan.frameSelectorValue) return jsonError(res, 400, "selector/frame snapshots are not supported for existing-session profiles; snapshot the whole page and use refs.");
				const snapshot = await takeChromeMcpSnapshot({
					profileName: profileCtx.profile.name,
					userDataDir: profileCtx.profile.userDataDir,
					targetId: tab.targetId
				});
				if (plan.format === "aria") return res.json({
					ok: true,
					format: "aria",
					targetId: tab.targetId,
					url: tab.url,
					nodes: flattenChromeMcpSnapshotToAriaNodes(snapshot, plan.limit)
				});
				const built = buildAiSnapshotFromChromeMcpSnapshot({
					root: snapshot,
					options: {
						interactive: plan.interactive ?? void 0,
						compact: plan.compact ?? void 0,
						maxDepth: plan.depth ?? void 0
					},
					maxChars: plan.resolvedMaxChars
				});
				if (plan.labels) {
					const refs = Object.keys(built.refs);
					const labelResult = await renderChromeMcpLabels({
						profileName: profileCtx.profile.name,
						userDataDir: profileCtx.profile.userDataDir,
						targetId: tab.targetId,
						refs
					});
					try {
						const normalized = await normalizeBrowserScreenshot(await takeChromeMcpScreenshot({
							profileName: profileCtx.profile.name,
							userDataDir: profileCtx.profile.userDataDir,
							targetId: tab.targetId,
							format: "png"
						}), {
							maxSide: DEFAULT_BROWSER_SCREENSHOT_MAX_SIDE,
							maxBytes: DEFAULT_BROWSER_SCREENSHOT_MAX_BYTES
						});
						await ensureMediaDir();
						const saved = await saveMediaBuffer(normalized.buffer, normalized.contentType ?? "image/png", "browser", DEFAULT_BROWSER_SCREENSHOT_MAX_BYTES);
						return res.json({
							ok: true,
							format: "ai",
							targetId: tab.targetId,
							url: tab.url,
							labels: true,
							labelsCount: labelResult.labels,
							labelsSkipped: labelResult.skipped,
							imagePath: path.resolve(saved.path),
							imageType: normalized.contentType?.includes("jpeg") ? "jpeg" : "png",
							...built
						});
					} finally {
						await clearChromeMcpOverlay({
							profileName: profileCtx.profile.name,
							userDataDir: profileCtx.profile.userDataDir,
							targetId: tab.targetId
						});
					}
				}
				return res.json({
					ok: true,
					format: "ai",
					targetId: tab.targetId,
					url: tab.url,
					...built
				});
			}
			if (plan.format === "ai") {
				const pw = await requirePwAi(res, "ai snapshot");
				if (!pw) return;
				const roleSnapshotArgs = {
					cdpUrl: profileCtx.profile.cdpUrl,
					targetId: tab.targetId,
					selector: plan.selectorValue,
					frameSelector: plan.frameSelectorValue,
					refsMode: plan.refsMode,
					options: {
						interactive: plan.interactive ?? void 0,
						compact: plan.compact ?? void 0,
						maxDepth: plan.depth ?? void 0
					}
				};
				const snap = plan.wantsRoleSnapshot ? await pw.snapshotRoleViaPlaywright(roleSnapshotArgs) : await pw.snapshotAiViaPlaywright({
					cdpUrl: profileCtx.profile.cdpUrl,
					targetId: tab.targetId,
					...typeof plan.resolvedMaxChars === "number" ? { maxChars: plan.resolvedMaxChars } : {}
				}).catch(async (err) => {
					if (String(err).toLowerCase().includes("_snapshotforai")) return await pw.snapshotRoleViaPlaywright(roleSnapshotArgs);
					throw err;
				});
				if (plan.labels) {
					const labeled = await pw.screenshotWithLabelsViaPlaywright({
						cdpUrl: profileCtx.profile.cdpUrl,
						targetId: tab.targetId,
						refs: "refs" in snap ? snap.refs : {},
						type: "png"
					});
					const normalized = await normalizeBrowserScreenshot(labeled.buffer, {
						maxSide: DEFAULT_BROWSER_SCREENSHOT_MAX_SIDE,
						maxBytes: DEFAULT_BROWSER_SCREENSHOT_MAX_BYTES
					});
					await ensureMediaDir();
					const saved = await saveMediaBuffer(normalized.buffer, normalized.contentType ?? "image/png", "browser", DEFAULT_BROWSER_SCREENSHOT_MAX_BYTES);
					const imageType = normalized.contentType?.includes("jpeg") ? "jpeg" : "png";
					return res.json({
						ok: true,
						format: plan.format,
						targetId: tab.targetId,
						url: tab.url,
						labels: true,
						labelsCount: labeled.labels,
						labelsSkipped: labeled.skipped,
						imagePath: path.resolve(saved.path),
						imageType,
						...snap
					});
				}
				return res.json({
					ok: true,
					format: plan.format,
					targetId: tab.targetId,
					url: tab.url,
					...snap
				});
			}
			const snap = shouldUsePlaywrightForAriaSnapshot({
				profile: profileCtx.profile,
				wsUrl: tab.wsUrl
			}) ? requirePwAi(res, "aria snapshot").then(async (pw) => {
				if (!pw) return null;
				return await pw.snapshotAriaViaPlaywright({
					cdpUrl: profileCtx.profile.cdpUrl,
					targetId: tab.targetId,
					limit: plan.limit
				});
			}) : snapshotAria({
				wsUrl: tab.wsUrl ?? "",
				limit: plan.limit
			});
			const resolved = await Promise.resolve(snap);
			if (!resolved) return;
			return res.json({
				ok: true,
				format: plan.format,
				targetId: tab.targetId,
				url: tab.url,
				...resolved
			});
		} catch (err) {
			handleRouteError(ctx, res, err);
		}
	});
}
//#endregion
//#region src/browser/routes/agent.storage.ts
function parseStorageKind(raw) {
	if (raw === "local" || raw === "session") return raw;
	return null;
}
function parseStorageMutationRequest(kindParam, body) {
	return {
		kind: parseStorageKind(toStringOrEmpty(kindParam)),
		targetId: resolveTargetIdFromBody(body)
	};
}
function parseRequiredStorageMutationRequest(kindParam, body) {
	const parsed = parseStorageMutationRequest(kindParam, body);
	if (!parsed.kind) return null;
	return {
		kind: parsed.kind,
		targetId: parsed.targetId
	};
}
function parseStorageMutationOrRespond(res, kindParam, body) {
	const parsed = parseRequiredStorageMutationRequest(kindParam, body);
	if (!parsed) {
		jsonError(res, 400, "kind must be local|session");
		return null;
	}
	return parsed;
}
function parseStorageMutationFromRequest(req, res) {
	const body = readBody(req);
	const parsed = parseStorageMutationOrRespond(res, req.params.kind, body);
	if (!parsed) return null;
	return {
		body,
		parsed
	};
}
function registerBrowserAgentStorageRoutes(app, ctx) {
	app.get("/cookies", async (req, res) => {
		await withPlaywrightRouteContext({
			req,
			res,
			ctx,
			targetId: resolveTargetIdFromQuery(req.query),
			feature: "cookies",
			run: async ({ cdpUrl, tab, pw }) => {
				const result = await pw.cookiesGetViaPlaywright({
					cdpUrl,
					targetId: tab.targetId
				});
				res.json({
					ok: true,
					targetId: tab.targetId,
					...result
				});
			}
		});
	});
	app.post("/cookies/set", async (req, res) => {
		const body = readBody(req);
		const targetId = resolveTargetIdFromBody(body);
		const cookie = body.cookie && typeof body.cookie === "object" && !Array.isArray(body.cookie) ? body.cookie : null;
		if (!cookie) return jsonError(res, 400, "cookie is required");
		await withPlaywrightRouteContext({
			req,
			res,
			ctx,
			targetId,
			feature: "cookies set",
			run: async ({ cdpUrl, tab, pw }) => {
				await pw.cookiesSetViaPlaywright({
					cdpUrl,
					targetId: tab.targetId,
					cookie: {
						name: toStringOrEmpty(cookie.name),
						value: toStringOrEmpty(cookie.value),
						url: toStringOrEmpty(cookie.url) || void 0,
						domain: toStringOrEmpty(cookie.domain) || void 0,
						path: toStringOrEmpty(cookie.path) || void 0,
						expires: toNumber(cookie.expires) ?? void 0,
						httpOnly: toBoolean(cookie.httpOnly) ?? void 0,
						secure: toBoolean(cookie.secure) ?? void 0,
						sameSite: cookie.sameSite === "Lax" || cookie.sameSite === "None" || cookie.sameSite === "Strict" ? cookie.sameSite : void 0
					}
				});
				res.json({
					ok: true,
					targetId: tab.targetId
				});
			}
		});
	});
	app.post("/cookies/clear", async (req, res) => {
		await withPlaywrightRouteContext({
			req,
			res,
			ctx,
			targetId: resolveTargetIdFromBody(readBody(req)),
			feature: "cookies clear",
			run: async ({ cdpUrl, tab, pw }) => {
				await pw.cookiesClearViaPlaywright({
					cdpUrl,
					targetId: tab.targetId
				});
				res.json({
					ok: true,
					targetId: tab.targetId
				});
			}
		});
	});
	app.get("/storage/:kind", async (req, res) => {
		const kind = parseStorageKind(toStringOrEmpty(req.params.kind));
		if (!kind) return jsonError(res, 400, "kind must be local|session");
		const targetId = resolveTargetIdFromQuery(req.query);
		const key = toStringOrEmpty(req.query.key);
		await withPlaywrightRouteContext({
			req,
			res,
			ctx,
			targetId,
			feature: "storage get",
			run: async ({ cdpUrl, tab, pw }) => {
				const result = await pw.storageGetViaPlaywright({
					cdpUrl,
					targetId: tab.targetId,
					kind,
					key: key.trim() || void 0
				});
				res.json({
					ok: true,
					targetId: tab.targetId,
					...result
				});
			}
		});
	});
	app.post("/storage/:kind/set", async (req, res) => {
		const mutation = parseStorageMutationFromRequest(req, res);
		if (!mutation) return;
		const key = toStringOrEmpty(mutation.body.key);
		if (!key) return jsonError(res, 400, "key is required");
		const value = typeof mutation.body.value === "string" ? mutation.body.value : "";
		await withPlaywrightRouteContext({
			req,
			res,
			ctx,
			targetId: mutation.parsed.targetId,
			feature: "storage set",
			run: async ({ cdpUrl, tab, pw }) => {
				await pw.storageSetViaPlaywright({
					cdpUrl,
					targetId: tab.targetId,
					kind: mutation.parsed.kind,
					key,
					value
				});
				res.json({
					ok: true,
					targetId: tab.targetId
				});
			}
		});
	});
	app.post("/storage/:kind/clear", async (req, res) => {
		const mutation = parseStorageMutationFromRequest(req, res);
		if (!mutation) return;
		await withPlaywrightRouteContext({
			req,
			res,
			ctx,
			targetId: mutation.parsed.targetId,
			feature: "storage clear",
			run: async ({ cdpUrl, tab, pw }) => {
				await pw.storageClearViaPlaywright({
					cdpUrl,
					targetId: tab.targetId,
					kind: mutation.parsed.kind
				});
				res.json({
					ok: true,
					targetId: tab.targetId
				});
			}
		});
	});
	app.post("/set/offline", async (req, res) => {
		const body = readBody(req);
		const targetId = resolveTargetIdFromBody(body);
		const offline = toBoolean(body.offline);
		if (offline === void 0) return jsonError(res, 400, "offline is required");
		await withPlaywrightRouteContext({
			req,
			res,
			ctx,
			targetId,
			feature: "offline",
			run: async ({ cdpUrl, tab, pw }) => {
				await pw.setOfflineViaPlaywright({
					cdpUrl,
					targetId: tab.targetId,
					offline
				});
				res.json({
					ok: true,
					targetId: tab.targetId
				});
			}
		});
	});
	app.post("/set/headers", async (req, res) => {
		const body = readBody(req);
		const targetId = resolveTargetIdFromBody(body);
		const headers = body.headers && typeof body.headers === "object" && !Array.isArray(body.headers) ? body.headers : null;
		if (!headers) return jsonError(res, 400, "headers is required");
		const parsed = {};
		for (const [k, v] of Object.entries(headers)) if (typeof v === "string") parsed[k] = v;
		await withPlaywrightRouteContext({
			req,
			res,
			ctx,
			targetId,
			feature: "headers",
			run: async ({ cdpUrl, tab, pw }) => {
				await pw.setExtraHTTPHeadersViaPlaywright({
					cdpUrl,
					targetId: tab.targetId,
					headers: parsed
				});
				res.json({
					ok: true,
					targetId: tab.targetId
				});
			}
		});
	});
	app.post("/set/credentials", async (req, res) => {
		const body = readBody(req);
		const targetId = resolveTargetIdFromBody(body);
		const clear = toBoolean(body.clear) ?? false;
		const username = toStringOrEmpty(body.username) || void 0;
		const password = typeof body.password === "string" ? body.password : void 0;
		await withPlaywrightRouteContext({
			req,
			res,
			ctx,
			targetId,
			feature: "http credentials",
			run: async ({ cdpUrl, tab, pw }) => {
				await pw.setHttpCredentialsViaPlaywright({
					cdpUrl,
					targetId: tab.targetId,
					username,
					password,
					clear
				});
				res.json({
					ok: true,
					targetId: tab.targetId
				});
			}
		});
	});
	app.post("/set/geolocation", async (req, res) => {
		const body = readBody(req);
		const targetId = resolveTargetIdFromBody(body);
		const clear = toBoolean(body.clear) ?? false;
		const latitude = toNumber(body.latitude);
		const longitude = toNumber(body.longitude);
		const accuracy = toNumber(body.accuracy) ?? void 0;
		const origin = toStringOrEmpty(body.origin) || void 0;
		await withPlaywrightRouteContext({
			req,
			res,
			ctx,
			targetId,
			feature: "geolocation",
			run: async ({ cdpUrl, tab, pw }) => {
				await pw.setGeolocationViaPlaywright({
					cdpUrl,
					targetId: tab.targetId,
					latitude,
					longitude,
					accuracy,
					origin,
					clear
				});
				res.json({
					ok: true,
					targetId: tab.targetId
				});
			}
		});
	});
	app.post("/set/media", async (req, res) => {
		const body = readBody(req);
		const targetId = resolveTargetIdFromBody(body);
		const schemeRaw = toStringOrEmpty(body.colorScheme);
		const colorScheme = schemeRaw === "dark" || schemeRaw === "light" || schemeRaw === "no-preference" ? schemeRaw : schemeRaw === "none" ? null : void 0;
		if (colorScheme === void 0) return jsonError(res, 400, "colorScheme must be dark|light|no-preference|none");
		await withPlaywrightRouteContext({
			req,
			res,
			ctx,
			targetId,
			feature: "media emulation",
			run: async ({ cdpUrl, tab, pw }) => {
				await pw.emulateMediaViaPlaywright({
					cdpUrl,
					targetId: tab.targetId,
					colorScheme
				});
				res.json({
					ok: true,
					targetId: tab.targetId
				});
			}
		});
	});
	app.post("/set/timezone", async (req, res) => {
		const body = readBody(req);
		const targetId = resolveTargetIdFromBody(body);
		const timezoneId = toStringOrEmpty(body.timezoneId);
		if (!timezoneId) return jsonError(res, 400, "timezoneId is required");
		await withPlaywrightRouteContext({
			req,
			res,
			ctx,
			targetId,
			feature: "timezone",
			run: async ({ cdpUrl, tab, pw }) => {
				await pw.setTimezoneViaPlaywright({
					cdpUrl,
					targetId: tab.targetId,
					timezoneId
				});
				res.json({
					ok: true,
					targetId: tab.targetId
				});
			}
		});
	});
	app.post("/set/locale", async (req, res) => {
		const body = readBody(req);
		const targetId = resolveTargetIdFromBody(body);
		const locale = toStringOrEmpty(body.locale);
		if (!locale) return jsonError(res, 400, "locale is required");
		await withPlaywrightRouteContext({
			req,
			res,
			ctx,
			targetId,
			feature: "locale",
			run: async ({ cdpUrl, tab, pw }) => {
				await pw.setLocaleViaPlaywright({
					cdpUrl,
					targetId: tab.targetId,
					locale
				});
				res.json({
					ok: true,
					targetId: tab.targetId
				});
			}
		});
	});
	app.post("/set/device", async (req, res) => {
		const body = readBody(req);
		const targetId = resolveTargetIdFromBody(body);
		const name = toStringOrEmpty(body.name);
		if (!name) return jsonError(res, 400, "name is required");
		await withPlaywrightRouteContext({
			req,
			res,
			ctx,
			targetId,
			feature: "device emulation",
			run: async ({ cdpUrl, tab, pw }) => {
				await pw.setDeviceViaPlaywright({
					cdpUrl,
					targetId: tab.targetId,
					name
				});
				res.json({
					ok: true,
					targetId: tab.targetId
				});
			}
		});
	});
}
//#endregion
//#region src/browser/routes/agent.ts
function registerBrowserAgentRoutes(app, ctx) {
	registerBrowserAgentSnapshotRoutes(app, ctx);
	registerBrowserAgentActRoutes(app, ctx);
	registerBrowserAgentDebugRoutes(app, ctx);
	registerBrowserAgentStorageRoutes(app, ctx);
}
//#endregion
//#region src/browser/profiles-service.ts
const HEX_COLOR_RE = /^#[0-9A-Fa-f]{6}$/;
const cdpPortRange = (resolved) => {
	const start = resolved.cdpPortRangeStart;
	const end = resolved.cdpPortRangeEnd;
	if (typeof start === "number" && Number.isFinite(start) && Number.isInteger(start) && typeof end === "number" && Number.isFinite(end) && Number.isInteger(end) && start > 0 && end >= start && end <= 65535) return {
		start,
		end
	};
	return deriveDefaultBrowserCdpPortRange(resolved.controlPort);
};
function createBrowserProfilesService(ctx) {
	const listProfiles = async () => {
		return await ctx.listProfiles();
	};
	const createProfile = async (params) => {
		const name = params.name.trim();
		const rawCdpUrl = params.cdpUrl?.trim() || void 0;
		const rawUserDataDir = params.userDataDir?.trim() || void 0;
		const normalizedUserDataDir = rawUserDataDir ? resolveUserPath(rawUserDataDir) : void 0;
		const driver = params.driver === "existing-session" ? "existing-session" : void 0;
		if (!isValidProfileName(name)) throw new BrowserValidationError("invalid profile name: use lowercase letters, numbers, and hyphens only");
		const state = ctx.state();
		const resolvedProfiles = state.resolved.profiles;
		if (name in resolvedProfiles) throw new BrowserConflictError(`profile "${name}" already exists`);
		const cfg = loadConfig();
		const rawProfiles = cfg.browser?.profiles ?? {};
		if (name in rawProfiles) throw new BrowserConflictError(`profile "${name}" already exists`);
		const usedColors = getUsedColors(resolvedProfiles);
		const profileColor = params.color && HEX_COLOR_RE.test(params.color) ? params.color : allocateColor(usedColors);
		let profileConfig;
		if (normalizedUserDataDir && driver !== "existing-session") throw new BrowserValidationError("driver=existing-session is required when userDataDir is provided");
		if (normalizedUserDataDir && !fs.existsSync(normalizedUserDataDir)) throw new BrowserValidationError(`browser user data directory not found: ${normalizedUserDataDir}`);
		if (rawCdpUrl) {
			let parsed;
			try {
				parsed = parseHttpUrl(rawCdpUrl, "browser.profiles.cdpUrl");
			} catch (err) {
				throw new BrowserValidationError(String(err));
			}
			if (driver === "existing-session") throw new BrowserValidationError("driver=existing-session does not accept cdpUrl; it attaches via the Chrome MCP auto-connect flow");
			profileConfig = {
				cdpUrl: parsed.normalized,
				...driver ? { driver } : {},
				color: profileColor
			};
		} else if (driver === "existing-session") profileConfig = {
			driver,
			attachOnly: true,
			...normalizedUserDataDir ? { userDataDir: normalizedUserDataDir } : {},
			color: profileColor
		};
		else {
			const cdpPort = allocateCdpPort(getUsedPorts(resolvedProfiles), cdpPortRange(state.resolved));
			if (cdpPort === null) throw new BrowserResourceExhaustedError("no available CDP ports in range");
			profileConfig = {
				cdpPort,
				...driver ? { driver } : {},
				color: profileColor
			};
		}
		await writeConfigFile({
			...cfg,
			browser: {
				...cfg.browser,
				profiles: {
					...rawProfiles,
					[name]: profileConfig
				}
			}
		});
		state.resolved.profiles[name] = profileConfig;
		const resolved = resolveProfile(state.resolved, name);
		if (!resolved) throw new BrowserProfileNotFoundError(`profile "${name}" not found after creation`);
		const capabilities = getBrowserProfileCapabilities(resolved);
		return {
			ok: true,
			profile: name,
			transport: capabilities.usesChromeMcp ? "chrome-mcp" : "cdp",
			cdpPort: capabilities.usesChromeMcp ? null : resolved.cdpPort,
			cdpUrl: capabilities.usesChromeMcp ? null : resolved.cdpUrl,
			userDataDir: resolved.userDataDir ?? null,
			color: resolved.color,
			isRemote: !resolved.cdpIsLoopback
		};
	};
	const deleteProfile = async (nameRaw) => {
		const name = nameRaw.trim();
		if (!name) throw new BrowserValidationError("profile name is required");
		if (!isValidProfileName(name)) throw new BrowserValidationError("invalid profile name");
		const state = ctx.state();
		const cfg = loadConfig();
		const profiles = cfg.browser?.profiles ?? {};
		if (name === (cfg.browser?.defaultProfile ?? state.resolved.defaultProfile)) throw new BrowserValidationError(`cannot delete the default profile "${name}"; change browser.defaultProfile first`);
		if (!(name in profiles)) throw new BrowserProfileNotFoundError(`profile "${name}" not found`);
		let deleted = false;
		const resolved = resolveProfile(state.resolved, name);
		if (resolved?.cdpIsLoopback && resolved.driver === "openclaw") {
			try {
				await ctx.forProfile(name).stopRunningBrowser();
			} catch {}
			const userDataDir = resolveOpenClawUserDataDir(name);
			const profileDir = path.dirname(userDataDir);
			if (fs.existsSync(profileDir)) {
				await movePathToTrash(profileDir);
				deleted = true;
			}
		}
		const { [name]: _removed, ...remainingProfiles } = profiles;
		await writeConfigFile({
			...cfg,
			browser: {
				...cfg.browser,
				profiles: remainingProfiles
			}
		});
		delete state.resolved.profiles[name];
		state.profiles.delete(name);
		return {
			ok: true,
			profile: name,
			deleted
		};
	};
	return {
		listProfiles,
		createProfile,
		deleteProfile
	};
}
//#endregion
//#region src/browser/routes/basic.ts
function handleBrowserRouteError(res, err) {
	const mapped = toBrowserErrorResponse(err);
	if (mapped) return jsonError(res, mapped.status, mapped.message);
	jsonError(res, 500, String(err));
}
async function withBasicProfileRoute(params) {
	const profileCtx = resolveProfileContext(params.req, params.res, params.ctx);
	if (!profileCtx) return;
	try {
		await params.run(profileCtx);
	} catch (err) {
		return handleBrowserRouteError(params.res, err);
	}
}
async function withProfilesServiceMutation(params) {
	try {
		const service = createBrowserProfilesService(params.ctx);
		const result = await params.run(service);
		params.res.json(result);
	} catch (err) {
		return handleBrowserRouteError(params.res, err);
	}
}
function registerBrowserBasicRoutes(app, ctx) {
	app.get("/profiles", async (_req, res) => {
		try {
			const profiles = await createBrowserProfilesService(ctx).listProfiles();
			res.json({ profiles });
		} catch (err) {
			jsonError(res, 500, String(err));
		}
	});
	app.get("/", async (req, res) => {
		let current;
		try {
			current = ctx.state();
		} catch {
			return jsonError(res, 503, "browser server not started");
		}
		const profileCtx = getProfileContext(req, ctx);
		if ("error" in profileCtx) return jsonError(res, profileCtx.status, profileCtx.error);
		try {
			const [cdpHttp, cdpReady] = await Promise.all([profileCtx.isHttpReachable(300), profileCtx.isReachable(600)]);
			const profileState = current.profiles.get(profileCtx.profile.name);
			const capabilities = getBrowserProfileCapabilities(profileCtx.profile);
			let detectedBrowser = null;
			let detectedExecutablePath = null;
			let detectError = null;
			try {
				const detected = resolveBrowserExecutableForPlatform(current.resolved, process.platform);
				if (detected) {
					detectedBrowser = detected.kind;
					detectedExecutablePath = detected.path;
				}
			} catch (err) {
				detectError = String(err);
			}
			res.json({
				enabled: current.resolved.enabled,
				profile: profileCtx.profile.name,
				driver: profileCtx.profile.driver,
				transport: capabilities.usesChromeMcp ? "chrome-mcp" : "cdp",
				running: cdpReady,
				cdpReady,
				cdpHttp,
				pid: capabilities.usesChromeMcp ? getChromeMcpPid(profileCtx.profile.name) : profileState?.running?.pid ?? null,
				cdpPort: capabilities.usesChromeMcp ? null : profileCtx.profile.cdpPort,
				cdpUrl: capabilities.usesChromeMcp ? null : profileCtx.profile.cdpUrl,
				chosenBrowser: profileState?.running?.exe.kind ?? null,
				detectedBrowser,
				detectedExecutablePath,
				detectError,
				userDataDir: profileState?.running?.userDataDir ?? profileCtx.profile.userDataDir ?? null,
				color: profileCtx.profile.color,
				headless: current.resolved.headless,
				noSandbox: current.resolved.noSandbox,
				executablePath: current.resolved.executablePath ?? null,
				attachOnly: profileCtx.profile.attachOnly
			});
		} catch (err) {
			const mapped = toBrowserErrorResponse(err);
			if (mapped) return jsonError(res, mapped.status, mapped.message);
			jsonError(res, 500, String(err));
		}
	});
	app.post("/start", async (req, res) => {
		await withBasicProfileRoute({
			req,
			res,
			ctx,
			run: async (profileCtx) => {
				await profileCtx.ensureBrowserAvailable();
				res.json({
					ok: true,
					profile: profileCtx.profile.name
				});
			}
		});
	});
	app.post("/stop", async (req, res) => {
		await withBasicProfileRoute({
			req,
			res,
			ctx,
			run: async (profileCtx) => {
				const result = await profileCtx.stopRunningBrowser();
				res.json({
					ok: true,
					stopped: result.stopped,
					profile: profileCtx.profile.name
				});
			}
		});
	});
	app.post("/reset-profile", async (req, res) => {
		await withBasicProfileRoute({
			req,
			res,
			ctx,
			run: async (profileCtx) => {
				const result = await profileCtx.resetProfile();
				res.json({
					ok: true,
					profile: profileCtx.profile.name,
					...result
				});
			}
		});
	});
	app.post("/profiles/create", async (req, res) => {
		const name = toStringOrEmpty(req.body?.name);
		const color = toStringOrEmpty(req.body?.color);
		const cdpUrl = toStringOrEmpty(req.body?.cdpUrl);
		const userDataDir = toStringOrEmpty(req.body?.userDataDir);
		const driver = toStringOrEmpty(req.body?.driver);
		if (!name) return jsonError(res, 400, "name is required");
		if (driver && driver !== "openclaw" && driver !== "clawd" && driver !== "existing-session") return jsonError(res, 400, `unsupported profile driver "${driver}"; use "openclaw", "clawd", or "existing-session"`);
		await withProfilesServiceMutation({
			res,
			ctx,
			run: async (service) => await service.createProfile({
				name,
				color: color || void 0,
				cdpUrl: cdpUrl || void 0,
				userDataDir: userDataDir || void 0,
				driver: driver === "existing-session" ? "existing-session" : driver === "openclaw" || driver === "clawd" ? "openclaw" : void 0
			})
		});
	});
	app.delete("/profiles/:name", async (req, res) => {
		const name = toStringOrEmpty(req.params.name);
		if (!name) return jsonError(res, 400, "profile name is required");
		await withProfilesServiceMutation({
			res,
			ctx,
			run: async (service) => await service.deleteProfile(name)
		});
	});
}
//#endregion
//#region src/browser/routes/tabs.ts
function resolveTabsProfileContext(req, res, ctx) {
	const profileCtx = getProfileContext(req, ctx);
	if ("error" in profileCtx) {
		jsonError(res, profileCtx.status, profileCtx.error);
		return null;
	}
	return profileCtx;
}
function handleTabsRouteError(ctx, res, err, opts) {
	if (opts?.mapTabError) {
		const mapped = ctx.mapTabError(err);
		if (mapped) return jsonError(res, mapped.status, mapped.message);
	}
	return jsonError(res, 500, String(err));
}
async function withTabsProfileRoute(params) {
	const profileCtx = resolveTabsProfileContext(params.req, params.res, params.ctx);
	if (!profileCtx) return;
	try {
		await params.run(profileCtx);
	} catch (err) {
		handleTabsRouteError(params.ctx, params.res, err, { mapTabError: params.mapTabError });
	}
}
async function ensureBrowserRunning(profileCtx, res) {
	if (!await profileCtx.isReachable(300)) {
		jsonError(res, new BrowserProfileUnavailableError("browser not running").status, "browser not running");
		return false;
	}
	return true;
}
function resolveIndexedTab(tabs, index) {
	return typeof index === "number" ? tabs[index] : tabs.at(0);
}
function parseRequiredTargetId(res, rawTargetId) {
	const targetId = toStringOrEmpty(rawTargetId);
	if (!targetId) {
		jsonError(res, 400, "targetId is required");
		return null;
	}
	return targetId;
}
async function runTabTargetMutation(params) {
	await withTabsProfileRoute({
		req: params.req,
		res: params.res,
		ctx: params.ctx,
		mapTabError: true,
		run: async (profileCtx) => {
			if (!await ensureBrowserRunning(profileCtx, params.res)) return;
			await params.mutate(profileCtx, params.targetId);
			params.res.json({ ok: true });
		}
	});
}
function registerBrowserTabRoutes(app, ctx) {
	app.get("/tabs", async (req, res) => {
		await withTabsProfileRoute({
			req,
			res,
			ctx,
			run: async (profileCtx) => {
				if (!await profileCtx.isReachable(300)) return res.json({
					running: false,
					tabs: []
				});
				const tabs = await profileCtx.listTabs();
				res.json({
					running: true,
					tabs
				});
			}
		});
	});
	app.post("/tabs/open", async (req, res) => {
		const url = toStringOrEmpty(req.body?.url);
		if (!url) return jsonError(res, 400, "url is required");
		await withTabsProfileRoute({
			req,
			res,
			ctx,
			mapTabError: true,
			run: async (profileCtx) => {
				await assertBrowserNavigationAllowed({
					url,
					...withBrowserNavigationPolicy(ctx.state().resolved.ssrfPolicy)
				});
				await profileCtx.ensureBrowserAvailable();
				const tab = await profileCtx.openTab(url);
				res.json(tab);
			}
		});
	});
	app.post("/tabs/focus", async (req, res) => {
		const targetId = parseRequiredTargetId(res, req.body?.targetId);
		if (!targetId) return;
		await runTabTargetMutation({
			req,
			res,
			ctx,
			targetId,
			mutate: async (profileCtx, id) => {
				await profileCtx.focusTab(id);
			}
		});
	});
	app.delete("/tabs/:targetId", async (req, res) => {
		const targetId = parseRequiredTargetId(res, req.params.targetId);
		if (!targetId) return;
		await runTabTargetMutation({
			req,
			res,
			ctx,
			targetId,
			mutate: async (profileCtx, id) => {
				await profileCtx.closeTab(id);
			}
		});
	});
	app.post("/tabs/action", async (req, res) => {
		const action = toStringOrEmpty(req.body?.action);
		const index = toNumber(req.body?.index);
		await withTabsProfileRoute({
			req,
			res,
			ctx,
			mapTabError: true,
			run: async (profileCtx) => {
				if (action === "list") {
					if (!await profileCtx.isReachable(300)) return res.json({
						ok: true,
						tabs: []
					});
					const tabs = await profileCtx.listTabs();
					return res.json({
						ok: true,
						tabs
					});
				}
				if (action === "new") {
					await profileCtx.ensureBrowserAvailable();
					const tab = await profileCtx.openTab("about:blank");
					return res.json({
						ok: true,
						tab
					});
				}
				if (action === "close") {
					const target = resolveIndexedTab(await profileCtx.listTabs(), index);
					if (!target) throw new BrowserTabNotFoundError();
					await profileCtx.closeTab(target.targetId);
					return res.json({
						ok: true,
						targetId: target.targetId
					});
				}
				if (action === "select") {
					if (typeof index !== "number") return jsonError(res, 400, "index is required");
					const target = (await profileCtx.listTabs())[index];
					if (!target) throw new BrowserTabNotFoundError();
					await profileCtx.focusTab(target.targetId);
					return res.json({
						ok: true,
						targetId: target.targetId
					});
				}
				return jsonError(res, 400, "unknown tab action");
			}
		});
	});
}
//#endregion
//#region src/browser/routes/index.ts
function registerBrowserRoutes(app, ctx) {
	registerBrowserBasicRoutes(app, ctx);
	registerBrowserTabRoutes(app, ctx);
	registerBrowserAgentRoutes(app, ctx);
}
//#endregion
export { ensureBrowserControlAuth as $, cleanOldMedia as A, resolveStrictExistingPathsWithinRoot as B, parseBrowserMajorVersion as C, withNoProxyForCdpUrl as D, markPwAiLoaded as E, saveMediaSource as F, normalizeBrowserFormFieldValue as G, getBrowserProfileCapabilities as H, setMediaStoreNetworkDepsForTest as I, assertBrowserNavigationRedirectChainAllowed as J, BrowserTabNotFoundError as K, DEFAULT_TRACE_DIR as L, extractOriginalFilename as M, getMediaDir as N, MEDIA_MAX_BYTES as O, saveMediaBuffer as P, setBridgeAuthForPort as Q, DEFAULT_UPLOAD_DIR as R, getChromeWebSocketUrl as S, resolveGoogleChromeExecutableForPlatform as T, DEFAULT_FILL_FIELD_TYPE as U, matchBrowserUrlPattern as V, normalizeBrowserFormField as W, withBrowserNavigationPolicy as X, assertBrowserNavigationResultAllowed as Y, deleteBridgeAuthForPort as Z, startBrowserControlServiceFromConfig as _, parseRoleRef as a, resolveConfiguredSecretInputWithFallback as at, createBrowserRouteContext as b, appendCdpPath as c, normalizeCdpHttpBaseForJsonEndpoints as d, resolveBrowserControlAuth as et, redactCdpUrl as f, createBrowserControlContext as g, createBrowserRouteDispatcher as h, getRoleSnapshotStats as i, resolveConfiguredSecretInputString as it, ensureMediaDir as j, SaveMediaSourceError as k, fetchJson as l, fetchBrowserJson as m, buildRoleSnapshotFromAiSnapshot as n, mergeGatewayAuthConfig as nt, formatAriaSnapshot as o, resolveRequiredConfiguredSecretRefInputString as ot, withCdpSocket as p, assertBrowserNavigationAllowed as q, buildRoleSnapshotFromAriaSnapshot as r, mergeGatewayTailscaleConfig as rt, normalizeCdpWsUrl as s, registerBrowserRoutes as t, ensureGatewayStartupAuth as tt, getHeadersWithAuth as u, createBrowserRuntimeState as v, readBrowserVersion as w, movePathToTrash as x, stopBrowserRuntime as y, resolveExistingPathsWithinRoot as z };
