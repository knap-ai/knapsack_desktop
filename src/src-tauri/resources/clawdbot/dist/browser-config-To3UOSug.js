import { n as redactSensitiveText } from "./redact-BDinS1q9.js";
import { n as resolvePreferredOpenClawTmpDir } from "./tmp-openclaw-dir-Day5KPIY.js";
import { v as resolveUserPath } from "./utils-CE3P21nG.js";
import { u as resolveGatewayPort } from "./paths-CD8i0MSg.js";
import { r as isLoopbackHost } from "./net-D3XSbNNz.js";
import { a as resolveGatewayAuth } from "./auth-BHAc3x7O.js";
import { n as deriveDefaultBrowserCdpPortRange, r as deriveDefaultBrowserControlPort } from "./port-defaults-CG5Opz3-.js";
import path from "node:path";
const DEFAULT_BROWSER_EVALUATE_ENABLED = true;
const DEFAULT_OPENCLAW_BROWSER_COLOR = "#FF4500";
const DEFAULT_OPENCLAW_BROWSER_PROFILE_NAME = "openclaw";
const DEFAULT_AI_SNAPSHOT_MAX_CHARS = 8e4;
const DEFAULT_FALLBACK_BROWSER_TMP_DIR = "/tmp/openclaw";
const CDP_PORT_RANGE_START = 18800;
function canUseNodeFs() {
	const getBuiltinModule = process.getBuiltinModule;
	if (typeof getBuiltinModule !== "function") return false;
	try {
		return getBuiltinModule("fs") !== void 0;
	} catch {
		return false;
	}
}
const DEFAULT_BROWSER_TMP_DIR = canUseNodeFs() ? resolvePreferredOpenClawTmpDir() : DEFAULT_FALLBACK_BROWSER_TMP_DIR;
const DEFAULT_UPLOAD_DIR = path.join(DEFAULT_BROWSER_TMP_DIR, "uploads");
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
function parseBrowserHttpUrl(raw, label) {
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
function ensureDefaultProfile(profiles, defaultColor, legacyCdpPort, derivedDefaultCdpPort, legacyCdpUrl) {
	const result = { ...profiles };
	if (!result["openclaw"]) result[DEFAULT_OPENCLAW_BROWSER_PROFILE_NAME] = {
		cdpPort: legacyCdpPort ?? derivedDefaultCdpPort ?? CDP_PORT_RANGE_START,
		color: defaultColor,
		...legacyCdpUrl ? { cdpUrl: legacyCdpUrl } : {}
	};
	return result;
}
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
	if (rawCdpUrl) cdpInfo = parseBrowserHttpUrl(rawCdpUrl, "browser.cdpUrl");
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
	if (rawProfileUrl !== "" && cdpPort > 0 && /^wss?:\/\//i.test(rawProfileUrl) && /\/devtools\/browser\//i.test(rawProfileUrl)) {
		cdpHost = new URL(rawProfileUrl).hostname;
		cdpUrl = `${resolved.cdpProtocol}://${cdpHost}:${cdpPort}`;
	} else if (rawProfileUrl) {
		const parsed = parseBrowserHttpUrl(rawProfileUrl, `browser.profiles.${profileName}.cdpUrl`);
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
//#endregion
export { DEFAULT_UPLOAD_DIR as a, resolveBrowserControlAuth as c, DEFAULT_OPENCLAW_BROWSER_PROFILE_NAME as i, resolveProfile as l, DEFAULT_BROWSER_EVALUATE_ENABLED as n, redactCdpUrl as o, DEFAULT_OPENCLAW_BROWSER_COLOR as r, resolveBrowserConfig as s, DEFAULT_AI_SNAPSHOT_MAX_CHARS as t };
