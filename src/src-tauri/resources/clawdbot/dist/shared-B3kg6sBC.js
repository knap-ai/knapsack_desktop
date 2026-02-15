import { F as getResolvedLoggerSettings, h as defaultRuntime } from "./entry.js";
import { t as formatCliCommand } from "./command-format-CVN3MX2Q.js";
import { c as pickPrimaryLanIPv4 } from "./ws-D56uQr0E.js";
import { d as resolveGatewaySystemdServiceName, f as resolveGatewayWindowsTaskName, l as resolveGatewayLaunchAgentLabel } from "./constants-BnUiPMIW.js";
import { o as resolveGatewayLogPaths } from "./service-q_Baxtp9.js";
import { Writable } from "node:stream";

//#region src/cli/daemon-cli/response.ts
function emitDaemonActionJson(payload) {
	defaultRuntime.log(JSON.stringify(payload, null, 2));
}
function buildDaemonServiceSnapshot(service, loaded) {
	return {
		label: service.label,
		loaded,
		loadedText: service.loadedText,
		notLoadedText: service.notLoadedText
	};
}
function createNullWriter() {
	return new Writable({ write(_chunk, _encoding, callback) {
		callback();
	} });
}

//#endregion
//#region src/cli/daemon-cli/shared.ts
function parsePort(raw) {
	if (raw === void 0 || raw === null) return null;
	const value = typeof raw === "string" ? raw : typeof raw === "number" || typeof raw === "bigint" ? raw.toString() : null;
	if (value === null) return null;
	const parsed = Number.parseInt(value, 10);
	if (!Number.isFinite(parsed) || parsed <= 0) return null;
	return parsed;
}
function parsePortFromArgs(programArguments) {
	if (!programArguments?.length) return null;
	for (let i = 0; i < programArguments.length; i += 1) {
		const arg = programArguments[i];
		if (arg === "--port") {
			const next = programArguments[i + 1];
			const parsed = parsePort(next);
			if (parsed) return parsed;
		}
		if (arg?.startsWith("--port=")) {
			const parsed = parsePort(arg.split("=", 2)[1]);
			if (parsed) return parsed;
		}
	}
	return null;
}
function pickProbeHostForBind(bindMode, tailnetIPv4, customBindHost) {
	if (bindMode === "custom" && customBindHost?.trim()) return customBindHost.trim();
	if (bindMode === "tailnet") return tailnetIPv4 ?? "127.0.0.1";
	if (bindMode === "lan") return pickPrimaryLanIPv4() ?? "127.0.0.1";
	return "127.0.0.1";
}
const SAFE_DAEMON_ENV_KEYS = [
	"OPENCLAW_PROFILE",
	"OPENCLAW_STATE_DIR",
	"OPENCLAW_CONFIG_PATH",
	"OPENCLAW_GATEWAY_PORT",
	"OPENCLAW_NIX_MODE"
];
function filterDaemonEnv(env) {
	if (!env) return {};
	const filtered = {};
	for (const key of SAFE_DAEMON_ENV_KEYS) {
		const value = env[key];
		if (!value?.trim()) continue;
		filtered[key] = value.trim();
	}
	return filtered;
}
function safeDaemonEnv(env) {
	const filtered = filterDaemonEnv(env);
	return Object.entries(filtered).map(([key, value]) => `${key}=${value}`);
}
function normalizeListenerAddress(raw) {
	let value = raw.trim();
	if (!value) return value;
	value = value.replace(/^TCP\s+/i, "");
	value = value.replace(/\s+\(LISTEN\)\s*$/i, "");
	return value.trim();
}
function formatRuntimeStatus(runtime) {
	if (!runtime) return null;
	const status = runtime.status ?? "unknown";
	const details = [];
	if (runtime.pid) details.push(`pid ${runtime.pid}`);
	if (runtime.state && runtime.state.toLowerCase() !== status) details.push(`state ${runtime.state}`);
	if (runtime.subState) details.push(`sub ${runtime.subState}`);
	if (runtime.lastExitStatus !== void 0) details.push(`last exit ${runtime.lastExitStatus}`);
	if (runtime.lastExitReason) details.push(`reason ${runtime.lastExitReason}`);
	if (runtime.lastRunResult) details.push(`last run ${runtime.lastRunResult}`);
	if (runtime.lastRunTime) details.push(`last run time ${runtime.lastRunTime}`);
	if (runtime.detail) details.push(runtime.detail);
	return details.length > 0 ? `${status} (${details.join(", ")})` : status;
}
function renderRuntimeHints(runtime, env = process.env) {
	if (!runtime) return [];
	const hints = [];
	const fileLog = (() => {
		try {
			return getResolvedLoggerSettings().file;
		} catch {
			return null;
		}
	})();
	if (runtime.missingUnit) {
		hints.push(`Service not installed. Run: ${formatCliCommand("openclaw gateway install", env)}`);
		if (fileLog) hints.push(`File logs: ${fileLog}`);
		return hints;
	}
	if (runtime.status === "stopped") {
		if (fileLog) hints.push(`File logs: ${fileLog}`);
		if (process.platform === "darwin") {
			const logs = resolveGatewayLogPaths(env);
			hints.push(`Launchd stdout (if installed): ${logs.stdoutPath}`);
			hints.push(`Launchd stderr (if installed): ${logs.stderrPath}`);
		} else if (process.platform === "linux") {
			const unit = resolveGatewaySystemdServiceName(env.OPENCLAW_PROFILE);
			hints.push(`Logs: journalctl --user -u ${unit}.service -n 200 --no-pager`);
		} else if (process.platform === "win32") {
			const task = resolveGatewayWindowsTaskName(env.OPENCLAW_PROFILE);
			hints.push(`Logs: schtasks /Query /TN "${task}" /V /FO LIST`);
		}
	}
	return hints;
}
function renderGatewayServiceStartHints(env = process.env) {
	const base = [formatCliCommand("openclaw gateway install", env), formatCliCommand("openclaw gateway", env)];
	const profile = env.OPENCLAW_PROFILE;
	switch (process.platform) {
		case "darwin": {
			const label = resolveGatewayLaunchAgentLabel(profile);
			return [...base, `launchctl bootstrap gui/$UID ~/Library/LaunchAgents/${label}.plist`];
		}
		case "linux": {
			const unit = resolveGatewaySystemdServiceName(profile);
			return [...base, `systemctl --user start ${unit}.service`];
		}
		case "win32": {
			const task = resolveGatewayWindowsTaskName(profile);
			return [...base, `schtasks /Run /TN "${task}"`];
		}
		default: return base;
	}
}

//#endregion
export { parsePortFromArgs as a, renderRuntimeHints as c, createNullWriter as d, emitDaemonActionJson as f, parsePort as i, safeDaemonEnv as l, formatRuntimeStatus as n, pickProbeHostForBind as o, normalizeListenerAddress as r, renderGatewayServiceStartHints as s, filterDaemonEnv as t, buildDaemonServiceSnapshot as u };