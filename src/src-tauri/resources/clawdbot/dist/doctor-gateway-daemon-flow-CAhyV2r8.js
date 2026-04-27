import { o as getResolvedLoggerSettings } from "./logger-x0IvPL2B.js";
import { v as sleep } from "./utils-BMRcljdi.js";
import { t as formatCliCommand } from "./command-format-BFuugklF.js";
import { u as resolveGatewayPort } from "./paths-BG0ad0P6.js";
import { d as resolveGatewayLaunchAgentLabel, g as resolveNodeLaunchAgentLabel, m as resolveGatewayWindowsTaskName, p as resolveGatewaySystemdServiceName } from "./paths-CT9AMIex.js";
import { n as buildGatewayInstallPlan, r as gatewayInstallErrorHint } from "./auth-install-policy-5UmJXrca.js";
import { n as GATEWAY_DAEMON_RUNTIME_OPTIONS, t as DEFAULT_GATEWAY_DAEMON_RUNTIME } from "./daemon-runtime-BFK5T_3J.js";
import { t as resolveGatewayInstallToken } from "./gateway-install-token-SxWhAwDF.js";
import { i as isSystemdUserServiceAvailable, p as classifySystemdUnavailableDetail } from "./systemd-CRs0dE8y.js";
import { i as launchAgentPlistExists, n as isLaunchAgentListed, r as isLaunchAgentLoaded, s as repairLaunchAgentBootstrap } from "./launchd-DRtoVMuj.js";
import { a as inspectPortUsage, s as formatPortDiagnostics } from "./ports-BNt4VvHz.js";
import { r as resolveGatewayService, t as describeGatewayServiceRestart } from "./service-DKsVbGBH.js";
import { i as resolveDaemonContainerContext, r as formatRuntimeStatus, t as buildPlatformRuntimeLogHints } from "./runtime-hints-DJKu12XX.js";
import "./config-yDDhhyz6.js";
import { n as renderSystemdUnavailableHints, t as isSystemdUnavailableDetail } from "./systemd-hints-C4r43Rg3.js";
import { r as isWSLEnv, t as isWSL } from "./wsl-BAkKopm_.js";
import { t as readLastGatewayErrorLine } from "./diagnostics-DTwOCjVp.js";
import "./logging-DFHb42Bl.js";
import { t as note } from "./note-D_Kkgdi2.js";
import { n as formatHealthCheckFailure } from "./health-format-Cu0AxhMs.js";
import { n as healthCommand } from "./health-DpiT_nOq.js";
//#region src/commands/doctor-format.ts
function formatGatewayRuntimeSummary(runtime) {
	return formatRuntimeStatus(runtime);
}
function buildGatewayRuntimeHints(runtime, options = {}) {
	const hints = [];
	if (!runtime) return hints;
	const platform = options.platform ?? process.platform;
	const env = options.env ?? process.env;
	const container = Boolean(resolveDaemonContainerContext(env));
	const fileLog = (() => {
		try {
			return getResolvedLoggerSettings().file;
		} catch {
			return null;
		}
	})();
	if (platform === "linux" && isSystemdUnavailableDetail(runtime.detail)) {
		hints.push(...renderSystemdUnavailableHints({
			wsl: isWSLEnv(),
			kind: classifySystemdUnavailableDetail(runtime.detail),
			container
		}));
		if (fileLog) hints.push(`File logs: ${fileLog}`);
		return hints;
	}
	if (runtime.cachedLabel && platform === "darwin") {
		const label = resolveGatewayLaunchAgentLabel(env.OPENCLAW_PROFILE);
		hints.push(`LaunchAgent label cached but plist missing. Clear with: launchctl bootout gui/$UID/${label}`);
		hints.push(`Then reinstall: ${formatCliCommand("openclaw gateway install", env)}`);
	}
	if (runtime.missingUnit) {
		hints.push(`Service not installed. Run: ${formatCliCommand("openclaw gateway install", env)}`);
		if (fileLog) hints.push(`File logs: ${fileLog}`);
		return hints;
	}
	if (runtime.status === "stopped") {
		hints.push("Service is loaded but not running (likely exited immediately).");
		if (fileLog) hints.push(`File logs: ${fileLog}`);
		hints.push(...buildPlatformRuntimeLogHints({
			platform,
			env,
			systemdServiceName: resolveGatewaySystemdServiceName(env.OPENCLAW_PROFILE),
			windowsTaskName: resolveGatewayWindowsTaskName(env.OPENCLAW_PROFILE)
		}));
	}
	return hints;
}
//#endregion
//#region src/commands/doctor-gateway-daemon-flow.ts
async function maybeRepairLaunchAgentBootstrap(params) {
	if (process.platform !== "darwin") return false;
	if (!await isLaunchAgentListed({ env: params.env })) return false;
	if (await isLaunchAgentLoaded({ env: params.env })) return false;
	if (!await launchAgentPlistExists(params.env)) return false;
	note("LaunchAgent is listed but not loaded in launchd.", `${params.title} LaunchAgent`);
	if (!await params.prompter.confirmRuntimeRepair({
		message: `Repair ${params.title} LaunchAgent bootstrap now?`,
		initialValue: true
	})) return false;
	params.runtime.log(`Bootstrapping ${params.title} LaunchAgent...`);
	const repair = await repairLaunchAgentBootstrap({ env: params.env });
	if (!repair.ok) {
		params.runtime.error(`${params.title} LaunchAgent bootstrap failed: ${repair.detail ?? "unknown error"}`);
		return false;
	}
	if (!await isLaunchAgentLoaded({ env: params.env })) {
		params.runtime.error(`${params.title} LaunchAgent still not loaded after repair.`);
		return false;
	}
	note(`${params.title} LaunchAgent repaired.`, `${params.title} LaunchAgent`);
	return true;
}
async function maybeRepairGatewayDaemon(params) {
	if (params.healthOk) return;
	const service = resolveGatewayService();
	let loaded = false;
	try {
		loaded = await service.isLoaded({ env: process.env });
	} catch {
		loaded = false;
	}
	let serviceRuntime;
	if (loaded) serviceRuntime = await service.readRuntime(process.env).catch(() => void 0);
	if (process.platform === "darwin" && params.cfg.gateway?.mode !== "remote") {
		const gatewayRepaired = await maybeRepairLaunchAgentBootstrap({
			env: process.env,
			title: "Gateway",
			runtime: params.runtime,
			prompter: params.prompter
		});
		await maybeRepairLaunchAgentBootstrap({
			env: {
				...process.env,
				OPENCLAW_LAUNCHD_LABEL: resolveNodeLaunchAgentLabel()
			},
			title: "Node",
			runtime: params.runtime,
			prompter: params.prompter
		});
		if (gatewayRepaired) {
			loaded = await service.isLoaded({ env: process.env });
			if (loaded) serviceRuntime = await service.readRuntime(process.env).catch(() => void 0);
		}
	}
	if (params.cfg.gateway?.mode !== "remote") {
		const diagnostics = await inspectPortUsage(resolveGatewayPort(params.cfg, process.env));
		if (diagnostics.status === "busy") note(formatPortDiagnostics(diagnostics).join("\n"), "Gateway port");
		else if (loaded && serviceRuntime?.status === "running") {
			const lastError = await readLastGatewayErrorLine(process.env);
			if (lastError) note(`Last gateway error: ${lastError}`, "Gateway");
		}
	}
	if (!loaded) {
		if (process.platform === "linux") {
			if (!await isSystemdUserServiceAvailable().catch(() => false)) {
				note(renderSystemdUnavailableHints({
					wsl: await isWSL(),
					kind: "generic_unavailable"
				}).join("\n"), "Gateway");
				return;
			}
		}
		note("Gateway service not installed.", "Gateway");
		if (params.cfg.gateway?.mode !== "remote") {
			if (await params.prompter.confirmRuntimeRepair({
				message: "Install gateway service now?",
				initialValue: true
			})) {
				const daemonRuntime = await params.prompter.select({
					message: "Gateway service runtime",
					options: GATEWAY_DAEMON_RUNTIME_OPTIONS,
					initialValue: DEFAULT_GATEWAY_DAEMON_RUNTIME
				}, DEFAULT_GATEWAY_DAEMON_RUNTIME);
				const tokenResolution = await resolveGatewayInstallToken({
					config: params.cfg,
					env: process.env
				});
				for (const warning of tokenResolution.warnings) note(warning, "Gateway");
				if (tokenResolution.unavailableReason) {
					note([
						"Gateway service install aborted.",
						tokenResolution.unavailableReason,
						"Fix gateway auth config/token input and rerun doctor."
					].join("\n"), "Gateway");
					return;
				}
				const port = resolveGatewayPort(params.cfg, process.env);
				const { programArguments, workingDirectory, environment } = await buildGatewayInstallPlan({
					env: process.env,
					port,
					runtime: daemonRuntime,
					warn: (message, title) => note(message, title),
					config: params.cfg
				});
				try {
					await service.install({
						env: process.env,
						stdout: process.stdout,
						programArguments,
						workingDirectory,
						environment
					});
				} catch (err) {
					note(`Gateway service install failed: ${String(err)}`, "Gateway");
					note(gatewayInstallErrorHint(), "Gateway");
				}
			}
		}
		return;
	}
	const summary = formatGatewayRuntimeSummary(serviceRuntime);
	const hints = buildGatewayRuntimeHints(serviceRuntime, {
		platform: process.platform,
		env: process.env
	});
	if (summary || hints.length > 0) {
		const lines = [];
		if (summary) lines.push(`Runtime: ${summary}`);
		lines.push(...hints);
		note(lines.join("\n"), "Gateway");
	}
	if (serviceRuntime?.status !== "running") {
		if (await params.prompter.confirmRuntimeRepair({
			message: "Start gateway service now?",
			initialValue: true
		})) {
			const restartStatus = describeGatewayServiceRestart("Gateway", await service.restart({
				env: process.env,
				stdout: process.stdout
			}));
			if (!restartStatus.scheduled) await sleep(1500);
			else note(restartStatus.message, "Gateway");
		}
	}
	if (process.platform === "darwin") {
		const label = resolveGatewayLaunchAgentLabel(process.env.OPENCLAW_PROFILE);
		note(`LaunchAgent loaded; stopping requires "${formatCliCommand("openclaw gateway stop")}" or launchctl bootout gui/$UID/${label}.`, "Gateway");
	}
	if (serviceRuntime?.status === "running") {
		if (await params.prompter.confirmRuntimeRepair({
			message: "Restart gateway service now?",
			initialValue: true
		})) {
			const restartStatus = describeGatewayServiceRestart("Gateway", await service.restart({
				env: process.env,
				stdout: process.stdout
			}));
			if (restartStatus.scheduled) {
				note(restartStatus.message, "Gateway");
				return;
			}
			await sleep(1500);
			try {
				await healthCommand({
					json: false,
					timeoutMs: 1e4
				}, params.runtime);
			} catch (err) {
				if (String(err).includes("gateway closed")) {
					note("Gateway not running.", "Gateway");
					note(params.gatewayDetailsMessage, "Gateway connection");
				} else params.runtime.error(formatHealthCheckFailure(err));
			}
		}
	}
}
//#endregion
export { maybeRepairGatewayDaemon };
