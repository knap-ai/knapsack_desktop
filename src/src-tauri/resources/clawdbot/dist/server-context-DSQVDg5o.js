import { q as resolveGatewayPort } from "./entry.js";
import { n as runExec } from "./exec-B52LZOrO.js";
import { i as loadConfig, r as createConfigIO } from "./config-BJWIHf6x.js";
import { r as isLoopbackHost } from "./ws-D56uQr0E.js";
import { C as DEFAULT_BROWSER_EVALUATE_ENABLED, E as DEFAULT_OPENCLAW_BROWSER_PROFILE_NAME, S as DEFAULT_BROWSER_DEFAULT_PROFILE_NAME, T as DEFAULT_OPENCLAW_BROWSER_ENABLED, _ as ensureChromeExtensionRelayServer, a as resolveOpenClawUserDataDir, d as normalizeCdpWsUrl, h as getHeadersWithAuth, i as launchOpenClawChrome, l as createTargetViaCdp, n as isChromeCdpReady, o as stopOpenClawChrome, p as appendCdpPath, r as isChromeReachable, v as stopChromeExtensionRelayServer, w as DEFAULT_OPENCLAW_BROWSER_COLOR } from "./chrome-Biwk6Xdw.js";
import { n as formatErrorMessage, t as extractErrorCode } from "./errors-C34O4jLW.js";
import path from "node:path";
import os from "node:os";
import fs from "node:fs";

//#region src/config/port-defaults.ts
function isValidPort(port) {
	return Number.isFinite(port) && port > 0 && port <= 65535;
}
function clampPort(port, fallback) {
	return isValidPort(port) ? port : fallback;
}
function derivePort(base, offset, fallback) {
	return clampPort(base + offset, fallback);
}
const DEFAULT_BROWSER_CONTROL_PORT = 18791;
const DEFAULT_BROWSER_CDP_PORT_RANGE_START = 18800;
const DEFAULT_BROWSER_CDP_PORT_RANGE_END = 18899;
function deriveDefaultBrowserControlPort(gatewayPort) {
	return derivePort(gatewayPort, 2, DEFAULT_BROWSER_CONTROL_PORT);
}
function deriveDefaultBrowserCdpPortRange(browserControlPort) {
	const start = derivePort(browserControlPort, 9, DEFAULT_BROWSER_CDP_PORT_RANGE_START);
	const end = clampPort(start + (DEFAULT_BROWSER_CDP_PORT_RANGE_END - DEFAULT_BROWSER_CDP_PORT_RANGE_START), DEFAULT_BROWSER_CDP_PORT_RANGE_END);
	if (end < start) return {
		start,
		end: start
	};
	return {
		start,
		end
	};
}

//#endregion
//#region src/browser/profiles.ts
/**
* CDP port allocation for browser profiles.
*
* Default port range: 18800-18899 (100 profiles max)
* Ports are allocated once at profile creation and persisted in config.
* Multi-instance: callers may pass an explicit range to avoid collisions.
*
* Reserved ports (do not use for CDP):
*   18789 - Gateway WebSocket
*   18790 - Bridge
*   18791 - Browser control server
*   18792-18799 - Reserved for future one-off services (canvas at 18793)
*/
const CDP_PORT_RANGE_START = 18800;
const CDP_PORT_RANGE_END = 18899;
const PROFILE_NAME_REGEX = /^[a-z0-9][a-z0-9-]*$/;
function isValidProfileName(name) {
	if (!name || name.length > 64) return false;
	return PROFILE_NAME_REGEX.test(name);
}
function allocateCdpPort(usedPorts, range) {
	const start = range?.start ?? CDP_PORT_RANGE_START;
	const end = range?.end ?? CDP_PORT_RANGE_END;
	if (!Number.isFinite(start) || !Number.isFinite(end) || start <= 0 || end <= 0) return null;
	if (start > end) return null;
	for (let port = start; port <= end; port++) if (!usedPorts.has(port)) return port;
	return null;
}
function getUsedPorts(profiles) {
	if (!profiles) return /* @__PURE__ */ new Set();
	const used = /* @__PURE__ */ new Set();
	for (const profile of Object.values(profiles)) {
		if (typeof profile.cdpPort === "number") {
			used.add(profile.cdpPort);
			continue;
		}
		const rawUrl = profile.cdpUrl?.trim();
		if (!rawUrl) continue;
		try {
			const parsed = new URL(rawUrl);
			const port = parsed.port && Number.parseInt(parsed.port, 10) > 0 ? Number.parseInt(parsed.port, 10) : parsed.protocol === "https:" ? 443 : 80;
			if (!Number.isNaN(port) && port > 0 && port <= 65535) used.add(port);
		} catch {}
	}
	return used;
}
const PROFILE_COLORS = [
	"#FF4500",
	"#0066CC",
	"#00AA00",
	"#9933FF",
	"#FF6699",
	"#00CCCC",
	"#FF9900",
	"#6666FF",
	"#CC3366",
	"#339966"
];
function allocateColor(usedColors) {
	for (const color of PROFILE_COLORS) if (!usedColors.has(color.toUpperCase())) return color;
	return PROFILE_COLORS[usedColors.size % PROFILE_COLORS.length] ?? PROFILE_COLORS[0];
}
function getUsedColors(profiles) {
	if (!profiles) return /* @__PURE__ */ new Set();
	return new Set(Object.values(profiles).map((p) => p.color.toUpperCase()));
}

