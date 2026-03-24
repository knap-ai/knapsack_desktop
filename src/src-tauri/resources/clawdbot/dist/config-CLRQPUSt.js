import { u as resolveGatewayPort } from "./paths-ViKUYWUK.js";
import { y as resolveUserPath } from "./utils-CS0Ikux6.js";
import { r as isLoopbackHost } from "./net-JAg9zL0G.js";
//#region src/browser/constants.ts
const DEFAULT_OPENCLAW_BROWSER_COLOR = "#FF4500";
const DEFAULT_OPENCLAW_BROWSER_PROFILE_NAME = "openclaw";
const DEFAULT_AI_SNAPSHOT_MAX_CHARS = 8e4;
const DEFAULT_AI_SNAPSHOT_EFFICIENT_MAX_CHARS = 1e4;
//#endregion
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
const PROFILE_NAME_REGEX = /^[a-z0-9][a-z0-9-]*$/;
function isValidProfileName(name) {
	if (!name || name.length > 64) return false;
	return PROFILE_NAME_REGEX.test(name);
}
function allocateCdpPort(usedPorts, range) {
	const start = range?.start ?? 18800;
	const end = range?.end ?? 18899;
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
function resolveCdpPortRangeStart(rawStart, fallbackStart, rangeSpan) {
	const start = typeof rawStart === "number" && Number.isFinite(rawStart) ? Math.floor(rawStart) : fallbackStart;
	if (start < 1 || start > 65535) throw new Error(`browser.cdpPortRangeStart must be between 1 and 65535, got: ${start}`);
	const maxStart = 65535 - rangeSpan;
	if (start > maxStart) throw new Error(`browser.cdpPortRangeStart (${start}) is too high for a ${rangeSpan + 1}-port range; max is ${maxStart}.`);
	return start;
}
function normalizeStringList(raw) {
	if (!Array.isArray(raw) || raw.length === 0) return;
	const values = raw.map((value) => value.trim()).filter((value) => value.length > 0);
	return values.length > 0 ? values : void 0;
}
function resolveBrowserSsrFPolicy(cfg) {
	const allowPrivateNetwork = cfg?.ssrfPolicy?.allowPrivateNetwork;
	const dangerouslyAllowPrivateNetwork = cfg?.ssrfPolicy?.dangerouslyAllowPrivateNetwork;
	const allowedHostnames = normalizeStringList(cfg?.ssrfPolicy?.allowedHostnames);
	const hostnameAllowlist = normalizeStringList(cfg?.ssrfPolicy?.hostnameAllowlist);
	const hasExplicitPrivateSetting = allowPrivateNetwork !== void 0 || dangerouslyAllowPrivateNetwork !== void 0;
	const resolvedAllowPrivateNetwork = dangerouslyAllowPrivateNetwork === true || allowPrivateNetwork === true || !hasExplicitPrivateSetting;
	if (!resolvedAllowPrivateNetwork && !hasExplicitPrivateSetting && !allowedHostnames && !hostnameAllowlist) return;
	return {
		...resolvedAllowPrivateNetwork ? { dangerouslyAllowPrivateNetwork: true } : {},
		...allowedHostnames ? { allowedHostnames } : {},
		...hostnameAllowlist ? { hostnameAllowlist } : {}
	};
}
function parseHttpUrl(raw, label) {
	const trimmed = raw.trim();
	const parsed = new URL(trimmed);
	if (![
		"http:",
		"https:",
		"ws:",
		"wss:"
	].includes(parsed.protocol)) throw new Error(`${label} must be http(s) or ws(s), got: ${parsed.protocol.replace(":", "")}`);
	const isSecure = parsed.protocol === "https:" || parsed.protocol === "wss:";
	const port = parsed.port && Number.parseInt(parsed.port, 10) > 0 ? Number.parseInt(parsed.port, 10) : isSecure ? 443 : 80;
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
function ensureDefaultProfile(profiles, defaultColor, legacyCdpPort, derivedDefaultCdpPort, legacyCdpUrl) {
	const result = { ...profiles };
	if (!result["openclaw"]) result[DEFAULT_OPENCLAW_BROWSER_PROFILE_NAME] = {
		cdpPort: legacyCdpPort ?? derivedDefaultCdpPort ?? 18800,
		color: defaultColor,
		...legacyCdpUrl ? { cdpUrl: legacyCdpUrl } : {}
	};
	return result;
}
/**
* Ensure a built-in "user" profile exists for Chrome's existing-session attach flow.
*/
function ensureDefaultUserBrowserProfile(profiles) {
	const result = { ...profiles };
	if (result.user) return result;
	result.user = {
		driver: "existing-session",
		attachOnly: true,
		color: "#00AA00"
	};
	return result;
}
function resolveBrowserConfig(cfg, rootConfig) {
	const enabled = cfg?.enabled ?? true;
	const evaluateEnabled = cfg?.evaluateEnabled ?? true;
	const controlPort = deriveDefaultBrowserControlPort(resolveGatewayPort(rootConfig) ?? 18791);
	const defaultColor = normalizeHexColor(cfg?.color);
	const remoteCdpTimeoutMs = normalizeTimeoutMs(cfg?.remoteCdpTimeoutMs, 1500);
	const remoteCdpHandshakeTimeoutMs = normalizeTimeoutMs(cfg?.remoteCdpHandshakeTimeoutMs, Math.max(2e3, remoteCdpTimeoutMs * 2));
	const derivedCdpRange = deriveDefaultBrowserCdpPortRange(controlPort);
	const cdpRangeSpan = derivedCdpRange.end - derivedCdpRange.start;
	const cdpPortRangeStart = resolveCdpPortRangeStart(cfg?.cdpPortRangeStart, derivedCdpRange.start, cdpRangeSpan);
	const cdpPortRangeEnd = cdpPortRangeStart + cdpRangeSpan;
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
	const isWsUrl = cdpInfo.parsed.protocol === "ws:" || cdpInfo.parsed.protocol === "wss:";
	const legacyCdpUrl = rawCdpUrl && isWsUrl ? cdpInfo.normalized : void 0;
	const profiles = ensureDefaultUserBrowserProfile(ensureDefaultProfile(cfg?.profiles, defaultColor, legacyCdpPort, cdpPortRangeStart, legacyCdpUrl));
	const cdpProtocol = cdpInfo.parsed.protocol === "https:" ? "https" : "http";
	const defaultProfile = defaultProfileFromConfig ?? (profiles["openclaw"] ? "openclaw" : profiles["openclaw"] ? "openclaw" : "user");
	const extraArgs = Array.isArray(cfg?.extraArgs) ? cfg.extraArgs.filter((a) => typeof a === "string" && a.trim().length > 0) : [];
	const ssrfPolicy = resolveBrowserSsrFPolicy(cfg);
	return {
		enabled,
		evaluateEnabled,
		controlPort,
		cdpPortRangeStart,
		cdpPortRangeEnd,
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
		profiles,
		ssrfPolicy,
		extraArgs
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
	const driver = profile.driver === "existing-session" ? "existing-session" : "openclaw";
	if (driver === "existing-session") return {
		name: profileName,
		cdpPort: 0,
		cdpUrl: "",
		cdpHost: "",
		cdpIsLoopback: true,
		userDataDir: resolveUserPath(profile.userDataDir?.trim() || "") || void 0,
		color: profile.color,
		driver,
		attachOnly: true
	};
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
		driver,
		attachOnly: profile.attachOnly ?? resolved.attachOnly
	};
}
//#endregion
export { allocateColor as a, isValidProfileName as c, DEFAULT_AI_SNAPSHOT_MAX_CHARS as d, DEFAULT_OPENCLAW_BROWSER_COLOR as f, allocateCdpPort as i, deriveDefaultBrowserCdpPortRange as l, resolveBrowserConfig as n, getUsedColors as o, DEFAULT_OPENCLAW_BROWSER_PROFILE_NAME as p, resolveProfile as r, getUsedPorts as s, parseHttpUrl as t, DEFAULT_AI_SNAPSHOT_EFFICIENT_MAX_CHARS as u };
