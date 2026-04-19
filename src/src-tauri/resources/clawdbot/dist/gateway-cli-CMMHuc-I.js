import { i as formatErrorMessage } from "./errors-D8p6rxH8.js";
import { o as normalizeOptionalLowercaseString, s as normalizeOptionalString } from "./string-coerce-BUSzWgUA.js";
import { _ as shortenHomePath, m as resolveUserPath } from "./utils-D5DtWkEu.js";
import { r as setVerbose } from "./global-state-LrCGCReA.js";
import { n as defaultRuntime } from "./runtime-Dx7oeLYq.js";
import { d as setConsoleTimestampPrefix, t as createSubsystemLogger, u as setConsoleSubsystemFilter } from "./subsystem-Cgmckbux.js";
import { t as formatDocsLink } from "./links-Dp5-Wbn2.js";
import { n as isRich, r as theme, t as colorize } from "./theme-D5sxSdHD.js";
import { n as inheritOptionFromParent } from "./command-options-0jYAGXoL.js";
import { t as addGatewayServiceCommands } from "./register-service-commands-DyCdrZnc.js";
import { t as formatCliCommand } from "./command-format-Dd3uP9-6.js";
import { _ as resolveStateDir, t as CONFIG_PATH, u as resolveGatewayPort } from "./paths-Dvv9VRAc.js";
import { d as resolveGatewayLaunchAgentLabel, m as resolveGatewayWindowsTaskName, p as resolveGatewaySystemdServiceName } from "./paths-icbGFVZa.js";
import { a as hasConfiguredSecretInput } from "./types.secrets-CeL3gSMO.js";
import "./globals-De6QTwLG.js";
import { n as isContainerEnvironment, t as defaultGatewayBindMode } from "./net-lBInRHnX.js";
import { o as resolveGatewayAuth } from "./auth-DN1PwXy9.js";
import { a as loadConfig, g as writeConfigFile, l as readConfigFileSnapshot, r as createConfigIO } from "./io-5pxHCi7V.js";
import { _ as resolveWorkspaceTemplateDir, g as resolveDefaultAgentWorkspaceDir } from "./workspace-hhTlRYqM.js";
import { t as cleanStaleGatewayProcessesSync } from "./restart-stale-pids-HQYy2vGd.js";
import { a as inspectPortUsage, s as formatPortDiagnostics } from "./ports-BQYvWPfn.js";
import { r as resolveGatewayService } from "./service-DkbTemHA.js";
import { t as parsePort } from "./parse-port-Bd1Ciu7u.js";
import "./config-Q9XZc_2I.js";
import { g as GATEWAY_CLIENT_NAMES, h as GATEWAY_CLIENT_MODES } from "./message-channel-CBqCPFa_.js";
import { a as getActiveTaskCount, c as markGatewayDraining, d as waitForActiveTasks, l as resetAllLanes } from "./command-queue-BLDIg9zn.js";
import { r as callGateway } from "./call-BA3do6C0.js";
import { a as markGatewaySigusr1RestartHandled, i as isGatewaySigusr1RestartExternallyAllowed, l as triggerOpenClawRestart, o as scheduleGatewaySigusr1Restart, t as consumeGatewaySigusr1RestartAuthorization } from "./restart-Bh5n8icp.js";
import { d as waitForActiveEmbeddedRuns, r as getActiveEmbeddedRunCount, t as abortEmbeddedPiRun } from "./runs-D-CeEXwD.js";
import { n as parseTimeoutMsWithFallback } from "./parse-timeout-DQBLjOP7.js";
import { n as withProgress } from "./progress-plFYyayR.js";
import { n as runCommandWithRuntime } from "./cli-utils-PbJDKJWK.js";
import { n as setGatewayWsLogStyle } from "./ws-logging-CnIeNr3I.js";
import { t as formatHelpExamples } from "./help-format-DfEzE9Kd.js";
import { t as readSecretFromFile } from "./secret-file-DL1Tp2Jb.js";
import { o as handleReset } from "./onboard-helpers-B-FfdZ4h.js";
import { n as buildGatewayDiscoveryTarget } from "./gateway-discovery-targets-CkH9uXgo.js";
import { o as resolveControlUiRootSync } from "./control-ui-assets-CISH9MR3.js";
import { n as acquireGatewayLock, t as GatewayLockError } from "./gateway-lock-BuBm_oza.js";
import { n as forceFreePortAndWait, r as waitForPortBindable } from "./ports-Bmoq4Ckk.js";
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import os from "node:os";
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
//#region src/infra/supervisor-markers.ts
const SUPERVISOR_HINTS = {
	launchd: [
		"LAUNCH_JOB_LABEL",
		"LAUNCH_JOB_NAME",
		"XPC_SERVICE_NAME",
		"OPENCLAW_LAUNCHD_LABEL"
	],
	systemd: [
		"OPENCLAW_SYSTEMD_UNIT",
		"INVOCATION_ID",
		"SYSTEMD_EXEC_PID",
		"JOURNAL_STREAM"
	],
	schtasks: ["OPENCLAW_WINDOWS_TASK_NAME"]
};
[
	...SUPERVISOR_HINTS.launchd,
	...SUPERVISOR_HINTS.systemd,
	...SUPERVISOR_HINTS.schtasks
];
function hasAnyHint(env, keys) {
	return keys.some((key) => {
		const value = env[key];
		return typeof value === "string" && value.trim().length > 0;
	});
}
function detectRespawnSupervisor(env = process.env, platform = process.platform) {
	if (platform === "darwin") return hasAnyHint(env, SUPERVISOR_HINTS.launchd) ? "launchd" : null;
	if (platform === "linux") return hasAnyHint(env, SUPERVISOR_HINTS.systemd) ? "systemd" : null;
	if (platform === "win32") {
		if (hasAnyHint(env, SUPERVISOR_HINTS.schtasks)) return "schtasks";
		const marker = env.OPENCLAW_SERVICE_MARKER?.trim();
		const serviceKind = env.OPENCLAW_SERVICE_KIND?.trim();
		return marker && serviceKind === "gateway" ? "schtasks" : null;
	}
	return null;
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
	await writeConfigFile({
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
		const args = [...process.execArgv, ...process.argv.slice(1)];
		const child = spawn(process.execPath, args, {
			env: process.env,
			detached: true,
			stdio: "inherit"
		});
		child.unref();
		return {
			mode: "spawned",
			pid: child.pid ?? void 0
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
async function runGatewayLoop(params) {
	let startupStartedAt = Date.now();
	let lock = await acquireGatewayLock({ port: params.lockPort });
	let server = null;
	let shuttingDown = false;
	let restartResolver = null;
	const cleanupSignals = () => {
		process.removeListener("SIGTERM", onSigterm);
		process.removeListener("SIGINT", onSigint);
		process.removeListener("SIGUSR1", onSigusr1);
	};
	const exitProcess = (code) => {
		cleanupSignals();
		params.runtime.exit(code);
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
	const handleRestartAfterServerClose = async () => {
		const hadLock = await releaseLockIfHeld();
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
		if (respawn.mode === "failed") gatewayLog$1.warn(`full process restart failed (${respawn.detail ?? "unknown error"}); falling back to in-process restart`);
		else gatewayLog$1.info(`restart mode: in-process restart (${respawn.detail ?? "OPENCLAW_NO_RESPAWN"})`);
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
			const timeoutMs = loadConfig().gateway?.reload?.deferralTimeoutMs;
			return typeof timeoutMs === "number" && Number.isFinite(timeoutMs) && timeoutMs >= 0 ? timeoutMs : DEFAULT_RESTART_DRAIN_TIMEOUT_MS;
		} catch {
			return DEFAULT_RESTART_DRAIN_TIMEOUT_MS;
		}
	};
	const request = (action, signal) => {
		if (shuttingDown) {
			gatewayLog$1.info(`received ${signal} during shutdown; ignoring`);
			return;
		}
		shuttingDown = true;
		const isRestart = action === "restart";
		const restartDrainTimeoutMs = isRestart ? resolveRestartDrainTimeoutMs() : 0;
		gatewayLog$1.info(`received ${signal}; ${isRestart ? "restarting" : "shutting down"}`);
		const forceExitMs = isRestart ? restartDrainTimeoutMs + SHUTDOWN_TIMEOUT_MS : SHUTDOWN_TIMEOUT_MS;
		const forceExitTimer = setTimeout(() => {
			gatewayLog$1.error("shutdown timed out; exiting without full cleanup");
			exitProcess(1);
		}, forceExitMs);
		(async () => {
			try {
				if (isRestart) {
					markGatewayDraining();
					const activeTasks = getActiveTaskCount();
					const activeRuns = getActiveEmbeddedRunCount();
					if (activeRuns > 0) abortEmbeddedPiRun(void 0, { mode: "compacting" });
					if (activeTasks > 0 || activeRuns > 0) {
						gatewayLog$1.info(`draining ${activeTasks} active task(s) and ${activeRuns} active embedded run(s) before restart (timeout ${restartDrainTimeoutMs}ms)`);
						const [tasksDrain, runsDrain] = await Promise.all([activeTasks > 0 ? waitForActiveTasks(restartDrainTimeoutMs) : Promise.resolve({ drained: true }), activeRuns > 0 ? waitForActiveEmbeddedRuns(restartDrainTimeoutMs) : Promise.resolve({ drained: true })]);
						if (tasksDrain.drained && runsDrain.drained) gatewayLog$1.info("all active work drained");
						else {
							gatewayLog$1.warn("drain timeout reached; proceeding with restart");
							abortEmbeddedPiRun(void 0, { mode: "all" });
						}
					}
				}
				await server?.close({
					reason: isRestart ? "gateway restarting" : "gateway stopping",
					restartExpectedMs: isRestart ? 1500 : null
				});
			} catch (err) {
				gatewayLog$1.error(`shutdown error: ${String(err)}`);
			} finally {
				clearTimeout(forceExitTimer);
				server = null;
				if (isRestart) await handleRestartAfterServerClose();
				else await handleStopAfterServerClose();
			}
		})();
	};
	const onSigterm = () => {
		gatewayLog$1.info("signal SIGTERM received");
		request("stop", "SIGTERM");
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
		markGatewaySigusr1RestartHandled();
		request("restart", "SIGUSR1");
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
	gatewayLog.info("Control UI assets are missing; first startup may spend a few seconds building them before the gateway binds. Prebuild with `pnpm ui:build` for a faster first boot.");
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
	const { startGatewayServer } = await withProgress({
		label: "Loading gateway modules…",
		indeterminate: true
	}, async () => import("./server-CDWyu9ex.js"));
	setConsoleTimestampPrefix(true);
	if (devMode) await ensureDevGatewayConfig({ reset: Boolean(opts.reset) });
	gatewayLog.info("loading configuration…");
	const cfg = loadConfig();
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
	const snapshot = await readConfigFileSnapshot().catch(() => null);
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
	const resolvedAuth = resolveGatewayAuth({
		authConfig: cfg.gateway?.auth,
		authOverride,
		env: process.env,
		tailscaleMode: tailscaleMode ?? cfg.gateway?.tailscale?.mode ?? "off"
	});
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
	const startLoop = async () => await runGatewayLoop({
		runtime: defaultRuntime,
		lockPort: port,
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
function loadConfigModule() {
	configModulePromise ??= import("./read-best-effort-config.runtime-BstyzYAd.js");
	return configModulePromise;
}
function loadGatewayStatusModule() {
	gatewayStatusModulePromise ??= import("./gateway-status-B2JeYHAg.js");
	return gatewayStatusModulePromise;
}
function loadGatewayHealthModule() {
	gatewayHealthModulePromise ??= import("./health-CHIcnYyJ.js");
	return gatewayHealthModulePromise;
}
function loadBonjourDiscoveryModule() {
	bonjourDiscoveryModulePromise ??= import("./bonjour-discovery-DT6SWnVx.js");
	return bonjourDiscoveryModulePromise;
}
function loadWideAreaDnsModule() {
	wideAreaDnsModulePromise ??= import("./widearea-dns-Da24nw8v.js");
	return wideAreaDnsModulePromise;
}
function loadHealthStyleModule() {
	healthStyleModulePromise ??= import("./health-style-G5P2yf31.js");
	return healthStyleModulePromise;
}
function loadUsageFormatModule() {
	usageFormatModulePromise ??= import("./usage-format-6orNPGn8.js");
	return usageFormatModulePromise;
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
function registerGatewayCli(program) {
	const gateway = addGatewayRunCommand(program.command("gateway").description("Run, inspect, and query the WebSocket Gateway").addHelpText("after", () => `\n${theme.heading("Examples:")}\n${formatHelpExamples([
		["openclaw gateway run", "Run the gateway in the foreground."],
		["openclaw gateway status", "Show service status and probe reachability."],
		["openclaw gateway discover", "Find local and wide-area gateway beacons."],
		["openclaw gateway call health", "Call a gateway RPC method directly."]
	])}\n\n${theme.muted("Docs:")} ${formatDocsLink("/cli/gateway", "docs.openclaw.ai/cli/gateway")}\n`));
	addGatewayRunCommand(gateway.command("run").description("Run the WebSocket Gateway (foreground)"));
	addGatewayServiceCommands(gateway, { statusDescription: "Show gateway service status + probe the Gateway" });
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
	gateway.command("probe").description("Show gateway reachability + discovery + health + status summary (local + remote)").option("--url <url>", "Explicit Gateway WebSocket URL (still probes localhost)").option("--ssh <target>", "SSH target for remote gateway tunnel (user@host or user@host:port)").option("--ssh-identity <path>", "SSH identity file path").option("--ssh-auto", "Try to derive an SSH target from Bonjour discovery", false).option("--token <token>", "Gateway token (applies to all probes)").option("--password <password>", "Gateway password (applies to all probes)").option("--timeout <ms>", "Overall probe budget in ms", "3000").option("--json", "Output JSON", false).action(async (opts, command) => {
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