//#endregion
//#region src/browser/config.ts
function normalizeHexColor(raw) {
	const value = (raw ?? "").trim();
	if (!value) return DEFAULT_OPENCLAW_BROWSER_COLOR;
	const normalized = value.startsWith("#") ? value : `#${value}`;
	if (!/^#[0-9a-fA-F]{6}$/.test(normalized)) return DEFAULT_OPENCLAW_BROWSER_COLOR;
	return normalized.toUpperCase();
}
function normalizeTimeoutMs(raw, fallback) {
	const value = typeof raw === "number" && Number.isFinite(raw) ? Math.floor(raw) : fallback;
	return value < 0 ? fallback : value;
}
function parseHttpUrl(raw, label) {
	const trimmed = raw.trim();
	const parsed = new URL(trimmed);
	if (parsed.protocol !== "http:" && parsed.protocol !== "https:") throw new Error(`${label} must be http(s), got: ${parsed.protocol.replace(":", "")}`);
	const port = parsed.port && Number.parseInt(parsed.port, 10) > 0 ? Number.parseInt(parsed.port, 10) : parsed.protocol === "https:" ? 443 : 80;
	if (Number.isNaN(port) || port <= 0 || port > 65535) throw new Error(`${label} has invalid port: ${parsed.port}`);
	return {
		parsed,
		port,
		normalized: parsed.toString().replace(/\/$/, "")
	};
}
/**
* Ensure the default "openclaw" profile exists in the profiles map.
* Auto-creates it with the legacy CDP port (from browser.cdpUrl) or first port if missing.
*/
function ensureDefaultProfile(profiles, defaultColor, legacyCdpPort, derivedDefaultCdpPort) {
	const result = { ...profiles };
	if (!result[DEFAULT_OPENCLAW_BROWSER_PROFILE_NAME]) result[DEFAULT_OPENCLAW_BROWSER_PROFILE_NAME] = {
		cdpPort: legacyCdpPort ?? derivedDefaultCdpPort ?? CDP_PORT_RANGE_START,
		color: defaultColor
	};
	return result;
}
/**
* Ensure a built-in "chrome" profile exists for the Chrome extension relay.
*
* Note: this is an OpenClaw browser profile (routing config), not a Chrome user profile.
* It points at the local relay CDP endpoint (controlPort + 1).
*/
function ensureDefaultChromeExtensionProfile(profiles, controlPort) {
	const result = { ...profiles };
	if (result.chrome) return result;
	const relayPort = controlPort + 1;
	if (!Number.isFinite(relayPort) || relayPort <= 0 || relayPort > 65535) return result;
	if (getUsedPorts(result).has(relayPort)) return result;
	result.chrome = {
		driver: "extension",
		cdpUrl: `http://127.0.0.1:${relayPort}`,
		color: "#00AA00"
	};
	return result;
}
function resolveBrowserConfig(cfg, rootConfig) {
	const enabled = cfg?.enabled ?? DEFAULT_OPENCLAW_BROWSER_ENABLED;
	const evaluateEnabled = cfg?.evaluateEnabled ?? DEFAULT_BROWSER_EVALUATE_ENABLED;
	const controlPort = deriveDefaultBrowserControlPort(resolveGatewayPort(rootConfig) ?? DEFAULT_BROWSER_CONTROL_PORT);
	const defaultColor = normalizeHexColor(cfg?.color);
	const remoteCdpTimeoutMs = normalizeTimeoutMs(cfg?.remoteCdpTimeoutMs, 1500);
	const remoteCdpHandshakeTimeoutMs = normalizeTimeoutMs(cfg?.remoteCdpHandshakeTimeoutMs, Math.max(2e3, remoteCdpTimeoutMs * 2));
	const derivedCdpRange = deriveDefaultBrowserCdpPortRange(controlPort);
	const rawCdpUrl = (cfg?.cdpUrl ?? "").trim();
	let cdpInfo;
	if (rawCdpUrl) cdpInfo = parseHttpUrl(rawCdpUrl, "browser.cdpUrl");
	else {
		const derivedPort = controlPort + 1;
		if (derivedPort > 65535) throw new Error(`Derived CDP port (${derivedPort}) is too high; check gateway port configuration.`);
		const derived = new URL(`http://127.0.0.1:${derivedPort}`);
		cdpInfo = {
			parsed: derived,
			port: derivedPort,
			normalized: derived.toString().replace(/\/$/, "")
		};
	}
	const headless = cfg?.headless === true;
	const noSandbox = cfg?.noSandbox === true;
	const attachOnly = cfg?.attachOnly === true;
	const executablePath = cfg?.executablePath?.trim() || void 0;
	const defaultProfileFromConfig = cfg?.defaultProfile?.trim() || void 0;
	const legacyCdpPort = rawCdpUrl ? cdpInfo.port : void 0;
	const profiles = ensureDefaultChromeExtensionProfile(ensureDefaultProfile(cfg?.profiles, defaultColor, legacyCdpPort, derivedCdpRange.start), controlPort);
	const cdpProtocol = cdpInfo.parsed.protocol === "https:" ? "https" : "http";
	const defaultProfile = defaultProfileFromConfig ?? (profiles[DEFAULT_BROWSER_DEFAULT_PROFILE_NAME] ? DEFAULT_BROWSER_DEFAULT_PROFILE_NAME : DEFAULT_OPENCLAW_BROWSER_PROFILE_NAME);
	return {
		enabled,
		evaluateEnabled,
		controlPort,
		cdpProtocol,
		cdpHost: cdpInfo.parsed.hostname,
		cdpIsLoopback: isLoopbackHost(cdpInfo.parsed.hostname),
		remoteCdpTimeoutMs,
		remoteCdpHandshakeTimeoutMs,
		color: defaultColor,
		executablePath,
		headless,
		noSandbox,
		attachOnly,
		defaultProfile,
		profiles
	};
}
/**
* Resolve a profile by name from the config.
* Returns null if the profile doesn't exist.
*/
function resolveProfile(resolved, profileName) {
	const profile = resolved.profiles[profileName];
	if (!profile) return null;
	const rawProfileUrl = profile.cdpUrl?.trim() ?? "";
	let cdpHost = resolved.cdpHost;
	let cdpPort = profile.cdpPort ?? 0;
	let cdpUrl = "";
	const driver = profile.driver === "extension" ? "extension" : "openclaw";
	if (rawProfileUrl) {
		const parsed = parseHttpUrl(rawProfileUrl, `browser.profiles.${profileName}.cdpUrl`);
		cdpHost = parsed.parsed.hostname;
		cdpPort = parsed.port;
		cdpUrl = parsed.normalized;
	} else if (cdpPort) cdpUrl = `${resolved.cdpProtocol}://${resolved.cdpHost}:${cdpPort}`;
	else throw new Error(`Profile "${profileName}" must define cdpPort or cdpUrl.`);
	return {
		name: profileName,
		cdpPort,
		cdpUrl,
		cdpHost,
		cdpIsLoopback: isLoopbackHost(cdpHost),
		color: profile.color,
		driver
	};
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
		return await import("./pw-ai-C_-fZwjh.js");
	} catch (err) {
		if (mode === "soft") return null;
		if (isModuleNotFoundError(err)) return null;
		throw err;
	}
}
async function getPwAiModule(opts) {
	if ((opts?.mode ?? "soft") === "soft") {
		if (!pwAiModuleSoft) pwAiModuleSoft = loadPwAiModule("soft");
		return await pwAiModuleSoft;
	}
	if (!pwAiModuleStrict) pwAiModuleStrict = loadPwAiModule("strict");
	return await pwAiModuleStrict;
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
		if (fs.existsSync(dest)) dest = path.join(trashDir, `${base}-${Date.now()}-${Math.random()}`);
		fs.renameSync(targetPath, dest);
		return dest;
	}
}

