import { d as resolveGatewaySystemdServiceName, f as resolveGatewayWindowsTaskName, l as resolveGatewayLaunchAgentLabel, n as GATEWAY_SERVICE_KIND, r as GATEWAY_SERVICE_MARKER } from "./constants-BnUiPMIW.js";
import { c as getMinimalServicePathPartsFromEnv, l as isSystemNodePath, m as resolveSystemNodePath, u as isVersionManagedNodePath } from "./daemon-runtime-CPrv-rEf.js";
import { s as resolveLaunchAgentPlistPath } from "./service-q_Baxtp9.js";
import { o as resolveSystemdUserUnitPath } from "./systemd-BmDw_juR.js";
import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";
import fs from "node:fs/promises";

//#region src/daemon/inspect.ts
const EXTRA_MARKERS = [
	"openclaw",
	"clawdbot",
	"moltbot"
];
const execFileAsync = promisify(execFile);
function renderGatewayServiceCleanupHints(env = process.env) {
	const profile = env.OPENCLAW_PROFILE;
	switch (process.platform) {
		case "darwin": {
			const label = resolveGatewayLaunchAgentLabel(profile);
			return [`launchctl bootout gui/$UID/${label}`, `rm ~/Library/LaunchAgents/${label}.plist`];
		}
		case "linux": {
			const unit = resolveGatewaySystemdServiceName(profile);
			return [`systemctl --user disable --now ${unit}.service`, `rm ~/.config/systemd/user/${unit}.service`];
		}
		case "win32": return [`schtasks /Delete /TN "${resolveGatewayWindowsTaskName(profile)}" /F`];
		default: return [];
	}
}
function resolveHomeDir(env) {
	const home = env.HOME?.trim() || env.USERPROFILE?.trim();
	if (!home) throw new Error("Missing HOME");
	return home;
}
function detectMarker(content) {
	const lower = content.toLowerCase();
	for (const marker of EXTRA_MARKERS) if (lower.includes(marker)) return marker;
	return null;
}
function hasGatewayServiceMarker(content) {
	const lower = content.toLowerCase();
	const markerKeys = ["openclaw_service_marker"];
	const kindKeys = ["openclaw_service_kind"];
	const markerValues = [GATEWAY_SERVICE_MARKER.toLowerCase()];
	const hasMarkerKey = markerKeys.some((key) => lower.includes(key));
	const hasKindKey = kindKeys.some((key) => lower.includes(key));
	const hasMarkerValue = markerValues.some((value) => lower.includes(value));
	return hasMarkerKey && hasKindKey && hasMarkerValue && lower.includes(GATEWAY_SERVICE_KIND.toLowerCase());
}
function isOpenClawGatewayLaunchdService(label, contents) {
	if (hasGatewayServiceMarker(contents)) return true;
	if (!contents.toLowerCase().includes("gateway")) return false;
	return label.startsWith("ai.openclaw.");
}
function isOpenClawGatewaySystemdService(name, contents) {
	if (hasGatewayServiceMarker(contents)) return true;
	if (!name.startsWith("openclaw-gateway")) return false;
	return contents.toLowerCase().includes("gateway");
}
function isOpenClawGatewayTaskName(name) {
	const normalized = name.trim().toLowerCase();
	if (!normalized) return false;
	return normalized === resolveGatewayWindowsTaskName().toLowerCase() || normalized.startsWith("openclaw gateway");
}
function tryExtractPlistLabel(contents) {
	const match = contents.match(/<key>Label<\/key>\s*<string>([\s\S]*?)<\/string>/i);
	if (!match) return null;
	return match[1]?.trim() || null;
}
function isIgnoredLaunchdLabel(label) {
	return label === resolveGatewayLaunchAgentLabel();
}
function isIgnoredSystemdName(name) {
	return name === resolveGatewaySystemdServiceName();
}
function isLegacyLabel(label) {
	const lower = label.toLowerCase();
	return lower.includes("clawdbot") || lower.includes("moltbot");
}
async function scanLaunchdDir(params) {
	const results = [];
	let entries = [];
	try {
		entries = await fs.readdir(params.dir);
	} catch {
		return results;
	}
	for (const entry of entries) {
		if (!entry.endsWith(".plist")) continue;
		const labelFromName = entry.replace(/\.plist$/, "");
		if (isIgnoredLaunchdLabel(labelFromName)) continue;
		const fullPath = path.join(params.dir, entry);
		let contents = "";
		try {
			contents = await fs.readFile(fullPath, "utf8");
		} catch {
			continue;
		}
		const marker = detectMarker(contents);
		const label = tryExtractPlistLabel(contents) ?? labelFromName;
		if (!marker) {
			if (!(isLegacyLabel(labelFromName) || isLegacyLabel(label))) continue;
			results.push({
				platform: "darwin",
				label,
				detail: `plist: ${fullPath}`,
				scope: params.scope,
				marker: isLegacyLabel(label) ? "clawdbot" : "moltbot",
				legacy: true
			});
			continue;
		}
		if (isIgnoredLaunchdLabel(label)) continue;
		if (marker === "openclaw" && isOpenClawGatewayLaunchdService(label, contents)) continue;
		results.push({
			platform: "darwin",
			label,
			detail: `plist: ${fullPath}`,
			scope: params.scope,
			marker,
			legacy: marker !== "openclaw" || isLegacyLabel(label)
		});
	}
	return results;
}
async function scanSystemdDir(params) {
	const results = [];
	let entries = [];
	try {
		entries = await fs.readdir(params.dir);
	} catch {
		return results;
	}
	for (const entry of entries) {
		if (!entry.endsWith(".service")) continue;
		const name = entry.replace(/\.service$/, "");
		if (isIgnoredSystemdName(name)) continue;
		const fullPath = path.join(params.dir, entry);
		let contents = "";
		try {
			contents = await fs.readFile(fullPath, "utf8");
		} catch {
			continue;
		}
		const marker = detectMarker(contents);
		if (!marker) continue;
		if (marker === "openclaw" && isOpenClawGatewaySystemdService(name, contents)) continue;
		results.push({
			platform: "linux",
			label: entry,
			detail: `unit: ${fullPath}`,
			scope: params.scope,
			marker,
			legacy: marker !== "openclaw"
		});
	}
	return results;
}
function parseSchtasksList(output) {
	const tasks = [];
	let current = null;
	for (const rawLine of output.split(/\r?\n/)) {
		const line = rawLine.trim();
		if (!line) {
			if (current) {
				tasks.push(current);
				current = null;
			}
			continue;
		}
		const idx = line.indexOf(":");
		if (idx <= 0) continue;
		const key = line.slice(0, idx).trim().toLowerCase();
		const value = line.slice(idx + 1).trim();
		if (!value) continue;
		if (key === "taskname") {
			if (current) tasks.push(current);
			current = { name: value };
			continue;
		}
		if (!current) continue;
		if (key === "task to run") current.taskToRun = value;
	}
	if (current) tasks.push(current);
	return tasks;
}
async function execSchtasks(args) {
	try {
		const { stdout, stderr } = await execFileAsync("schtasks", args, {
			encoding: "utf8",
			windowsHide: true
		});
		return {
			stdout: String(stdout ?? ""),
			stderr: String(stderr ?? ""),
			code: 0
		};
	} catch (error) {
		const e = error;
		return {
			stdout: typeof e.stdout === "string" ? e.stdout : "",
			stderr: typeof e.stderr === "string" ? e.stderr : typeof e.message === "string" ? e.message : "",
			code: typeof e.code === "number" ? e.code : 1
		};
	}
}
async function findExtraGatewayServices(env, opts = {}) {
	const results = [];
	const seen = /* @__PURE__ */ new Set();
	const push = (svc) => {
		const key = `${svc.platform}:${svc.label}:${svc.detail}:${svc.scope}`;
		if (seen.has(key)) return;
		seen.add(key);
		results.push(svc);
	};
	if (process.platform === "darwin") {
		try {
			const home = resolveHomeDir(env);
			const userDir = path.join(home, "Library", "LaunchAgents");
			for (const svc of await scanLaunchdDir({
				dir: userDir,
				scope: "user"
			})) push(svc);
			if (opts.deep) {
				for (const svc of await scanLaunchdDir({
					dir: path.join(path.sep, "Library", "LaunchAgents"),
					scope: "system"
				})) push(svc);
				for (const svc of await scanLaunchdDir({
					dir: path.join(path.sep, "Library", "LaunchDaemons"),
					scope: "system"
				})) push(svc);
			}
		} catch {
			return results;
		}
		return results;
	}
	if (process.platform === "linux") {
		try {
			const home = resolveHomeDir(env);
			const userDir = path.join(home, ".config", "systemd", "user");
			for (const svc of await scanSystemdDir({
				dir: userDir,
				scope: "user"
			})) push(svc);
			if (opts.deep) for (const dir of [
				"/etc/systemd/system",
				"/usr/lib/systemd/system",
				"/lib/systemd/system"
			]) for (const svc of await scanSystemdDir({
				dir,
				scope: "system"
			})) push(svc);
		} catch {
			return results;
		}
		return results;
	}
	if (process.platform === "win32") {
		if (!opts.deep) return results;
		const res = await execSchtasks([
			"/Query",
			"/FO",
			"LIST",
			"/V"
		]);
		if (res.code !== 0) return results;
		const tasks = parseSchtasksList(res.stdout);
		for (const task of tasks) {
			const name = task.name.trim();
			if (!name) continue;
			if (isOpenClawGatewayTaskName(name)) continue;
			const lowerName = name.toLowerCase();
			const lowerCommand = task.taskToRun?.toLowerCase() ?? "";
			let marker = null;
			for (const candidate of EXTRA_MARKERS) if (lowerName.includes(candidate) || lowerCommand.includes(candidate)) {
				marker = candidate;
				break;
			}
			if (!marker) continue;
			push({
				platform: "win32",
				label: name,
				detail: task.taskToRun ? `task: ${name}, run: ${task.taskToRun}` : name,
				scope: "system",
				marker,
				legacy: marker !== "openclaw"
			});
		}
		return results;
	}
	return results;
}

