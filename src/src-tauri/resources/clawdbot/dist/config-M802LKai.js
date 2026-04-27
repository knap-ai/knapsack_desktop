import { c as normalizeOptionalString } from "./string-coerce-C1IzJjqi.js";
import { m as resolveUserPath } from "./utils-BMRcljdi.js";
import { u as resolveGatewayPort } from "./paths-BG0ad0P6.js";
import { a as isLoopbackHost } from "./net-AycWGi8-.js";
import { a as normalizeOptionalTrimmedStringList } from "./string-normalization-Bvcn03I9.js";
import { n as deriveDefaultBrowserCdpPortRange, r as deriveDefaultBrowserControlPort } from "./port-defaults-Cqg2lup0.js";
import "./text-runtime-B1c54bxG.js";
import "./browser-config-support-7Tw_KuVs.js";
import "./control-auth-B88kj1mG.js";
import { h as DEFAULT_OPENCLAW_BROWSER_PROFILE_NAME, l as DEFAULT_BROWSER_ACTION_TIMEOUT_MS, p as DEFAULT_OPENCLAW_BROWSER_COLOR } from "./paths-CR_dD-bq.js";
import { d as parseBrowserHttpUrl } from "./cdp.helpers-2643q7gc.js";
import path from "node:path";
import os from "node:os";
//#region extensions/browser/src/browser/config.ts
const DEFAULT_BROWSER_CDP_PORT_RANGE_START = 18800;
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
function normalizeNonNegativeInteger(raw, fallback) {
	const value = typeof raw === "number" && Number.isFinite(raw) ? Math.floor(raw) : fallback;
	return value < 0 ? fallback : value;
}
function normalizePositiveInteger(raw, fallback) {
	const value = typeof raw === "number" && Number.isFinite(raw) ? Math.floor(raw) : fallback;
	return value <= 0 ? fallback : value;
}
function normalizeExecutablePath(raw) {
	const value = normalizeOptionalString(raw);
	if (!value) return;
	if (!/^~(?=$|[\\/])/.test(value)) return value;
	return path.resolve(value.replace(/^~(?=$|[\\/])/, os.homedir()));
}
function resolveBrowserTabCleanupConfig(cfg) {
	const raw = cfg?.tabCleanup;
	return {
		enabled: raw?.enabled ?? true,
		idleMinutes: normalizeNonNegativeInteger(raw?.idleMinutes, 120),
		maxTabsPerSession: normalizeNonNegativeInteger(raw?.maxTabsPerSession, 8),
		sweepMinutes: normalizePositiveInteger(raw?.sweepMinutes, 5)
	};
}
function resolveCdpPortRangeStart(rawStart, fallbackStart, rangeSpan) {
	const start = typeof rawStart === "number" && Number.isFinite(rawStart) ? Math.floor(rawStart) : fallbackStart;
	if (start < 1 || start > 65535) throw new Error(`browser.cdpPortRangeStart must be between 1 and 65535, got: ${start}`);
	const maxStart = 65535 - rangeSpan;
	if (start > maxStart) throw new Error(`browser.cdpPortRangeStart (${start}) is too high for a ${rangeSpan + 1}-port range; max is ${maxStart}.`);
	return start;
}
const normalizeStringList = normalizeOptionalTrimmedStringList;
function resolveBrowserSsrFPolicy(cfg) {
	const rawPolicy = cfg?.ssrfPolicy;
	const allowPrivateNetwork = rawPolicy?.allowPrivateNetwork;
	const dangerouslyAllowPrivateNetwork = rawPolicy?.dangerouslyAllowPrivateNetwork;
	const allowedHostnames = normalizeStringList(rawPolicy?.allowedHostnames);
	const hostnameAllowlist = normalizeStringList(rawPolicy?.hostnameAllowlist);
	const hasExplicitPrivateSetting = allowPrivateNetwork !== void 0 || dangerouslyAllowPrivateNetwork !== void 0;
	const resolvedAllowPrivateNetwork = dangerouslyAllowPrivateNetwork === true || allowPrivateNetwork === true;
	if (!resolvedAllowPrivateNetwork && !hasExplicitPrivateSetting && !allowedHostnames && !hostnameAllowlist) return {};
	return {
		...resolvedAllowPrivateNetwork || dangerouslyAllowPrivateNetwork === false || allowPrivateNetwork === false ? { dangerouslyAllowPrivateNetwork: resolvedAllowPrivateNetwork } : {},
		...allowedHostnames ? { allowedHostnames } : {},
		...hostnameAllowlist ? { hostnameAllowlist } : {}
	};
}
function ensureDefaultProfile(profiles, defaultColor, legacyCdpPort, derivedDefaultCdpPort, legacyCdpUrl) {
	const result = { ...profiles };
	if (!result["openclaw"]) result[DEFAULT_OPENCLAW_BROWSER_PROFILE_NAME] = {
		cdpPort: legacyCdpPort ?? derivedDefaultCdpPort ?? DEFAULT_BROWSER_CDP_PORT_RANGE_START,
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
	const actionTimeoutMs = normalizeTimeoutMs(cfg?.actionTimeoutMs, DEFAULT_BROWSER_ACTION_TIMEOUT_MS);
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
	const executablePath = normalizeExecutablePath(cfg?.executablePath);
	const defaultProfileFromConfig = normalizeOptionalString(cfg?.defaultProfile);
	const legacyCdpPort = rawCdpUrl ? cdpInfo.port : void 0;
	const isWsUrl = cdpInfo.parsed.protocol === "ws:" || cdpInfo.parsed.protocol === "wss:";
	const legacyCdpUrl = rawCdpUrl && isWsUrl ? cdpInfo.normalized : void 0;
	const profiles = ensureDefaultUserBrowserProfile(ensureDefaultProfile(cfg?.profiles, defaultColor, legacyCdpPort, cdpPortRangeStart, legacyCdpUrl));
	const cdpProtocol = cdpInfo.parsed.protocol === "https:" ? "https" : "http";
	const defaultProfile = defaultProfileFromConfig ?? (profiles["openclaw"] ? "openclaw" : profiles["openclaw"] ? "openclaw" : "user");
	const extraArgs = Array.isArray(cfg?.extraArgs) ? cfg.extraArgs.filter((value) => typeof value === "string" && value.trim().length > 0) : [];
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
		actionTimeoutMs,
		color: defaultColor,
		executablePath,
		headless,
		noSandbox,
		attachOnly,
		defaultProfile,
		profiles,
		tabCleanup: resolveBrowserTabCleanupConfig(cfg),
		ssrfPolicy: resolveBrowserSsrFPolicy(cfg),
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
	const headless = profile.headless ?? resolved.headless;
	const executablePath = normalizeExecutablePath(profile.executablePath) ?? resolved.executablePath;
	if (driver === "existing-session") return {
		name: profileName,
		cdpPort: 0,
		cdpUrl: "",
		cdpHost: "",
		cdpIsLoopback: true,
		userDataDir: resolveUserPath(profile.userDataDir?.trim() || "") || void 0,
		color: profile.color,
		driver,
		executablePath,
		headless,
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
		executablePath,
		headless,
		attachOnly: profile.attachOnly ?? resolved.attachOnly
	};
}
//#endregion
export { resolveProfile as n, resolveBrowserConfig as t };
