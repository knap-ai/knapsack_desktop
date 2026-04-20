import { s as normalizeOptionalString } from "./string-coerce-BUSzWgUA.js";
import { n as defaultRuntime } from "./runtime-Dx7oeLYq.js";
import { r as theme } from "./theme-D5sxSdHD.js";
import { t as formatCliCommand } from "./command-format-Dd3uP9-6.js";
import { u as resolveGatewayPort } from "./paths-Dvv9VRAc.js";
import { c as readBestEffortConfig } from "./io-5pxHCi7V.js";
import { i as launchAgentPlistExists, s as repairLaunchAgentBootstrap } from "./launchd-Bk3hz4bn.js";
import { d as formatGatewayPidList, f as signalVerifiedGatewayPidSync, u as findVerifiedGatewayListenerPidsOnPortSync } from "./schtasks-CFOo0cPs.js";
import { r as resolveGatewayService } from "./service-DkbTemHA.js";
import { l as renderGatewayServiceStartHints, s as parsePortFromArgs } from "./shared-B7diuUph.js";
import { n as isRestartEnabled } from "./commands.flags-DTSeDvkD.js";
import "./config-Q9XZc_2I.js";
import { i as probeGateway } from "./probe-BQKUsIcx.js";
import { i as runServiceUninstall, n as runServiceStart, r as runServiceStop, t as runServiceRestart } from "./lifecycle-core-DNyjPioz.js";
import { a as renderGatewayPortHealthDiagnostics, c as waitForGatewayHealthyListener, l as waitForGatewayHealthyRestart, o as renderRestartDiagnostics, s as terminateStaleGatewayPids, t as DEFAULT_RESTART_HEALTH_ATTEMPTS } from "./restart-health-BZcHItfA.js";
//#region src/cli/daemon-cli/launchd-recovery.ts
const LAUNCH_AGENT_RECOVERY_MESSAGE = "Gateway LaunchAgent was installed but not loaded; re-bootstrapped launchd service.";
async function recoverInstalledLaunchAgent(params) {
	if (process.platform !== "darwin") return null;
	const env = params.env ?? process.env;
	if (!await launchAgentPlistExists(env).catch(() => false)) return null;
	if (!(await repairLaunchAgentBootstrap({ env }).catch(() => ({
		ok: false,
		status: "bootstrap-failed"
	}))).ok) return null;
	return {
		result: params.result,
		loaded: true,
		message: LAUNCH_AGENT_RECOVERY_MESSAGE
	};
}
//#endregion
//#region src/cli/daemon-cli/lifecycle.ts
const POST_RESTART_HEALTH_ATTEMPTS = DEFAULT_RESTART_HEALTH_ATTEMPTS;
const POST_RESTART_HEALTH_DELAY_MS = 500;
function formatRestartFailure(params) {
	if (params.health.waitOutcome === "stopped-free") {
		const elapsedSeconds = Math.max(1, Math.round((params.health.elapsedMs ?? 0) / 1e3));
		return {
			statusLine: `Gateway restart failed after ${elapsedSeconds}s: service stayed stopped and port ${params.port} stayed free.`,
			failMessage: `Gateway restart failed after ${elapsedSeconds}s: service stayed stopped and health checks never came up.`
		};
	}
	return {
		statusLine: `Timed out after ${params.timeoutSeconds}s waiting for gateway port ${params.port} to become healthy.`,
		failMessage: `Gateway restart timed out after ${params.timeoutSeconds}s waiting for health checks.`
	};
}
async function resolveGatewayLifecyclePort(service = resolveGatewayService()) {
	const command = await service.readCommand(process.env).catch(() => null);
	const serviceEnv = command?.environment ?? void 0;
	const mergedEnv = {
		...process.env,
		...serviceEnv ?? void 0
	};
	return parsePortFromArgs(command?.programArguments) ?? resolveGatewayPort(await readBestEffortConfig(), mergedEnv);
}
function resolveGatewayPortFallback() {
	return readBestEffortConfig().then((cfg) => resolveGatewayPort(cfg, process.env)).catch(() => resolveGatewayPort(void 0, process.env));
}
async function assertUnmanagedGatewayRestartEnabled(port) {
	const probe = await probeGateway({
		url: `${!!(await readBestEffortConfig().catch(() => void 0))?.gateway?.tls?.enabled ? "wss" : "ws"}://127.0.0.1:${port}`,
		auth: {
			token: normalizeOptionalString(process.env.OPENCLAW_GATEWAY_TOKEN),
			password: normalizeOptionalString(process.env.OPENCLAW_GATEWAY_PASSWORD)
		},
		timeoutMs: 1e3
	}).catch(() => null);
	if (!probe?.ok) return;
	if (!isRestartEnabled(probe.configSnapshot)) throw new Error("Gateway restart is disabled in the running gateway config (commands.restart=false); unmanaged SIGUSR1 restart would be ignored");
}
function resolveVerifiedGatewayListenerPids(port) {
	return findVerifiedGatewayListenerPidsOnPortSync(port).filter((pid) => Number.isFinite(pid) && pid > 0);
}
async function stopGatewayWithoutServiceManager(port) {
	const pids = resolveVerifiedGatewayListenerPids(port);
	if (pids.length === 0) return null;
	for (const pid of pids) signalVerifiedGatewayPidSync(pid, "SIGTERM");
	return {
		result: "stopped",
		message: `Gateway stop signal sent to unmanaged process${pids.length === 1 ? "" : "es"} on port ${port}: ${formatGatewayPidList(pids)}.`
	};
}
async function restartGatewayWithoutServiceManager(port) {
	await assertUnmanagedGatewayRestartEnabled(port);
	const pids = resolveVerifiedGatewayListenerPids(port);
	if (pids.length === 0) return null;
	if (pids.length > 1) throw new Error(`multiple gateway processes are listening on port ${port}: ${formatGatewayPidList(pids)}; use "openclaw gateway status --deep" before retrying restart`);
	signalVerifiedGatewayPidSync(pids[0], "SIGUSR1");
	return {
		result: "restarted",
		message: `Gateway restart signal sent to unmanaged process on port ${port}: ${pids[0]}.`
	};
}
async function runDaemonUninstall(opts = {}) {
	return await runServiceUninstall({
		serviceNoun: "Gateway",
		service: resolveGatewayService(),
		opts,
		stopBeforeUninstall: true,
		assertNotLoadedAfterUninstall: true
	});
}
async function runDaemonStart(opts = {}) {
	return await runServiceStart({
		serviceNoun: "Gateway",
		service: resolveGatewayService(),
		renderStartHints: renderGatewayServiceStartHints,
		onNotLoaded: process.platform === "darwin" ? async () => await recoverInstalledLaunchAgent({ result: "started" }) : void 0,
		opts
	});
}
async function runDaemonStop(opts = {}) {
	const service = resolveGatewayService();
	let gatewayPortPromise;
	return await runServiceStop({
		serviceNoun: "Gateway",
		service,
		opts,
		onNotLoaded: async () => {
			gatewayPortPromise ??= resolveGatewayLifecyclePort(service).catch(() => resolveGatewayPortFallback());
			return await stopGatewayWithoutServiceManager(await gatewayPortPromise);
		}
	});
}
/**
* Restart the gateway service service.
* @returns `true` if restart succeeded, `false` if the service was not loaded.
* Throws/exits on check or restart failures.
*/
async function runDaemonRestart(opts = {}) {
	const json = Boolean(opts.json);
	const service = resolveGatewayService();
	let restartedWithoutServiceManager = false;
	const restartPort = await resolveGatewayLifecyclePort(service).catch(() => resolveGatewayPortFallback());
	const restartWaitMs = POST_RESTART_HEALTH_ATTEMPTS * POST_RESTART_HEALTH_DELAY_MS;
	const restartWaitSeconds = Math.round(restartWaitMs / 1e3);
	return await runServiceRestart({
		serviceNoun: "Gateway",
		service,
		renderStartHints: renderGatewayServiceStartHints,
		opts,
		checkTokenDrift: true,
		onNotLoaded: async () => {
			const handled = await restartGatewayWithoutServiceManager(restartPort);
			if (handled) {
				restartedWithoutServiceManager = true;
				return handled;
			}
			return await recoverInstalledLaunchAgent({ result: "restarted" });
		},
		postRestartCheck: async ({ warnings, fail, stdout }) => {
			if (restartedWithoutServiceManager) {
				const health = await waitForGatewayHealthyListener({
					port: restartPort,
					attempts: POST_RESTART_HEALTH_ATTEMPTS,
					delayMs: POST_RESTART_HEALTH_DELAY_MS
				});
				if (health.healthy) return;
				const diagnostics = renderGatewayPortHealthDiagnostics(health);
				const timeoutLine = `Timed out after ${restartWaitSeconds}s waiting for gateway port ${restartPort} to become healthy.`;
				if (!json) {
					defaultRuntime.log(theme.warn(timeoutLine));
					for (const line of diagnostics) defaultRuntime.log(theme.muted(line));
				} else {
					warnings.push(timeoutLine);
					warnings.push(...diagnostics);
				}
				fail(`Gateway restart timed out after ${restartWaitSeconds}s waiting for health checks.`, [formatCliCommand("openclaw gateway status --deep"), formatCliCommand("openclaw doctor")]);
				throw new Error("unreachable after gateway restart health failure");
			}
			let health = await waitForGatewayHealthyRestart({
				service,
				port: restartPort,
				attempts: POST_RESTART_HEALTH_ATTEMPTS,
				delayMs: POST_RESTART_HEALTH_DELAY_MS,
				includeUnknownListenersAsStale: process.platform === "win32"
			});
			if (!health.healthy && health.staleGatewayPids.length > 0) {
				const staleMsg = `Found stale gateway process(es): ${health.staleGatewayPids.join(", ")}.`;
				warnings.push(staleMsg);
				if (!json) {
					defaultRuntime.log(theme.warn(staleMsg));
					defaultRuntime.log(theme.muted("Stopping stale process(es) and retrying restart..."));
				}
				await terminateStaleGatewayPids(health.staleGatewayPids);
				const retryRestart = await service.restart({
					env: process.env,
					stdout
				});
				if (retryRestart.outcome === "scheduled") return retryRestart;
				health = await waitForGatewayHealthyRestart({
					service,
					port: restartPort,
					attempts: POST_RESTART_HEALTH_ATTEMPTS,
					delayMs: POST_RESTART_HEALTH_DELAY_MS,
					includeUnknownListenersAsStale: process.platform === "win32"
				});
			}
			if (health.healthy) return;
			const diagnostics = renderRestartDiagnostics(health);
			const failure = formatRestartFailure({
				health,
				port: restartPort,
				timeoutSeconds: restartWaitSeconds
			});
			const runningNoPortLine = health.runtime.status === "running" && health.portUsage.status === "free" ? `Gateway process is running but port ${restartPort} is still free (startup hang/crash loop or very slow VM startup).` : null;
			if (!json) {
				defaultRuntime.log(theme.warn(failure.statusLine));
				if (runningNoPortLine) defaultRuntime.log(theme.warn(runningNoPortLine));
				for (const line of diagnostics) defaultRuntime.log(theme.muted(line));
			} else {
				warnings.push(failure.statusLine);
				if (runningNoPortLine) warnings.push(runningNoPortLine);
				warnings.push(...diagnostics);
			}
			fail(failure.failMessage, [formatCliCommand("openclaw gateway status --deep"), formatCliCommand("openclaw doctor")]);
			throw new Error("unreachable after gateway restart failure");
		}
	});
}
//#endregion
export { runDaemonUninstall as i, runDaemonStart as n, runDaemonStop as r, runDaemonRestart as t };