//#endregion
//#region src/browser/server-context.ts
function listKnownProfileNames(state) {
	const names = new Set(Object.keys(state.resolved.profiles));
	for (const name of state.profiles.keys()) names.add(name);
	return [...names];
}
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
async function fetchJson(url, timeoutMs = 1500, init) {
	const ctrl = new AbortController();
	const t = setTimeout(ctrl.abort.bind(ctrl), timeoutMs);
	try {
		const headers = getHeadersWithAuth(url, init?.headers || {});
		const res = await fetch(url, {
			...init,
			headers,
			signal: ctrl.signal
		});
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		return await res.json();
	} finally {
		clearTimeout(t);
	}
}
async function fetchOk(url, timeoutMs = 1500, init) {
	const ctrl = new AbortController();
	const t = setTimeout(ctrl.abort.bind(ctrl), timeoutMs);
	try {
		const headers = getHeadersWithAuth(url, init?.headers || {});
		const res = await fetch(url, {
			...init,
			headers,
			signal: ctrl.signal
		});
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
	} finally {
		clearTimeout(t);
	}
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
				lastTargetId: null
			};
			current.profiles.set(profile.name, profileState);
		}
		return profileState;
	};
	const setProfileRunning = (running) => {
		const profileState = getProfileState();
		profileState.running = running;
	};
	const listTabs = async () => {
		if (!profile.cdpIsLoopback) {
			const listPagesViaPlaywright = (await getPwAiModule({ mode: "strict" }))?.listPagesViaPlaywright;
			if (typeof listPagesViaPlaywright === "function") return (await listPagesViaPlaywright({ cdpUrl: profile.cdpUrl })).map((p) => ({
				targetId: p.targetId,
				title: p.title,
				url: p.url,
				type: p.type
			}));
		}
		return (await fetchJson(appendCdpPath(profile.cdpUrl, "/json/list"))).map((t) => ({
			targetId: t.id ?? "",
			title: t.title ?? "",
			url: t.url ?? "",
			wsUrl: normalizeWsUrl(t.webSocketDebuggerUrl, profile.cdpUrl),
			type: t.type
		})).filter((t) => Boolean(t.targetId));
	};
	const openTab = async (url) => {
		if (!profile.cdpIsLoopback) {
			const createPageViaPlaywright = (await getPwAiModule({ mode: "strict" }))?.createPageViaPlaywright;
			if (typeof createPageViaPlaywright === "function") {
				const page = await createPageViaPlaywright({
					cdpUrl: profile.cdpUrl,
					url
				});
				const profileState = getProfileState();
				profileState.lastTargetId = page.targetId;
				return {
					targetId: page.targetId,
					title: page.title,
					url: page.url,
					type: page.type
				};
			}
		}
		const createdViaCdp = await createTargetViaCdp({
			cdpUrl: profile.cdpUrl,
			url
		}).then((r) => r.targetId).catch(() => null);
		if (createdViaCdp) {
			const profileState = getProfileState();
			profileState.lastTargetId = createdViaCdp;
			const deadline = Date.now() + 2e3;
			while (Date.now() < deadline) {
				const found = (await listTabs().catch(() => [])).find((t) => t.targetId === createdViaCdp);
				if (found) return found;
				await new Promise((r) => setTimeout(r, 100));
			}
			return {
				targetId: createdViaCdp,
				title: "",
				url,
				type: "page"
			};
		}
		const encoded = encodeURIComponent(url);
		const endpointUrl = new URL(appendCdpPath(profile.cdpUrl, "/json/new"));
		const endpoint = endpointUrl.search ? (() => {
			endpointUrl.searchParams.set("url", url);
			return endpointUrl.toString();
		})() : `${endpointUrl.toString()}?${encoded}`;
		const created = await fetchJson(endpoint, 1500, { method: "PUT" }).catch(async (err) => {
			if (String(err).includes("HTTP 405")) return await fetchJson(endpoint, 1500);
			throw err;
		});
		if (!created.id) throw new Error("Failed to open tab (missing id)");
		const profileState = getProfileState();
		profileState.lastTargetId = created.id;
		return {
			targetId: created.id,
			title: created.title ?? "",
			url: created.url ?? url,
			wsUrl: normalizeWsUrl(created.webSocketDebuggerUrl, profile.cdpUrl),
			type: created.type
		};
	};
	const resolveRemoteHttpTimeout = (timeoutMs) => {
		if (profile.cdpIsLoopback) return timeoutMs ?? 300;
		const resolved = state().resolved;
		if (typeof timeoutMs === "number" && Number.isFinite(timeoutMs)) return Math.max(Math.floor(timeoutMs), resolved.remoteCdpTimeoutMs);
		return resolved.remoteCdpTimeoutMs;
	};
	const resolveRemoteWsTimeout = (timeoutMs) => {
		if (profile.cdpIsLoopback) {
			const base = timeoutMs ?? 300;
			return Math.max(200, Math.min(2e3, base * 2));
		}
		const resolved = state().resolved;
		if (typeof timeoutMs === "number" && Number.isFinite(timeoutMs)) return Math.max(Math.floor(timeoutMs) * 2, resolved.remoteCdpHandshakeTimeoutMs);
		return resolved.remoteCdpHandshakeTimeoutMs;
	};
	const isReachable = async (timeoutMs) => {
		const httpTimeout = resolveRemoteHttpTimeout(timeoutMs);
		const wsTimeout = resolveRemoteWsTimeout(timeoutMs);
		return await isChromeCdpReady(profile.cdpUrl, httpTimeout, wsTimeout);
	};
	const isHttpReachable = async (timeoutMs) => {
		const httpTimeout = resolveRemoteHttpTimeout(timeoutMs);
		return await isChromeReachable(profile.cdpUrl, httpTimeout);
	};
	const attachRunning = (running) => {
		setProfileRunning(running);
		running.proc.on("exit", () => {
			if (!opts.getState()) return;
			if (getProfileState().running?.pid === running.pid) setProfileRunning(null);
		});
	};
	const ensureBrowserAvailable = async () => {
		const current = state();
		const remoteCdp = !profile.cdpIsLoopback;
		const isExtension = profile.driver === "extension";
		const profileState = getProfileState();
		const httpReachable = await isHttpReachable();
		if (isExtension && remoteCdp) throw new Error(`Profile "${profile.name}" uses driver=extension but cdpUrl is not loopback (${profile.cdpUrl}).`);
		if (isExtension) {
			if (!httpReachable) {
				await ensureChromeExtensionRelayServer({ cdpUrl: profile.cdpUrl });
				if (await isHttpReachable(1200)) {} else throw new Error(`Chrome extension relay for profile "${profile.name}" is not reachable at ${profile.cdpUrl}.`);
			}
			if (await isReachable(600)) return;
			throw new Error(`Chrome extension relay is running, but no tab is connected. Click the OpenClaw Chrome extension icon on a tab to attach it (profile "${profile.name}").`);
		}
		if (!httpReachable) {
			if ((current.resolved.attachOnly || remoteCdp) && opts.onEnsureAttachTarget) {
				await opts.onEnsureAttachTarget(profile);
				if (await isHttpReachable(1200)) return;
			}
			if (current.resolved.attachOnly || remoteCdp) throw new Error(remoteCdp ? `Remote CDP for profile "${profile.name}" is not reachable at ${profile.cdpUrl}.` : `Browser attachOnly is enabled and profile "${profile.name}" is not running.`);
			attachRunning(await launchOpenClawChrome(current.resolved, profile));
			return;
		}
		if (await isReachable()) return;
		if (!profileState.running) throw new Error(`Port ${profile.cdpPort} is in use for profile "${profile.name}" but not by openclaw. Run action=reset-profile profile=${profile.name} to kill the process.`);
		if (current.resolved.attachOnly || remoteCdp) {
			if (opts.onEnsureAttachTarget) {
				await opts.onEnsureAttachTarget(profile);
				if (await isReachable(1200)) return;
			}
			throw new Error(remoteCdp ? `Remote CDP websocket for profile "${profile.name}" is not reachable.` : `Browser attachOnly is enabled and CDP websocket for profile "${profile.name}" is not reachable.`);
		}
		await stopOpenClawChrome(profileState.running);
		setProfileRunning(null);
		attachRunning(await launchOpenClawChrome(current.resolved, profile));
		if (!await isReachable(600)) throw new Error(`Chrome CDP websocket for profile "${profile.name}" is not reachable after restart.`);
	};
	const ensureTabAvailable = async (targetId) => {
		await ensureBrowserAvailable();
		const profileState = getProfileState();
		if ((await listTabs()).length === 0) {
			if (profile.driver === "extension") throw new Error(`tab not found (no attached Chrome tabs for profile "${profile.name}"). Click the OpenClaw Browser Relay toolbar icon on the tab you want to control (badge ON).`);
			await openTab("about:blank");
		}
		const tabs = await listTabs();
		const candidates = profile.driver === "extension" || !profile.cdpIsLoopback ? tabs : tabs.filter((t) => Boolean(t.wsUrl));
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
		let chosen = targetId ? resolveById(targetId) : pickDefault();
		if (!chosen && profile.driver === "extension" && candidates.length === 1) chosen = candidates[0] ?? null;
		if (chosen === "AMBIGUOUS") throw new Error("ambiguous target id prefix");
		if (!chosen) throw new Error("tab not found");
		profileState.lastTargetId = chosen.targetId;
		return chosen;
	};
	const focusTab = async (targetId) => {
		const resolved = resolveTargetIdFromTabs(targetId, await listTabs());
		if (!resolved.ok) {
			if (resolved.reason === "ambiguous") throw new Error("ambiguous target id prefix");
			throw new Error("tab not found");
		}
		if (!profile.cdpIsLoopback) {
			const focusPageByTargetIdViaPlaywright = (await getPwAiModule({ mode: "strict" }))?.focusPageByTargetIdViaPlaywright;
			if (typeof focusPageByTargetIdViaPlaywright === "function") {
				await focusPageByTargetIdViaPlaywright({
					cdpUrl: profile.cdpUrl,
					targetId: resolved.targetId
				});
				const profileState = getProfileState();
				profileState.lastTargetId = resolved.targetId;
				return;
			}
		}
		await fetchOk(appendCdpPath(profile.cdpUrl, `/json/activate/${resolved.targetId}`));
		const profileState = getProfileState();
		profileState.lastTargetId = resolved.targetId;
	};
	const closeTab = async (targetId) => {
		const resolved = resolveTargetIdFromTabs(targetId, await listTabs());
		if (!resolved.ok) {
			if (resolved.reason === "ambiguous") throw new Error("ambiguous target id prefix");
			throw new Error("tab not found");
		}
		if (!profile.cdpIsLoopback) {
			const closePageByTargetIdViaPlaywright = (await getPwAiModule({ mode: "strict" }))?.closePageByTargetIdViaPlaywright;
			if (typeof closePageByTargetIdViaPlaywright === "function") {
				await closePageByTargetIdViaPlaywright({
					cdpUrl: profile.cdpUrl,
					targetId: resolved.targetId
				});
				return;
			}
		}
		await fetchOk(appendCdpPath(profile.cdpUrl, `/json/close/${resolved.targetId}`));
	};
	const stopRunningBrowser = async () => {
		if (profile.driver === "extension") return { stopped: await stopChromeExtensionRelayServer({ cdpUrl: profile.cdpUrl }) };
		const profileState = getProfileState();
		if (!profileState.running) return { stopped: false };
		await stopOpenClawChrome(profileState.running);
		setProfileRunning(null);
		return { stopped: true };
	};
	const resetProfile = async () => {
		if (profile.driver === "extension") {
			await stopChromeExtensionRelayServer({ cdpUrl: profile.cdpUrl }).catch(() => {});
			return {
				moved: false,
				from: profile.cdpUrl
			};
		}
		if (!profile.cdpIsLoopback) throw new Error(`reset-profile is only supported for local profiles (profile "${profile.name}" is remote).`);
		const userDataDir = resolveOpenClawUserDataDir(profile.name);
		const profileState = getProfileState();
		if (await isHttpReachable(300) && !profileState.running) try {
			await (await import("./pw-ai-C_-fZwjh.js")).closePlaywrightBrowserConnection();
		} catch {}
		if (profileState.running) await stopRunningBrowser();
		try {
			await (await import("./pw-ai-C_-fZwjh.js")).closePlaywrightBrowserConnection();
		} catch {}
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
	const applyResolvedConfig = (current, freshResolved) => {
		current.resolved = freshResolved;
		for (const [name, runtime] of current.profiles) {
			const nextProfile = resolveProfile(freshResolved, name);
			if (nextProfile) {
				runtime.profile = nextProfile;
				continue;
			}
			if (!runtime.running) current.profiles.delete(name);
		}
	};
	const refreshResolvedConfig = (current) => {
		if (!refreshConfigFromDisk) return;
		const cfg = loadConfig();
		applyResolvedConfig(current, resolveBrowserConfig(cfg.browser, cfg));
	};
	const refreshResolvedConfigFresh = (current) => {
		if (!refreshConfigFromDisk) return;
		const freshCfg = createConfigIO().loadConfig();
		applyResolvedConfig(current, resolveBrowserConfig(freshCfg.browser, freshCfg));
	};
	const forProfile = (profileName) => {
		const current = state();
		refreshResolvedConfig(current);
		const name = profileName ?? current.resolved.defaultProfile;
		let profile = resolveProfile(current.resolved, name);
		if (!profile) {
			refreshResolvedConfigFresh(current);
			profile = resolveProfile(current.resolved, name);
		}
		if (!profile) {
			const available = Object.keys(current.resolved.profiles).join(", ");
			throw new Error(`Profile "${name}" not found. Available profiles: ${available || "(none)"}`);
		}
		return createProfileContext(opts, profile);
	};
	const listProfiles = async () => {
		const current = state();
		refreshResolvedConfig(current);
		const result = [];
		for (const name of Object.keys(current.resolved.profiles)) {
			const profileState = current.profiles.get(name);
			const profile = resolveProfile(current.resolved, name);
			if (!profile) continue;
			let tabCount = 0;
			let running = false;
			if (profileState?.running) {
				running = true;
				try {
					tabCount = (await createProfileContext(opts, profile).listTabs()).filter((t) => t.type === "page").length;
				} catch {}
			} else try {
				if (await isChromeReachable(profile.cdpUrl, 200)) {
					running = true;
					tabCount = (await createProfileContext(opts, profile).listTabs().catch(() => [])).filter((t) => t.type === "page").length;
				}
			} catch {}
			result.push({
				name,
				cdpPort: profile.cdpPort,
				cdpUrl: profile.cdpUrl,
				color: profile.color,
				running,
				tabCount,
				isDefault: name === current.resolved.defaultProfile,
				isRemote: !profile.cdpIsLoopback
			});
		}
		return result;
	};
	const getDefaultContext = () => forProfile();
	const mapTabError = (err) => {
		const msg = String(err);
		if (msg.includes("ambiguous target id prefix")) return {
			status: 409,
			message: "ambiguous target id prefix"
		};
		if (msg.includes("tab not found")) return {
			status: 404,
			message: msg
		};
		if (msg.includes("not found")) return {
			status: 404,
			message: msg
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
export { parseHttpUrl as a, allocateCdpPort as c, getUsedPorts as d, isValidProfileName as f, getPwAiModule as i, allocateColor as l, listKnownProfileNames as n, resolveBrowserConfig as o, deriveDefaultBrowserCdpPortRange as p, movePathToTrash as r, resolveProfile as s, createBrowserRouteContext as t, getUsedColors as u };