//#endregion
//#region src/daemon/service-audit.ts
const SERVICE_AUDIT_CODES = {
	gatewayCommandMissing: "gateway-command-missing",
	gatewayEntrypointMismatch: "gateway-entrypoint-mismatch",
	gatewayPathMissing: "gateway-path-missing",
	gatewayPathMissingDirs: "gateway-path-missing-dirs",
	gatewayPathNonMinimal: "gateway-path-nonminimal",
	gatewayRuntimeBun: "gateway-runtime-bun",
	gatewayRuntimeNodeVersionManager: "gateway-runtime-node-version-manager",
	gatewayRuntimeNodeSystemMissing: "gateway-runtime-node-system-missing",
	launchdKeepAlive: "launchd-keep-alive",
	launchdRunAtLoad: "launchd-run-at-load",
	systemdAfterNetworkOnline: "systemd-after-network-online",
	systemdRestartSec: "systemd-restart-sec",
	systemdWantsNetworkOnline: "systemd-wants-network-online"
};
function needsNodeRuntimeMigration(issues) {
	return issues.some((issue) => issue.code === SERVICE_AUDIT_CODES.gatewayRuntimeBun || issue.code === SERVICE_AUDIT_CODES.gatewayRuntimeNodeVersionManager);
}
function hasGatewaySubcommand(programArguments) {
	return Boolean(programArguments?.some((arg) => arg === "gateway"));
}
function parseSystemdUnit(content) {
	const after = /* @__PURE__ */ new Set();
	const wants = /* @__PURE__ */ new Set();
	let restartSec;
	for (const rawLine of content.split(/\r?\n/)) {
		const line = rawLine.trim();
		if (!line) continue;
		if (line.startsWith("#") || line.startsWith(";")) continue;
		if (line.startsWith("[")) continue;
		const idx = line.indexOf("=");
		if (idx <= 0) continue;
		const key = line.slice(0, idx).trim();
		const value = line.slice(idx + 1).trim();
		if (!value) continue;
		if (key === "After") {
			for (const entry of value.split(/\s+/)) if (entry) after.add(entry);
		} else if (key === "Wants") {
			for (const entry of value.split(/\s+/)) if (entry) wants.add(entry);
		} else if (key === "RestartSec") restartSec = value;
	}
	return {
		after,
		wants,
		restartSec
	};
}
function isRestartSecPreferred(value) {
	if (!value) return false;
	const parsed = Number.parseFloat(value);
	if (!Number.isFinite(parsed)) return false;
	return Math.abs(parsed - 5) < .01;
}
async function auditSystemdUnit(env, issues) {
	const unitPath = resolveSystemdUserUnitPath(env);
	let content = "";
	try {
		content = await fs.readFile(unitPath, "utf8");
	} catch {
		return;
	}
	const parsed = parseSystemdUnit(content);
	if (!parsed.after.has("network-online.target")) issues.push({
		code: SERVICE_AUDIT_CODES.systemdAfterNetworkOnline,
		message: "Missing systemd After=network-online.target",
		detail: unitPath,
		level: "recommended"
	});
	if (!parsed.wants.has("network-online.target")) issues.push({
		code: SERVICE_AUDIT_CODES.systemdWantsNetworkOnline,
		message: "Missing systemd Wants=network-online.target",
		detail: unitPath,
		level: "recommended"
	});
	if (!isRestartSecPreferred(parsed.restartSec)) issues.push({
		code: SERVICE_AUDIT_CODES.systemdRestartSec,
		message: "RestartSec does not match the recommended 5s",
		detail: unitPath,
		level: "recommended"
	});
}
async function auditLaunchdPlist(env, issues) {
	const plistPath = resolveLaunchAgentPlistPath(env);
	let content = "";
	try {
		content = await fs.readFile(plistPath, "utf8");
	} catch {
		return;
	}
	const hasRunAtLoad = /<key>RunAtLoad<\/key>\s*<true\s*\/>/i.test(content);
	const hasKeepAlive = /<key>KeepAlive<\/key>\s*<true\s*\/>/i.test(content);
	if (!hasRunAtLoad) issues.push({
		code: SERVICE_AUDIT_CODES.launchdRunAtLoad,
		message: "LaunchAgent is missing RunAtLoad=true",
		detail: plistPath,
		level: "recommended"
	});
	if (!hasKeepAlive) issues.push({
		code: SERVICE_AUDIT_CODES.launchdKeepAlive,
		message: "LaunchAgent is missing KeepAlive=true",
		detail: plistPath,
		level: "recommended"
	});
}
function auditGatewayCommand(programArguments, issues) {
	if (!programArguments || programArguments.length === 0) return;
	if (!hasGatewaySubcommand(programArguments)) issues.push({
		code: SERVICE_AUDIT_CODES.gatewayCommandMissing,
		message: "Service command does not include the gateway subcommand",
		level: "aggressive"
	});
}
function isNodeRuntime(execPath) {
	const base = path.basename(execPath).toLowerCase();
	return base === "node" || base === "node.exe";
}
function isBunRuntime(execPath) {
	const base = path.basename(execPath).toLowerCase();
	return base === "bun" || base === "bun.exe";
}
function getPathModule(platform) {
	return platform === "win32" ? path.win32 : path.posix;
}
function normalizePathEntry(entry, platform) {
	const normalized = getPathModule(platform).normalize(entry).replaceAll("\\", "/");
	if (platform === "win32") return normalized.toLowerCase();
	return normalized;
}
function auditGatewayServicePath(command, issues, env, platform) {
	if (platform === "win32") return;
	const servicePath = command?.environment?.PATH;
	if (!servicePath) {
		issues.push({
			code: SERVICE_AUDIT_CODES.gatewayPathMissing,
			message: "Gateway service PATH is not set; the daemon should use a minimal PATH.",
			level: "recommended"
		});
		return;
	}
	const expected = getMinimalServicePathPartsFromEnv({
		platform,
		env
	});
	const parts = servicePath.split(getPathModule(platform).delimiter).map((entry) => entry.trim()).filter(Boolean);
	const normalizedParts = new Set(parts.map((entry) => normalizePathEntry(entry, platform)));
	const normalizedExpected = new Set(expected.map((entry) => normalizePathEntry(entry, platform)));
	const missing = expected.filter((entry) => {
		const normalized = normalizePathEntry(entry, platform);
		return !normalizedParts.has(normalized);
	});
	if (missing.length > 0) issues.push({
		code: SERVICE_AUDIT_CODES.gatewayPathMissingDirs,
		message: `Gateway service PATH missing required dirs: ${missing.join(", ")}`,
		level: "recommended"
	});
	const nonMinimal = parts.filter((entry) => {
		const normalized = normalizePathEntry(entry, platform);
		if (normalizedExpected.has(normalized)) return false;
		return normalized.includes("/.nvm/") || normalized.includes("/.fnm/") || normalized.includes("/.volta/") || normalized.includes("/.asdf/") || normalized.includes("/.n/") || normalized.includes("/.nodenv/") || normalized.includes("/.nodebrew/") || normalized.includes("/nvs/") || normalized.includes("/.local/share/pnpm/") || normalized.includes("/pnpm/") || normalized.endsWith("/pnpm");
	});
	if (nonMinimal.length > 0) issues.push({
		code: SERVICE_AUDIT_CODES.gatewayPathNonMinimal,
		message: "Gateway service PATH includes version managers or package managers; recommend a minimal PATH.",
		detail: nonMinimal.join(", "),
		level: "recommended"
	});
}
async function auditGatewayRuntime(env, command, issues, platform) {
	const execPath = command?.programArguments?.[0];
	if (!execPath) return;
	if (isBunRuntime(execPath)) {
		issues.push({
			code: SERVICE_AUDIT_CODES.gatewayRuntimeBun,
			message: "Gateway service uses Bun; Bun is incompatible with WhatsApp + Telegram channels.",
			detail: execPath,
			level: "recommended"
		});
		return;
	}
	if (!isNodeRuntime(execPath)) return;
	if (isVersionManagedNodePath(execPath, platform)) {
		issues.push({
			code: SERVICE_AUDIT_CODES.gatewayRuntimeNodeVersionManager,
			message: "Gateway service uses Node from a version manager; it can break after upgrades.",
			detail: execPath,
			level: "recommended"
		});
		if (!isSystemNodePath(execPath, env, platform)) {
			if (!await resolveSystemNodePath(env, platform)) issues.push({
				code: SERVICE_AUDIT_CODES.gatewayRuntimeNodeSystemMissing,
				message: "System Node 22+ not found; install it before migrating away from version managers.",
				level: "recommended"
			});
		}
	}
}
async function auditGatewayServiceConfig(params) {
	const issues = [];
	const platform = params.platform ?? process.platform;
	auditGatewayCommand(params.command?.programArguments, issues);
	auditGatewayServicePath(params.command, issues, params.env, platform);
	await auditGatewayRuntime(params.env, params.command, issues, platform);
	if (platform === "linux") await auditSystemdUnit(params.env, issues);
	else if (platform === "darwin") await auditLaunchdPlist(params.env, issues);
	return {
		ok: issues.length === 0,
		issues
	};
}

//#endregion
export { renderGatewayServiceCleanupHints as a, findExtraGatewayServices as i, auditGatewayServiceConfig as n, needsNodeRuntimeMigration as r, SERVICE_AUDIT_CODES as t };