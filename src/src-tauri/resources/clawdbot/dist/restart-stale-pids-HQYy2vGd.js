import { i as normalizeLowercaseStringOrEmpty } from "./string-coerce-BUSzWgUA.js";
import { t as createSubsystemLogger } from "./subsystem-Cgmckbux.js";
import { u as resolveGatewayPort } from "./paths-Dvv9VRAc.js";
import { n as resolveLsofCommandSync } from "./ports-lsof-BuPfzhlZ.js";
import { a as splitArgsPreservingQuotes } from "./runtime-parse-DNfo_4xv.js";
import path from "node:path";
import { spawnSync } from "node:child_process";
//#region src/infra/gateway-process-argv.ts
function normalizeProcArg(arg) {
	return normalizeLowercaseStringOrEmpty(arg.replaceAll("\\", "/"));
}
function parseProcCmdline(raw) {
	return raw.split("\0").map((entry) => entry.trim()).filter(Boolean);
}
/**
* Parse a Windows command line string into argv-style tokens,
* handling double-quoted paths (e.g. `"C:\Program Files\node.exe" gateway run`).
*/
function parseWindowsCmdline(raw) {
	const args = [];
	let current = "";
	let inQuote = false;
	for (const char of raw) if (char === "\"") inQuote = !inQuote;
	else if (char === " " && !inQuote) {
		if (current) {
			args.push(current);
			current = "";
		}
	} else current += char;
	if (current) args.push(current);
	return args;
}
function isGatewayArgv(args, opts) {
	const normalized = args.map(normalizeProcArg);
	if (!normalized.includes("gateway")) return false;
	const entryCandidates = [
		"dist/index.js",
		"dist/entry.js",
		"openclaw.mjs",
		"scripts/run-node.mjs",
		"src/entry.ts",
		"src/index.ts"
	];
	if (normalized.some((arg) => entryCandidates.some((entry) => arg.endsWith(entry)))) return true;
	const exe = (normalized[0] ?? "").replace(/\.(bat|cmd|exe)$/i, "");
	return exe.endsWith("/openclaw") || exe === "openclaw" || opts?.allowGatewayBinary === true && exe.endsWith("/openclaw-gateway");
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
//#region src/infra/windows-port-pids.ts
const DEFAULT_TIMEOUT_MS = 5e3;
function readListeningPidsViaPowerShell(port, timeoutMs) {
	const ps = spawnSync("powershell", [
		"-NoProfile",
		"-Command",
		`(Get-NetTCPConnection -LocalPort ${port} -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess)`
	], {
		encoding: "utf8",
		timeout: timeoutMs,
		windowsHide: true
	});
	if (ps.error || ps.status !== 0) return null;
	return ps.stdout.split(/\r?\n/).map((line) => Number.parseInt(line.trim(), 10)).filter((pid) => Number.isFinite(pid) && pid > 0);
}
function parseListeningPidsFromNetstat(stdout, port) {
	const pids = /* @__PURE__ */ new Set();
	for (const line of stdout.split(/\r?\n/)) {
		const match = line.match(/^\s*TCP\s+(\S+):(\d+)\s+\S+\s+LISTENING\s+(\d+)\s*$/i);
		if (!match) continue;
		const parsedPort = Number.parseInt(match[2] ?? "", 10);
		const pid = Number.parseInt(match[3] ?? "", 10);
		if (parsedPort === port && Number.isFinite(pid) && pid > 0) pids.add(pid);
	}
	return [...pids];
}
function readWindowsListeningPidsOnPortSync(port, timeoutMs = DEFAULT_TIMEOUT_MS) {
	const result = readWindowsListeningPidsResultSync(port, timeoutMs);
	return result.ok ? result.pids : [];
}
function readWindowsListeningPidsResultSync(port, timeoutMs = DEFAULT_TIMEOUT_MS) {
	const powershellPids = readListeningPidsViaPowerShell(port, timeoutMs);
	if (powershellPids != null) return {
		ok: true,
		pids: powershellPids
	};
	const netstat = spawnSync("netstat", [
		"-ano",
		"-p",
		"tcp"
	], {
		encoding: "utf8",
		timeout: timeoutMs,
		windowsHide: true
	});
	if (netstat.error) {
		const code = netstat.error.code;
		return {
			ok: false,
			permanent: code === "ENOENT" || code === "EACCES" || code === "EPERM"
		};
	}
	if (netstat.status !== 0) return {
		ok: false,
		permanent: false
	};
	return {
		ok: true,
		pids: parseListeningPidsFromNetstat(netstat.stdout, port)
	};
}
function extractWindowsCommandLine(raw) {
	const lines = raw.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
	for (const line of lines) {
		if (!normalizeLowercaseStringOrEmpty(line).startsWith("commandline=")) continue;
		return line.slice(12).trim() || null;
	}
	return lines.find((line) => normalizeLowercaseStringOrEmpty(line) !== "commandline") ?? null;
}
function readWindowsProcessArgsSync(pid, timeoutMs = DEFAULT_TIMEOUT_MS) {
	const result = readWindowsProcessArgsResultSync(pid, timeoutMs);
	return result.ok ? result.args : null;
}
function readWindowsProcessArgsResultSync(pid, timeoutMs = DEFAULT_TIMEOUT_MS) {
	const powershell = spawnSync("powershell", [
		"-NoProfile",
		"-Command",
		`(Get-CimInstance Win32_Process -Filter "ProcessId = ${pid}" | Select-Object -ExpandProperty CommandLine)`
	], {
		encoding: "utf8",
		timeout: timeoutMs,
		windowsHide: true
	});
	if (!powershell.error && powershell.status === 0) {
		const command = powershell.stdout.trim();
		return {
			ok: true,
			args: command ? parseCmdScriptCommandLine(command) : null
		};
	}
	const wmic = spawnSync("wmic", [
		"process",
		"where",
		`ProcessId=${pid}`,
		"get",
		"CommandLine",
		"/value"
	], {
		encoding: "utf8",
		timeout: timeoutMs,
		windowsHide: true
	});
	if (!wmic.error && wmic.status === 0) {
		const command = extractWindowsCommandLine(wmic.stdout);
		return {
			ok: true,
			args: command ? parseCmdScriptCommandLine(command) : null
		};
	}
	const code = (wmic.error ?? powershell.error)?.code;
	return {
		ok: false,
		permanent: code === "ENOENT" || code === "EACCES" || code === "EPERM"
	};
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
		if (currentPid != null && currentCmd && normalizeLowercaseStringOrEmpty(currentCmd).includes("openclaw")) pids.push(currentPid);
		const parsed = Number.parseInt(line.slice(1), 10);
		currentPid = Number.isFinite(parsed) && parsed > 0 ? parsed : void 0;
		currentCmd = void 0;
	} else if (line.startsWith("c")) currentCmd = line.slice(1);
	if (currentPid != null && currentCmd && normalizeLowercaseStringOrEmpty(currentCmd).includes("openclaw")) pids.push(currentPid);
	return [...new Set(pids)].filter((pid) => pid !== process.pid);
}
/**
* Windows: find listening PIDs on the port, then verify each is an openclaw
* gateway process via command-line inspection. Excludes the current process.
*/
function filterVerifiedWindowsGatewayPids(rawPids) {
	return Array.from(new Set(rawPids)).filter((pid) => Number.isFinite(pid) && pid > 0 && pid !== process.pid).filter((pid) => {
		const args = readWindowsProcessArgsSync(pid);
		return args != null && isGatewayArgv(args, { allowGatewayBinary: true });
	});
}
function filterVerifiedWindowsGatewayPidsResult(rawPids, processArgsResult) {
	const verified = [];
	for (const pid of Array.from(new Set(rawPids))) {
		if (!Number.isFinite(pid) || pid <= 0 || pid === process.pid) continue;
		const argsResult = processArgsResult(pid);
		if (!argsResult.ok) return {
			ok: false,
			permanent: argsResult.permanent
		};
		if (argsResult.args != null && isGatewayArgv(argsResult.args, { allowGatewayBinary: true })) verified.push(pid);
	}
	return {
		ok: true,
		pids: verified
	};
}
function findVerifiedWindowsGatewayPidsOnPortSync(port) {
	return filterVerifiedWindowsGatewayPids(readWindowsListeningPidsOnPortSync(port));
}
function findVerifiedWindowsGatewayPidsOnPortResultSync(port) {
	const result = readWindowsListeningPidsResultSync(port);
	if (!result.ok) return result;
	return filterVerifiedWindowsGatewayPidsResult(result.pids, (pid) => readWindowsProcessArgsResultSync(pid));
}
/**
* Find PIDs of gateway processes listening on the given port using synchronous lsof.
* Returns only PIDs that belong to openclaw gateway processes (not the current process).
*/
function findGatewayPidsOnPortSync(port, spawnTimeoutMs = SPAWN_TIMEOUT_MS) {
	if (process.platform === "win32") return findVerifiedWindowsGatewayPidsOnPortSync(port);
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
	if (process.platform === "win32") return pollPortOnceWindows(port);
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
* Windows-specific port poll.
* Uses a short timeout (POLL_SPAWN_TIMEOUT_MS) so a single slow PowerShell
* invocation cannot exceed the waitForPortFreeSync wall-clock budget.
* Only checks whether any process is listening — no gateway verification
* needed because we already killed the stale gateway in the prior step.
*/
function pollPortOnceWindows(port) {
	try {
		const result = readWindowsListeningPidsResultSync(port, POLL_SPAWN_TIMEOUT_MS);
		if (!result.ok) return {
			free: null,
			permanent: result.permanent
		};
		return result.pids.length === 0 ? { free: true } : { free: false };
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
*
* On Unix: sends SIGTERM, waits briefly, then SIGKILL for survivors.
* On Windows: uses taskkill (graceful first, then /F for force-kill).
*/
function terminateStaleProcessesSync(pids) {
	if (process.platform === "win32") return terminateStaleProcessesWindows(pids);
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
* Windows-specific process termination using taskkill.
* Sends a graceful taskkill first (/T for tree), waits, then escalates to /F.
*/
function terminateStaleProcessesWindows(pids) {
	const taskkillPath = path.join(process.env.SystemRoot ?? "C:\\Windows", "System32", "taskkill.exe");
	const killed = [];
	for (const pid of pids) {
		const graceful = spawnSync(taskkillPath, [
			"/T",
			"/PID",
			String(pid)
		], {
			stdio: "ignore",
			timeout: 5e3,
			windowsHide: true
		});
		if (!(graceful.error != null || (graceful.status ?? 0) !== 0) && !isProcessAlive(pid)) {
			killed.push(pid);
			continue;
		}
		sleepSync(STALE_SIGTERM_WAIT_MS);
		if (!isProcessAlive(pid)) {
			killed.push(pid);
			continue;
		}
		const forced = spawnSync(taskkillPath, [
			"/F",
			"/T",
			"/PID",
			String(pid)
		], {
			stdio: "ignore",
			timeout: 5e3,
			windowsHide: true
		});
		if (forced.error != null || (forced.status ?? 0) !== 0) continue;
		sleepSync(STALE_SIGKILL_WAIT_MS);
		if (!isProcessAlive(pid)) killed.push(pid);
	}
	return killed;
}
function isProcessAlive(pid) {
	try {
		process.kill(pid, 0);
		return true;
	} catch (error) {
		return error.code === "EPERM";
	}
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
		const stalePids = process.platform === "win32" ? (() => {
			const result = findVerifiedWindowsGatewayPidsOnPortResultSync(port);
			if (result.ok) return result.pids;
			waitForPortFreeSync(port);
			return [];
		})() : findGatewayPidsOnPortSync(port);
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
export { parseCmdScriptCommandLine as a, parseCmdSetAssignment as c, parseProcCmdline as d, parseWindowsCmdline as f, readWindowsProcessArgsSync as i, renderCmdSetAssignment as l, findGatewayPidsOnPortSync as n, quoteCmdScriptArg as o, readWindowsListeningPidsOnPortSync as r, assertNoCmdLineBreak as s, cleanStaleGatewayProcessesSync as t, isGatewayArgv as u };
