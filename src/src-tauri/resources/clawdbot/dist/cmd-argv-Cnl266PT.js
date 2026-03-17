import { t as createSubsystemLogger } from "./subsystem-BDbeCphF.js";
import { u as resolveGatewayPort } from "./paths-dQ_clcF4.js";
import { t as formatCliCommand } from "./command-format-BTnLVWI8.js";
import { t as runCommandWithTimeout } from "./exec-CdZJtviz.js";
import { o as isErrno } from "./errors-Bgu5Y3JI.js";
import { t as splitArgsPreservingQuotes } from "./arg-split-C1AYgiDY.js";
import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import fs$1 from "node:fs/promises";
import net from "node:net";
//#region src/infra/ports-format.ts
function classifyPortListener(listener, port) {
	const raw = `${listener.commandLine ?? ""} ${listener.command ?? ""}`.trim().toLowerCase();
	if (raw.includes("openclaw")) return "gateway";
	if (raw.includes("ssh")) {
		const portToken = String(port);
		const tunnelPattern = new RegExp(`-(l|r)\\s*${portToken}\\b|-(l|r)${portToken}\\b|:${portToken}\\b`);
		if (!raw || tunnelPattern.test(raw)) return "ssh";
		return "ssh";
	}
	return "unknown";
}
function buildPortHints(listeners, port) {
	if (listeners.length === 0) return [];
	const kinds = new Set(listeners.map((listener) => classifyPortListener(listener, port)));
	const hints = [];
	if (kinds.has("gateway")) hints.push(`Gateway already running locally. Stop it (${formatCliCommand("openclaw gateway stop")}) or use a different port.`);
	if (kinds.has("ssh")) hints.push("SSH tunnel already bound to this port. Close the tunnel or use a different local port in -L.");
	if (kinds.has("unknown")) hints.push("Another process is listening on this port.");
	if (listeners.length > 1) hints.push("Multiple listeners detected; ensure only one gateway/tunnel per port unless intentionally running isolated profiles.");
	return hints;
}
function formatPortListener(listener) {
	return `${listener.pid ? `pid ${listener.pid}` : "pid ?"}${listener.user ? ` ${listener.user}` : ""}: ${listener.commandLine || listener.command || "unknown"}${listener.address ? ` (${listener.address})` : ""}`;
}
function formatPortDiagnostics(diagnostics) {
	if (diagnostics.status !== "busy") return [`Port ${diagnostics.port} is free.`];
	const lines = [`Port ${diagnostics.port} is already in use.`];
	for (const listener of diagnostics.listeners) lines.push(`- ${formatPortListener(listener)}`);
	for (const hint of diagnostics.hints) lines.push(`- ${hint}`);
	return lines;
}
//#endregion
//#region src/infra/ports-lsof.ts
const LSOF_CANDIDATES = process.platform === "darwin" ? ["/usr/sbin/lsof", "/usr/bin/lsof"] : ["/usr/bin/lsof", "/usr/sbin/lsof"];
async function canExecute(path) {
	try {
		await fs$1.access(path, fs.constants.X_OK);
		return true;
	} catch {
		return false;
	}
}
async function resolveLsofCommand() {
	for (const candidate of LSOF_CANDIDATES) if (await canExecute(candidate)) return candidate;
	return "lsof";
}
function resolveLsofCommandSync() {
	for (const candidate of LSOF_CANDIDATES) try {
		fs.accessSync(candidate, fs.constants.X_OK);
		return candidate;
	} catch {}
	return "lsof";
}
//#endregion
//#region src/infra/ports-probe.ts
async function tryListenOnPort(params) {
	const listenOptions = { port: params.port };
	if (params.host) listenOptions.host = params.host;
	if (typeof params.exclusive === "boolean") listenOptions.exclusive = params.exclusive;
	await new Promise((resolve, reject) => {
		const tester = net.createServer().once("error", (err) => reject(err)).once("listening", () => {
			tester.close(() => resolve());
		}).listen(listenOptions);
	});
}
//#endregion
//#region src/infra/ports-inspect.ts
async function runCommandSafe(argv, timeoutMs = 5e3) {
	try {
		const res = await runCommandWithTimeout(argv, { timeoutMs });
		return {
			stdout: res.stdout,
			stderr: res.stderr,
			code: res.code ?? 1
		};
	} catch (err) {
		return {
			stdout: "",
			stderr: "",
			code: 1,
			error: String(err)
		};
	}
}
function parseLsofFieldOutput(output) {
	const lines = output.split(/\r?\n/).filter(Boolean);
	const listeners = [];
	let current = {};
	for (const line of lines) if (line.startsWith("p")) {
		if (current.pid || current.command) listeners.push(current);
		const pid = Number.parseInt(line.slice(1), 10);
		current = Number.isFinite(pid) ? { pid } : {};
	} else if (line.startsWith("c")) current.command = line.slice(1);
	else if (line.startsWith("n")) {
		if (!current.address) current.address = line.slice(1);
	}
	if (current.pid || current.command) listeners.push(current);
	return listeners;
}
async function enrichUnixListenerProcessInfo(listeners) {
	await Promise.all(listeners.map(async (listener) => {
		if (!listener.pid) return;
		const [commandLine, user, parentPid] = await Promise.all([
			resolveUnixCommandLine(listener.pid),
			resolveUnixUser(listener.pid),
			resolveUnixParentPid(listener.pid)
		]);
		if (commandLine) listener.commandLine = commandLine;
		if (user) listener.user = user;
		if (parentPid !== void 0) listener.ppid = parentPid;
	}));
}
async function resolveUnixCommandLine(pid) {
	const res = await runCommandSafe([
		"ps",
		"-p",
		String(pid),
		"-o",
		"command="
	]);
	if (res.code !== 0) return;
	return res.stdout.trim() || void 0;
}
async function resolveUnixUser(pid) {
	const res = await runCommandSafe([
		"ps",
		"-p",
		String(pid),
		"-o",
		"user="
	]);
	if (res.code !== 0) return;
	return res.stdout.trim() || void 0;
}
async function resolveUnixParentPid(pid) {
	const res = await runCommandSafe([
		"ps",
		"-p",
		String(pid),
		"-o",
		"ppid="
	]);
	if (res.code !== 0) return;
	const line = res.stdout.trim();
	const parentPid = Number.parseInt(line, 10);
	return Number.isFinite(parentPid) && parentPid > 0 ? parentPid : void 0;
}
function parseSsListeners(output, port) {
	const lines = output.split(/\r?\n/).map((line) => line.trim());
	const listeners = [];
	for (const line of lines) {
		if (!line || !line.includes("LISTEN")) continue;
		const localAddress = line.split(/\s+/).find((part) => part.includes(`:${port}`));
		if (!localAddress) continue;
		const listener = { address: localAddress };
		const pidMatch = line.match(/pid=(\d+)/);
		if (pidMatch) {
			const pid = Number.parseInt(pidMatch[1], 10);
			if (Number.isFinite(pid)) listener.pid = pid;
		}
		const commandMatch = line.match(/users:\(\("([^"]+)"/);
		if (commandMatch?.[1]) listener.command = commandMatch[1];
		listeners.push(listener);
	}
	return listeners;
}
async function readUnixListenersFromSs(port) {
	const errors = [];
	const res = await runCommandSafe([
		"ss",
		"-H",
		"-ltnp",
		`sport = :${port}`
	]);
	if (res.code === 0) {
		const listeners = parseSsListeners(res.stdout, port);
		await enrichUnixListenerProcessInfo(listeners);
		return {
			listeners,
			detail: res.stdout.trim() || void 0,
			errors
		};
	}
	const stderr = res.stderr.trim();
	if (res.code === 1 && !res.error && !stderr) return {
		listeners: [],
		detail: void 0,
		errors
	};
	if (res.error) errors.push(res.error);
	const detail = [stderr, res.stdout.trim()].filter(Boolean).join("\n");
	if (detail) errors.push(detail);
	return {
		listeners: [],
		detail: void 0,
		errors
	};
}
async function readUnixListeners(port) {
	const res = await runCommandSafe([
		await resolveLsofCommand(),
		"-nP",
		`-iTCP:${port}`,
		"-sTCP:LISTEN",
		"-FpFcn"
	]);
	if (res.code === 0) {
		const listeners = parseLsofFieldOutput(res.stdout);
		await enrichUnixListenerProcessInfo(listeners);
		return {
			listeners,
			detail: res.stdout.trim() || void 0,
			errors: []
		};
	}
	const lsofErrors = [];
	const stderr = res.stderr.trim();
	if (res.code === 1 && !res.error && !stderr) return {
		listeners: [],
		detail: void 0,
		errors: []
	};
	if (res.error) lsofErrors.push(res.error);
	const detail = [stderr, res.stdout.trim()].filter(Boolean).join("\n");
	if (detail) lsofErrors.push(detail);
	const ssFallback = await readUnixListenersFromSs(port);
	if (ssFallback.listeners.length > 0) return ssFallback;
	return {
		listeners: [],
		detail: void 0,
		errors: [...lsofErrors, ...ssFallback.errors]
	};
}
function parseNetstatListeners(output, port) {
	const listeners = [];
	const portToken = `:${port}`;
	for (const rawLine of output.split(/\r?\n/)) {
		const line = rawLine.trim();
		if (!line) continue;
		if (!line.toLowerCase().includes("listen")) continue;
		if (!line.includes(portToken)) continue;
		const parts = line.split(/\s+/);
		if (parts.length < 4) continue;
		const pidRaw = parts.at(-1);
		const pid = pidRaw ? Number.parseInt(pidRaw, 10) : NaN;
		const localAddr = parts[1];
		const listener = {};
		if (Number.isFinite(pid)) listener.pid = pid;
		if (localAddr?.includes(portToken)) listener.address = localAddr;
		listeners.push(listener);
	}
	return listeners;
}
async function resolveWindowsImageName(pid) {
	const res = await runCommandSafe([
		"tasklist",
		"/FI",
		`PID eq ${pid}`,
		"/FO",
		"LIST"
	]);
	if (res.code !== 0) return;
	for (const rawLine of res.stdout.split(/\r?\n/)) {
		const line = rawLine.trim();
		if (!line.toLowerCase().startsWith("image name:")) continue;
		return line.slice(11).trim() || void 0;
	}
}
async function resolveWindowsCommandLine(pid) {
	const res = await runCommandSafe([
		"wmic",
		"process",
		"where",
		`ProcessId=${pid}`,
		"get",
		"CommandLine",
		"/value"
	]);
	if (res.code !== 0) return;
	for (const rawLine of res.stdout.split(/\r?\n/)) {
		const line = rawLine.trim();
		if (!line.toLowerCase().startsWith("commandline=")) continue;
		return line.slice(12).trim() || void 0;
	}
}
async function readWindowsListeners(port) {
	const errors = [];
	const res = await runCommandSafe([
		"netstat",
		"-ano",
		"-p",
		"tcp"
	]);
	if (res.code !== 0) {
		if (res.error) errors.push(res.error);
		const detail = [res.stderr.trim(), res.stdout.trim()].filter(Boolean).join("\n");
		if (detail) errors.push(detail);
		return {
			listeners: [],
			errors
		};
	}
	const listeners = parseNetstatListeners(res.stdout, port);
	await Promise.all(listeners.map(async (listener) => {
		if (!listener.pid) return;
		const [imageName, commandLine] = await Promise.all([resolveWindowsImageName(listener.pid), resolveWindowsCommandLine(listener.pid)]);
		if (imageName) listener.command = imageName;
		if (commandLine) listener.commandLine = commandLine;
	}));
	return {
		listeners,
		detail: res.stdout.trim() || void 0,
		errors
	};
}
async function tryListenOnHost(port, host) {
	try {
		await tryListenOnPort({
			port,
			host,
			exclusive: true
		});
		return "free";
	} catch (err) {
		if (isErrno(err) && err.code === "EADDRINUSE") return "busy";
		if (isErrno(err) && (err.code === "EADDRNOTAVAIL" || err.code === "EAFNOSUPPORT")) return "skip";
		return "unknown";
	}
}
async function checkPortInUse(port) {
	const hosts = [
		"127.0.0.1",
		"0.0.0.0",
		"::1",
		"::"
	];
	let sawUnknown = false;
	for (const host of hosts) {
		const result = await tryListenOnHost(port, host);
		if (result === "busy") return "busy";
		if (result === "unknown") sawUnknown = true;
	}
	return sawUnknown ? "unknown" : "free";
}
async function inspectPortUsage(port) {
	const errors = [];
	const result = process.platform === "win32" ? await readWindowsListeners(port) : await readUnixListeners(port);
	errors.push(...result.errors);
	let listeners = result.listeners;
	let status = listeners.length > 0 ? "busy" : "unknown";
	if (listeners.length === 0) status = await checkPortInUse(port);
	if (status !== "busy") listeners = [];
	const hints = buildPortHints(listeners, port);
	if (status === "busy" && listeners.length === 0) hints.push("Port is in use but process details are unavailable (install lsof or run as an admin user).");
	return {
		port,
		status,
		listeners,
		hints,
		detail: result.detail,
		errors: errors.length > 0 ? errors : void 0
	};
}
//#endregion
//#region src/infra/ports.ts
var PortInUseError = class extends Error {
	constructor(port, details) {
		super(`Port ${port} is already in use.`);
		this.name = "PortInUseError";
		this.port = port;
		this.details = details;
	}
};
async function ensurePortAvailable(port) {
	try {
		await tryListenOnPort({ port });
	} catch (err) {
		if (isErrno(err) && err.code === "EADDRINUSE") throw new PortInUseError(port);
		throw err;
	}
}
//#endregion
//#region src/process/kill-tree.ts
const DEFAULT_GRACE_MS = 3e3;
const MAX_GRACE_MS = 6e4;
/**
* Best-effort process-tree termination with graceful shutdown.
* - Windows: use taskkill /T to include descendants. Sends SIGTERM-equivalent
*   first (without /F), then force-kills if process survives.
* - Unix: send SIGTERM to process group first, wait grace period, then SIGKILL.
*
* This gives child processes a chance to clean up (close connections, remove
* temp files, terminate their own children) before being hard-killed.
*/
function killProcessTree(pid, opts) {
	if (!Number.isFinite(pid) || pid <= 0) return;
	const graceMs = normalizeGraceMs(opts?.graceMs);
	if (process.platform === "win32") {
		killProcessTreeWindows(pid, graceMs);
		return;
	}
	killProcessTreeUnix(pid, graceMs);
}
function normalizeGraceMs(value) {
	if (typeof value !== "number" || !Number.isFinite(value)) return DEFAULT_GRACE_MS;
	return Math.max(0, Math.min(MAX_GRACE_MS, Math.floor(value)));
}
function isProcessAlive(pid) {
	try {
		process.kill(pid, 0);
		return true;
	} catch {
		return false;
	}
}
function killProcessTreeUnix(pid, graceMs) {
	try {
		process.kill(-pid, "SIGTERM");
	} catch {
		try {
			process.kill(pid, "SIGTERM");
		} catch {
			return;
		}
	}
	setTimeout(() => {
		if (isProcessAlive(-pid)) try {
			process.kill(-pid, "SIGKILL");
			return;
		} catch {}
		if (!isProcessAlive(pid)) return;
		try {
			process.kill(pid, "SIGKILL");
		} catch {}
	}, graceMs).unref();
}
function runTaskkill(args) {
	try {
		spawn("taskkill", args, {
			stdio: "ignore",
			detached: true,
			windowsHide: true
		});
	} catch {}
}
function killProcessTreeWindows(pid, graceMs) {
	runTaskkill([
		"/T",
		"/PID",
		String(pid)
	]);
	setTimeout(() => {
		if (!isProcessAlive(pid)) return;
		runTaskkill([
			"/F",
			"/T",
			"/PID",
			String(pid)
		]);
	}, graceMs).unref();
}
//#endregion
//#region src/infra/restart-stale-pids.ts
const SPAWN_TIMEOUT_MS = 2e3;
const STALE_SIGTERM_WAIT_MS = 600;
const STALE_SIGKILL_WAIT_MS = 400;
/**
* After SIGKILL, the kernel may not release the TCP port immediately.
* Poll until the port is confirmed free (or until the budget expires) before
* returning control to the caller (typically `triggerOpenClawRestart` →
* `systemctl restart`). Without this wait the new process races the dying
* process for the port and systemd enters an EADDRINUSE restart loop.
*
* POLL_SPAWN_TIMEOUT_MS is intentionally much shorter than SPAWN_TIMEOUT_MS
* so that a single slow or hung lsof invocation does not consume the entire
* polling budget. At 400 ms per call, up to five independent lsof attempts
* fit within PORT_FREE_TIMEOUT_MS = 2000 ms, each with a definitive outcome.
*/
const PORT_FREE_POLL_INTERVAL_MS = 50;
const PORT_FREE_TIMEOUT_MS = 2e3;
const POLL_SPAWN_TIMEOUT_MS = 400;
const restartLog = createSubsystemLogger("restart");
function getTimeMs() {
	return Date.now();
}
function sleepSync(ms) {
	const timeoutMs = Math.max(0, Math.floor(ms));
	if (timeoutMs <= 0) return;
	try {
		const lock = new Int32Array(new SharedArrayBuffer(4));
		Atomics.wait(lock, 0, 0, timeoutMs);
	} catch {
		const start = Date.now();
		while (Date.now() - start < timeoutMs);
	}
}
/**
* Parse openclaw gateway PIDs from lsof -Fpc stdout.
* Pure function — no I/O. Excludes the current process.
*/
function parsePidsFromLsofOutput(stdout) {
	const pids = [];
	let currentPid;
	let currentCmd;
	for (const line of stdout.split(/\r?\n/).filter(Boolean)) if (line.startsWith("p")) {
		if (currentPid != null && currentCmd && currentCmd.toLowerCase().includes("openclaw")) pids.push(currentPid);
		const parsed = Number.parseInt(line.slice(1), 10);
		currentPid = Number.isFinite(parsed) && parsed > 0 ? parsed : void 0;
		currentCmd = void 0;
	} else if (line.startsWith("c")) currentCmd = line.slice(1);
	if (currentPid != null && currentCmd && currentCmd.toLowerCase().includes("openclaw")) pids.push(currentPid);
	return [...new Set(pids)].filter((pid) => pid !== process.pid);
}
/**
* Find PIDs of gateway processes listening on the given port using synchronous lsof.
* Returns only PIDs that belong to openclaw gateway processes (not the current process).
*/
function findGatewayPidsOnPortSync(port, spawnTimeoutMs = SPAWN_TIMEOUT_MS) {
	if (process.platform === "win32") return [];
	const res = spawnSync(resolveLsofCommandSync(), [
		"-nP",
		`-iTCP:${port}`,
		"-sTCP:LISTEN",
		"-Fpc"
	], {
		encoding: "utf8",
		timeout: spawnTimeoutMs
	});
	if (res.error) {
		const code = res.error.code;
		const detail = code && code.trim().length > 0 ? code : res.error instanceof Error ? res.error.message : "unknown error";
		restartLog.warn(`lsof failed during initial stale-pid scan for port ${port}: ${detail}`);
		return [];
	}
	if (res.status === 1) return [];
	if (res.status !== 0) {
		restartLog.warn(`lsof exited with status ${res.status} during initial stale-pid scan for port ${port}; skipping stale pid check`);
		return [];
	}
	return parsePidsFromLsofOutput(res.stdout);
}
function pollPortOnce(port) {
	try {
		const res = spawnSync(resolveLsofCommandSync(), [
			"-nP",
			`-iTCP:${port}`,
			"-sTCP:LISTEN",
			"-Fpc"
		], {
			encoding: "utf8",
			timeout: POLL_SPAWN_TIMEOUT_MS
		});
		if (res.error) {
			const code = res.error.code;
			return {
				free: null,
				permanent: code === "ENOENT" || code === "EACCES" || code === "EPERM"
			};
		}
		if (res.status === 1) {
			if (res.stdout) return parsePidsFromLsofOutput(res.stdout).length === 0 ? { free: true } : { free: false };
			return { free: true };
		}
		if (res.status !== 0) return {
			free: null,
			permanent: false
		};
		return parsePidsFromLsofOutput(res.stdout).length === 0 ? { free: true } : { free: false };
	} catch {
		return {
			free: null,
			permanent: false
		};
	}
}
/**
* Synchronously terminate stale gateway processes.
* Callers must pass a non-empty pids array.
* Sends SIGTERM, waits briefly, then SIGKILL for survivors.
*/
function terminateStaleProcessesSync(pids) {
	const killed = [];
	for (const pid of pids) try {
		process.kill(pid, "SIGTERM");
		killed.push(pid);
	} catch {}
	if (killed.length === 0) return killed;
	sleepSync(STALE_SIGTERM_WAIT_MS);
	for (const pid of killed) try {
		process.kill(pid, 0);
		process.kill(pid, "SIGKILL");
	} catch {}
	sleepSync(STALE_SIGKILL_WAIT_MS);
	return killed;
}
/**
* Poll the given port until it is confirmed free, lsof is confirmed unavailable,
* or the wall-clock budget expires.
*
* Each poll invocation uses POLL_SPAWN_TIMEOUT_MS (400 ms), which is
* significantly shorter than PORT_FREE_TIMEOUT_MS (2000 ms). This ensures
* that a single slow or hung lsof call cannot consume the entire polling
* budget and cause the function to exit prematurely with an inconclusive
* result. Up to five independent lsof attempts fit within the budget.
*
* Exit conditions:
*   - `pollPortOnce` returns `{ free: true }`                    → port confirmed free
*   - `pollPortOnce` returns `{ free: null, permanent: true }`   → lsof unavailable, bail
*   - `pollPortOnce` returns `{ free: false }`                   → port busy, sleep + retry
*   - `pollPortOnce` returns `{ free: null, permanent: false }`  → transient error, sleep + retry
*   - Wall-clock deadline exceeded                               → log warning, proceed anyway
*/
function waitForPortFreeSync(port) {
	const deadline = getTimeMs() + PORT_FREE_TIMEOUT_MS;
	while (getTimeMs() < deadline) {
		const result = pollPortOnce(port);
		if (result.free === true) return;
		if (result.free === null && result.permanent) return;
		sleepSync(PORT_FREE_POLL_INTERVAL_MS);
	}
	restartLog.warn(`port ${port} still in use after ${PORT_FREE_TIMEOUT_MS}ms; proceeding anyway`);
}
/**
* Inspect the gateway port and kill any stale gateway processes holding it.
* Blocks until the port is confirmed free (or the poll budget expires) so
* the supervisor (systemd / launchctl) does not race a zombie process for
* the port and enter an EADDRINUSE restart loop.
*
* Called before service restart commands to prevent port conflicts.
*/
function cleanStaleGatewayProcessesSync(portOverride) {
	try {
		const port = typeof portOverride === "number" && Number.isFinite(portOverride) && portOverride > 0 ? Math.floor(portOverride) : resolveGatewayPort(void 0, process.env);
		const stalePids = findGatewayPidsOnPortSync(port);
		if (stalePids.length === 0) return [];
		restartLog.warn(`killing ${stalePids.length} stale gateway process(es) before restart: ${stalePids.join(", ")}`);
		const killed = terminateStaleProcessesSync(stalePids);
		waitForPortFreeSync(port);
		return killed;
	} catch {
		return [];
	}
}
//#endregion
//#region src/daemon/cmd-set.ts
function assertNoCmdLineBreak(value, field) {
	if (/[\r\n]/.test(value)) throw new Error(`${field} cannot contain CR or LF in Windows task scripts.`);
}
function escapeCmdSetAssignmentComponent(value) {
	return value.replace(/\^/g, "^^").replace(/%/g, "%%").replace(/!/g, "^!").replace(/"/g, "^\"");
}
function unescapeCmdSetAssignmentComponent(value) {
	let out = "";
	for (let i = 0; i < value.length; i += 1) {
		const ch = value[i];
		const next = value[i + 1];
		if (ch === "^" && (next === "^" || next === "\"" || next === "!")) {
			out += next;
			i += 1;
			continue;
		}
		if (ch === "%" && next === "%") {
			out += "%";
			i += 1;
			continue;
		}
		out += ch;
	}
	return out;
}
function parseCmdSetAssignment(line) {
	const raw = line.trim();
	if (!raw) return null;
	const quoted = raw.startsWith("\"") && raw.endsWith("\"") && raw.length >= 2;
	const assignment = quoted ? raw.slice(1, -1) : raw;
	const index = assignment.indexOf("=");
	if (index <= 0) return null;
	const key = assignment.slice(0, index).trim();
	const value = assignment.slice(index + 1).trim();
	if (!key) return null;
	if (!quoted) return {
		key,
		value
	};
	return {
		key: unescapeCmdSetAssignmentComponent(key),
		value: unescapeCmdSetAssignmentComponent(value)
	};
}
function renderCmdSetAssignment(key, value) {
	assertNoCmdLineBreak(key, "Environment variable name");
	assertNoCmdLineBreak(value, "Environment variable value");
	return `set "${escapeCmdSetAssignmentComponent(key)}=${escapeCmdSetAssignmentComponent(value)}"`;
}
//#endregion
//#region src/daemon/cmd-argv.ts
function quoteCmdScriptArg(value) {
	assertNoCmdLineBreak(value, "Command argument");
	if (!value) return "\"\"";
	const escaped = value.replace(/"/g, "\\\"").replace(/%/g, "%%").replace(/!/g, "^!");
	if (!/[ \t"&|<>^()%!]/g.test(value)) return escaped;
	return `"${escaped}"`;
}
function unescapeCmdScriptArg(value) {
	return value.replace(/\^!/g, "!").replace(/%%/g, "%");
}
function parseCmdScriptCommandLine(value) {
	return splitArgsPreservingQuotes(value, { escapeMode: "backslash-quote-only" }).map(unescapeCmdScriptArg);
}
//#endregion
export { renderCmdSetAssignment as a, killProcessTree as c, tryListenOnPort as d, resolveLsofCommandSync as f, parseCmdSetAssignment as i, ensurePortAvailable as l, formatPortDiagnostics as m, quoteCmdScriptArg as n, cleanStaleGatewayProcessesSync as o, classifyPortListener as p, assertNoCmdLineBreak as r, findGatewayPidsOnPortSync as s, parseCmdScriptCommandLine as t, inspectPortUsage as u };
