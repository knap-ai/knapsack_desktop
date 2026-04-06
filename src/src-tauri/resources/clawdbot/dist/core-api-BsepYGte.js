import { c as loadConfig } from "./io-DhtVmzAJ.js";
import { r as isLoopbackHost } from "./net-D3XSbNNz.js";
import { t as detectMime } from "./mime-C9472kP8.js";
import { t as withTimeout } from "./with-timeout-Bf86P6C3.js";
import { l as saveMediaBuffer } from "./store-CCBPdtW9.js";
import "./browser-support-BhOCz67v.js";
import { A as resolveBrowserConfig, C as createBrowserRouteContext, et as deleteBridgeAuthForPort, f as redactCdpUrl, g as createBrowserControlContext, h as createBrowserRouteDispatcher, m as fetchBrowserJson, t as registerBrowserRoutes, tt as setBridgeAuthForPort, v as startBrowserControlServiceFromConfig } from "./routes-D3B9A956.js";
import { n as installBrowserCommonMiddleware, t as installBrowserAuthMiddleware } from "./server-middleware-DhP5_y4H.js";
import fs from "node:fs/promises";
import express from "express";
//#region extensions/browser/src/browser/bridge-server.ts
function buildNoVncBootstrapHtml(params) {
	const hash = new URLSearchParams({
		autoconnect: "1",
		resize: "remote"
	});
	if (params.password?.trim()) hash.set("password", params.password);
	const targetUrl = `http://127.0.0.1:${params.noVncPort}/vnc.html#${hash.toString()}`;
	return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="referrer" content="no-referrer" />
  <title>OpenClaw noVNC Observer</title>
</head>
<body>
  <p>Opening sandbox observer...</p>
  <script>
    const target = ${JSON.stringify(targetUrl)};
    window.location.replace(target);
  <\/script>
</body>
</html>`;
}
async function startBrowserBridgeServer(params) {
	const host = params.host ?? "127.0.0.1";
	if (!isLoopbackHost(host)) throw new Error(`bridge server must bind to loopback host (got ${host})`);
	const port = params.port ?? 0;
	const app = express();
	installBrowserCommonMiddleware(app);
	if (params.resolveSandboxNoVncToken) app.get("/sandbox/novnc", (req, res) => {
		res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
		res.setHeader("Pragma", "no-cache");
		res.setHeader("Expires", "0");
		res.setHeader("Referrer-Policy", "no-referrer");
		const rawToken = typeof req.query?.token === "string" ? req.query.token.trim() : "";
		if (!rawToken) {
			res.status(400).send("Missing token");
			return;
		}
		const resolved = params.resolveSandboxNoVncToken?.(rawToken);
		if (!resolved) {
			res.status(404).send("Invalid or expired token");
			return;
		}
		res.type("html").status(200).send(buildNoVncBootstrapHtml(resolved));
	});
	const authToken = params.authToken?.trim() || void 0;
	const authPassword = params.authPassword?.trim() || void 0;
	if (!authToken && !authPassword) throw new Error("bridge server requires auth (authToken/authPassword missing)");
	installBrowserAuthMiddleware(app, {
		token: authToken,
		password: authPassword
	});
	const state = {
		server: null,
		port,
		resolved: params.resolved,
		profiles: /* @__PURE__ */ new Map()
	};
	registerBrowserRoutes(app, createBrowserRouteContext({
		getState: () => state,
		onEnsureAttachTarget: params.onEnsureAttachTarget
	}));
	const server = await new Promise((resolve, reject) => {
		const s = app.listen(port, host, () => resolve(s));
		s.once("error", reject);
	});
	const resolvedPort = server.address()?.port ?? port;
	state.server = server;
	state.port = resolvedPort;
	state.resolved.controlPort = resolvedPort;
	setBridgeAuthForPort(resolvedPort, {
		token: authToken,
		password: authPassword
	});
	return {
		server,
		port: resolvedPort,
		baseUrl: `http://${host}:${resolvedPort}`,
		state
	};
}
async function stopBrowserBridgeServer(server) {
	try {
		const address = server.address();
		if (address?.port) deleteBridgeAuthForPort(address.port);
	} catch {}
	await new Promise((resolve) => {
		server.close(() => resolve());
	});
}
//#endregion
//#region extensions/browser/src/browser/client-actions-url.ts
function buildProfileQuery$1(profile) {
	return profile ? `?profile=${encodeURIComponent(profile)}` : "";
}
function withBaseUrl$1(baseUrl, path) {
	const trimmed = baseUrl?.trim();
	if (!trimmed) return path;
	return `${trimmed.replace(/\/$/, "")}${path}`;
}
//#endregion
//#region extensions/browser/src/browser/client-actions-core.ts
async function browserNavigate(baseUrl, opts) {
	return await fetchBrowserJson(withBaseUrl$1(baseUrl, `/navigate${buildProfileQuery$1(opts.profile)}`), {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			url: opts.url,
			targetId: opts.targetId
		}),
		timeoutMs: 2e4
	});
}
async function browserArmDialog(baseUrl, opts) {
	return await fetchBrowserJson(withBaseUrl$1(baseUrl, `/hooks/dialog${buildProfileQuery$1(opts.profile)}`), {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			accept: opts.accept,
			promptText: opts.promptText,
			targetId: opts.targetId,
			timeoutMs: opts.timeoutMs
		}),
		timeoutMs: 2e4
	});
}
async function browserArmFileChooser(baseUrl, opts) {
	return await fetchBrowserJson(withBaseUrl$1(baseUrl, `/hooks/file-chooser${buildProfileQuery$1(opts.profile)}`), {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			paths: opts.paths,
			ref: opts.ref,
			inputRef: opts.inputRef,
			element: opts.element,
			targetId: opts.targetId,
			timeoutMs: opts.timeoutMs
		}),
		timeoutMs: 2e4
	});
}
async function browserAct(baseUrl, req, opts) {
	return await fetchBrowserJson(withBaseUrl$1(baseUrl, `/act${buildProfileQuery$1(opts?.profile)}`), {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(req),
		timeoutMs: 2e4
	});
}
async function browserScreenshotAction(baseUrl, opts) {
	return await fetchBrowserJson(withBaseUrl$1(baseUrl, `/screenshot${buildProfileQuery$1(opts.profile)}`), {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			targetId: opts.targetId,
			fullPage: opts.fullPage,
			ref: opts.ref,
			element: opts.element,
			type: opts.type
		}),
		timeoutMs: 2e4
	});
}
//#endregion
//#region extensions/browser/src/browser/client-actions-observe.ts
function buildQuerySuffix(params) {
	const query = new URLSearchParams();
	for (const [key, value] of params) {
		if (typeof value === "boolean") {
			query.set(key, String(value));
			continue;
		}
		if (typeof value === "string" && value.length > 0) query.set(key, value);
	}
	const encoded = query.toString();
	return encoded.length > 0 ? `?${encoded}` : "";
}
async function browserConsoleMessages(baseUrl, opts = {}) {
	return await fetchBrowserJson(withBaseUrl$1(baseUrl, `/console${buildQuerySuffix([
		["level", opts.level],
		["targetId", opts.targetId],
		["profile", opts.profile]
	])}`), { timeoutMs: 2e4 });
}
async function browserPdfSave(baseUrl, opts = {}) {
	return await fetchBrowserJson(withBaseUrl$1(baseUrl, `/pdf${buildProfileQuery$1(opts.profile)}`), {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ targetId: opts.targetId }),
		timeoutMs: 2e4
	});
}
//#endregion
//#region extensions/browser/src/browser/client.ts
function buildProfileQuery(profile) {
	return profile ? `?profile=${encodeURIComponent(profile)}` : "";
}
function withBaseUrl(baseUrl, path) {
	const trimmed = baseUrl?.trim();
	if (!trimmed) return path;
	return `${trimmed.replace(/\/$/, "")}${path}`;
}
async function browserStatus(baseUrl, opts) {
	return await fetchBrowserJson(withBaseUrl(baseUrl, `/${buildProfileQuery(opts?.profile)}`), { timeoutMs: 1500 });
}
async function browserProfiles(baseUrl) {
	return (await fetchBrowserJson(withBaseUrl(baseUrl, `/profiles`), { timeoutMs: 3e3 })).profiles ?? [];
}
async function browserStart(baseUrl, opts) {
	await fetchBrowserJson(withBaseUrl(baseUrl, `/start${buildProfileQuery(opts?.profile)}`), {
		method: "POST",
		timeoutMs: 15e3
	});
}
async function browserStop(baseUrl, opts) {
	await fetchBrowserJson(withBaseUrl(baseUrl, `/stop${buildProfileQuery(opts?.profile)}`), {
		method: "POST",
		timeoutMs: 15e3
	});
}
async function browserResetProfile(baseUrl, opts) {
	return await fetchBrowserJson(withBaseUrl(baseUrl, `/reset-profile${buildProfileQuery(opts?.profile)}`), {
		method: "POST",
		timeoutMs: 2e4
	});
}
async function browserCreateProfile(baseUrl, opts) {
	return await fetchBrowserJson(withBaseUrl(baseUrl, `/profiles/create`), {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			name: opts.name,
			color: opts.color,
			cdpUrl: opts.cdpUrl,
			userDataDir: opts.userDataDir,
			driver: opts.driver
		}),
		timeoutMs: 1e4
	});
}
async function browserDeleteProfile(baseUrl, profile) {
	return await fetchBrowserJson(withBaseUrl(baseUrl, `/profiles/${encodeURIComponent(profile)}`), {
		method: "DELETE",
		timeoutMs: 2e4
	});
}
async function browserTabs(baseUrl, opts) {
	return (await fetchBrowserJson(withBaseUrl(baseUrl, `/tabs${buildProfileQuery(opts?.profile)}`), { timeoutMs: 3e3 })).tabs ?? [];
}
async function browserOpenTab(baseUrl, url, opts) {
	return await fetchBrowserJson(withBaseUrl(baseUrl, `/tabs/open${buildProfileQuery(opts?.profile)}`), {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ url }),
		timeoutMs: 15e3
	});
}
async function browserFocusTab(baseUrl, targetId, opts) {
	await fetchBrowserJson(withBaseUrl(baseUrl, `/tabs/focus${buildProfileQuery(opts?.profile)}`), {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ targetId }),
		timeoutMs: 5e3
	});
}
async function browserCloseTab(baseUrl, targetId, opts) {
	const q = buildProfileQuery(opts?.profile);
	await fetchBrowserJson(withBaseUrl(baseUrl, `/tabs/${encodeURIComponent(targetId)}${q}`), {
		method: "DELETE",
		timeoutMs: 5e3
	});
}
async function browserTabAction(baseUrl, opts) {
	return await fetchBrowserJson(withBaseUrl(baseUrl, `/tabs/action${buildProfileQuery(opts.profile)}`), {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			action: opts.action,
			index: opts.index
		}),
		timeoutMs: 1e4
	});
}
async function browserSnapshot(baseUrl, opts) {
	const q = new URLSearchParams();
	if (opts.format) q.set("format", opts.format);
	if (opts.targetId) q.set("targetId", opts.targetId);
	if (typeof opts.limit === "number") q.set("limit", String(opts.limit));
	if (typeof opts.maxChars === "number" && Number.isFinite(opts.maxChars)) q.set("maxChars", String(opts.maxChars));
	if (opts.refs === "aria" || opts.refs === "role") q.set("refs", opts.refs);
	if (typeof opts.interactive === "boolean") q.set("interactive", String(opts.interactive));
	if (typeof opts.compact === "boolean") q.set("compact", String(opts.compact));
	if (typeof opts.depth === "number" && Number.isFinite(opts.depth)) q.set("depth", String(opts.depth));
	if (opts.selector?.trim()) q.set("selector", opts.selector.trim());
	if (opts.frame?.trim()) q.set("frame", opts.frame.trim());
	if (opts.labels === true) q.set("labels", "1");
	if (opts.mode) q.set("mode", opts.mode);
	if (opts.profile) q.set("profile", opts.profile);
	return await fetchBrowserJson(withBaseUrl(baseUrl, `/snapshot?${q.toString()}`), { timeoutMs: 2e4 });
}
//#endregion
//#region extensions/browser/src/node-host/invoke-browser.ts
const BROWSER_PROXY_MAX_FILE_BYTES = 10 * 1024 * 1024;
const DEFAULT_BROWSER_PROXY_TIMEOUT_MS = 2e4;
const BROWSER_PROXY_STATUS_TIMEOUT_MS = 750;
function normalizeProfileAllowlist(raw) {
	return Array.isArray(raw) ? raw.map((entry) => entry.trim()).filter(Boolean) : [];
}
function resolveBrowserProxyConfig() {
	const proxy = loadConfig().nodeHost?.browserProxy;
	const allowProfiles = normalizeProfileAllowlist(proxy?.allowProfiles);
	return {
		enabled: proxy?.enabled !== false,
		allowProfiles
	};
}
let browserControlReady = null;
async function ensureBrowserControlService() {
	if (browserControlReady) return browserControlReady;
	browserControlReady = (async () => {
		const cfg = loadConfig();
		if (!resolveBrowserConfig(cfg.browser, cfg).enabled) throw new Error("browser control disabled");
		if (!await startBrowserControlServiceFromConfig()) throw new Error("browser control disabled");
	})();
	return browserControlReady;
}
function isProfileAllowed(params) {
	const { allowProfiles, profile } = params;
	if (!allowProfiles.length) return true;
	if (!profile) return false;
	return allowProfiles.includes(profile.trim());
}
function collectBrowserProxyPaths(payload) {
	const paths = /* @__PURE__ */ new Set();
	const obj = typeof payload === "object" && payload !== null ? payload : null;
	if (!obj) return [];
	if (typeof obj.path === "string" && obj.path.trim()) paths.add(obj.path.trim());
	if (typeof obj.imagePath === "string" && obj.imagePath.trim()) paths.add(obj.imagePath.trim());
	const download = obj.download;
	if (download && typeof download === "object") {
		const dlPath = download.path;
		if (typeof dlPath === "string" && dlPath.trim()) paths.add(dlPath.trim());
	}
	return [...paths];
}
async function readBrowserProxyFile(filePath) {
	const stat = await fs.stat(filePath).catch(() => null);
	if (!stat || !stat.isFile()) return null;
	if (stat.size > BROWSER_PROXY_MAX_FILE_BYTES) throw new Error(`browser proxy file exceeds ${Math.round(BROWSER_PROXY_MAX_FILE_BYTES / (1024 * 1024))}MB`);
	const buffer = await fs.readFile(filePath);
	const mimeType = await detectMime({
		buffer,
		filePath
	});
	return {
		path: filePath,
		base64: buffer.toString("base64"),
		mimeType
	};
}
function decodeParams(raw) {
	if (!raw) throw new Error("INVALID_REQUEST: paramsJSON required");
	return JSON.parse(raw);
}
function resolveBrowserProxyTimeout(timeoutMs) {
	return typeof timeoutMs === "number" && Number.isFinite(timeoutMs) ? Math.max(1, Math.floor(timeoutMs)) : DEFAULT_BROWSER_PROXY_TIMEOUT_MS;
}
function isBrowserProxyTimeoutError(err) {
	return String(err).includes("browser proxy request timed out");
}
function isWsBackedBrowserProxyPath(path) {
	return path === "/act" || path === "/navigate" || path === "/pdf" || path === "/screenshot" || path === "/snapshot";
}
async function readBrowserProxyStatus(params) {
	const query = params.profile ? { profile: params.profile } : {};
	try {
		const response = await withTimeout((signal) => params.dispatcher.dispatch({
			method: "GET",
			path: "/",
			query,
			signal
		}), BROWSER_PROXY_STATUS_TIMEOUT_MS, "browser proxy status");
		if (response.status >= 400 || !response.body || typeof response.body !== "object") return null;
		const body = response.body;
		return {
			running: body.running,
			transport: body.transport,
			cdpHttp: body.cdpHttp,
			cdpReady: body.cdpReady,
			cdpUrl: body.cdpUrl
		};
	} catch {
		return null;
	}
}
function formatBrowserProxyTimeoutMessage(params) {
	const parts = [`browser proxy timed out for ${params.method} ${params.path} after ${params.timeoutMs}ms`, params.wsBacked ? "ws-backed browser action" : "browser action"];
	if (params.profile) parts.push(`profile=${params.profile}`);
	if (params.status) {
		const statusParts = [
			`running=${String(params.status.running)}`,
			`cdpHttp=${String(params.status.cdpHttp)}`,
			`cdpReady=${String(params.status.cdpReady)}`
		];
		if (typeof params.status.transport === "string" && params.status.transport.trim()) statusParts.push(`transport=${params.status.transport}`);
		if (typeof params.status.cdpUrl === "string" && params.status.cdpUrl.trim()) statusParts.push(`cdpUrl=${redactCdpUrl(params.status.cdpUrl)}`);
		parts.push(`status(${statusParts.join(", ")})`);
	}
	return parts.join("; ");
}
async function runBrowserProxyCommand(paramsJSON) {
	const params = decodeParams(paramsJSON);
	const pathValue = typeof params.path === "string" ? params.path.trim() : "";
	if (!pathValue) throw new Error("INVALID_REQUEST: path required");
	const proxyConfig = resolveBrowserProxyConfig();
	if (!proxyConfig.enabled) throw new Error("UNAVAILABLE: node browser proxy disabled");
	await ensureBrowserControlService();
	const cfg = loadConfig();
	const resolved = resolveBrowserConfig(cfg.browser, cfg);
	const method = typeof params.method === "string" ? params.method.toUpperCase() : "GET";
	const path = normalizeBrowserRequestPath(pathValue);
	const body = params.body;
	const requestedProfile = resolveRequestedBrowserProfile({
		query: params.query,
		body,
		profile: params.profile
	}) ?? "";
	const allowedProfiles = proxyConfig.allowProfiles;
	if (allowedProfiles.length > 0) {
		if (isPersistentBrowserProfileMutation(method, path)) throw new Error("INVALID_REQUEST: browser.proxy cannot mutate persistent browser profiles when allowProfiles is configured");
		if (path !== "/profiles") {
			if (!isProfileAllowed({
				allowProfiles: allowedProfiles,
				profile: requestedProfile || resolved.defaultProfile
			})) throw new Error("INVALID_REQUEST: browser profile not allowed");
		} else if (requestedProfile) {
			if (!isProfileAllowed({
				allowProfiles: allowedProfiles,
				profile: requestedProfile
			})) throw new Error("INVALID_REQUEST: browser profile not allowed");
		}
	}
	const timeoutMs = resolveBrowserProxyTimeout(params.timeoutMs);
	const query = {};
	const rawQuery = params.query ?? {};
	for (const [key, value] of Object.entries(rawQuery)) {
		if (value === void 0 || value === null) continue;
		query[key] = typeof value === "string" ? value : String(value);
	}
	if (requestedProfile) query.profile = requestedProfile;
	const dispatcher = createBrowserRouteDispatcher(createBrowserControlContext());
	let response;
	try {
		response = await withTimeout((signal) => dispatcher.dispatch({
			method: method === "DELETE" ? "DELETE" : method === "POST" ? "POST" : "GET",
			path,
			query,
			body,
			signal
		}), timeoutMs, "browser proxy request");
	} catch (err) {
		if (!isBrowserProxyTimeoutError(err)) throw err;
		const profileForStatus = requestedProfile || resolved.defaultProfile;
		const status = await readBrowserProxyStatus({
			dispatcher,
			profile: path === "/profiles" ? void 0 : profileForStatus
		});
		throw new Error(formatBrowserProxyTimeoutMessage({
			method,
			path,
			profile: path === "/profiles" ? void 0 : profileForStatus || void 0,
			timeoutMs,
			wsBacked: isWsBackedBrowserProxyPath(path),
			status
		}), { cause: err });
	}
	if (response.status >= 400) {
		const message = response.body && typeof response.body === "object" && "error" in response.body ? String(response.body.error) : `HTTP ${response.status}`;
		throw new Error(message);
	}
	const result = response.body;
	if (allowedProfiles.length > 0 && path === "/profiles") {
		const obj = typeof result === "object" && result !== null ? result : {};
		obj.profiles = (Array.isArray(obj.profiles) ? obj.profiles : []).filter((entry) => {
			if (!entry || typeof entry !== "object") return false;
			const name = entry.name;
			return typeof name === "string" && allowedProfiles.includes(name);
		});
	}
	let files;
	const paths = collectBrowserProxyPaths(result);
	if (paths.length > 0) {
		const loaded = await Promise.all(paths.map(async (p) => {
			try {
				const file = await readBrowserProxyFile(p);
				if (!file) throw new Error("file not found");
				return file;
			} catch (err) {
				throw new Error(`browser proxy file read failed for ${p}: ${String(err)}`, { cause: err });
			}
		}));
		if (loaded.length > 0) files = loaded;
	}
	return JSON.stringify(files ? {
		result,
		files
	} : { result });
}
//#endregion
//#region extensions/browser/src/browser/proxy-files.ts
async function persistBrowserProxyFiles(files) {
	if (!files || files.length === 0) return /* @__PURE__ */ new Map();
	const mapping = /* @__PURE__ */ new Map();
	for (const file of files) {
		const saved = await saveMediaBuffer(Buffer.from(file.base64, "base64"), file.mimeType, "browser");
		mapping.set(file.path, saved.path);
	}
	return mapping;
}
function applyBrowserProxyPaths(result, mapping) {
	if (!result || typeof result !== "object") return;
	const obj = result;
	if (typeof obj.path === "string" && mapping.has(obj.path)) obj.path = mapping.get(obj.path);
	if (typeof obj.imagePath === "string" && mapping.has(obj.imagePath)) obj.imagePath = mapping.get(obj.imagePath);
	const download = obj.download;
	if (download && typeof download === "object") {
		const d = download;
		if (typeof d.path === "string" && mapping.has(d.path)) d.path = mapping.get(d.path);
	}
}
//#endregion
//#region extensions/browser/src/browser/request-policy.ts
function normalizeBrowserRequestPath(value) {
	const trimmed = value.trim();
	if (!trimmed) return trimmed;
	const withLeadingSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
	if (withLeadingSlash.length <= 1) return withLeadingSlash;
	return withLeadingSlash.replace(/\/+$/, "");
}
function isPersistentBrowserProfileMutation(method, path) {
	const normalizedPath = normalizeBrowserRequestPath(path);
	if (method === "POST" && (normalizedPath === "/profiles/create" || normalizedPath === "/reset-profile")) return true;
	return method === "DELETE" && /^\/profiles\/[^/]+$/.test(normalizedPath);
}
function resolveRequestedBrowserProfile(params) {
	const queryProfile = typeof params.query?.profile === "string" ? params.query.profile.trim() : void 0;
	if (queryProfile) return queryProfile;
	if (params.body && typeof params.body === "object") {
		const bodyProfile = "profile" in params.body && typeof params.body.profile === "string" ? params.body.profile.trim() : void 0;
		if (bodyProfile) return bodyProfile;
	}
	return (typeof params.profile === "string" ? params.profile.trim() : void 0) || void 0;
}
//#endregion
//#region extensions/browser/src/browser/session-tab-registry.ts
const trackedTabsBySession = /* @__PURE__ */ new Map();
function normalizeSessionKey(raw) {
	return raw.trim().toLowerCase();
}
function normalizeTargetId(raw) {
	return raw.trim();
}
function normalizeProfile(raw) {
	if (!raw) return;
	const trimmed = raw.trim();
	return trimmed ? trimmed.toLowerCase() : void 0;
}
function normalizeBaseUrl(raw) {
	if (!raw) return;
	const trimmed = raw.trim();
	return trimmed ? trimmed : void 0;
}
function toTrackedTabId(params) {
	return `${params.targetId}\u0000${params.baseUrl ?? ""}\u0000${params.profile ?? ""}`;
}
function isIgnorableCloseError(err) {
	const message = String(err).toLowerCase();
	return message.includes("tab not found") || message.includes("target closed") || message.includes("target not found") || message.includes("no such target");
}
function trackSessionBrowserTab(params) {
	const sessionKeyRaw = params.sessionKey?.trim();
	const targetIdRaw = params.targetId?.trim();
	if (!sessionKeyRaw || !targetIdRaw) return;
	const sessionKey = normalizeSessionKey(sessionKeyRaw);
	const tracked = {
		sessionKey,
		targetId: normalizeTargetId(targetIdRaw),
		baseUrl: normalizeBaseUrl(params.baseUrl),
		profile: normalizeProfile(params.profile),
		trackedAt: Date.now()
	};
	const trackedId = toTrackedTabId(tracked);
	let trackedForSession = trackedTabsBySession.get(sessionKey);
	if (!trackedForSession) {
		trackedForSession = /* @__PURE__ */ new Map();
		trackedTabsBySession.set(sessionKey, trackedForSession);
	}
	trackedForSession.set(trackedId, tracked);
}
function untrackSessionBrowserTab(params) {
	const sessionKeyRaw = params.sessionKey?.trim();
	const targetIdRaw = params.targetId?.trim();
	if (!sessionKeyRaw || !targetIdRaw) return;
	const sessionKey = normalizeSessionKey(sessionKeyRaw);
	const trackedForSession = trackedTabsBySession.get(sessionKey);
	if (!trackedForSession) return;
	const trackedId = toTrackedTabId({
		targetId: normalizeTargetId(targetIdRaw),
		baseUrl: normalizeBaseUrl(params.baseUrl),
		profile: normalizeProfile(params.profile)
	});
	trackedForSession.delete(trackedId);
	if (trackedForSession.size === 0) trackedTabsBySession.delete(sessionKey);
}
function takeTrackedTabsForSessionKeys(sessionKeys) {
	const uniqueSessionKeys = /* @__PURE__ */ new Set();
	for (const key of sessionKeys) {
		if (!key?.trim()) continue;
		uniqueSessionKeys.add(normalizeSessionKey(key));
	}
	if (uniqueSessionKeys.size === 0) return [];
	const seenTrackedIds = /* @__PURE__ */ new Set();
	const tabs = [];
	for (const sessionKey of uniqueSessionKeys) {
		const trackedForSession = trackedTabsBySession.get(sessionKey);
		if (!trackedForSession || trackedForSession.size === 0) continue;
		trackedTabsBySession.delete(sessionKey);
		for (const tracked of trackedForSession.values()) {
			const trackedId = toTrackedTabId(tracked);
			if (seenTrackedIds.has(trackedId)) continue;
			seenTrackedIds.add(trackedId);
			tabs.push(tracked);
		}
	}
	return tabs;
}
async function closeTrackedBrowserTabsForSessions(params) {
	const tabs = takeTrackedTabsForSessionKeys(params.sessionKeys);
	if (tabs.length === 0) return 0;
	const closeTab = params.closeTab ?? (async (tab) => {
		await browserCloseTab(tab.baseUrl, tab.targetId, { profile: tab.profile });
	});
	let closed = 0;
	for (const tab of tabs) try {
		await closeTab({
			targetId: tab.targetId,
			baseUrl: tab.baseUrl,
			profile: tab.profile
		});
		closed += 1;
	} catch (err) {
		if (!isIgnorableCloseError(err)) params.onWarn?.(`failed to close tracked browser tab ${tab.targetId}: ${String(err)}`);
	}
	return closed;
}
//#endregion
export { startBrowserBridgeServer as A, browserConsoleMessages as C, browserArmFileChooser as D, browserArmDialog as E, browserNavigate as O, browserTabs as S, browserAct as T, browserSnapshot as _, normalizeBrowserRequestPath as a, browserStop as b, persistBrowserProxyFiles as c, browserCreateProfile as d, browserDeleteProfile as f, browserResetProfile as g, browserProfiles as h, isPersistentBrowserProfileMutation as i, stopBrowserBridgeServer as j, browserScreenshotAction as k, runBrowserProxyCommand as l, browserOpenTab as m, trackSessionBrowserTab as n, resolveRequestedBrowserProfile as o, browserFocusTab as p, untrackSessionBrowserTab as r, applyBrowserProxyPaths as s, closeTrackedBrowserTabsForSessions as t, browserCloseTab as u, browserStart as v, browserPdfSave as w, browserTabAction as x, browserStatus as y };
