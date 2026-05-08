import { c as normalizeOptionalString, s as normalizeOptionalLowercaseString } from "./string-coerce-Bje8XVt9.js";
import { _ as resolveStateDir, t as CONFIG_PATH, u as resolveGatewayPort } from "./paths-B2cMK-wd.js";
import { i as formatErrorMessage } from "./errors-CDFVCV9D.js";
import { t as isTruthyEnvValue } from "./env-BAymvSVL.js";
import { t as formatDocsLink } from "./links-BszRQhGa.js";
import { n as isRich, r as theme, t as colorize } from "./theme-B128avno.js";
import { n as inheritOptionFromParent } from "./command-options-DR-PifHH.js";
import { t as addGatewayServiceCommands } from "./register-service-commands-CuwbfBXm.js";
import { t as formatCliCommand } from "./command-format-BORwwHyH.js";
import { g as shortenHomePath, p as resolveUserPath } from "./utils-DvkbxKCZ.js";
import { d as resolveGatewayLaunchAgentLabel, m as resolveGatewayWindowsTaskName, p as resolveGatewaySystemdServiceName } from "./paths-Dxz5MWt4.js";
import { n as defaultRuntime } from "./runtime-izpjJukX.js";
import { o as hasConfiguredSecretInput } from "./types.secrets-ClP-vJ-P.js";
import { S as setVerbose } from "./logger-BYIbL3gn.js";
import "./globals-CJu56k75.js";
import { c as setConsoleTimestampPrefix, s as setConsoleSubsystemFilter } from "./console-D6VW2Y3e.js";
import { t as createSubsystemLogger } from "./subsystem-rHhUC6qs.js";
import { m as resolveGatewayBindHost, n as isContainerEnvironment, t as defaultGatewayBindMode } from "./net-BBCaEpfz.js";
import "./auth-Chs4IZd-.js";
import { n as resolveGatewayAuth } from "./auth-resolve-D9vCjzKT.js";
import { n as resolveDefaultAgentWorkspaceDir } from "./workspace-default-ClDnTm-0.js";
import { _ as waitForBundledRuntimeDepsInstallIdle, g as getActiveBundledRuntimeDepsInstallCount } from "./bundled-runtime-root-DEMD7-O_.js";
import { _ as recoverConfigFromLastKnownGood, g as recoverConfigFromJsonRootSuffix, i as getRuntimeConfig, l as readBestEffortConfig, r as createConfigIO, u as readConfigFileSnapshot } from "./io-CFdEhZuM.js";
import { r as replaceConfigFile } from "./config--k_1dtUP.js";
import { a as formatFutureConfigActionBlock, o as resolveFutureConfigActionBlock, r as resolveGatewayService } from "./service-CZlUBsZA.js";
import { t as cleanStaleGatewayProcessesSync } from "./restart-stale-pids-BQxFGeFd.js";
import { a as inspectPortUsage, s as formatPortDiagnostics } from "./ports-bfXSW6vy.js";
import { t as parsePort } from "./parse-port-TF7Phonh.js";
import { i as GATEWAY_CLIENT_NAMES, r as GATEWAY_CLIENT_MODES } from "./client-info-B22NhLQV.js";
import { c as peekGatewaySigusr1RestartReason, f as triggerOpenClawRestart, l as scheduleGatewaySigusr1Restart, n as consumeGatewayRestartIntentSync, o as isGatewaySigusr1RestartExternallyAllowed, r as consumeGatewaySigusr1RestartAuthorization, s as markGatewaySigusr1RestartHandled } from "./restart-BEJNVwEm.js";
import { a as getActiveTaskCount, c as markGatewayDraining, d as waitForActiveTasks, l as resetAllLanes } from "./command-queue-O7Nzaeee.js";
import { v as resolveWorkspaceTemplateDir } from "./workspace-Ddypv-c6.js";
import { r as callGateway } from "./call-CP7A3sdw.js";
import { m as writeRestartSentinel, s as markUpdateRestartSentinelFailure } from "./restart-sentinel-xJkrCnsf.js";
import { f as getActiveEmbeddedRunCount, t as abortEmbeddedPiRun, u as waitForActiveEmbeddedRuns } from "./runs-CCsjme9h.js";
import { _ as selectDiagnosticStabilitySnapshot, f as writeDiagnosticStabilityBundleForFailureSync, h as normalizeDiagnosticStabilityQuery } from "./diagnostic-stability-bundle-qDPYowjl.js";
import { n as parseTimeoutMsWithFallback } from "./parse-timeout-KACUMoby.js";
import { n as withProgress } from "./progress-CmC4nq1O.js";
import { n as runCommandWithRuntime } from "./cli-utils-Bey8_EmD.js";
import { n as setGatewayWsLogStyle } from "./ws-logging-CqXVLF9i.js";
import { t as formatHelpExamples } from "./help-format-DNTD3upA.js";
import { t as readSecretFromFile } from "./secret-file-WL6e2ril.js";
import { n as buildGatewayDiscoveryTarget } from "./gateway-discovery-targets-9UU82bx_.js";
import { o as resolveControlUiRootSync } from "./control-ui-assets-BxnfkIdw.js";
import { n as acquireGatewayLock, t as GatewayLockError } from "./gateway-lock-BxtQ23ET.js";
import { t as detectRespawnSupervisor } from "./supervisor-markers-DFFvMHRG.js";
import { n as forceFreePortAndWait, r as waitForPortBindable } from "./ports-CUmvj7Fu.js";
import { o as handleReset } from "./onboard-helpers-mX5Q_dhT.js";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { spawn } from "node:child_process";
import net from "node:net";
//#region src/cli/gateway-cli/call.ts
const gatewayCallOpts = (cmd) => cmd.option("--url <url>", "Gateway WebSocket URL (defaults to gateway.remote.url when configured)").option("--token <token>", "Gateway token (if required)").option("--password <password>", "Gateway password (password auth)").option("--timeout <ms>", "Timeout in ms", "10000").option("--expect-final", "Wait for final response (agent)", false).option("--json", "Output JSON", false);
const callGatewayCli = async (method, opts, params) => withProgress({
	label: `Gateway ${method}`,
	indeterminate: true,
	enabled: opts.json !== true
}, async () => await callGateway({
	config: opts.config,
	url: opts.url,
	token: opts.token,
	password: opts.password,
	method,
	params,
	expectFinal: Boolean(opts.expectFinal),
	timeoutMs: Number(opts.timeout ?? 1e4),
	clientName: GATEWAY_CLIENT_NAMES.CLI,
	mode: GATEWAY_CLIENT_MODES.CLI
}));
//#endregion
//#region src/cli/gateway-cli/discover.ts
function parseDiscoverTimeoutMs(raw, fallbackMs) {
	return parseTimeoutMsWithFallback(raw, fallbackMs, { invalidType: "error" });
}
function pickBeaconHost(beacon) {
	return buildGatewayDiscoveryTarget(beacon).endpoint?.host ?? null;
}
function pickGatewayPort(beacon) {
	return buildGatewayDiscoveryTarget(beacon).endpoint?.port ?? null;
}
function dedupeBeacons(beacons) {
	const out = [];
	const seen = /* @__PURE__ */ new Set();
	for (const b of beacons) {
		const host = pickBeaconHost(b) ?? "";
		const key = [
			b.domain ?? "",
			b.instanceName ?? "",
			b.displayName ?? "",
			host,
			String(b.port ?? ""),
			String(b.gatewayPort ?? "")
		].join("|");
		if (seen.has(key)) continue;
		seen.add(key);
		out.push(b);
	}
	return out;
}
function renderBeaconLines(beacon, rich) {
	const target = buildGatewayDiscoveryTarget(beacon);
	const lines = [`- ${colorize(rich, theme.accentBright, target.title)} ${colorize(rich, theme.muted, target.domain)}`];
	if (beacon.tailnetDns) lines.push(`  ${colorize(rich, theme.info, "tailnet")}: ${beacon.tailnetDns}`);
	if (beacon.lanHost) lines.push(`  ${colorize(rich, theme.info, "lan")}: ${beacon.lanHost}`);
	if (beacon.host) lines.push(`  ${colorize(rich, theme.info, "host")}: ${beacon.host}`);
	if (target.wsUrl) lines.push(`  ${colorize(rich, theme.muted, "ws")}: ${colorize(rich, theme.command, target.wsUrl)}`);
	if (beacon.role) lines.push(`  ${colorize(rich, theme.muted, "role")}: ${beacon.role}`);
	if (beacon.transport) lines.push(`  ${colorize(rich, theme.muted, "transport")}: ${beacon.transport}`);
	if (beacon.gatewayTls) {
		const fingerprint = beacon.gatewayTlsFingerprintSha256 ? `sha256 ${beacon.gatewayTlsFingerprintSha256}` : "enabled";
		lines.push(`  ${colorize(rich, theme.muted, "tls")}: ${fingerprint}`);
	}
	if (target.endpoint && target.sshPort) {
		const ssh = `ssh -N -L 18789:127.0.0.1:18789 <user>@${target.endpoint.host} -p ${target.sshPort}`;
		lines.push(`  ${colorize(rich, theme.muted, "ssh")}: ${colorize(rich, theme.command, ssh)}`);
	}
	return lines;
}
//#endregion
//#region src/cli/gateway-cli/dev.ts
const DEV_IDENTITY_NAME = "C3-PO";
const DEV_IDENTITY_THEME = "protocol droid";
const DEV_IDENTITY_EMOJI = "🤖";
const DEV_AGENT_WORKSPACE_SUFFIX = "dev";
async function loadDevTemplate(name, fallback) {
	try {
		const templateDir = await resolveWorkspaceTemplateDir();
		const raw = await fs.promises.readFile(path.join(templateDir, name), "utf-8");
		if (!raw.startsWith("---")) return raw;
		const endIndex = raw.indexOf("\n---", 3);
		if (endIndex === -1) return raw;
		return raw.slice(endIndex + 4).replace(/^\s+/, "");
	} catch {
		return fallback;
	}
}
const resolveDevWorkspaceDir = (env = process.env) => {
	const baseDir = resolveDefaultAgentWorkspaceDir(env, os.homedir);
	if (normalizeOptionalLowercaseString(env.OPENCLAW_PROFILE) === "dev") return baseDir;
	return `${baseDir}-${DEV_AGENT_WORKSPACE_SUFFIX}`;
};
async function writeFileIfMissing(filePath, content) {
	try {
		await fs.promises.writeFile(filePath, content, {
			encoding: "utf-8",
			flag: "wx"
		});
	} catch (err) {
		if (err.code !== "EEXIST") throw err;
	}
}
async function ensureDevWorkspace(dir) {
	const resolvedDir = resolveUserPath(dir);
	await fs.promises.mkdir(resolvedDir, { recursive: true });
	const [agents, soul, tools, identity, user] = await Promise.all([
		loadDevTemplate("AGENTS.dev.md", `# AGENTS.md - OpenClaw Dev Workspace\n\nDefault dev workspace for openclaw gateway --dev.\n`),
		loadDevTemplate("SOUL.dev.md", `# SOUL.md - Dev Persona\n\nProtocol droid for debugging and operations.\n`),
		loadDevTemplate("TOOLS.dev.md", `# TOOLS.md - User Tool Notes (editable)\n\nAdd your local tool notes here.\n`),
		loadDevTemplate("IDENTITY.dev.md", `# IDENTITY.md - Agent Identity\n\n- Name: ${DEV_IDENTITY_NAME}\n- Creature: protocol droid\n- Vibe: ${DEV_IDENTITY_THEME}\n- Emoji: ${DEV_IDENTITY_EMOJI}\n`),
		loadDevTemplate("USER.dev.md", `# USER.md - User Profile\n\n- Name:\n- Preferred address:\n- Notes:\n`)
	]);
	await writeFileIfMissing(path.join(resolvedDir, "AGENTS.md"), agents);
	await writeFileIfMissing(path.join(resolvedDir, "SOUL.md"), soul);
	await writeFileIfMissing(path.join(resolvedDir, "TOOLS.md"), tools);
	await writeFileIfMissing(path.join(resolvedDir, "IDENTITY.md"), identity);
	await writeFileIfMissing(path.join(resolvedDir, "USER.md"), user);
}
async function ensureDevGatewayConfig(opts) {
	const workspace = resolveDevWorkspaceDir();
	if (opts.reset) await handleReset("full", workspace, defaultRuntime);
	const configPath = createConfigIO().configPath;
	const configExists = fs.existsSync(configPath);
	if (!opts.reset && configExists) return;
	await replaceConfigFile({
		nextConfig: {
			gateway: {
				mode: "local",
				bind: "loopback"
			},
			agents: {
				defaults: {
					workspace,
					skipBootstrap: true
				},
				list: [{
					id: "dev",
					default: true,
					workspace,
					identity: {
						name: DEV_IDENTITY_NAME,
						theme: DEV_IDENTITY_THEME,
						emoji: DEV_IDENTITY_EMOJI
					}
				}]
			}
		},
		afterWrite: { mode: "auto" }
	});
	await ensureDevWorkspace(workspace);
	defaultRuntime.log(`Dev config ready: ${shortenHomePath(configPath)}`);
	defaultRuntime.log(`Dev workspace ready: ${shortenHomePath(resolveUserPath(workspace))}`);
}
//#endregion
//#region src/infra/process-respawn.ts
function isTruthy(value) {
	const normalized = normalizeOptionalLowercaseString(value);
	return normalized === "1" || normalized === "true" || normalized === "yes" || normalized === "on";
}
function spawnDetachedGatewayProcess() {
	const args = [...process.execArgv, ...process.argv.slice(1)];
	const child = spawn(process.execPath, args, {
		env: process.env,
		detached: true,
		stdio: "inherit"
	});
	child.unref();
	return {
		child,
		pid: child.pid ?? void 0
	};
}
/**
* Attempt to restart this process with a fresh PID.
* - supervised environments (launchd/systemd/schtasks): caller should exit and let supervisor restart
* - OPENCLAW_NO_RESPAWN=1: caller should keep in-process restart behavior (tests/dev)
* - otherwise: spawn detached child with current argv/execArgv, then caller exits
*/
function restartGatewayProcessWithFreshPid() {
	if (isTruthy(process.env.OPENCLAW_NO_RESPAWN)) return { mode: "disabled" };
	const supervisor = detectRespawnSupervisor(process.env);
	if (supervisor) {
		if (supervisor === "schtasks") {
			const restart = triggerOpenClawRestart();
			if (!restart.ok) return {
				mode: "failed",
				detail: restart.detail ?? `${restart.method} restart failed`
			};
		}
		return { mode: "supervised" };
	}
	if (process.platform === "win32") return {
		mode: "disabled",
		detail: "win32: detached respawn unsupported without Scheduled Task markers"
	};
	try {
		const { pid } = spawnDetachedGatewayProcess();
		return {
			mode: "spawned",
			pid
		};
	} catch (err) {
		return {
			mode: "failed",
			detail: formatErrorMessage(err)
		};
	}
}
/**
* Update restarts must replace the OS process so the new code runs from a
* fresh module graph after package files have changed on disk.
*
* Unlike the generic restart path, update mode allows detached respawn on
* unmanaged Windows installs because there is no safe in-process fallback once
* the installed package contents have been replaced.
*/
function respawnGatewayProcessForUpdate() {
	if (isTruthy(process.env.OPENCLAW_NO_RESPAWN)) return {
		mode: "disabled",
		detail: "OPENCLAW_NO_RESPAWN"
	};
	const supervisor = detectRespawnSupervisor(process.env);
	if (supervisor) {
		if (supervisor === "schtasks") {
			const restart = triggerOpenClawRestart();
			if (!restart.ok) return {
				mode: "failed",
				detail: restart.detail ?? `${restart.method} restart failed`
			};
		}
		return { mode: "supervised" };
	}
	try {
		const { child, pid } = spawnDetachedGatewayProcess();
		return {
			mode: "spawned",
			pid,
			child
		};
	} catch (err) {
		return {
			mode: "failed",
			detail: formatErrorMessage(err)
		};
	}
}
//#endregion
//#region src/process/restart-recovery.ts
/**
* Returns an iteration hook for in-process restart loops.
* The first call is considered initial startup and does nothing.
* Each subsequent call represents a restart iteration and invokes `onRestart`.
*/
function createRestartIterationHook(onRestart) {
	let isFirstIteration = true;
	return () => {
		if (isFirstIteration) {
			isFirstIteration = false;
			return false;
		}
		onRestart();
		return true;
	};
}
//#endregion
//#region src/cli/gateway-cli/run-loop.ts
const gatewayLog$1 = createSubsystemLogger("gateway");
const LAUNCHD_SUPERVISED_RESTART_EXIT_DELAY_MS = 1500;
const DEFAULT_RESTART_DRAIN_TIMEOUT_MS = 3e5;
const RESTART_DRAIN_STILL_PENDING_WARN_MS = 3e4;
const UPDATE_RESPAWN_HEALTH_TIMEOUT_MS = 1e4;
const UPDATE_RESPAWN_HEALTH_POLL_MS = 200;
async function waitForGatewayPortReady(host, port) {
	return await new Promise((resolve) => {
		const socket = net.createConnection({
			host,
			port
		});
		let settled = false;
		const finish = (value) => {
			if (settled) return;
			settled = true;
			clearTimeout(timer);
			socket.removeAllListeners();
			socket.destroy();
			resolve(value);
		};
		const timer = setTimeout(() => {
			finish(false);
		}, UPDATE_RESPAWN_HEALTH_POLL_MS);
		socket.once("connect", () => finish(true));
		socket.once("error", () => finish(false));
	});
}
async function waitForHealthyGatewayChild(port, _pid, host = "127.0.0.1", timeoutMs = UPDATE_RESPAWN_HEALTH_TIMEOUT_MS) {
	const deadline = Date.now() + timeoutMs;
	while (Date.now() < deadline) {
		if (await waitForGatewayPortReady(host, port)) return true;
		await new Promise((resolve) => {
			setTimeout(resolve, UPDATE_RESPAWN_HEALTH_POLL_MS);
		});
	}
	return false;
}
async function runGatewayLoop(params) {
	let startupStartedAt = Date.now();
	let lock = await acquireGatewayLock({ port: params.lockPort });
	let server = null;
	let shuttingDown = false;
	let restartResolver = null;
	const waitForHealthyChild = params.waitForHealthyChild ?? waitForHealthyGatewayChild;
	const cleanupSignals = () => {
		process.removeListener("SIGTERM", onSigterm);
		process.removeListener("SIGINT", onSigint);
		process.removeListener("SIGUSR1", onSigusr1);
	};
	const exitProcess = (code) => {
		cleanupSignals();
		params.runtime.exit(code);
	};
	const writeStabilityBundle = (reason, error) => {
		const result = writeDiagnosticStabilityBundleForFailureSync(reason, error);
		if ("message" in result) gatewayLog$1.warn(result.message);
	};
	const releaseLockIfHeld = async () => {
		if (!lock) return false;
		await lock.release();
		lock = null;
		return true;
	};
	const reacquireLockForInProcessRestart = async () => {
		try {
			startupStartedAt = Date.now();
			lock = await acquireGatewayLock({ port: params.lockPort });
			return true;
		} catch (err) {
			gatewayLog$1.error(`failed to reacquire gateway lock for in-process restart: ${String(err)}`);
			exitProcess(1);
			return false;
		}
	};
	const handleRestartAfterServerClose = async (restartReason) => {
		const hadLock = await releaseLockIfHeld();
		if (restartReason === "update.run") {
			const respawn = respawnGatewayProcessForUpdate();
			if (respawn.mode === "spawned") {
				const port = params.lockPort;
				if (typeof port === "number" ? await waitForHealthyChild(port, respawn.pid, params.healthHost ?? "127.0.0.1") : false) {
					gatewayLog$1.info(`restart mode: update process respawn (spawned pid ${respawn.pid ?? "unknown"})`);
					exitProcess(0);
					return;
				}
				gatewayLog$1.warn(`update respawn child did not become healthy (${respawn.pid ?? "unknown"}); falling back to in-process restart`);
				try {
					respawn.child?.kill();
				} catch {}
				await markUpdateRestartSentinelFailure("restart-unhealthy").catch((err) => {
					gatewayLog$1.warn(`failed to mark update restart sentinel unhealthy: ${String(err)}`);
				});
				if (hadLock && !await reacquireLockForInProcessRestart()) return;
				shuttingDown = false;
				restartResolver?.();
				return;
			}
			if (respawn.mode === "supervised") {
				gatewayLog$1.info("restart mode: update process respawn (supervisor restart)");
				if (detectRespawnSupervisor(process.env, process.platform) === "launchd") await new Promise((resolve) => {
					setTimeout(resolve, LAUNCHD_SUPERVISED_RESTART_EXIT_DELAY_MS);
				});
				exitProcess(0);
				return;
			}
			if (respawn.mode === "failed") {
				gatewayLog$1.warn(`update respawn failed (${respawn.detail ?? "unknown error"}); falling back to in-process restart`);
				await markUpdateRestartSentinelFailure("restart-unhealthy").catch((err) => {
					gatewayLog$1.warn(`failed to mark update restart sentinel unhealthy: ${String(err)}`);
				});
			} else gatewayLog$1.info(`restart mode: in-process restart (${respawn.detail ?? "OPENCLAW_NO_RESPAWN"})`);
			if (hadLock && !await reacquireLockForInProcessRestart()) return;
			shuttingDown = false;
			restartResolver?.();
			return;
		}
		const respawn = restartGatewayProcessWithFreshPid();
		if (respawn.mode === "spawned" || respawn.mode === "supervised") {
			const modeLabel = respawn.mode === "spawned" ? `spawned pid ${respawn.pid ?? "unknown"}` : "supervisor restart";
			gatewayLog$1.info(`restart mode: full process restart (${modeLabel})`);
			if (respawn.mode === "supervised" && detectRespawnSupervisor(process.env, process.platform) === "launchd") await new Promise((resolve) => {
				setTimeout(resolve, LAUNCHD_SUPERVISED_RESTART_EXIT_DELAY_MS);
			});
			exitProcess(0);
			return;
		}
		if (respawn.mode === "failed") {
			writeStabilityBundle("gateway.restart_respawn_failed");
			gatewayLog$1.warn(`full process restart failed (${respawn.detail ?? "unknown error"}); falling back to in-process restart`);
		} else gatewayLog$1.info(`restart mode: in-process restart (${respawn.detail ?? "OPENCLAW_NO_RESPAWN"})`);
		if (hadLock && !await reacquireLockForInProcessRestart()) return;
		shuttingDown = false;
		restartResolver?.();
	};
	const handleStopAfterServerClose = async () => {
		await releaseLockIfHeld();
		exitProcess(0);
	};
	const SHUTDOWN_TIMEOUT_MS = 25e3;
	const resolveRestartDrainTimeoutMs = () => {
		try {
			const timeoutMs = getRuntimeConfig().gateway?.reload?.deferralTimeoutMs;
			return typeof timeoutMs === "number" && Number.isFinite(timeoutMs) && timeoutMs > 0 ? timeoutMs : void 0;
		} catch {
			return DEFAULT_RESTART_DRAIN_TIMEOUT_MS;
		}
	};
	const request = (action, signal, restartReason) => {
		if (shuttingDown) {
			gatewayLog$1.info(`received ${signal} during shutdown; ignoring`);
			return;
		}
		shuttingDown = true;
		const isRestart = action === "restart";
		const restartDrainTimeoutMs = isRestart ? resolveRestartDrainTimeoutMs() : 0;
		gatewayLog$1.info(`received ${signal}; ${isRestart ? "restarting" : "shutting down"}`);
		let forceExitTimer = null;
		const armForceExitTimer = (forceExitMs) => {
			if (forceExitTimer) return;
			forceExitTimer = setTimeout(() => {
				gatewayLog$1.error("shutdown timed out; exiting without full cleanup");
				writeStabilityBundle(isRestart ? "gateway.restart_shutdown_timeout" : "gateway.stop_shutdown_timeout");
				exitProcess(1);
			}, forceExitMs);
		};
		const clearForceExitTimer = () => {
			if (!forceExitTimer) return;
			clearTimeout(forceExitTimer);
			forceExitTimer = null;
		};
		if (!isRestart) armForceExitTimer(SHUTDOWN_TIMEOUT_MS);
		else if (restartDrainTimeoutMs !== void 0) armForceExitTimer(restartDrainTimeoutMs + SHUTDOWN_TIMEOUT_MS);
		const formatRestartDrainBudget = () => restartDrainTimeoutMs === void 0 ? "without a timeout" : `with timeout ${restartDrainTimeoutMs}ms`;
		const createStillPendingDrainLogger = () => setInterval(() => {
			gatewayLog$1.warn(`still draining ${getActiveTaskCount()} active task(s), ${getActiveEmbeddedRunCount()} active embedded run(s), and ${getActiveBundledRuntimeDepsInstallCount()} runtime deps install(s) before restart`);
		}, RESTART_DRAIN_STILL_PENDING_WARN_MS);
		const armCloseForceExitTimerForIndefiniteRestart = () => {
			if (isRestart && restartDrainTimeoutMs === void 0) armForceExitTimer(SHUTDOWN_TIMEOUT_MS);
		};
		(async () => {
			try {
				if (isRestart) {
					markGatewayDraining();
					const activeTasks = getActiveTaskCount();
					const activeRuns = getActiveEmbeddedRunCount();
					const activeRuntimeDepsInstalls = getActiveBundledRuntimeDepsInstallCount();
					if (activeRuns > 0) abortEmbeddedPiRun(void 0, { mode: "compacting" });
					if (activeTasks > 0 || activeRuns > 0 || activeRuntimeDepsInstalls > 0) {
						gatewayLog$1.info(`draining ${activeTasks} active task(s), ${activeRuns} active embedded run(s), and ${activeRuntimeDepsInstalls} runtime deps install(s) before restart ${formatRestartDrainBudget()}`);
						const stillPendingDrainLogger = createStillPendingDrainLogger();
						const [tasksDrain, runsDrain, runtimeDepsDrain] = await Promise.all([
							activeTasks > 0 ? waitForActiveTasks(restartDrainTimeoutMs) : Promise.resolve({ drained: true }),
							activeRuns > 0 ? waitForActiveEmbeddedRuns(restartDrainTimeoutMs) : Promise.resolve({ drained: true }),
							activeRuntimeDepsInstalls > 0 ? waitForBundledRuntimeDepsInstallIdle(restartDrainTimeoutMs) : Promise.resolve({ drained: true })
						]).finally(() => clearInterval(stillPendingDrainLogger));
						if (tasksDrain.drained && runsDrain.drained && runtimeDepsDrain.drained) gatewayLog$1.info("all active work drained");
						else {
							gatewayLog$1.warn("drain timeout reached; proceeding with restart");
							abortEmbeddedPiRun(void 0, { mode: "all" });
						}
					}
				}
				armCloseForceExitTimerForIndefiniteRestart();
				await server?.close({
					reason: isRestart ? "gateway restarting" : "gateway stopping",
					restartExpectedMs: isRestart ? 1500 : null
				});
			} catch (err) {
				gatewayLog$1.error(`shutdown error: ${String(err)}`);
			} finally {
				clearForceExitTimer();
				server = null;
				if (isRestart) await handleRestartAfterServerClose(restartReason);
				else await handleStopAfterServerClose();
			}
		})();
	};
	const onSigterm = () => {
		gatewayLog$1.info("signal SIGTERM received");
		request(consumeGatewayRestartIntentSync() ? "restart" : "stop", "SIGTERM");
	};
	const onSigint = () => {
		gatewayLog$1.info("signal SIGINT received");
		request("stop", "SIGINT");
	};
	const onSigusr1 = () => {
		gatewayLog$1.info("signal SIGUSR1 received");
		if (!consumeGatewaySigusr1RestartAuthorization()) {
			if (!isGatewaySigusr1RestartExternallyAllowed()) {
				gatewayLog$1.warn("SIGUSR1 restart ignored (not authorized; commands.restart=false or use gateway tool).");
				return;
			}
			if (shuttingDown) {
				gatewayLog$1.info("received SIGUSR1 during shutdown; ignoring");
				return;
			}
			scheduleGatewaySigusr1Restart({
				delayMs: 0,
				reason: "SIGUSR1"
			});
			return;
		}
		const restartReason = peekGatewaySigusr1RestartReason();
		markGatewaySigusr1RestartHandled();
		request("restart", "SIGUSR1", restartReason);
	};
	process.on("SIGTERM", onSigterm);
	process.on("SIGINT", onSigint);
	process.on("SIGUSR1", onSigusr1);
	try {
		const onIteration = createRestartIterationHook(() => {
			resetAllLanes();
		});
		let isFirstStart = true;
		for (;;) {
			onIteration();
			try {
				server = await params.start({ startupStartedAt });
				isFirstStart = false;
			} catch (err) {
				if (isFirstStart) throw err;
				server = null;
				await releaseLockIfHeld();
				const errMsg = formatErrorMessage(err);
				const errStack = err instanceof Error && err.stack ? `\n${err.stack}` : "";
				writeStabilityBundle("gateway.restart_startup_failed", err);
				gatewayLog$1.error(`gateway startup failed: ${errMsg}. Process will stay alive; fix the issue and restart.${errStack}`);
			}
			await new Promise((resolve) => {
				restartResolver = resolve;
			});
		}
	} finally {
		await releaseLockIfHeld();
		cleanupSignals();
	}
}
//#endregion
//#region src/cli/gateway-cli/shared.ts
const toOptionString = (value) => {
	if (typeof value === "string") return value;
	if (typeof value === "number" || typeof value === "bigint") return value.toString();
};
function extractGatewayMiskeys(parsed) {
	if (!parsed || typeof parsed !== "object") return {
		hasGatewayToken: false,
		hasRemoteToken: false
	};
	const gateway = parsed.gateway;
	if (!gateway || typeof gateway !== "object") return {
		hasGatewayToken: false,
		hasRemoteToken: false
	};
	const hasGatewayToken = "token" in gateway;
	const remote = gateway.remote;
	return {
		hasGatewayToken,
		hasRemoteToken: remote && typeof remote === "object" ? "token" in remote : false
	};
}
function renderGatewayServiceStopHints(env = process.env) {
	const profile = env.OPENCLAW_PROFILE;
	switch (process.platform) {
		case "darwin": return [`Tip: ${formatCliCommand("openclaw gateway stop")}`, `Or: launchctl bootout gui/$UID/${resolveGatewayLaunchAgentLabel(profile)}`];
		case "linux": return [`Tip: ${formatCliCommand("openclaw gateway stop")}`, `Or: systemctl --user stop ${resolveGatewaySystemdServiceName(profile)}.service`];
		case "win32": return [`Tip: ${formatCliCommand("openclaw gateway stop")}`, `Or: schtasks /End /TN "${resolveGatewayWindowsTaskName(profile)}"`];
		default: return [`Tip: ${formatCliCommand("openclaw gateway stop")}`];
	}
}
async function maybeExplainGatewayServiceStop() {
	const service = resolveGatewayService();
	let loaded = null;
	try {
		loaded = await service.isLoaded({ env: process.env });
	} catch {
		loaded = null;
	}
	if (loaded === false) return;
	defaultRuntime.error(loaded ? `Gateway service appears ${service.loadedText}. Stop it first.` : "Gateway service status unknown; if supervised, stop it first.");
	for (const hint of renderGatewayServiceStopHints()) defaultRuntime.error(hint);
}
//#endregion
//#region src/cli/gateway-cli/run.ts
const gatewayLog = createSubsystemLogger("gateway");
const GATEWAY_RUN_VALUE_KEYS = [
	"port",
	"bind",
	"token",
	"auth",
	"password",
	"passwordFile",
	"tailscale",
	"wsLog",
	"rawStreamPath"
];
const GATEWAY_RUN_BOOLEAN_KEYS = [
	"tailscaleResetOnExit",
	"allowUnconfigured",
	"dev",
	"reset",
	"force",
	"verbose",
	"cliBackendLogs",
	"claudeCliLogs",
	"compact",
	"rawStream"
];
const SUPERVISED_GATEWAY_LOCK_RETRY_MS = 5e3;
/**
* EX_CONFIG (78) from sysexits.h — used for configuration errors so systemd
* (via RestartPreventExitStatus=78) stops restarting instead of entering a
* restart storm that can render low-resource hosts unresponsive.
*/
const EXIT_CONFIG_ERROR = 78;
const CONFIG_AUTO_RECOVERY_MESSAGE = "Gateway recovered automatically after a failed config change and restored the last known good configuration.";
const GATEWAY_AUTH_MODES = [
	"none",
	"token",
	"password",
	"trusted-proxy"
];
const GATEWAY_TAILSCALE_MODES = [
	"off",
	"serve",
	"funnel"
];
function createGatewayCliStartupTrace() {
	const enabled = isTruthyEnvValue(process.env.OPENCLAW_GATEWAY_STARTUP_TRACE);
	const started = performance.now();
	let last = started;
	const emit = (name, durationMs, totalMs) => {
		if (enabled) gatewayLog.info(`startup trace: ${name} ${durationMs.toFixed(1)}ms total=${totalMs.toFixed(1)}ms`);
	};
	return {
		mark(name) {
			const now = performance.now();
			emit(name, now - last, now - started);
			last = now;
		},
		async measure(name, run) {
			const before = performance.now();
			try {
				return await run();
			} finally {
				const now = performance.now();
				emit(name, now - before, now - started);
				last = now;
			}
		}
	};
}
function warnInlinePasswordFlag() {
	defaultRuntime.error("Warning: --password can be exposed via process listings. Prefer --password-file or OPENCLAW_GATEWAY_PASSWORD.");
}
function resolveGatewayPasswordOption(opts) {
	const direct = toOptionString(opts.password);
	const file = toOptionString(opts.passwordFile);
	if (direct && file) throw new Error("Use either --password or --password-file.");
	if (file) return readSecretFromFile(file, "Gateway password");
	return direct;
}
function parseEnumOption(raw, allowed) {
	if (!raw) return null;
	return allowed.includes(raw) ? raw : null;
}
function formatModeChoices(modes) {
	return modes.map((mode) => `"${mode}"`).join("|");
}
function formatModeErrorList(modes) {
	const quoted = modes.map((mode) => `"${mode}"`);
	if (quoted.length === 0) return "";
	if (quoted.length === 1) return quoted[0];
	if (quoted.length === 2) return `${quoted[0]} or ${quoted[1]}`;
	return `${quoted.slice(0, -1).join(", ")}, or ${quoted[quoted.length - 1]}`;
}
function maybeLogPendingControlUiBuild(cfg) {
	if (cfg.gateway?.controlUi?.enabled === false) return;
	if (toOptionString(cfg.gateway?.controlUi?.root)) return;
	if (resolveControlUiRootSync({
		moduleUrl: import.meta.url,
		argv1: process.argv[1],
		cwd: process.cwd()
	})) return;
	gatewayLog.info("Control UI assets are missing; first startup may spend a few seconds building them before the gateway binds. `pnpm gateway:watch` does not rebuild Control UI assets, so rerun `pnpm ui:build` after UI changes or use `pnpm ui:dev` while developing the Control UI. For a full local dist, run `pnpm build && pnpm ui:build`.");
}
function getGatewayStartGuardErrors(params) {
	if (params.allowUnconfigured || params.mode === "local") return [];
	if (!params.configExists) return [`Missing config. Run \`${formatCliCommand("openclaw setup")}\` or set gateway.mode=local (or pass --allow-unconfigured).`];
	if (params.mode === void 0) return [[
		"Gateway start blocked: existing config is missing gateway.mode.",
		"Treat this as suspicious or clobbered config.",
		`Re-run \`${formatCliCommand("openclaw onboard --mode local")}\` or \`${formatCliCommand("openclaw setup")}\`, set gateway.mode=local manually, or pass --allow-unconfigured.`
	].join(" "), `Config write audit: ${params.configAuditPath}`];
	return [`Gateway start blocked: set gateway.mode=local (current: ${params.mode}) or pass --allow-unconfigured.`, `Config write audit: ${params.configAuditPath}`];
}
async function readGatewayStartupConfig(params) {
	let cfg = await params.startupTrace.measure("cli.config-load", () => readBestEffortConfig());
	let snapshot = await params.startupTrace.measure("cli.config-snapshot", () => readConfigFileSnapshot().catch(() => null));
	if (snapshot?.exists && !snapshot.valid) {
		const invalidSnapshot = snapshot;
		if (await params.startupTrace.measure("cli.config-recovery", () => recoverConfigFromLastKnownGood({
			snapshot: invalidSnapshot,
			reason: "gateway-run-invalid-config"
		}))) {
			gatewayLog.warn(`gateway: restored invalid effective config from last-known-good backup: ${invalidSnapshot.path}`);
			try {
				await writeRestartSentinel({
					kind: "config-auto-recovery",
					status: "ok",
					ts: Date.now(),
					message: CONFIG_AUTO_RECOVERY_MESSAGE,
					stats: {
						mode: "config-auto-recovery",
						reason: "gateway-run-invalid-config",
						after: { restoredFrom: "last-known-good" }
					}
				});
			} catch (err) {
				gatewayLog.warn(`gateway: failed to persist config auto-recovery notice: ${formatErrorMessage(err)}`);
			}
			snapshot = await params.startupTrace.measure("cli.config-snapshot-reload", () => readConfigFileSnapshot().catch(() => null));
		} else if (await params.startupTrace.measure("cli.config-prefix-recovery", () => recoverConfigFromJsonRootSuffix(invalidSnapshot))) {
			gatewayLog.warn(`gateway: repaired invalid effective config by stripping a non-JSON prefix: ${invalidSnapshot.path}`);
			snapshot = await params.startupTrace.measure("cli.config-snapshot-reload", () => readConfigFileSnapshot().catch(() => null));
		}
	}
	if (snapshot?.valid) cfg = snapshot.config;
	return {
		cfg,
		snapshot
	};
}
function resolveGatewayRunOptions(opts, command) {
	const resolved = { ...opts };
	for (const key of GATEWAY_RUN_VALUE_KEYS) {
		const inherited = inheritOptionFromParent(command, key);
		if (key === "wsLog") {
			resolved[key] = inherited ?? resolved[key];
			continue;
		}
		resolved[key] = resolved[key] ?? inherited;
	}
	for (const key of GATEWAY_RUN_BOOLEAN_KEYS) {
		const inherited = inheritOptionFromParent(command, key);
		resolved[key] = Boolean(resolved[key] || inherited);
	}
	return resolved;
}
function isGatewayLockError(err) {
	return err instanceof GatewayLockError || !!err && typeof err === "object" && err.name === "GatewayLockError";
}
function isHealthyGatewayLockError(err) {
	if (!isGatewayLockError(err) || typeof err.message !== "string") return false;
	return err.message.includes("gateway already running") || err.message.includes("another gateway instance is already listening");
}
function maybeWriteGatewayStartupFailureBundle(err) {
	const result = writeDiagnosticStabilityBundleForFailureSync("gateway.startup_failed", err);
	if ("message" in result) gatewayLog.warn(result.message);
}
async function runGatewayCommand$1(opts) {
	const isDevProfile = normalizeOptionalLowercaseString(process.env.OPENCLAW_PROFILE) === "dev";
	const devMode = Boolean(opts.dev) || isDevProfile;
	if (opts.reset && !devMode) {
		defaultRuntime.error("Use --reset with --dev.");
		defaultRuntime.exit(1);
		return;
	}
	setVerbose(Boolean(opts.verbose));
	if (opts.cliBackendLogs || opts.claudeCliLogs) {
		setConsoleSubsystemFilter(["agent/cli-backend"]);
		process.env.OPENCLAW_CLI_BACKEND_LOG_OUTPUT = "1";
	}
	const wsLogRaw = opts.compact ? "compact" : opts.wsLog;
	const wsLogStyle = wsLogRaw === "compact" ? "compact" : wsLogRaw === "full" ? "full" : "auto";
	if (wsLogRaw !== void 0 && wsLogRaw !== "auto" && wsLogRaw !== "compact" && wsLogRaw !== "full") {
		defaultRuntime.error("Invalid --ws-log (use \"auto\", \"full\", \"compact\")");
		defaultRuntime.exit(1);
	}
	setGatewayWsLogStyle(wsLogStyle);
	if (opts.rawStream) process.env.OPENCLAW_RAW_STREAM = "1";
	const rawStreamPath = toOptionString(opts.rawStreamPath);
	if (rawStreamPath) process.env.OPENCLAW_RAW_STREAM_PATH = rawStreamPath;
	const startupTrace = createGatewayCliStartupTrace();
	const { startGatewayServer } = await startupTrace.measure("cli.server-import", () => withProgress({
		label: "Loading gateway modules…",
		indeterminate: true
	}, async () => import("./server-BnrDM4ZY.js")));
	setConsoleTimestampPrefix(true);
	if (devMode) await startupTrace.measure("cli.dev-config", () => ensureDevGatewayConfig({ reset: Boolean(opts.reset) }));
	gatewayLog.info("loading configuration…");
	const { cfg, snapshot } = await readGatewayStartupConfig({ startupTrace });
	maybeLogPendingControlUiBuild(cfg);
	const portOverride = parsePort(opts.port);
	if (opts.port !== void 0 && portOverride === null) {
		defaultRuntime.error("Invalid port");
		defaultRuntime.exit(1);
	}
	const port = portOverride ?? resolveGatewayPort(cfg);
	if (!Number.isFinite(port) || port <= 0) {
		defaultRuntime.error("Invalid port");
		defaultRuntime.exit(1);
	}
	const futureStartupBlock = resolveFutureConfigActionBlock({
		action: "start the gateway service",
		snapshot
	});
	if (futureStartupBlock && process.env.OPENCLAW_SERVICE_MARKER?.trim()) {
		defaultRuntime.error(formatFutureConfigActionBlock(futureStartupBlock));
		defaultRuntime.exit(78);
		return;
	}
	const futureForceBlock = opts.force ? resolveFutureConfigActionBlock({
		action: "force-kill gateway port listeners",
		snapshot
	}) : null;
	if (futureForceBlock) {
		defaultRuntime.error(formatFutureConfigActionBlock(futureForceBlock));
		defaultRuntime.exit(1);
		return;
	}
	const VALID_BIND_MODES = new Set([
		"loopback",
		"lan",
		"auto",
		"custom",
		"tailnet"
	]);
	const bindExplicitRawStr = normalizeOptionalString(toOptionString(opts.bind) ?? cfg.gateway?.bind);
	if (bindExplicitRawStr !== void 0 && !VALID_BIND_MODES.has(bindExplicitRawStr)) {
		defaultRuntime.error("Invalid --bind (use \"loopback\", \"lan\", \"tailnet\", \"auto\", or \"custom\")");
		defaultRuntime.exit(1);
		return;
	}
	const bindExplicitRaw = bindExplicitRawStr;
	if (process.env.OPENCLAW_SERVICE_MARKER?.trim()) {
		const stale = cleanStaleGatewayProcessesSync(port);
		if (stale.length > 0) gatewayLog.info(`service-mode: cleared ${stale.length} stale gateway pid(s) before bind on port ${port}`);
	}
	if (opts.force) try {
		const { killed, waitedMs, escalatedToSigkill } = await forceFreePortAndWait(port, {
			timeoutMs: 2e3,
			intervalMs: 100,
			sigtermTimeoutMs: 700
		});
		if (killed.length === 0) gatewayLog.info(`force: no listeners on port ${port}`);
		else {
			for (const proc of killed) gatewayLog.info(`force: killed pid ${proc.pid}${proc.command ? ` (${proc.command})` : ""} on port ${port}`);
			if (escalatedToSigkill) gatewayLog.info(`force: escalated to SIGKILL while freeing port ${port}`);
			if (waitedMs > 0) gatewayLog.info(`force: waited ${waitedMs}ms for port ${port} to free`);
		}
		const bindWaitMs = await waitForPortBindable(port, {
			timeoutMs: 3e3,
			intervalMs: 150,
			host: bindExplicitRaw === "loopback" ? "127.0.0.1" : bindExplicitRaw === "lan" ? "0.0.0.0" : bindExplicitRaw === "custom" ? toOptionString(cfg.gateway?.customBindHost) : void 0
		});
		if (bindWaitMs > 0) gatewayLog.info(`force: waited ${bindWaitMs}ms for port ${port} to become bindable`);
	} catch (err) {
		defaultRuntime.error(`Force: ${String(err)}`);
		defaultRuntime.exit(1);
		return;
	}
	if (opts.token) {
		const token = toOptionString(opts.token);
		if (token) process.env.OPENCLAW_GATEWAY_TOKEN = token;
	}
	const authModeRaw = toOptionString(opts.auth);
	const authMode = parseEnumOption(authModeRaw, GATEWAY_AUTH_MODES);
	if (authModeRaw && !authMode) {
		defaultRuntime.error(`Invalid --auth (use ${formatModeErrorList(GATEWAY_AUTH_MODES)})`);
		defaultRuntime.exit(1);
		return;
	}
	const tailscaleRaw = toOptionString(opts.tailscale);
	const tailscaleMode = parseEnumOption(tailscaleRaw, GATEWAY_TAILSCALE_MODES);
	if (tailscaleRaw && !tailscaleMode) {
		defaultRuntime.error(`Invalid --tailscale (use ${formatModeErrorList(GATEWAY_TAILSCALE_MODES)})`);
		defaultRuntime.exit(1);
		return;
	}
	const effectiveTailscaleMode = tailscaleMode ?? cfg.gateway?.tailscale?.mode ?? "off";
	const bind = bindExplicitRaw ?? defaultGatewayBindMode(effectiveTailscaleMode);
	let passwordRaw;
	try {
		passwordRaw = resolveGatewayPasswordOption(opts);
	} catch (err) {
		defaultRuntime.error(formatErrorMessage(err));
		defaultRuntime.exit(1);
		return;
	}
	if (toOptionString(opts.password)) warnInlinePasswordFlag();
	const tokenRaw = toOptionString(opts.token);
	gatewayLog.info("resolving authentication…");
	const configExists = snapshot?.exists ?? fs.existsSync(CONFIG_PATH);
	const configAuditPath = path.join(resolveStateDir(process.env), "logs", "config-audit.jsonl");
	const mode = (snapshot?.valid ? snapshot.config : cfg).gateway?.mode;
	const guardErrors = getGatewayStartGuardErrors({
		allowUnconfigured: opts.allowUnconfigured,
		configExists,
		configAuditPath,
		mode
	});
	if (guardErrors.length > 0) {
		for (const error of guardErrors) defaultRuntime.error(error);
		defaultRuntime.exit(EXIT_CONFIG_ERROR);
		return;
	}
	const miskeys = extractGatewayMiskeys(snapshot?.parsed);
	const authOverride = authMode || passwordRaw || tokenRaw || authModeRaw ? {
		...authMode ? { mode: authMode } : {},
		...tokenRaw ? { token: tokenRaw } : {},
		...passwordRaw ? { password: passwordRaw } : {}
	} : void 0;
	const resolvedAuth = await startupTrace.measure("cli.auth-resolve", () => resolveGatewayAuth({
		authConfig: cfg.gateway?.auth,
		authOverride,
		env: process.env,
		tailscaleMode: tailscaleMode ?? cfg.gateway?.tailscale?.mode ?? "off"
	}));
	const resolvedAuthMode = resolvedAuth.mode;
	const tokenValue = resolvedAuth.token;
	const passwordValue = resolvedAuth.password;
	const hasToken = typeof tokenValue === "string" && tokenValue.trim().length > 0;
	const hasPassword = typeof passwordValue === "string" && passwordValue.trim().length > 0;
	const tokenConfigured = hasToken || hasConfiguredSecretInput(authOverride?.token ?? cfg.gateway?.auth?.token, cfg.secrets?.defaults);
	const passwordConfigured = hasPassword || hasConfiguredSecretInput(authOverride?.password ?? cfg.gateway?.auth?.password, cfg.secrets?.defaults);
	const hasSharedSecret = resolvedAuthMode === "token" && tokenConfigured || resolvedAuthMode === "password" && passwordConfigured;
	const canBootstrapToken = resolvedAuthMode === "token" && !tokenConfigured;
	const authHints = [];
	if (miskeys.hasGatewayToken) authHints.push("Found \"gateway.token\" in config. Use \"gateway.auth.token\" instead.");
	if (miskeys.hasRemoteToken) authHints.push("\"gateway.remote.token\" is for remote CLI calls; it does not enable local gateway auth.");
	if (resolvedAuthMode === "password" && !passwordConfigured) {
		defaultRuntime.error([
			"Gateway auth is set to password, but no password is configured.",
			"Set gateway.auth.password (or OPENCLAW_GATEWAY_PASSWORD), or pass --password.",
			...authHints
		].filter(Boolean).join("\n"));
		defaultRuntime.exit(EXIT_CONFIG_ERROR);
		return;
	}
	if (resolvedAuthMode === "none") gatewayLog.warn("Gateway auth mode=none explicitly configured; all gateway connections are unauthenticated.");
	if (bind !== "loopback" && !hasSharedSecret && !canBootstrapToken && resolvedAuthMode !== "trusted-proxy") {
		defaultRuntime.error([
			`Refusing to bind gateway to ${bind} without auth.`,
			...isContainerEnvironment() ? ["Container environment detected — the gateway defaults to bind=auto (0.0.0.0) for port-forwarding compatibility.", "Set OPENCLAW_GATEWAY_TOKEN or OPENCLAW_GATEWAY_PASSWORD, or pass --token/--password to start with auth."] : ["Set gateway.auth.token/password (or OPENCLAW_GATEWAY_TOKEN/OPENCLAW_GATEWAY_PASSWORD) or pass --token/--password."],
			...authHints
		].filter(Boolean).join("\n"));
		defaultRuntime.exit(EXIT_CONFIG_ERROR);
		return;
	}
	const tailscaleOverride = tailscaleMode || opts.tailscaleResetOnExit ? {
		...tailscaleMode ? { mode: tailscaleMode } : {},
		...opts.tailscaleResetOnExit ? { resetOnExit: true } : {}
	} : void 0;
	gatewayLog.info("starting...");
	startupTrace.mark("cli.gateway-loop");
	const startLoop = async () => await runGatewayLoop({
		runtime: defaultRuntime,
		lockPort: port,
		healthHost: await resolveGatewayBindHost(bind, cfg.gateway?.customBindHost),
		start: async ({ startupStartedAt } = {}) => await startGatewayServer(port, {
			bind,
			auth: authOverride,
			tailscale: tailscaleOverride,
			startupStartedAt
		})
	});
	try {
		const supervisor = detectRespawnSupervisor(process.env);
		while (true) try {
			await startLoop();
			break;
		} catch (err) {
			const isGatewayAlreadyRunning = err instanceof GatewayLockError && typeof err.message === "string" && err.message.includes("gateway already running");
			if (!supervisor || !isGatewayAlreadyRunning) throw err;
			gatewayLog.warn(`gateway already running under ${supervisor}; waiting ${SUPERVISED_GATEWAY_LOCK_RETRY_MS}ms before retrying startup`);
			await new Promise((resolve) => setTimeout(resolve, SUPERVISED_GATEWAY_LOCK_RETRY_MS));
		}
	} catch (err) {
		if (isGatewayLockError(err)) {
			const errMessage = formatErrorMessage(err);
			defaultRuntime.error(`Gateway failed to start: ${errMessage}\nIf the gateway is supervised, stop it with: ${formatCliCommand("openclaw gateway stop")}`);
			try {
				const diagnostics = await inspectPortUsage(port);
				if (diagnostics.status === "busy") for (const line of formatPortDiagnostics(diagnostics)) defaultRuntime.error(line);
			} catch {}
			await maybeExplainGatewayServiceStop();
			defaultRuntime.exit(isHealthyGatewayLockError(err) ? 0 : 1);
			return;
		}
		maybeWriteGatewayStartupFailureBundle(err);
		defaultRuntime.error(`Gateway failed to start: ${String(err)}`);
		defaultRuntime.exit(1);
	}
}
function addGatewayRunCommand(cmd) {
	return cmd.option("--port <port>", "Port for the gateway WebSocket").option("--bind <mode>", "Bind mode (\"loopback\"|\"lan\"|\"tailnet\"|\"auto\"|\"custom\"). Defaults to config gateway.bind (or loopback).").option("--token <token>", "Shared token required in connect.params.auth.token (default: OPENCLAW_GATEWAY_TOKEN env if set)").option("--auth <mode>", `Gateway auth mode (${formatModeChoices(GATEWAY_AUTH_MODES)})`).option("--password <password>", "Password for auth mode=password").option("--password-file <path>", "Read gateway password from file").option("--tailscale <mode>", `Tailscale exposure mode (${formatModeChoices(GATEWAY_TAILSCALE_MODES)})`).option("--tailscale-reset-on-exit", "Reset Tailscale serve/funnel configuration on shutdown", false).option("--allow-unconfigured", "Allow gateway start without enforcing gateway.mode=local in config (does not repair config)", false).option("--dev", "Create a dev config + workspace if missing (no BOOTSTRAP.md)", false).option("--reset", "Reset dev config + credentials + sessions + workspace (requires --dev)", false).option("--force", "Kill any existing listener on the target port before starting", false).option("--verbose", "Verbose logging to stdout/stderr", false).option("--cli-backend-logs", "Only show CLI backend logs in the console (includes stdout/stderr)", false).option("--claude-cli-logs", "Deprecated alias for --cli-backend-logs", false).option("--ws-log <style>", "WebSocket log style (\"auto\"|\"full\"|\"compact\")", "auto").option("--compact", "Alias for \"--ws-log compact\"", false).option("--raw-stream", "Log raw model stream events to jsonl", false).option("--raw-stream-path <path>", "Raw stream jsonl path").action(async (opts, command) => {
		await runGatewayCommand$1(resolveGatewayRunOptions(opts, command));
	});
}
//#endregion
//#region src/cli/gateway-cli/register.ts
let configModulePromise;
let gatewayStatusModulePromise;
let gatewayHealthModulePromise;
let bonjourDiscoveryModulePromise;
let wideAreaDnsModulePromise;
let healthStyleModulePromise;
let usageFormatModulePromise;
let stabilityBundleModulePromise;
let supportExportModulePromise;
let daemonStatusGatherModulePromise;
function loadConfigModule() {
	configModulePromise ??= import("./read-best-effort-config.runtime-D7MA1Tzz.js");
	return configModulePromise;
}
function loadGatewayStatusModule() {
	gatewayStatusModulePromise ??= import("./gateway-status-Ced77zP8.js");
	return gatewayStatusModulePromise;
}
function loadGatewayHealthModule() {
	gatewayHealthModulePromise ??= import("./health-Dn7SjhPF.js");
	return gatewayHealthModulePromise;
}
function loadBonjourDiscoveryModule() {
	bonjourDiscoveryModulePromise ??= import("./bonjour-discovery-C2g1HqLu.js");
	return bonjourDiscoveryModulePromise;
}
function loadWideAreaDnsModule() {
	wideAreaDnsModulePromise ??= import("./widearea-dns-COb47ftR.js");
	return wideAreaDnsModulePromise;
}
function loadHealthStyleModule() {
	healthStyleModulePromise ??= import("./health-style-BlMOz76l.js");
	return healthStyleModulePromise;
}
function loadUsageFormatModule() {
	usageFormatModulePromise ??= import("./usage-format-DFefy2-n.js");
	return usageFormatModulePromise;
}
function loadStabilityBundleModule() {
	stabilityBundleModulePromise ??= import("./diagnostic-stability-bundle-e344wM3j.js");
	return stabilityBundleModulePromise;
}
function loadSupportExportModule() {
	supportExportModulePromise ??= import("./diagnostic-support-export-eaG1cg2U.js");
	return supportExportModulePromise;
}
function loadDaemonStatusGatherModule() {
	daemonStatusGatherModulePromise ??= import("./status.gather-0CRBAAHo.js");
	return daemonStatusGatherModulePromise;
}
function runGatewayCommand(action, label) {
	return runCommandWithRuntime(defaultRuntime, action, (err) => {
		const message = String(err);
		defaultRuntime.error(label ? `${label}: ${message}` : message);
		defaultRuntime.exit(1);
	});
}
function parseDaysOption(raw, fallback = 30) {
	if (typeof raw === "number" && Number.isFinite(raw)) return Math.max(1, Math.floor(raw));
	if (typeof raw === "string" && raw.trim() !== "") {
		const parsed = Number(raw);
		if (Number.isFinite(parsed)) return Math.max(1, Math.floor(parsed));
	}
	return fallback;
}
function resolveGatewayRpcOptions(opts, command) {
	const parentToken = inheritOptionFromParent(command, "token");
	const parentPassword = inheritOptionFromParent(command, "password");
	return {
		...opts,
		token: opts.token ?? parentToken,
		password: opts.password ?? parentPassword
	};
}
async function renderCostUsageSummaryAsync(summary, days, rich) {
	const { formatTokenCount, formatUsd } = await loadUsageFormatModule();
	const totalCost = formatUsd(summary.totals.totalCost) ?? "$0.00";
	const totalTokens = formatTokenCount(summary.totals.totalTokens) ?? "0";
	const lines = [colorize(rich, theme.heading, `Usage cost (${days} days)`), `${colorize(rich, theme.muted, "Total:")} ${totalCost} · ${totalTokens} tokens`];
	if (summary.totals.missingCostEntries > 0) lines.push(`${colorize(rich, theme.muted, "Missing entries:")} ${summary.totals.missingCostEntries}`);
	const latest = summary.daily.at(-1);
	if (latest) {
		const latestCost = formatUsd(latest.totalCost) ?? "$0.00";
		const latestTokens = formatTokenCount(latest.totalTokens) ?? "0";
		lines.push(`${colorize(rich, theme.muted, "Latest day:")} ${latest.date} · ${latestCost} · ${latestTokens} tokens`);
	}
	return lines;
}
function formatBytes(value) {
	if (value === void 0) return "n/a";
	const units = [
		"B",
		"KiB",
		"MiB",
		"GiB"
	];
	let amount = value;
	let unitIndex = 0;
	while (amount >= 1024 && unitIndex < units.length - 1) {
		amount /= 1024;
		unitIndex += 1;
	}
	const digits = unitIndex === 0 || amount >= 100 ? 0 : 1;
	return `${amount.toFixed(digits)} ${units[unitIndex]}`;
}
function formatStabilityEvent(record) {
	return [
		new Date(record.ts).toISOString(),
		`#${record.seq}`,
		record.type,
		record.level ? `level=${record.level}` : "",
		record.action ? `action=${record.action}` : "",
		record.outcome ? `outcome=${record.outcome}` : "",
		record.surface ? `surface=${record.surface}` : "",
		record.channel ? `channel=${record.channel}` : "",
		record.pluginId ? `plugin=${record.pluginId}` : "",
		record.reason ? `reason=${record.reason}` : "",
		record.bytes !== void 0 ? `bytes=${formatBytes(record.bytes)}` : "",
		record.limitBytes !== void 0 ? `limit=${formatBytes(record.limitBytes)}` : "",
		record.queueDepth !== void 0 ? `queueDepth=${record.queueDepth}` : "",
		record.queued !== void 0 ? `queued=${record.queued}` : "",
		record.memory ? `rss=${formatBytes(record.memory.rssBytes)}` : "",
		record.memory ? `heap=${formatBytes(record.memory.heapUsedBytes)}` : ""
	].filter(Boolean).join(" ");
}
function renderStabilitySummary(snapshot, rich) {
	const lines = [colorize(rich, theme.heading, "Gateway Stability"), `${colorize(rich, theme.muted, "Events:")} ${snapshot.count}/${snapshot.capacity}${snapshot.dropped > 0 ? ` · dropped=${snapshot.dropped}` : ""}`];
	const topTypes = Object.entries(snapshot.summary.byType).toSorted((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 8).map(([type, count]) => `${type}=${count}`).join(", ");
	if (topTypes) lines.push(`${colorize(rich, theme.muted, "Types:")} ${topTypes}`);
	const memory = snapshot.summary.memory;
	if (memory) lines.push(`${colorize(rich, theme.muted, "Memory:")} rss=${formatBytes(memory.latest?.rssBytes)} heap=${formatBytes(memory.latest?.heapUsedBytes)} maxRss=${formatBytes(memory.maxRssBytes)} pressure=${memory.pressureCount}`);
	const payloadLarge = snapshot.summary.payloadLarge;
	if (payloadLarge) {
		const surfaces = Object.entries(payloadLarge.bySurface).toSorted((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([surface, count]) => `${surface}=${count}`).join(", ");
		lines.push(`${colorize(rich, theme.muted, "Large payloads:")} total=${payloadLarge.count} rejected=${payloadLarge.rejected} truncated=${payloadLarge.truncated} chunked=${payloadLarge.chunked}${surfaces ? ` · ${surfaces}` : ""}`);
	}
	if (snapshot.events.length > 0) {
		lines.push(colorize(rich, theme.muted, "Recent:"));
		for (const event of snapshot.events) lines.push(`  ${formatStabilityEvent(event)}`);
	}
	return lines;
}
function normalizeStabilityBundleTarget(raw) {
	if (raw === void 0 || raw === false) return null;
	if (raw === true) return "latest";
	if (typeof raw !== "string") return "latest";
	const value = raw.trim();
	return value === "" ? "latest" : value;
}
function formatBundleError(result) {
	if (result.status === "missing") return `No stability bundles found in ${result.dir}`;
	if (result.status === "failed") return result.error instanceof Error ? result.error.message : String(result.error);
	return "Unexpected stability bundle read result";
}
async function readStabilityBundleTarget(bundleTarget) {
	const { readDiagnosticStabilityBundleFileSync, readLatestDiagnosticStabilityBundleSync } = await loadStabilityBundleModule();
	return bundleTarget === "latest" ? readLatestDiagnosticStabilityBundleSync() : readDiagnosticStabilityBundleFileSync(bundleTarget);
}
function renderStabilityBundleSummary(params) {
	const { bundle, path, rich, snapshot } = params;
	const processDetails = [
		`pid=${bundle.process.pid}`,
		`node=${bundle.process.node}`,
		`${bundle.process.platform}/${bundle.process.arch}`,
		`uptime=${Math.round(bundle.process.uptimeMs / 1e3)}s`
	].join(" ");
	const lines = [
		colorize(rich, theme.heading, "Stability bundle"),
		`${colorize(rich, theme.muted, "Path:")} ${path}`,
		`${colorize(rich, theme.muted, "Generated:")} ${bundle.generatedAt}`,
		`${colorize(rich, theme.muted, "Reason:")} ${bundle.reason}`,
		`${colorize(rich, theme.muted, "Process:")} ${processDetails}`,
		`${colorize(rich, theme.muted, "Host:")} ${bundle.host.hostname}`
	];
	if (bundle.error) {
		const errorParts = [bundle.error.name ? `name=${bundle.error.name}` : "", bundle.error.code ? `code=${bundle.error.code}` : ""].filter(Boolean);
		if (errorParts.length > 0) lines.push(`${colorize(rich, theme.muted, "Error:")} ${errorParts.join(" ")}`);
	}
	lines.push("", ...renderStabilitySummary(snapshot, rich));
	return lines;
}
function renderSupportExportResult(result, rich) {
	return [
		colorize(rich, theme.heading, "Diagnostics export"),
		`${colorize(rich, theme.muted, "Path:")} ${result.path}`,
		`${colorize(rich, theme.muted, "Size:")} ${formatBytes(result.bytes)}`,
		`${colorize(rich, theme.muted, "Files:")} ${result.manifest.contents.length}`,
		`${colorize(rich, theme.muted, "Privacy:")} payload-free stability, sanitized logs/status/health/config`
	];
}
function resolveSupportExportRpcOptions(rpc) {
	return {
		url: rpc?.url,
		token: rpc?.token,
		password: rpc?.password,
		timeout: rpc?.timeout ?? "3000",
		json: true
	};
}
async function writeSupportExportFromCli(opts) {
	const { writeDiagnosticSupportExport } = await loadSupportExportModule();
	const rpc = resolveSupportExportRpcOptions(opts.rpc);
	const result = await writeDiagnosticSupportExport({
		outputPath: opts.output,
		logLimit: opts.logLines ? Number(opts.logLines) : void 0,
		logMaxBytes: opts.logBytes ? Number(opts.logBytes) : void 0,
		stabilityBundle: opts.stabilityBundle,
		readStatusSnapshot: async () => {
			const { gatherDaemonStatus } = await loadDaemonStatusGatherModule();
			return await gatherDaemonStatus({
				rpc,
				probe: true,
				requireRpc: false,
				deep: false
			});
		},
		readHealthSnapshot: async () => await callGatewayCli("health", rpc)
	});
	if (opts.json) {
		defaultRuntime.writeJson(result);
		return;
	}
	const rich = isRich();
	for (const line of renderSupportExportResult(result, rich)) defaultRuntime.log(line);
}
function registerGatewayCli(program) {
	const gateway = addGatewayRunCommand(program.command("gateway").description("Run, inspect, and query the WebSocket Gateway").addHelpText("after", () => `\n${theme.heading("Examples:")}\n${formatHelpExamples([
		["openclaw gateway run", "Run the gateway in the foreground."],
		["openclaw gateway status", "Show service status plus connectivity/capability."],
		["openclaw gateway discover", "Find local and wide-area gateway beacons."],
		["openclaw gateway stability", "Show recent stability diagnostics."],
		["openclaw gateway call health", "Call a gateway RPC method directly."]
	])}\n\n${theme.muted("Docs:")} ${formatDocsLink("/cli/gateway", "docs.openclaw.ai/cli/gateway")}\n`));
	addGatewayRunCommand(gateway.command("run").description("Run the WebSocket Gateway (foreground)"));
	addGatewayServiceCommands(gateway, { statusDescription: "Show gateway service status + probe connectivity/capability" });
	gatewayCallOpts(gateway.command("call").description("Call a Gateway method").argument("<method>", "Method name (health/status/system-presence/cron.*)").option("--params <json>", "JSON object string for params", "{}").action(async (method, opts, command) => {
		await runGatewayCommand(async () => {
			const rpcOpts = resolveGatewayRpcOptions(opts, command);
			const result = await callGatewayCli(method, rpcOpts, JSON.parse(String(opts.params ?? "{}")));
			if (rpcOpts.json) {
				defaultRuntime.writeJson(result);
				return;
			}
			const rich = isRich();
			defaultRuntime.log(`${colorize(rich, theme.heading, "Gateway call")}: ${colorize(rich, theme.muted, String(method))}`);
			defaultRuntime.writeJson(result);
		}, "Gateway call failed");
	}));
	gatewayCallOpts(gateway.command("usage-cost").description("Fetch usage cost summary from session logs").option("--days <days>", "Number of days to include", "30").action(async (opts, command) => {
		await runGatewayCommand(async () => {
			const rpcOpts = resolveGatewayRpcOptions(opts, command);
			const days = parseDaysOption(opts.days);
			const result = await callGatewayCli("usage.cost", rpcOpts, { days });
			if (rpcOpts.json) {
				defaultRuntime.writeJson(result);
				return;
			}
			const rich = isRich();
			const summary = result;
			for (const line of await renderCostUsageSummaryAsync(summary, days, rich)) defaultRuntime.log(line);
		}, "Gateway usage cost failed");
	}));
	gatewayCallOpts(gateway.command("health").description("Fetch Gateway health").action(async (opts, command) => {
		await runGatewayCommand(async () => {
			const rpcOpts = resolveGatewayRpcOptions(opts, command);
			const [{ formatHealthChannelLines }, { styleHealthChannelLine }] = await Promise.all([loadGatewayHealthModule(), loadHealthStyleModule()]);
			const result = await callGatewayCli("health", rpcOpts);
			if (rpcOpts.json) {
				defaultRuntime.writeJson(result);
				return;
			}
			const rich = isRich();
			const obj = result && typeof result === "object" ? result : {};
			const durationMs = typeof obj.durationMs === "number" ? obj.durationMs : null;
			defaultRuntime.log(colorize(rich, theme.heading, "Gateway Health"));
			defaultRuntime.log(`${colorize(rich, theme.success, "OK")}${durationMs != null ? ` (${durationMs}ms)` : ""}`);
			if (obj.channels && typeof obj.channels === "object") for (const line of formatHealthChannelLines(obj)) defaultRuntime.log(styleHealthChannelLine(line, rich));
		});
	}));
	gatewayCallOpts(gateway.command("stability").description("Fetch payload-free Gateway stability diagnostics").option("--limit <limit>", "Maximum number of recent events", "25").option("--type <type>", "Filter by diagnostic event type").option("--since-seq <seq>", "Only include events after this sequence").option("--bundle [path]", "Read a persisted stability bundle instead of calling Gateway; pass \"latest\" for newest").option("--export", "Write a shareable support diagnostics export", false).option("--output <path>", "Diagnostics export output .zip path").action(async (opts, command) => {
		await runGatewayCommand(async () => {
			const rpcOpts = resolveGatewayRpcOptions(opts, command);
			const query = normalizeDiagnosticStabilityQuery({
				limit: opts.limit,
				sinceSeq: opts.sinceSeq,
				type: opts.type
			}, { defaultLimit: 25 });
			const bundleTarget = normalizeStabilityBundleTarget(opts.bundle);
			if (opts.export) {
				await writeSupportExportFromCli({
					json: rpcOpts.json,
					output: opts.output,
					stabilityBundle: bundleTarget ?? "latest",
					rpc: rpcOpts
				});
				return;
			}
			if (bundleTarget) {
				const result = await readStabilityBundleTarget(bundleTarget);
				if (result.status !== "found") throw new Error(formatBundleError(result));
				const snapshot = selectDiagnosticStabilitySnapshot(result.bundle.snapshot, query);
				if (rpcOpts.json) {
					defaultRuntime.writeJson({
						path: result.path,
						mtimeMs: result.mtimeMs,
						bundle: {
							...result.bundle,
							snapshot
						}
					});
					return;
				}
				const rich = isRich();
				for (const line of renderStabilityBundleSummary({
					bundle: result.bundle,
					path: result.path,
					rich,
					snapshot
				})) defaultRuntime.log(line);
				return;
			}
			const result = await callGatewayCli("diagnostics.stability", rpcOpts, {
				limit: query.limit,
				...query.type ? { type: query.type } : {},
				...query.sinceSeq !== void 0 ? { sinceSeq: query.sinceSeq } : {}
			});
			if (rpcOpts.json) {
				defaultRuntime.writeJson(result);
				return;
			}
			const rich = isRich();
			for (const line of renderStabilitySummary(result, rich)) defaultRuntime.log(line);
		}, "Gateway stability failed");
	}));
	gateway.command("diagnostics").description("Export local support diagnostics").command("export").description("Write a shareable, payload-free diagnostics .zip").option("--output <path>", "Output .zip path").option("--log-lines <count>", "Maximum sanitized log lines to include", "5000").option("--log-bytes <bytes>", "Maximum log bytes to inspect", "1000000").option("--url <url>", "Gateway WebSocket URL for health snapshot").option("--token <token>", "Gateway token for health snapshot").option("--password <password>", "Gateway password for health snapshot").option("--timeout <ms>", "Status/health snapshot timeout in ms", "3000").option("--no-stability-bundle", "Skip persisted stability bundle lookup").option("--json", "Output JSON", false).action(async (opts, command) => {
		await runGatewayCommand(async () => {
			const rpcOpts = resolveGatewayRpcOptions(opts, command);
			await writeSupportExportFromCli({
				json: opts.json,
				output: opts.output,
				logLines: opts.logLines,
				logBytes: opts.logBytes,
				stabilityBundle: opts.stabilityBundle === false ? false : "latest",
				rpc: rpcOpts
			});
		}, "Gateway diagnostics export failed");
	});
	gateway.command("probe").description("Show gateway reachability, auth capability, and read-probe summary (local + remote)").option("--url <url>", "Explicit Gateway WebSocket URL (still probes localhost)").option("--ssh <target>", "SSH target for remote gateway tunnel (user@host or user@host:port)").option("--ssh-identity <path>", "SSH identity file path").option("--ssh-auto", "Try to derive an SSH target from Bonjour discovery", false).option("--token <token>", "Gateway token (applies to all probes)").option("--password <password>", "Gateway password (applies to all probes)").option("--timeout <ms>", "Overall probe budget in ms", "3000").option("--json", "Output JSON", false).action(async (opts, command) => {
		await runGatewayCommand(async () => {
			const rpcOpts = resolveGatewayRpcOptions(opts, command);
			const { gatewayStatusCommand } = await loadGatewayStatusModule();
			await gatewayStatusCommand(rpcOpts, defaultRuntime);
		});
	});
	gateway.command("discover").description("Discover gateways via Bonjour (local + wide-area if configured)").option("--timeout <ms>", "Per-command timeout in ms", "2000").option("--json", "Output JSON", false).action(async (opts) => {
		await runGatewayCommand(async () => {
			const [{ readSourceConfigBestEffort }, { discoverGatewayBeacons }, { resolveWideAreaDiscoveryDomain }] = await Promise.all([
				loadConfigModule(),
				loadBonjourDiscoveryModule(),
				loadWideAreaDnsModule()
			]);
			const wideAreaDomain = resolveWideAreaDiscoveryDomain({ configDomain: (await readSourceConfigBestEffort()).discovery?.wideArea?.domain });
			const timeoutMs = parseDiscoverTimeoutMs(opts.timeout, 2e3);
			const domains = ["local.", ...wideAreaDomain ? [wideAreaDomain] : []];
			const deduped = dedupeBeacons(await withProgress({
				label: "Scanning for gateways…",
				indeterminate: true,
				enabled: opts.json !== true,
				delayMs: 0
			}, async () => await discoverGatewayBeacons({
				timeoutMs,
				wideAreaDomain
			}))).toSorted((a, b) => (a.displayName || a.instanceName).localeCompare(b.displayName || b.instanceName));
			if (opts.json) {
				const enriched = deduped.map((b) => {
					const host = pickBeaconHost(b);
					const port = pickGatewayPort(b);
					return {
						...b,
						wsUrl: host ? `ws://${host}:${port}` : null
					};
				});
				defaultRuntime.writeJson({
					timeoutMs,
					domains,
					count: enriched.length,
					beacons: enriched
				});
				return;
			}
			const rich = isRich();
			defaultRuntime.log(colorize(rich, theme.heading, "Gateway Discovery"));
			defaultRuntime.log(colorize(rich, theme.muted, `Found ${deduped.length} gateway(s) · domains: ${domains.join(", ")}`));
			if (deduped.length === 0) return;
			for (const beacon of deduped) for (const line of renderBeaconLines(beacon, rich)) defaultRuntime.log(line);
		}, "gateway discover failed");
	});
}
//#endregion
export { registerGatewayCli };
