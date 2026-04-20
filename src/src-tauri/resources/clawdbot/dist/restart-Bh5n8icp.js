import { i as formatErrorMessage } from "./errors-D8p6rxH8.js";
import { n as resolvePreferredOpenClawTmpDir } from "./tmp-openclaw-dir-eyAoWbVe.js";
import { t as createSubsystemLogger } from "./subsystem-Cgmckbux.js";
import { d as resolveGatewayLaunchAgentLabel, m as resolveGatewayWindowsTaskName, p as resolveGatewaySystemdServiceName } from "./paths-icbGFVZa.js";
import { i as getRuntimeConfig } from "./io-5pxHCi7V.js";
import { o as quoteCmdScriptArg, t as cleanStaleGatewayProcessesSync } from "./restart-stale-pids-HQYy2vGd.js";
import { a as resolveTaskScriptPath } from "./schtasks-CFOo0cPs.js";
import "./config-Q9XZc_2I.js";
import fs from "node:fs";
import path from "node:path";
import { spawn, spawnSync } from "node:child_process";
import os from "node:os";
import { randomUUID } from "node:crypto";
//#region src/infra/windows-task-restart.ts
const TASK_RESTART_RETRY_LIMIT = 12;
const TASK_RESTART_RETRY_DELAY_SEC = 1;
function resolveWindowsTaskName(env) {
	const override = env.OPENCLAW_WINDOWS_TASK_NAME?.trim();
	if (override) return override;
	return resolveGatewayWindowsTaskName(env.OPENCLAW_PROFILE);
}
function buildScheduledTaskRestartScript(taskName, taskScriptPath) {
	const quotedTaskName = quoteCmdScriptArg(taskName);
	const lines = [
		"@echo off",
		"setlocal",
		`schtasks /Query /TN ${quotedTaskName} >nul 2>&1`,
		"if errorlevel 1 goto fallback",
		"set /a attempts=0",
		":retry",
		`timeout /t ${TASK_RESTART_RETRY_DELAY_SEC} /nobreak >nul`,
		"set /a attempts+=1",
		`schtasks /Run /TN ${quotedTaskName} >nul 2>&1`,
		"if not errorlevel 1 goto cleanup",
		`if %attempts% GEQ ${TASK_RESTART_RETRY_LIMIT} goto fallback`,
		"goto retry",
		":fallback"
	];
	if (taskScriptPath) {
		const quotedScript = quoteCmdScriptArg(taskScriptPath);
		lines.push(`if exist ${quotedScript} (`, `  start "" /min cmd.exe /d /c ${quotedScript}`, ")");
	}
	lines.push(":cleanup", "del \"%~f0\" >nul 2>&1");
	return lines.join("\r\n");
}
function relaunchGatewayScheduledTask(env = process.env) {
	const taskName = resolveWindowsTaskName(env);
	const taskScriptPath = resolveTaskScriptPath(env);
	const scriptPath = path.join(resolvePreferredOpenClawTmpDir(), `openclaw-schtasks-restart-${randomUUID()}.cmd`);
	const quotedScriptPath = quoteCmdScriptArg(scriptPath);
	try {
		fs.writeFileSync(scriptPath, `${buildScheduledTaskRestartScript(taskName, taskScriptPath)}\r\n`, "utf8");
		spawn("cmd.exe", [
			"/d",
			"/s",
			"/c",
			quotedScriptPath
		], {
			detached: true,
			stdio: "ignore",
			windowsHide: true
		}).unref();
		return {
			ok: true,
			method: "schtasks",
			tried: [`schtasks /Run /TN "${taskName}"`, `cmd.exe /d /s /c ${quotedScriptPath}`]
		};
	} catch (err) {
		try {
			fs.unlinkSync(scriptPath);
		} catch {}
		return {
			ok: false,
			method: "schtasks",
			detail: formatErrorMessage(err),
			tried: [`schtasks /Run /TN "${taskName}"`]
		};
	}
}
//#endregion
//#region src/infra/restart.ts
const SPAWN_TIMEOUT_MS = 2e3;
const SIGUSR1_AUTH_GRACE_MS = 5e3;
const DEFAULT_DEFERRAL_POLL_MS = 500;
const DEFAULT_DEFERRAL_MAX_WAIT_MS = 3e5;
const RESTART_COOLDOWN_MS = 3e4;
const restartLog = createSubsystemLogger("restart");
let sigusr1AuthorizedCount = 0;
let sigusr1AuthorizedUntil = 0;
let sigusr1ExternalAllowed = false;
let preRestartCheck = null;
let restartCycleToken = 0;
let emittedRestartToken = 0;
let consumedRestartToken = 0;
let lastRestartEmittedAt = 0;
let pendingRestartTimer = null;
let pendingRestartDueAt = 0;
let pendingRestartReason;
const activeDeferralPolls = /* @__PURE__ */ new Set();
function hasUnconsumedRestartSignal() {
	return emittedRestartToken > consumedRestartToken;
}
function clearPendingScheduledRestart() {
	if (pendingRestartTimer) clearTimeout(pendingRestartTimer);
	pendingRestartTimer = null;
	pendingRestartDueAt = 0;
	pendingRestartReason = void 0;
}
function clearActiveDeferralPolls() {
	for (const poll of activeDeferralPolls) clearInterval(poll);
	activeDeferralPolls.clear();
}
function summarizeChangedPaths(paths, maxPaths = 6) {
	if (!Array.isArray(paths) || paths.length === 0) return null;
	if (paths.length <= maxPaths) return paths.join(",");
	return `${paths.slice(0, maxPaths).join(",")},+${paths.length - maxPaths} more`;
}
function formatRestartAudit(audit) {
	const actor = typeof audit?.actor === "string" && audit.actor.trim() ? audit.actor.trim() : null;
	const deviceId = typeof audit?.deviceId === "string" && audit.deviceId.trim() ? audit.deviceId.trim() : null;
	const clientIp = typeof audit?.clientIp === "string" && audit.clientIp.trim() ? audit.clientIp.trim() : null;
	const changed = summarizeChangedPaths(audit?.changedPaths);
	const fields = [];
	if (actor) fields.push(`actor=${actor}`);
	if (deviceId) fields.push(`device=${deviceId}`);
	if (clientIp) fields.push(`ip=${clientIp}`);
	if (changed) fields.push(`changedPaths=${changed}`);
	return fields.length > 0 ? fields.join(" ") : "actor=<unknown>";
}
/**
* Register a callback that scheduleGatewaySigusr1Restart checks before emitting SIGUSR1.
* The callback should return the number of pending items (0 = safe to restart).
*/
function setPreRestartDeferralCheck(fn) {
	preRestartCheck = fn;
}
/**
* Emit an authorized SIGUSR1 gateway restart, guarded against duplicate emissions.
* Returns true if SIGUSR1 was emitted, false if a restart was already emitted.
* Both scheduleGatewaySigusr1Restart and the config watcher should use this
* to ensure only one restart fires.
*/
function emitGatewayRestart() {
	if (hasUnconsumedRestartSignal()) {
		clearActiveDeferralPolls();
		clearPendingScheduledRestart();
		return false;
	}
	clearActiveDeferralPolls();
	clearPendingScheduledRestart();
	emittedRestartToken = ++restartCycleToken;
	authorizeGatewaySigusr1Restart();
	try {
		if (process.listenerCount("SIGUSR1") > 0) process.emit("SIGUSR1");
		else process.kill(process.pid, "SIGUSR1");
	} catch {
		emittedRestartToken = consumedRestartToken;
		return false;
	}
	lastRestartEmittedAt = Date.now();
	return true;
}
function resetSigusr1AuthorizationIfExpired(now = Date.now()) {
	if (sigusr1AuthorizedCount <= 0) return;
	if (now <= sigusr1AuthorizedUntil) return;
	sigusr1AuthorizedCount = 0;
	sigusr1AuthorizedUntil = 0;
}
function setGatewaySigusr1RestartPolicy(opts) {
	sigusr1ExternalAllowed = opts?.allowExternal === true;
}
function isGatewaySigusr1RestartExternallyAllowed() {
	return sigusr1ExternalAllowed;
}
function authorizeGatewaySigusr1Restart(delayMs = 0) {
	const delay = Math.max(0, Math.floor(delayMs));
	const expiresAt = Date.now() + delay + SIGUSR1_AUTH_GRACE_MS;
	sigusr1AuthorizedCount += 1;
	if (expiresAt > sigusr1AuthorizedUntil) sigusr1AuthorizedUntil = expiresAt;
}
function consumeGatewaySigusr1RestartAuthorization() {
	resetSigusr1AuthorizationIfExpired();
	if (sigusr1AuthorizedCount <= 0) return false;
	sigusr1AuthorizedCount -= 1;
	if (sigusr1AuthorizedCount <= 0) sigusr1AuthorizedUntil = 0;
	return true;
}
/**
* Mark the currently emitted SIGUSR1 restart cycle as consumed by the run loop.
* This explicitly advances the cycle state instead of resetting emit guards inside
* consumeGatewaySigusr1RestartAuthorization().
*/
function markGatewaySigusr1RestartHandled() {
	if (hasUnconsumedRestartSignal()) consumedRestartToken = emittedRestartToken;
}
/**
* Poll pending work until it drains (or times out), then emit one restart signal.
* Shared by both the direct RPC restart path and the config watcher path.
*/
function deferGatewayRestartUntilIdle(opts) {
	const pollMsRaw = opts.pollMs ?? DEFAULT_DEFERRAL_POLL_MS;
	const pollMs = Math.max(10, Math.floor(pollMsRaw));
	const maxWaitMsRaw = opts.maxWaitMs ?? DEFAULT_DEFERRAL_MAX_WAIT_MS;
	const maxWaitMs = Math.max(pollMs, Math.floor(maxWaitMsRaw));
	let pending;
	try {
		pending = opts.getPendingCount();
	} catch (err) {
		opts.hooks?.onCheckError?.(err);
		emitGatewayRestart();
		return;
	}
	if (pending <= 0) {
		opts.hooks?.onReady?.();
		emitGatewayRestart();
		return;
	}
	opts.hooks?.onDeferring?.(pending);
	const startedAt = Date.now();
	const poll = setInterval(() => {
		let current;
		try {
			current = opts.getPendingCount();
		} catch (err) {
			clearInterval(poll);
			activeDeferralPolls.delete(poll);
			opts.hooks?.onCheckError?.(err);
			emitGatewayRestart();
			return;
		}
		if (current <= 0) {
			clearInterval(poll);
			activeDeferralPolls.delete(poll);
			opts.hooks?.onReady?.();
			emitGatewayRestart();
			return;
		}
		const elapsedMs = Date.now() - startedAt;
		if (elapsedMs >= maxWaitMs) {
			clearInterval(poll);
			activeDeferralPolls.delete(poll);
			opts.hooks?.onTimeout?.(current, elapsedMs);
			emitGatewayRestart();
		}
	}, pollMs);
	activeDeferralPolls.add(poll);
}
function formatSpawnDetail(result) {
	const clean = (value) => {
		return (typeof value === "string" ? value : value ? value.toString() : "").replace(/\s+/g, " ").trim();
	};
	if (result.error) {
		if (result.error instanceof Error) return result.error.message;
		if (typeof result.error === "string") return result.error;
		try {
			return JSON.stringify(result.error);
		} catch {
			return "unknown error";
		}
	}
	const stderr = clean(result.stderr);
	if (stderr) return stderr;
	const stdout = clean(result.stdout);
	if (stdout) return stdout;
	if (typeof result.status === "number") return `exit ${result.status}`;
	return "unknown error";
}
function normalizeSystemdUnit(raw, profile) {
	const unit = raw?.trim();
	if (!unit) return `${resolveGatewaySystemdServiceName(profile)}.service`;
	return unit.endsWith(".service") ? unit : `${unit}.service`;
}
function triggerOpenClawRestart() {
	if (process.env.VITEST || false) return {
		ok: true,
		method: "supervisor",
		detail: "test mode"
	};
	cleanStaleGatewayProcessesSync();
	const tried = [];
	if (process.platform === "linux") {
		const unit = normalizeSystemdUnit(process.env.OPENCLAW_SYSTEMD_UNIT, process.env.OPENCLAW_PROFILE);
		const userArgs = [
			"--user",
			"restart",
			unit
		];
		tried.push(`systemctl ${userArgs.join(" ")}`);
		const userRestart = spawnSync("systemctl", userArgs, {
			encoding: "utf8",
			timeout: SPAWN_TIMEOUT_MS
		});
		if (!userRestart.error && userRestart.status === 0) return {
			ok: true,
			method: "systemd",
			tried
		};
		const systemArgs = ["restart", unit];
		tried.push(`systemctl ${systemArgs.join(" ")}`);
		const systemRestart = spawnSync("systemctl", systemArgs, {
			encoding: "utf8",
			timeout: SPAWN_TIMEOUT_MS
		});
		if (!systemRestart.error && systemRestart.status === 0) return {
			ok: true,
			method: "systemd",
			tried
		};
		return {
			ok: false,
			method: "systemd",
			detail: [`user: ${formatSpawnDetail(userRestart)}`, `system: ${formatSpawnDetail(systemRestart)}`].join("; "),
			tried
		};
	}
	if (process.platform === "win32") return relaunchGatewayScheduledTask(process.env);
	if (process.platform !== "darwin") return {
		ok: false,
		method: "supervisor",
		detail: "unsupported platform restart"
	};
	const label = process.env.OPENCLAW_LAUNCHD_LABEL || resolveGatewayLaunchAgentLabel(process.env.OPENCLAW_PROFILE);
	const uid = typeof process.getuid === "function" ? process.getuid() : void 0;
	const domain = uid !== void 0 ? `gui/${uid}` : "gui/501";
	const target = `${domain}/${label}`;
	const args = [
		"kickstart",
		"-k",
		target
	];
	tried.push(`launchctl ${args.join(" ")}`);
	const res = spawnSync("launchctl", args, {
		encoding: "utf8",
		timeout: SPAWN_TIMEOUT_MS
	});
	if (!res.error && res.status === 0) return {
		ok: true,
		method: "launchctl",
		tried
	};
	const home = process.env.HOME?.trim() || os.homedir();
	const bootstrapArgs = [
		"bootstrap",
		domain,
		path.join(home, "Library", "LaunchAgents", `${label}.plist`)
	];
	tried.push(`launchctl ${bootstrapArgs.join(" ")}`);
	const boot = spawnSync("launchctl", bootstrapArgs, {
		encoding: "utf8",
		timeout: SPAWN_TIMEOUT_MS
	});
	if (boot.error || boot.status !== 0 && boot.status !== null) return {
		ok: false,
		method: "launchctl",
		detail: formatSpawnDetail(boot),
		tried
	};
	const retryArgs = [
		"kickstart",
		"-k",
		target
	];
	tried.push(`launchctl ${retryArgs.join(" ")}`);
	const retry = spawnSync("launchctl", retryArgs, {
		encoding: "utf8",
		timeout: SPAWN_TIMEOUT_MS
	});
	if (!retry.error && retry.status === 0) return {
		ok: true,
		method: "launchctl",
		tried
	};
	return {
		ok: false,
		method: "launchctl",
		detail: formatSpawnDetail(retry),
		tried
	};
}
function scheduleGatewaySigusr1Restart(opts) {
	const delayMsRaw = typeof opts?.delayMs === "number" && Number.isFinite(opts.delayMs) ? Math.floor(opts.delayMs) : 2e3;
	const delayMs = Math.min(Math.max(delayMsRaw, 0), 6e4);
	const reason = typeof opts?.reason === "string" && opts.reason.trim() ? opts.reason.trim().slice(0, 200) : void 0;
	const mode = process.listenerCount("SIGUSR1") > 0 ? "emit" : "signal";
	const nowMs = Date.now();
	const cooldownMsApplied = Math.max(0, lastRestartEmittedAt + RESTART_COOLDOWN_MS - nowMs);
	const requestedDueAt = nowMs + delayMs + cooldownMsApplied;
	if (hasUnconsumedRestartSignal()) {
		restartLog.warn(`restart request coalesced (already in-flight) reason=${reason ?? "unspecified"} ${formatRestartAudit(opts?.audit)}`);
		return {
			ok: true,
			pid: process.pid,
			signal: "SIGUSR1",
			delayMs: 0,
			reason,
			mode,
			coalesced: true,
			cooldownMsApplied
		};
	}
	if (pendingRestartTimer) {
		const remainingMs = Math.max(0, pendingRestartDueAt - nowMs);
		if (requestedDueAt < pendingRestartDueAt) {
			restartLog.warn(`restart request rescheduled earlier reason=${reason ?? "unspecified"} pendingReason=${pendingRestartReason ?? "unspecified"} oldDelayMs=${remainingMs} newDelayMs=${Math.max(0, requestedDueAt - nowMs)} ${formatRestartAudit(opts?.audit)}`);
			clearPendingScheduledRestart();
		} else {
			restartLog.warn(`restart request coalesced (already scheduled) reason=${reason ?? "unspecified"} pendingReason=${pendingRestartReason ?? "unspecified"} delayMs=${remainingMs} ${formatRestartAudit(opts?.audit)}`);
			return {
				ok: true,
				pid: process.pid,
				signal: "SIGUSR1",
				delayMs: remainingMs,
				reason,
				mode,
				coalesced: true,
				cooldownMsApplied
			};
		}
	}
	pendingRestartDueAt = requestedDueAt;
	pendingRestartReason = reason;
	pendingRestartTimer = setTimeout(() => {
		pendingRestartTimer = null;
		pendingRestartDueAt = 0;
		pendingRestartReason = void 0;
		const pendingCheck = preRestartCheck;
		if (!pendingCheck) {
			emitGatewayRestart();
			return;
		}
		deferGatewayRestartUntilIdle({
			getPendingCount: pendingCheck,
			maxWaitMs: getRuntimeConfig().gateway?.reload?.deferralTimeoutMs
		});
	}, Math.max(0, requestedDueAt - nowMs));
	return {
		ok: true,
		pid: process.pid,
		signal: "SIGUSR1",
		delayMs: Math.max(0, requestedDueAt - nowMs),
		reason,
		mode,
		coalesced: false,
		cooldownMsApplied
	};
}
//#endregion
export { markGatewaySigusr1RestartHandled as a, setPreRestartDeferralCheck as c, isGatewaySigusr1RestartExternallyAllowed as i, triggerOpenClawRestart as l, deferGatewayRestartUntilIdle as n, scheduleGatewaySigusr1Restart as o, emitGatewayRestart as r, setGatewaySigusr1RestartPolicy as s, consumeGatewaySigusr1RestartAuthorization as t };
