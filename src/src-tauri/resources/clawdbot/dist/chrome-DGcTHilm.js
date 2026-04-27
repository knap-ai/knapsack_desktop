import { r as redactSensitiveText } from "./redact-Bl2deF7j.js";
import { c as normalizeOptionalString } from "./string-coerce-C1IzJjqi.js";
import { t as CONFIG_DIR } from "./utils-BMRcljdi.js";
import { t as createSubsystemLogger } from "./subsystem-CWI_MDy_.js";
import { a as isLoopbackHost } from "./net-AycWGi8-.js";
import { r as ensurePortAvailable } from "./ports-BNt4VvHz.js";
import { t as normalizeHostname } from "./hostname-yjWB6Bxj.js";
import { d as isPrivateNetworkAllowedByPolicy, g as resolvePinnedHostnameWithPolicy, p as matchesHostnameAllowlist } from "./ssrf-MkDHylX_.js";
import { t as prepareOomScoreAdjustedSpawn } from "./linux-oom-score-oaXNACcA.js";
import "./text-runtime-B1c54bxG.js";
import "./process-runtime-piJTYkFC.js";
import "./browser-security-runtime-BrD1-zTV.js";
import { h as DEFAULT_OPENCLAW_BROWSER_PROFILE_NAME } from "./paths-CR_dD-bq.js";
import { _ as CHROME_BOOTSTRAP_PREFS_TIMEOUT_MS, b as CHROME_STDERR_HINT_MAX_CHARS, c as isWebSocketUrl, f as redactCdpUrl, g as CHROME_BOOTSTRAP_EXIT_TIMEOUT_MS, i as fetchJson, l as normalizeCdpHttpBaseForJsonEndpoints, n as assertCdpEndpointAllowed, p as withCdpSocket, r as fetchCdpChecked, s as isDirectCdpWebSocketEndpoint, t as appendCdpPath, u as openCdpWebSocket, v as CHROME_LAUNCH_READY_WINDOW_MS, x as CHROME_STOP_TIMEOUT_MS } from "./cdp.helpers-2643q7gc.js";
import { t as BrowserCdpEndpointBlockedError } from "./errors-zZtFFUsY.js";
import "./subsystem-CpBPfGE6.js";
import { r as resolveBrowserExecutableForPlatform } from "./chrome.executables-D4vvPgJr.js";
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import os from "node:os";
import { isIP } from "node:net";
//#region extensions/browser/src/browser/navigation-guard.ts
const NETWORK_NAVIGATION_PROTOCOLS = new Set(["http:", "https:"]);
const SAFE_NON_NETWORK_URLS = new Set(["about:blank"]);
function isAllowedNonNetworkNavigationUrl(parsed) {
	return SAFE_NON_NETWORK_URLS.has(parsed.href);
}
function normalizeNavigationUrl(url) {
	return url.trim();
}
var InvalidBrowserNavigationUrlError = class extends Error {
	constructor(message) {
		super(message);
		this.name = "InvalidBrowserNavigationUrlError";
	}
};
function withBrowserNavigationPolicy(ssrfPolicy, opts) {
	return {
		...ssrfPolicy ? { ssrfPolicy } : {},
		...opts?.browserProxyMode && opts.browserProxyMode !== "direct" ? { browserProxyMode: opts.browserProxyMode } : {}
	};
}
function requiresInspectableBrowserNavigationRedirects(ssrfPolicy) {
	return ssrfPolicy?.dangerouslyAllowPrivateNetwork === false;
}
function requiresInspectableBrowserNavigationRedirectsForUrl(url, ssrfPolicy) {
	if (!requiresInspectableBrowserNavigationRedirects(ssrfPolicy)) return false;
	try {
		const parsed = new URL(url);
		return NETWORK_NAVIGATION_PROTOCOLS.has(parsed.protocol);
	} catch {
		return false;
	}
}
function isIpLiteralHostname(hostname) {
	return isIP(normalizeHostname(hostname)) !== 0;
}
function isExplicitlyAllowedBrowserHostname(hostname, ssrfPolicy) {
	const normalizedHostname = normalizeHostname(hostname);
	if ((ssrfPolicy?.allowedHostnames ?? []).some((value) => normalizeHostname(value) === normalizedHostname)) return true;
	const hostnameAllowlist = (ssrfPolicy?.hostnameAllowlist ?? []).map((pattern) => normalizeHostname(pattern)).filter(Boolean);
	return hostnameAllowlist.length > 0 ? matchesHostnameAllowlist(normalizedHostname, hostnameAllowlist) : false;
}
async function assertBrowserNavigationAllowed(opts) {
	const rawUrl = normalizeNavigationUrl(opts.url);
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
	if (opts.browserProxyMode === "explicit-browser-proxy" && !isPrivateNetworkAllowedByPolicy(opts.ssrfPolicy)) throw new InvalidBrowserNavigationUrlError("Navigation blocked: strict browser SSRF policy cannot be enforced while this browser profile is proxy-routed");
	if (opts.ssrfPolicy && opts.ssrfPolicy.dangerouslyAllowPrivateNetwork === false && !isPrivateNetworkAllowedByPolicy(opts.ssrfPolicy) && !isIpLiteralHostname(parsed.hostname) && !isExplicitlyAllowedBrowserHostname(parsed.hostname, opts.ssrfPolicy)) throw new InvalidBrowserNavigationUrlError("Navigation blocked: strict browser SSRF policy requires an IP-literal URL because browser DNS rebinding protections are unavailable for hostname-based navigation");
	await resolvePinnedHostnameWithPolicy(parsed.hostname, {
		lookupFn: opts.lookupFn,
		policy: opts.ssrfPolicy
	});
}
/**
* Best-effort post-navigation guard for final page URLs.
* Only validates network URLs (http/https) and about:blank to avoid false
* positives on browser-internal error pages (e.g. chrome-error://). In strict
* mode this intentionally re-applies the hostname gate after redirects.
*/
async function assertBrowserNavigationResultAllowed(opts) {
	const rawUrl = normalizeNavigationUrl(opts.url);
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
		ssrfPolicy: opts.ssrfPolicy,
		browserProxyMode: opts.browserProxyMode
	});
}
//#endregion
//#region extensions/browser/src/browser/browser-proxy-mode.ts
const PROXY_ROUTING_CHROME_ARGS = new Set([
	"--proxy-auto-detect",
	"--proxy-pac-url",
	"--proxy-server"
]);
const PROXY_CONTROL_CHROME_ARGS = new Set(["--no-proxy-server", ...PROXY_ROUTING_CHROME_ARGS]);
const CHROME_PROXY_ENV_KEYS = [
	"HTTP_PROXY",
	"HTTPS_PROXY",
	"ALL_PROXY",
	"NO_PROXY",
	"http_proxy",
	"https_proxy",
	"all_proxy",
	"no_proxy"
];
function chromeArgName(arg) {
	return arg.trim().split("=", 1)[0]?.toLowerCase() ?? "";
}
function hasChromeProxyControlArg(args) {
	return args.some((arg) => PROXY_CONTROL_CHROME_ARGS.has(chromeArgName(arg)));
}
function hasExplicitChromeProxyRoutingArg(args) {
	return args.some((arg) => PROXY_ROUTING_CHROME_ARGS.has(chromeArgName(arg)));
}
function omitChromeProxyEnv(env) {
	const next = { ...env };
	for (const key of CHROME_PROXY_ENV_KEYS) delete next[key];
	return next;
}
function resolveBrowserNavigationProxyMode(params) {
	if (params.profile.driver === "openclaw" && params.profile.cdpIsLoopback && hasExplicitChromeProxyRoutingArg(params.resolved.extraArgs)) return "explicit-browser-proxy";
	return "direct";
}
//#endregion
//#region extensions/browser/src/browser/cdp.ts
function normalizeCdpWsUrl(wsUrl, cdpUrl) {
	const ws = new URL(wsUrl);
	const cdp = new URL(cdpUrl);
	const isWildcardBind = ws.hostname === "0.0.0.0" || ws.hostname === "[::]";
	if ((isLoopbackHost(ws.hostname) || isWildcardBind) && !isLoopbackHost(cdp.hostname)) {
		ws.hostname = cdp.hostname;
		const cdpPort = cdp.port || (cdp.protocol === "https:" ? "443" : "80");
		/* c8 ignore next 3 */
		if (cdpPort) ws.port = cdpPort;
		ws.protocol = cdp.protocol === "https:" ? "wss:" : "ws:";
	} else if (isLoopbackHost(ws.hostname) && isLoopbackHost(cdp.hostname)) ws.hostname = cdp.hostname;
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
		let savedVp;
		if (opts.fullPage) {
			const metrics = await send("Page.getLayoutMetrics");
			const size = metrics?.cssContentSize ?? metrics?.contentSize;
			const contentWidth = size?.width ?? 0;
			const contentHeight = size?.height ?? 0;
			if (contentWidth > 0 && contentHeight > 0) {
				const v = (await send("Runtime.evaluate", {
					expression: "({ w: window.innerWidth, h: window.innerHeight, dpr: window.devicePixelRatio, sw: screen.width, sh: screen.height })",
					returnByValue: true
				}))?.result?.value;
				const currentW = v?.w ?? 0;
				const currentH = v?.h ?? 0;
				savedVp = {
					w: currentW,
					h: currentH,
					dpr: v?.dpr ?? 1,
					sw: v?.sw ?? currentW,
					sh: v?.sh ?? currentH
				};
				await send("Emulation.setDeviceMetricsOverride", {
					width: Math.ceil(Math.max(currentW, contentWidth)),
					height: Math.ceil(Math.max(currentH, contentHeight)),
					deviceScaleFactor: savedVp.dpr,
					mobile: false,
					screenWidth: savedVp.sw,
					screenHeight: savedVp.sh
				});
			}
		}
		const format = opts.format ?? "png";
		const quality = format === "jpeg" ? Math.max(0, Math.min(100, Math.round(opts.quality ?? 85))) : void 0;
		try {
			const base64 = (await send("Page.captureScreenshot", {
				format,
				...quality !== void 0 ? { quality } : {},
				...opts.fullPage ? { captureBeyondViewport: true } : {}
			}))?.data;
			if (!base64) throw new Error("Screenshot failed: missing data");
			return Buffer.from(base64, "base64");
		} finally {
			if (savedVp) {
				await send("Emulation.clearDeviceMetricsOverride").catch(() => {});
				try {
					const p = (await send("Runtime.evaluate", {
						expression: "({ w: window.innerWidth, h: window.innerHeight, dpr: window.devicePixelRatio })",
						returnByValue: true
					}))?.result?.value;
					if (p?.w !== savedVp.w || p?.h !== savedVp.h || p?.dpr !== savedVp.dpr) await send("Emulation.setDeviceMetricsOverride", {
						width: savedVp.w,
						height: savedVp.h,
						deviceScaleFactor: savedVp.dpr,
						mobile: false,
						screenWidth: savedVp.sw,
						screenHeight: savedVp.sh
					});
				} catch {}
			}
		}
	}, { commandTimeoutMs: opts.timeoutMs });
}
async function createTargetViaCdp(opts) {
	await assertBrowserNavigationAllowed({
		url: opts.url,
		...withBrowserNavigationPolicy(opts.ssrfPolicy)
	});
	let wsUrl;
	if (isDirectCdpWebSocketEndpoint(opts.cdpUrl)) {
		await assertCdpEndpointAllowed(opts.cdpUrl, opts.ssrfPolicy);
		wsUrl = opts.cdpUrl;
	} else {
		const discoveryUrl = isWebSocketUrl(opts.cdpUrl) ? normalizeCdpHttpBaseForJsonEndpoints(opts.cdpUrl) : opts.cdpUrl;
		let version = null;
		try {
			version = await fetchJson(appendCdpPath(discoveryUrl, "/json/version"), 1500, void 0, opts.ssrfPolicy);
		} catch (err) {
			if (!isWebSocketUrl(opts.cdpUrl)) throw err;
		}
		const wsUrlRaw = version?.webSocketDebuggerUrl?.trim() ?? "";
		if (wsUrlRaw) wsUrl = normalizeCdpWsUrl(wsUrlRaw, discoveryUrl);
		else if (isWebSocketUrl(opts.cdpUrl)) wsUrl = opts.cdpUrl;
		else throw new Error("CDP /json/version missing webSocketDebuggerUrl");
		await assertCdpEndpointAllowed(wsUrl, opts.ssrfPolicy);
	}
	return await withCdpSocket(wsUrl, async (send) => {
		const targetId = (await send("Target.createTarget", { url: opts.url }))?.targetId?.trim() ?? "";
		if (!targetId) throw new Error("CDP Target.createTarget returned no targetId");
		return { targetId };
	});
}
const AX_REF_PATTERN = new RegExp(`^ax\\d+$`);
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
		/* c8 ignore next 3 */
		if (!popped) break;
		const { id, depth } = popped;
		const n = byId.get(id);
		/* c8 ignore next 3 */
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
			/* c8 ignore next 3 */
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
//#region extensions/browser/src/infra/ws.ts
function rawDataToString(data) {
	if (typeof data === "string") return data;
	if (Buffer.isBuffer(data)) return data.toString("utf8");
	if (Array.isArray(data)) return Buffer.concat(data).toString("utf8");
	if (ArrayBuffer.isView(data)) return Buffer.from(data.buffer, data.byteOffset, data.byteLength).toString("utf8");
	if (data instanceof ArrayBuffer) return Buffer.from(data).toString("utf8");
	return String(data);
}
//#endregion
//#region extensions/browser/src/browser/chrome.diagnostics.ts
function elapsedSince(startedAt) {
	return Math.max(0, Date.now() - startedAt);
}
function safeChromeCdpErrorMessage(error) {
	return redactSensitiveText((error instanceof Error ? error.message : String(error)) || "unknown error");
}
function failureDiagnostic(params) {
	return {
		ok: false,
		cdpUrl: params.cdpUrl,
		wsUrl: params.wsUrl,
		code: params.code,
		message: redactSensitiveText(params.message),
		elapsedMs: elapsedSince(params.startedAt)
	};
}
async function readChromeVersion(cdpUrl, timeoutMs = 500, ssrfPolicy) {
	const ctrl = new AbortController();
	const t = setTimeout(ctrl.abort.bind(ctrl), timeoutMs);
	try {
		const { response, release } = await fetchCdpChecked(appendCdpPath(cdpUrl, "/json/version"), timeoutMs, { signal: ctrl.signal }, ssrfPolicy);
		try {
			const data = await response.json();
			if (!data || typeof data !== "object") throw new Error("CDP /json/version returned non-object JSON");
			return data;
		} finally {
			await release();
		}
	} finally {
		clearTimeout(t);
	}
}
async function diagnoseCdpHealthCommand(wsUrl, timeoutMs = 800) {
	return await new Promise((resolve) => {
		const ws = openCdpWebSocket(wsUrl, { handshakeTimeoutMs: timeoutMs });
		let settled = false;
		let opened = false;
		const onMessage = (raw) => {
			if (settled) return;
			let parsed = null;
			try {
				parsed = JSON.parse(rawDataToString(raw));
			} catch {
				return;
			}
			if (parsed?.id !== 1) return;
			if (parsed.result && typeof parsed.result === "object") {
				finish({ ok: true });
				return;
			}
			finish({
				ok: false,
				code: "websocket_health_command_failed",
				message: "Browser.getVersion returned no result object"
			});
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
			finish({
				ok: false,
				code: opened ? "websocket_health_command_timeout" : "websocket_handshake_failed",
				message: opened ? `Browser.getVersion did not respond within ${timeoutMs}ms` : `WebSocket handshake did not complete within ${timeoutMs}ms`
			});
		}, Math.max(1, timeoutMs + Math.min(25, timeoutMs)));
		ws.once("open", () => {
			opened = true;
			try {
				ws.send(JSON.stringify({
					id: 1,
					method: "Browser.getVersion"
				}));
			} catch (err) {
				finish({
					ok: false,
					code: "websocket_health_command_failed",
					message: safeChromeCdpErrorMessage(err)
				});
			}
		});
		ws.on("message", onMessage);
		ws.once("error", (err) => {
			finish({
				ok: false,
				code: opened ? "websocket_health_command_failed" : "websocket_handshake_failed",
				message: safeChromeCdpErrorMessage(err)
			});
		});
		ws.once("close", () => {
			finish({
				ok: false,
				code: opened ? "websocket_health_command_failed" : "websocket_handshake_failed",
				message: opened ? "WebSocket closed before Browser.getVersion completed" : "WebSocket closed before handshake completed"
			});
		});
	});
}
function classifyChromeVersionError(error) {
	const message = safeChromeCdpErrorMessage(error);
	if (error instanceof BrowserCdpEndpointBlockedError) return {
		code: "ssrf_blocked",
		message
	};
	if (/^HTTP \d+/.test(message)) return {
		code: "http_status_failed",
		message
	};
	if (error instanceof SyntaxError || message.includes("non-object JSON")) return {
		code: "invalid_json",
		message
	};
	return {
		code: "http_unreachable",
		message
	};
}
function formatChromeCdpDiagnostic(diagnostic) {
	const redactedCdpUrl = redactCdpUrl(diagnostic.cdpUrl) ?? diagnostic.cdpUrl;
	const redactedWsUrl = redactCdpUrl(diagnostic.wsUrl) ?? diagnostic.wsUrl;
	if (diagnostic.ok) {
		const browser = diagnostic.browser ? ` browser=${diagnostic.browser}` : "";
		return `CDP diagnostic: ready after ${diagnostic.elapsedMs}ms; cdp=${redactedCdpUrl}; websocket=${redactedWsUrl}.${browser}`;
	}
	const websocket = redactedWsUrl ? `; websocket=${redactedWsUrl}` : "";
	return `CDP diagnostic: ${diagnostic.code} after ${diagnostic.elapsedMs}ms; cdp=${redactedCdpUrl}${websocket}; ${diagnostic.message}.`;
}
async function diagnoseChromeCdp(cdpUrl, timeoutMs = 500, handshakeTimeoutMs = 800, ssrfPolicy) {
	const startedAt = Date.now();
	try {
		await assertCdpEndpointAllowed(cdpUrl, ssrfPolicy);
	} catch (err) {
		return failureDiagnostic({
			cdpUrl,
			code: "ssrf_blocked",
			message: safeChromeCdpErrorMessage(err),
			startedAt
		});
	}
	if (isWebSocketUrl(cdpUrl)) {
		const health = await diagnoseCdpHealthCommand(cdpUrl, handshakeTimeoutMs);
		if (!health.ok) return failureDiagnostic({
			cdpUrl,
			wsUrl: cdpUrl,
			code: health.code,
			message: health.message,
			startedAt
		});
		return {
			ok: true,
			cdpUrl,
			wsUrl: cdpUrl,
			elapsedMs: elapsedSince(startedAt)
		};
	}
	let version;
	try {
		version = await readChromeVersion(cdpUrl, timeoutMs, ssrfPolicy);
	} catch (err) {
		const classified = classifyChromeVersionError(err);
		return failureDiagnostic({
			cdpUrl,
			code: classified.code,
			message: classified.message,
			startedAt
		});
	}
	const wsUrlRaw = normalizeOptionalString(version.webSocketDebuggerUrl) ?? "";
	if (!wsUrlRaw) return failureDiagnostic({
		cdpUrl,
		code: "missing_websocket_debugger_url",
		message: "CDP /json/version did not include webSocketDebuggerUrl",
		startedAt
	});
	const wsUrl = normalizeCdpWsUrl(wsUrlRaw, cdpUrl);
	try {
		await assertCdpEndpointAllowed(wsUrl, ssrfPolicy);
	} catch (err) {
		return failureDiagnostic({
			cdpUrl,
			wsUrl,
			code: "websocket_ssrf_blocked",
			message: safeChromeCdpErrorMessage(err),
			startedAt
		});
	}
	const health = await diagnoseCdpHealthCommand(wsUrl, handshakeTimeoutMs);
	if (!health.ok) return failureDiagnostic({
		cdpUrl,
		wsUrl,
		code: health.code,
		message: health.message,
		startedAt
	});
	return {
		ok: true,
		cdpUrl,
		wsUrl,
		browser: version.Browser,
		userAgent: version["User-Agent"],
		elapsedMs: elapsedSince(startedAt)
	};
}
//#endregion
//#region extensions/browser/src/browser/chrome.profile-decoration.ts
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
function asRecord(value) {
	return typeof value === "object" && value !== null && !Array.isArray(value) ? value : null;
}
function readNestedRecord(root, key) {
	return asRecord(asRecord(root)?.[key]);
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
	const info = readNestedRecord(readNestedRecord(profile, "info_cache"), "Default");
	const prefs = safeReadJson(preferencesPath);
	const browserTheme = readNestedRecord(prefs?.browser, "theme");
	const autogeneratedTheme = readNestedRecord(prefs?.autogenerated, "theme");
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
//#region extensions/browser/src/browser/chrome.ts
const log = createSubsystemLogger("browser").child("chrome");
const CHROME_SINGLETON_LOCK_PATHS = [
	"SingletonLock",
	"SingletonSocket",
	"SingletonCookie"
];
const CHROME_SINGLETON_IN_USE_PATTERN = /profile appears to be in use by another chromium process/i;
const CHROME_MISSING_DISPLAY_PATTERN = /missing x server|\$DISPLAY/i;
function exists(filePath) {
	try {
		return fs.existsSync(filePath);
	} catch {
		return false;
	}
}
function processExists(pid) {
	if (!Number.isInteger(pid) || pid <= 0) return false;
	try {
		process.kill(pid, 0);
		return true;
	} catch (err) {
		if (err.code === "EPERM") return true;
		return false;
	}
}
function clearChromeSingletonArtifacts(userDataDir) {
	for (const basename of CHROME_SINGLETON_LOCK_PATHS) try {
		fs.rmSync(path.join(userDataDir, basename), { force: true });
	} catch {}
}
function clearStaleChromeSingletonLocks(userDataDir, hostname = os.hostname()) {
	const lockPath = path.join(userDataDir, "SingletonLock");
	let target;
	try {
		target = fs.readlinkSync(lockPath);
	} catch {
		return false;
	}
	const match = /^(?<lockHost>.+)-(?<pid>\d+)$/.exec(target);
	if (!match?.groups) return false;
	const lockHost = normalizeOptionalString(match.groups.lockHost) ?? "";
	const pid = Number.parseInt(match.groups.pid ?? "", 10);
	if (lockHost === hostname && processExists(pid)) return false;
	clearChromeSingletonArtifacts(userDataDir);
	return true;
}
async function waitForChromeProcessExit(proc, timeoutMs) {
	if (proc.exitCode != null || proc.signalCode != null || proc.killed) return;
	await new Promise((resolve) => {
		const timer = setTimeout(() => {
			proc.off("exit", onExit);
			proc.off("close", onExit);
			resolve();
		}, timeoutMs);
		const onExit = () => {
			clearTimeout(timer);
			resolve();
		};
		proc.once("exit", onExit);
		proc.once("close", onExit);
	});
}
async function terminateChromeForRetry(proc, userDataDir) {
	try {
		proc.kill("SIGKILL");
	} catch {}
	await waitForChromeProcessExit(proc, CHROME_BOOTSTRAP_EXIT_TIMEOUT_MS);
	clearStaleChromeSingletonLocks(userDataDir);
}
function chromeLaunchHints(params) {
	const hints = [];
	if (process.platform === "linux" && !params.resolved.noSandbox) hints.push("If running in a container or as root, try setting browser.noSandbox: true.");
	if (CHROME_MISSING_DISPLAY_PATTERN.test(params.stderrOutput) && !params.profile.headless) hints.push("No DISPLAY/X server was detected. Enable browser.headless: true, start Xvfb, or run the Gateway in a desktop session.");
	if (CHROME_SINGLETON_IN_USE_PATTERN.test(params.stderrOutput)) hints.push(`The Chromium profile "${params.profile.name}" is locked. Stop the existing browser or remove stale Singleton* lock files under ~/.openclaw/browser/${params.profile.name}/user-data.`);
	return hints.length > 0 ? `\nHint: ${hints.join("\nHint: ")}` : "";
}
function resolveBrowserExecutable(resolved, profile) {
	return resolveBrowserExecutableForPlatform({
		...resolved,
		executablePath: profile.executablePath ?? resolved.executablePath
	}, process.platform);
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
	if (profile.headless) {
		args.push("--headless=new");
		args.push("--disable-gpu");
	}
	if (resolved.noSandbox) {
		args.push("--no-sandbox");
		args.push("--disable-setuid-sandbox");
	}
	if (process.platform === "linux") args.push("--disable-dev-shm-usage");
	if (!hasChromeProxyControlArg(resolved.extraArgs)) args.push("--no-proxy-server");
	if (resolved.extraArgs.length > 0) args.push(...resolved.extraArgs);
	return args;
}
async function canOpenWebSocket(url, timeoutMs) {
	return new Promise((resolve) => {
		const ws = openCdpWebSocket(url, { handshakeTimeoutMs: timeoutMs });
		let settled = false;
		const finish = (value) => {
			if (settled) return;
			settled = true;
			resolve(value);
		};
		ws.once("open", () => {
			try {
				ws.close();
			} catch {}
			finish(true);
		});
		ws.once("error", () => finish(false));
		ws.once("close", () => finish(false));
	});
}
async function isChromeReachable(cdpUrl, timeoutMs = 500, ssrfPolicy) {
	try {
		await assertCdpEndpointAllowed(cdpUrl, ssrfPolicy);
		if (isDirectCdpWebSocketEndpoint(cdpUrl)) return await canOpenWebSocket(cdpUrl, timeoutMs);
		if (await fetchChromeVersion(isWebSocketUrl(cdpUrl) ? normalizeCdpHttpBaseForJsonEndpoints(cdpUrl) : cdpUrl, timeoutMs, ssrfPolicy)) return true;
		if (isWebSocketUrl(cdpUrl)) return await canOpenWebSocket(cdpUrl, timeoutMs);
		return false;
	} catch {
		return false;
	}
}
async function fetchChromeVersion(cdpUrl, timeoutMs = 500, ssrfPolicy) {
	try {
		return await readChromeVersion(cdpUrl, timeoutMs, ssrfPolicy);
	} catch {
		return null;
	}
}
async function getChromeWebSocketUrl(cdpUrl, timeoutMs = 500, ssrfPolicy) {
	await assertCdpEndpointAllowed(cdpUrl, ssrfPolicy);
	if (isDirectCdpWebSocketEndpoint(cdpUrl)) return cdpUrl;
	const discoveryUrl = isWebSocketUrl(cdpUrl) ? normalizeCdpHttpBaseForJsonEndpoints(cdpUrl) : cdpUrl;
	const wsUrl = normalizeOptionalString((await fetchChromeVersion(discoveryUrl, timeoutMs, ssrfPolicy))?.webSocketDebuggerUrl) ?? "";
	if (!wsUrl) {
		if (isWebSocketUrl(cdpUrl)) return cdpUrl;
		return null;
	}
	const normalizedWsUrl = normalizeCdpWsUrl(wsUrl, discoveryUrl);
	await assertCdpEndpointAllowed(normalizedWsUrl, ssrfPolicy);
	return normalizedWsUrl;
}
async function isChromeCdpReady(cdpUrl, timeoutMs = 500, handshakeTimeoutMs = 800, ssrfPolicy) {
	const diagnostic = await diagnoseChromeCdp(cdpUrl, timeoutMs, handshakeTimeoutMs, ssrfPolicy);
	if (!diagnostic.ok) log.debug(formatChromeCdpDiagnostic(diagnostic));
	return diagnostic.ok;
}
async function launchOpenClawChrome(resolved, profile) {
	if (!profile.cdpIsLoopback) throw new Error(`Profile "${profile.name}" is remote; cannot launch local Chrome.`);
	await ensurePortAvailable(profile.cdpPort);
	const exe = resolveBrowserExecutable(resolved, profile);
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
		const preparedSpawn = prepareOomScoreAdjustedSpawn(exe.path, args, { env: {
			...omitChromeProxyEnv(process.env),
			HOME: os.homedir()
		} });
		return spawn(preparedSpawn.command, preparedSpawn.args, {
			stdio: [
				"ignore",
				"ignore",
				"pipe"
			],
			env: preparedSpawn.env
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
	const launchOnceAndWait = async (allowSingletonRecovery) => {
		const proc = spawnOnce();
		const stderrChunks = [];
		const onStderr = (chunk) => {
			stderrChunks.push(chunk);
		};
		proc.stderr?.on("data", onStderr);
		try {
			const readyDeadline = Date.now() + CHROME_LAUNCH_READY_WINDOW_MS;
			while (Date.now() < readyDeadline) {
				if (await isChromeReachable(profile.cdpUrl)) break;
				await new Promise((r) => setTimeout(r, 200));
			}
			if (!await isChromeReachable(profile.cdpUrl)) {
				const diagnosticText = await diagnoseChromeCdp(profile.cdpUrl).then(formatChromeCdpDiagnostic).catch((err) => `CDP diagnostic failed: ${safeChromeCdpErrorMessage(err)}.`);
				const stderrOutput = normalizeOptionalString(Buffer.concat(stderrChunks).toString("utf8")) ?? "";
				if (allowSingletonRecovery && CHROME_SINGLETON_IN_USE_PATTERN.test(stderrOutput) && clearStaleChromeSingletonLocks(userDataDir)) {
					log.warn(`Removed stale Chromium Singleton* locks for profile "${profile.name}" and retrying launch.`);
					await terminateChromeForRetry(proc, userDataDir);
					return await launchOnceAndWait(false);
				}
				const stderrHint = stderrOutput ? `\nChrome stderr:\n${stderrOutput.slice(0, CHROME_STDERR_HINT_MAX_CHARS)}` : "";
				const launchHints = chromeLaunchHints({
					stderrOutput,
					resolved,
					profile
				});
				try {
					proc.kill("SIGKILL");
				} catch {}
				throw new Error(`Failed to start Chrome CDP on port ${profile.cdpPort} for profile "${profile.name}". ${diagnosticText}${launchHints}${stderrHint}`);
			}
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
		} finally {
			proc.stderr?.off("data", onStderr);
			stderrChunks.length = 0;
		}
	};
	return await launchOnceAndWait(true);
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
		const remainingMs = timeoutMs - (Date.now() - start);
		await new Promise((r) => setTimeout(r, Math.max(1, Math.min(100, remainingMs))));
	}
	try {
		proc.kill("SIGKILL");
	} catch {}
}
//#endregion
export { assertBrowserNavigationAllowed as _, resolveOpenClawUserDataDir as a, requiresInspectableBrowserNavigationRedirectsForUrl as b, formatChromeCdpDiagnostic as c, createTargetViaCdp as d, formatAriaSnapshot as f, InvalidBrowserNavigationUrlError as g, resolveBrowserNavigationProxyMode as h, launchOpenClawChrome as i, AX_REF_PATTERN as l, snapshotAria as m, isChromeCdpReady as n, stopOpenClawChrome as o, normalizeCdpWsUrl as p, isChromeReachable as r, diagnoseChromeCdp as s, getChromeWebSocketUrl as t, captureScreenshot as u, assertBrowserNavigationRedirectChainAllowed as v, withBrowserNavigationPolicy as x, assertBrowserNavigationResultAllowed as y };
