import { t as __exportAll } from "./rolldown-runtime-Cbj13DAv.js";
import { $ as resolveStateDir, A as colorize, F as getResolvedLoggerSettings, J as resolveIsNixMode, M as theme, U as resolveConfigPath, h as defaultRuntime, j as isRich, q as resolveGatewayPort } from "./entry.js";
import { t as formatCliCommand } from "./command-format-CVN3MX2Q.js";
import { S as shortenHomePath } from "./utils-q1rHOG-N.js";
import { i as loadConfig, l as writeConfigFile, o as readConfigFileSnapshot, r as createConfigIO } from "./config-BJWIHf6x.js";
import { h as GATEWAY_CLIENT_NAMES, m as GATEWAY_CLIENT_MODES } from "./message-channel-D-iPIX3C.js";
import { t as pickPrimaryTailnetIPv4 } from "./tailnet-3BgKN5Il.js";
import { l as resolveGatewayBindHost } from "./ws-D56uQr0E.js";
import { i as resolveGatewayAuth } from "./auth-DaQXd14b.js";
import { i as formatPortDiagnostics, n as inspectPortUsage } from "./ports-C5vKQsaq.js";
import { n as callGateway } from "./call-FZUZ5EU4.js";
import { t as formatDocsLink } from "./links-C_tOT2wV.js";
import { n as withProgress } from "./progress-C4IJwa0T.js";
import { h as resolveControlUiLinks, m as randomToken } from "./onboard-helpers-HBGG6t5A.js";
import { n as isWSLEnv, t as isWSL } from "./wsl-D0QpX5NZ.js";
import { d as resolveGatewaySystemdServiceName, l as resolveGatewayLaunchAgentLabel } from "./constants-BnUiPMIW.js";
import { i as buildGatewayInstallPlan, r as isGatewayDaemonRuntime, t as DEFAULT_GATEWAY_DAEMON_RUNTIME } from "./daemon-runtime-CPrv-rEf.js";
import { o as resolveGatewayLogPaths, t as resolveGatewayService } from "./service-q_Baxtp9.js";
import { r as isSystemdUserServiceAvailable } from "./systemd-BmDw_juR.js";
import { a as parsePortFromArgs, c as renderRuntimeHints, d as createNullWriter, f as emitDaemonActionJson, i as parsePort, l as safeDaemonEnv, n as formatRuntimeStatus, o as pickProbeHostForBind, r as normalizeListenerAddress, s as renderGatewayServiceStartHints, t as filterDaemonEnv, u as buildDaemonServiceSnapshot } from "./shared-B3kg6sBC.js";
import { n as renderSystemdUnavailableHints, t as isSystemdUnavailableDetail } from "./systemd-hints-B67UJCMI.js";
import { t as readLastGatewayErrorLine } from "./diagnostics-D5dLtThb.js";
import { a as renderGatewayServiceCleanupHints, i as findExtraGatewayServices, n as auditGatewayServiceConfig } from "./service-audit-b749O_L6.js";

//#region src/cli/daemon-cli/install.ts
async function runDaemonInstall(opts) {
	const json = Boolean(opts.json);
	const warnings = [];
	const stdout = json ? createNullWriter() : process.stdout;
	const emit = (payload) => {
		if (!json) return;
		emitDaemonActionJson({
			action: "install",
			...payload
		});
	};
	const fail = (message) => {
		if (json) emit({
			ok: false,
			error: message,
			warnings: warnings.length ? warnings : void 0
		});
		else defaultRuntime.error(message);
		defaultRuntime.exit(1);
	};
	if (resolveIsNixMode(process.env)) {
		fail("Nix mode detected; service install is disabled.");
		return;
	}
	const cfg = loadConfig();
	const portOverride = parsePort(opts.port);
	if (opts.port !== void 0 && portOverride === null) {
		fail("Invalid port");
		return;
	}
	const port = portOverride ?? resolveGatewayPort(cfg);
	if (!Number.isFinite(port) || port <= 0) {
		fail("Invalid port");
		return;
	}
	const runtimeRaw = opts.runtime ? String(opts.runtime) : DEFAULT_GATEWAY_DAEMON_RUNTIME;
	if (!isGatewayDaemonRuntime(runtimeRaw)) {
		fail("Invalid --runtime (use \"node\" or \"bun\")");
		return;
	}
	const service = resolveGatewayService();
	let loaded = false;
	try {
		loaded = await service.isLoaded({ env: process.env });
	} catch (err) {
		fail(`Gateway service check failed: ${String(err)}`);
		return;
	}
	if (loaded) {
		if (!opts.force) {
			emit({
				ok: true,
				result: "already-installed",
				message: `Gateway service already ${service.loadedText}.`,
				service: buildDaemonServiceSnapshot(service, loaded),
				warnings: warnings.length ? warnings : void 0
			});
			if (!json) {
				defaultRuntime.log(`Gateway service already ${service.loadedText}.`);
				defaultRuntime.log(`Reinstall with: ${formatCliCommand("openclaw gateway install --force")}`);
			}
			return;
		}
	}
	const resolvedAuth = resolveGatewayAuth({
		authConfig: cfg.gateway?.auth,
		tailscaleMode: cfg.gateway?.tailscale?.mode ?? "off"
	});
	const needsToken = resolvedAuth.mode === "token" && !resolvedAuth.token && !resolvedAuth.allowTailscale;
	let token = opts.token || cfg.gateway?.auth?.token || process.env.OPENCLAW_GATEWAY_TOKEN || process.env.CLAWDBOT_GATEWAY_TOKEN;
	if (!token && needsToken) {
		token = randomToken();
		const warnMsg = "No gateway token found. Auto-generated one and saving to config.";
		if (json) warnings.push(warnMsg);
		else defaultRuntime.log(warnMsg);
		try {
			const snapshot = await readConfigFileSnapshot();
			if (snapshot.exists && !snapshot.valid) {
				const msg = "Warning: config file exists but is invalid; skipping token persistence.";
				if (json) warnings.push(msg);
				else defaultRuntime.log(msg);
			} else {
				const baseConfig = snapshot.exists ? snapshot.config : {};
				if (!baseConfig.gateway?.auth?.token) await writeConfigFile({
					...baseConfig,
					gateway: {
						...baseConfig.gateway,
						auth: {
							...baseConfig.gateway?.auth,
							mode: baseConfig.gateway?.auth?.mode ?? "token",
							token
						}
					}
				});
				else token = baseConfig.gateway.auth.token;
			}
		} catch (err) {
			const msg = `Warning: could not persist token to config: ${String(err)}`;
			if (json) warnings.push(msg);
			else defaultRuntime.log(msg);
		}
	}
	const { programArguments, workingDirectory, environment } = await buildGatewayInstallPlan({
		env: process.env,
		port,
		token,
		runtime: runtimeRaw,
		warn: (message) => {
			if (json) warnings.push(message);
			else defaultRuntime.log(message);
		},
		config: cfg
	});
	try {
		await service.install({
			env: process.env,
			stdout,
			programArguments,
			workingDirectory,
			environment
		});
	} catch (err) {
		fail(`Gateway install failed: ${String(err)}`);
		return;
	}
	let installed = true;
	try {
		installed = await service.isLoaded({ env: process.env });
	} catch {
		installed = true;
	}
	emit({
		ok: true,
		result: "installed",
		service: buildDaemonServiceSnapshot(service, installed),
		warnings: warnings.length ? warnings : void 0
	});
}

//#endregion
//#region src/cli/daemon-cli/lifecycle.ts
async function runDaemonUninstall(opts = {}) {
	const json = Boolean(opts.json);
	const stdout = json ? createNullWriter() : process.stdout;
	const emit = (payload) => {
		if (!json) return;
		emitDaemonActionJson({
			action: "uninstall",
			...payload
		});
	};
	const fail = (message) => {
		if (json) emit({
			ok: false,
			error: message
		});
		else defaultRuntime.error(message);
		defaultRuntime.exit(1);
	};
	if (resolveIsNixMode(process.env)) {
		fail("Nix mode detected; service uninstall is disabled.");
		return;
	}
	const service = resolveGatewayService();
	let loaded = false;
	try {
		loaded = await service.isLoaded({ env: process.env });
	} catch {
		loaded = false;
	}
	if (loaded) try {
		await service.stop({
			env: process.env,
			stdout
		});
	} catch {}
	try {
		await service.uninstall({
			env: process.env,
			stdout
		});
	} catch (err) {
		fail(`Gateway uninstall failed: ${String(err)}`);
		return;
	}
	loaded = false;
	try {
		loaded = await service.isLoaded({ env: process.env });
	} catch {
		loaded = false;
	}
	if (loaded) {
		fail("Gateway service still loaded after uninstall.");
		return;
	}
	emit({
		ok: true,
		result: "uninstalled",
		service: buildDaemonServiceSnapshot(service, loaded)
	});
}
async function runDaemonStart(opts = {}) {
	const json = Boolean(opts.json);
	const stdout = json ? createNullWriter() : process.stdout;
	const emit = (payload) => {
		if (!json) return;
		emitDaemonActionJson({
			action: "start",
			...payload
		});
	};
	const fail = (message, hints) => {
		if (json) emit({
			ok: false,
			error: message,
			hints
		});
		else defaultRuntime.error(message);
		defaultRuntime.exit(1);
	};
	const service = resolveGatewayService();
	let loaded = false;
	try {
		loaded = await service.isLoaded({ env: process.env });
	} catch (err) {
		fail(`Gateway service check failed: ${String(err)}`);
		return;
	}
	if (!loaded) {
		let hints = renderGatewayServiceStartHints();
		if (process.platform === "linux") {
			if (!await isSystemdUserServiceAvailable().catch(() => false)) hints = [...hints, ...renderSystemdUnavailableHints({ wsl: await isWSL() })];
		}
		emit({
			ok: true,
			result: "not-loaded",
			message: `Gateway service ${service.notLoadedText}.`,
			hints,
			service: buildDaemonServiceSnapshot(service, loaded)
		});
		if (!json) {
			defaultRuntime.log(`Gateway service ${service.notLoadedText}.`);
			for (const hint of hints) defaultRuntime.log(`Start with: ${hint}`);
		}
		return;
	}
	try {
		await service.restart({
			env: process.env,
			stdout
		});
	} catch (err) {
		const hints = renderGatewayServiceStartHints();
		fail(`Gateway start failed: ${String(err)}`, hints);
		return;
	}
	let started = true;
	try {
		started = await service.isLoaded({ env: process.env });
	} catch {
		started = true;
	}
	emit({
		ok: true,
		result: "started",
		service: buildDaemonServiceSnapshot(service, started)
	});
}
async function runDaemonStop(opts = {}) {
	const json = Boolean(opts.json);
	const stdout = json ? createNullWriter() : process.stdout;
	const emit = (payload) => {
		if (!json) return;
		emitDaemonActionJson({
			action: "stop",
			...payload
		});
	};
	const fail = (message) => {
		if (json) emit({
			ok: false,
			error: message
		});
		else defaultRuntime.error(message);
		defaultRuntime.exit(1);
	};
	const service = resolveGatewayService();
	let loaded = false;
	try {
		loaded = await service.isLoaded({ env: process.env });
	} catch (err) {
		fail(`Gateway service check failed: ${String(err)}`);
		return;
	}
	if (!loaded) {
		emit({
			ok: true,
			result: "not-loaded",
			message: `Gateway service ${service.notLoadedText}.`,
			service: buildDaemonServiceSnapshot(service, loaded)
		});
		if (!json) defaultRuntime.log(`Gateway service ${service.notLoadedText}.`);
		return;
	}
	try {
		await service.stop({
			env: process.env,
			stdout
		});
	} catch (err) {
		fail(`Gateway stop failed: ${String(err)}`);
		return;
	}
	let stopped = false;
	try {
		stopped = await service.isLoaded({ env: process.env });
	} catch {
		stopped = false;
	}
	emit({
		ok: true,
		result: "stopped",
		service: buildDaemonServiceSnapshot(service, stopped)
	});
}
/**
* Restart the gateway service service.
* @returns `true` if restart succeeded, `false` if the service was not loaded.
* Throws/exits on check or restart failures.
*/
async function runDaemonRestart(opts = {}) {
	const json = Boolean(opts.json);
	const stdout = json ? createNullWriter() : process.stdout;
	const emit = (payload) => {
		if (!json) return;
		emitDaemonActionJson({
			action: "restart",
			...payload
		});
	};
	const fail = (message, hints) => {
		if (json) emit({
			ok: false,
			error: message,
			hints
		});
		else defaultRuntime.error(message);
		defaultRuntime.exit(1);
	};
	const service = resolveGatewayService();
	let loaded = false;
	try {
		loaded = await service.isLoaded({ env: process.env });
	} catch (err) {
		fail(`Gateway service check failed: ${String(err)}`);
		return false;
	}
	if (!loaded) {
		let hints = renderGatewayServiceStartHints();
		if (process.platform === "linux") {
			if (!await isSystemdUserServiceAvailable().catch(() => false)) hints = [...hints, ...renderSystemdUnavailableHints({ wsl: await isWSL() })];
		}
		emit({
			ok: true,
			result: "not-loaded",
			message: `Gateway service ${service.notLoadedText}.`,
			hints,
			service: buildDaemonServiceSnapshot(service, loaded)
		});
		if (!json) {
			defaultRuntime.log(`Gateway service ${service.notLoadedText}.`);
			for (const hint of hints) defaultRuntime.log(`Start with: ${hint}`);
		}
		return false;
	}
	try {
		await service.restart({
			env: process.env,
			stdout
		});
		let restarted = true;
		try {
			restarted = await service.isLoaded({ env: process.env });
		} catch {
			restarted = true;
		}
		emit({
			ok: true,
			result: "restarted",
			service: buildDaemonServiceSnapshot(service, restarted)
		});
		return true;
	} catch (err) {
		const hints = renderGatewayServiceStartHints();
		fail(`Gateway restart failed: ${String(err)}`, hints);
		return false;
	}
}

//#endregion
//#region src/cli/daemon-cli/probe.ts
async function probeGatewayStatus(opts) {
	try {
		await withProgress({
			label: "Checking gateway status...",
			indeterminate: true,
			enabled: opts.json !== true
		}, async () => await callGateway({
			url: opts.url,
			token: opts.token,
			password: opts.password,
			method: "status",
			timeoutMs: opts.timeoutMs,
			clientName: GATEWAY_CLIENT_NAMES.CLI,
			mode: GATEWAY_CLIENT_MODES.CLI,
			...opts.configPath ? { configPath: opts.configPath } : {}
		}));
		return { ok: true };
	} catch (err) {
		return {
			ok: false,
			error: err instanceof Error ? err.message : String(err)
		};
	}
}

//#endregion
//#region src/cli/daemon-cli/status.gather.ts
function shouldReportPortUsage(status, rpcOk) {
	if (status !== "busy") return false;
	if (rpcOk === true) return false;
	return true;
}
async function gatherDaemonStatus(opts) {
	const service = resolveGatewayService();
	const [loaded, command, runtime] = await Promise.all([
		service.isLoaded({ env: process.env }).catch(() => false),
		service.readCommand(process.env).catch(() => null),
		service.readRuntime(process.env).catch((err) => ({
			status: "unknown",
			detail: String(err)
		}))
	]);
	const configAudit = await auditGatewayServiceConfig({
		env: process.env,
		command
	});
	const serviceEnv = command?.environment ?? void 0;
	const mergedDaemonEnv = {
		...process.env,
		...serviceEnv ?? void 0
	};
	const cliConfigPath = resolveConfigPath(process.env, resolveStateDir(process.env));
	const daemonConfigPath = resolveConfigPath(mergedDaemonEnv, resolveStateDir(mergedDaemonEnv));
	const cliIO = createConfigIO({
		env: process.env,
		configPath: cliConfigPath
	});
	const daemonIO = createConfigIO({
		env: mergedDaemonEnv,
		configPath: daemonConfigPath
	});
	const [cliSnapshot, daemonSnapshot] = await Promise.all([cliIO.readConfigFileSnapshot().catch(() => null), daemonIO.readConfigFileSnapshot().catch(() => null)]);
	const cliCfg = cliIO.loadConfig();
	const daemonCfg = daemonIO.loadConfig();
	const cliConfigSummary = {
		path: cliSnapshot?.path ?? cliConfigPath,
		exists: cliSnapshot?.exists ?? false,
		valid: cliSnapshot?.valid ?? true,
		...cliSnapshot?.issues?.length ? { issues: cliSnapshot.issues } : {},
		controlUi: cliCfg.gateway?.controlUi
	};
	const daemonConfigSummary = {
		path: daemonSnapshot?.path ?? daemonConfigPath,
		exists: daemonSnapshot?.exists ?? false,
		valid: daemonSnapshot?.valid ?? true,
		...daemonSnapshot?.issues?.length ? { issues: daemonSnapshot.issues } : {},
		controlUi: daemonCfg.gateway?.controlUi
	};
	const configMismatch = cliConfigSummary.path !== daemonConfigSummary.path;
	const portFromArgs = parsePortFromArgs(command?.programArguments);
	const daemonPort = portFromArgs ?? resolveGatewayPort(daemonCfg, mergedDaemonEnv);
	const portSource = portFromArgs ? "service args" : "env/config";
	const bindMode = daemonCfg.gateway?.bind ?? "loopback";
	const customBindHost = daemonCfg.gateway?.customBindHost;
	const bindHost = await resolveGatewayBindHost(bindMode, customBindHost);
	const probeHost = pickProbeHostForBind(bindMode, pickPrimaryTailnetIPv4(), customBindHost);
	const probeUrlOverride = typeof opts.rpc.url === "string" && opts.rpc.url.trim().length > 0 ? opts.rpc.url.trim() : null;
	const probeUrl = probeUrlOverride ?? `ws://${probeHost}:${daemonPort}`;
	const probeNote = !probeUrlOverride && bindMode === "lan" ? `bind=lan listens on 0.0.0.0 (all interfaces); probing via ${probeHost}.` : !probeUrlOverride && bindMode === "loopback" ? "Loopback-only gateway; only local clients can connect." : void 0;
	const cliPort = resolveGatewayPort(cliCfg, process.env);
	const [portDiagnostics, portCliDiagnostics] = await Promise.all([inspectPortUsage(daemonPort).catch(() => null), cliPort !== daemonPort ? inspectPortUsage(cliPort).catch(() => null) : null]);
	const portStatus = portDiagnostics ? {
		port: portDiagnostics.port,
		status: portDiagnostics.status,
		listeners: portDiagnostics.listeners,
		hints: portDiagnostics.hints
	} : void 0;
	const portCliStatus = portCliDiagnostics ? {
		port: portCliDiagnostics.port,
		status: portCliDiagnostics.status,
		listeners: portCliDiagnostics.listeners,
		hints: portCliDiagnostics.hints
	} : void 0;
	const extraServices = await findExtraGatewayServices(process.env, { deep: Boolean(opts.deep) }).catch(() => []);
	const timeoutMsRaw = Number.parseInt(String(opts.rpc.timeout ?? "10000"), 10);
	const timeoutMs = Number.isFinite(timeoutMsRaw) && timeoutMsRaw > 0 ? timeoutMsRaw : 1e4;
	const rpc = opts.probe ? await probeGatewayStatus({
		url: probeUrl,
		token: opts.rpc.token || mergedDaemonEnv.OPENCLAW_GATEWAY_TOKEN || daemonCfg.gateway?.auth?.token,
		password: opts.rpc.password || mergedDaemonEnv.OPENCLAW_GATEWAY_PASSWORD || daemonCfg.gateway?.auth?.password,
		timeoutMs,
		json: opts.rpc.json,
		configPath: daemonConfigSummary.path
	}) : void 0;
	let lastError;
	if (loaded && runtime?.status === "running" && portStatus && portStatus.status !== "busy") lastError = await readLastGatewayErrorLine(mergedDaemonEnv) ?? void 0;
	return {
		service: {
			label: service.label,
			loaded,
			loadedText: service.loadedText,
			notLoadedText: service.notLoadedText,
			command,
			runtime,
			configAudit
		},
		config: {
			cli: cliConfigSummary,
			daemon: daemonConfigSummary,
			...configMismatch ? { mismatch: true } : {}
		},
		gateway: {
			bindMode,
			bindHost,
			customBindHost,
			port: daemonPort,
			portSource,
			probeUrl,
			...probeNote ? { probeNote } : {}
		},
		port: portStatus,
		...portCliStatus ? { portCli: portCliStatus } : {},
		lastError,
		...rpc ? { rpc: {
			...rpc,
			url: probeUrl
		} } : {},
		extraServices
	};
}
function renderPortDiagnosticsForCli(status, rpcOk) {
	if (!status.port || !shouldReportPortUsage(status.port.status, rpcOk)) return [];
	return formatPortDiagnostics({
		port: status.port.port,
		status: status.port.status,
		listeners: status.port.listeners,
		hints: status.port.hints
	});
}
function resolvePortListeningAddresses(status) {
	return Array.from(new Set(status.port?.listeners?.map((l) => l.address ? normalizeListenerAddress(l.address) : "").filter((v) => Boolean(v)) ?? []));
}

//#endregion
//#region src/cli/daemon-cli/status.print.ts
function sanitizeDaemonStatusForJson(status) {
	const command = status.service.command;
	if (!command?.environment) return status;
	const safeEnv = filterDaemonEnv(command.environment);
	const nextCommand = {
		...command,
		environment: Object.keys(safeEnv).length > 0 ? safeEnv : void 0
	};
	return {
		...status,
		service: {
			...status.service,
			command: nextCommand
		}
	};
}
function printDaemonStatus(status, opts) {
	if (opts.json) {
		const sanitized = sanitizeDaemonStatusForJson(status);
		defaultRuntime.log(JSON.stringify(sanitized, null, 2));
		return;
	}
	const rich = isRich();
	const label = (value) => colorize(rich, theme.muted, value);
	const accent = (value) => colorize(rich, theme.accent, value);
	const infoText = (value) => colorize(rich, theme.info, value);
	const okText = (value) => colorize(rich, theme.success, value);
	const warnText = (value) => colorize(rich, theme.warn, value);
	const errorText = (value) => colorize(rich, theme.error, value);
	const spacer = () => defaultRuntime.log("");
	const { service, rpc, extraServices } = status;
	const serviceStatus = service.loaded ? okText(service.loadedText) : warnText(service.notLoadedText);
	defaultRuntime.log(`${label("Service:")} ${accent(service.label)} (${serviceStatus})`);
	try {
		const logFile = getResolvedLoggerSettings().file;
		defaultRuntime.log(`${label("File logs:")} ${infoText(shortenHomePath(logFile))}`);
	} catch {}
	if (service.command?.programArguments?.length) defaultRuntime.log(`${label("Command:")} ${infoText(service.command.programArguments.join(" "))}`);
	if (service.command?.sourcePath) defaultRuntime.log(`${label("Service file:")} ${infoText(shortenHomePath(service.command.sourcePath))}`);
	if (service.command?.workingDirectory) defaultRuntime.log(`${label("Working dir:")} ${infoText(shortenHomePath(service.command.workingDirectory))}`);
	const daemonEnvLines = safeDaemonEnv(service.command?.environment);
	if (daemonEnvLines.length > 0) defaultRuntime.log(`${label("Service env:")} ${daemonEnvLines.join(" ")}`);
	spacer();
	if (service.configAudit?.issues.length) {
		defaultRuntime.error(warnText("Service config looks out of date or non-standard."));
		for (const issue of service.configAudit.issues) {
			const detail = issue.detail ? ` (${issue.detail})` : "";
			defaultRuntime.error(`${warnText("Service config issue:")} ${issue.message}${detail}`);
		}
		defaultRuntime.error(warnText(`Recommendation: run "${formatCliCommand("openclaw doctor")}" (or "${formatCliCommand("openclaw doctor --repair")}").`));
	}
	if (status.config) {
		const cliCfg = `${shortenHomePath(status.config.cli.path)}${status.config.cli.exists ? "" : " (missing)"}${status.config.cli.valid ? "" : " (invalid)"}`;
		defaultRuntime.log(`${label("Config (cli):")} ${infoText(cliCfg)}`);
		if (!status.config.cli.valid && status.config.cli.issues?.length) for (const issue of status.config.cli.issues.slice(0, 5)) defaultRuntime.error(`${errorText("Config issue:")} ${issue.path || "<root>"}: ${issue.message}`);
		if (status.config.daemon) {
			const daemonCfg = `${shortenHomePath(status.config.daemon.path)}${status.config.daemon.exists ? "" : " (missing)"}${status.config.daemon.valid ? "" : " (invalid)"}`;
			defaultRuntime.log(`${label("Config (service):")} ${infoText(daemonCfg)}`);
			if (!status.config.daemon.valid && status.config.daemon.issues?.length) for (const issue of status.config.daemon.issues.slice(0, 5)) defaultRuntime.error(`${errorText("Service config issue:")} ${issue.path || "<root>"}: ${issue.message}`);
		}
		if (status.config.mismatch) {
			defaultRuntime.error(errorText("Root cause: CLI and service are using different config paths (likely a profile/state-dir mismatch)."));
			defaultRuntime.error(errorText(`Fix: rerun \`${formatCliCommand("openclaw gateway install --force")}\` from the same --profile / OPENCLAW_STATE_DIR you expect.`));
		}
		spacer();
	}
	if (status.gateway) {
		const bindHost = status.gateway.bindHost ?? "n/a";
		defaultRuntime.log(`${label("Gateway:")} bind=${infoText(status.gateway.bindMode)} (${infoText(bindHost)}), port=${infoText(String(status.gateway.port))} (${infoText(status.gateway.portSource)})`);
		defaultRuntime.log(`${label("Probe target:")} ${infoText(status.gateway.probeUrl)}`);
		if (!(status.config?.daemon?.controlUi?.enabled ?? true)) defaultRuntime.log(`${label("Dashboard:")} ${warnText("disabled")}`);
		else {
			const links = resolveControlUiLinks({
				port: status.gateway.port,
				bind: status.gateway.bindMode,
				customBindHost: status.gateway.customBindHost,
				basePath: status.config?.daemon?.controlUi?.basePath
			});
			defaultRuntime.log(`${label("Dashboard:")} ${infoText(links.httpUrl)}`);
		}
		if (status.gateway.probeNote) defaultRuntime.log(`${label("Probe note:")} ${infoText(status.gateway.probeNote)}`);
		spacer();
	}
	const runtimeLine = formatRuntimeStatus(service.runtime);
	if (runtimeLine) {
		const runtimeStatus = service.runtime?.status ?? "unknown";
		const runtimeColor = runtimeStatus === "running" ? theme.success : runtimeStatus === "stopped" ? theme.error : runtimeStatus === "unknown" ? theme.muted : theme.warn;
		defaultRuntime.log(`${label("Runtime:")} ${colorize(rich, runtimeColor, runtimeLine)}`);
	}
	if (rpc && !rpc.ok && service.loaded && service.runtime?.status === "running") defaultRuntime.log(warnText("Warm-up: launch agents can take a few seconds. Try again shortly."));
	if (rpc) {
		if (rpc.ok) defaultRuntime.log(`${label("RPC probe:")} ${okText("ok")}`);
		else {
			defaultRuntime.error(`${label("RPC probe:")} ${errorText("failed")}`);
			if (rpc.url) defaultRuntime.error(`${label("RPC target:")} ${rpc.url}`);
			const lines = String(rpc.error ?? "unknown").split(/\r?\n/).filter(Boolean);
			for (const line of lines.slice(0, 12)) defaultRuntime.error(`  ${errorText(line)}`);
		}
		spacer();
	}
	if (process.platform === "linux" && isSystemdUnavailableDetail(service.runtime?.detail)) {
		defaultRuntime.error(errorText("systemd user services unavailable."));
		for (const hint of renderSystemdUnavailableHints({ wsl: isWSLEnv() })) defaultRuntime.error(errorText(hint));
		spacer();
	}
	if (service.runtime?.missingUnit) {
		defaultRuntime.error(errorText("Service unit not found."));
		for (const hint of renderRuntimeHints(service.runtime)) defaultRuntime.error(errorText(hint));
	} else if (service.loaded && service.runtime?.status === "stopped") {
		defaultRuntime.error(errorText("Service is loaded but not running (likely exited immediately)."));
		for (const hint of renderRuntimeHints(service.runtime, service.command?.environment ?? process.env)) defaultRuntime.error(errorText(hint));
		spacer();
	}
	if (service.runtime?.cachedLabel) {
		const labelValue = resolveGatewayLaunchAgentLabel((service.command?.environment ?? process.env).OPENCLAW_PROFILE);
		defaultRuntime.error(errorText(`LaunchAgent label cached but plist missing. Clear with: launchctl bootout gui/$UID/${labelValue}`));
		defaultRuntime.error(errorText(`Then reinstall: ${formatCliCommand("openclaw gateway install")}`));
		spacer();
	}
	for (const line of renderPortDiagnosticsForCli(status, rpc?.ok)) defaultRuntime.error(errorText(line));
	if (status.port) {
		const addrs = resolvePortListeningAddresses(status);
		if (addrs.length > 0) defaultRuntime.log(`${label("Listening:")} ${infoText(addrs.join(", "))}`);
	}
	if (status.portCli && status.portCli.port !== status.port?.port) defaultRuntime.log(`${label("Note:")} CLI config resolves gateway port=${status.portCli.port} (${status.portCli.status}).`);
	if (service.loaded && service.runtime?.status === "running" && status.port && status.port.status !== "busy") {
		defaultRuntime.error(errorText(`Gateway port ${status.port.port} is not listening (service appears running).`));
		if (status.lastError) defaultRuntime.error(`${errorText("Last gateway error:")} ${status.lastError}`);
		if (process.platform === "linux") {
			const unit = resolveGatewaySystemdServiceName((service.command?.environment ?? process.env).OPENCLAW_PROFILE);
			defaultRuntime.error(errorText(`Logs: journalctl --user -u ${unit}.service -n 200 --no-pager`));
		} else if (process.platform === "darwin") {
			const logs = resolveGatewayLogPaths(service.command?.environment ?? process.env);
			defaultRuntime.error(`${errorText("Logs:")} ${shortenHomePath(logs.stdoutPath)}`);
			defaultRuntime.error(`${errorText("Errors:")} ${shortenHomePath(logs.stderrPath)}`);
		}
		spacer();
	}
	if (extraServices.length > 0) {
		defaultRuntime.error(errorText("Other gateway-like services detected (best effort):"));
		for (const svc of extraServices) defaultRuntime.error(`- ${errorText(svc.label)} (${svc.scope}, ${svc.detail})`);
		for (const hint of renderGatewayServiceCleanupHints()) defaultRuntime.error(`${errorText("Cleanup hint:")} ${hint}`);
		spacer();
	}
	if (extraServices.length > 0) {
		defaultRuntime.error(errorText("Recommendation: run a single gateway per machine for most setups. One gateway supports multiple agents (see docs: /gateway#multiple-gateways-same-host)."));
		defaultRuntime.error(errorText("If you need multiple gateways (e.g., a rescue bot on the same host), isolate ports + config/state (see docs: /gateway#multiple-gateways-same-host)."));
		spacer();
	}
	defaultRuntime.log(`${label("Troubles:")} run ${formatCliCommand("openclaw status")}`);
	defaultRuntime.log(`${label("Troubleshooting:")} https://docs.openclaw.ai/troubleshooting`);
}

//#endregion
//#region src/cli/daemon-cli/status.ts
async function runDaemonStatus(opts) {
	try {
		printDaemonStatus(await gatherDaemonStatus({
			rpc: opts.rpc,
			probe: Boolean(opts.probe),
			deep: Boolean(opts.deep)
		}), { json: Boolean(opts.json) });
	} catch (err) {
		const rich = isRich();
		defaultRuntime.error(colorize(rich, theme.error, `Gateway status failed: ${String(err)}`));
		defaultRuntime.exit(1);
	}
}

//#endregion
//#region src/cli/daemon-cli/register.ts
function registerDaemonCli(program) {
	const daemon = program.command("daemon").description("Manage the Gateway service (launchd/systemd/schtasks)").addHelpText("after", () => `\n${theme.muted("Docs:")} ${formatDocsLink("/cli/gateway", "docs.openclaw.ai/cli/gateway")}\n`);
	daemon.command("status").description("Show service install status + probe the Gateway").option("--url <url>", "Gateway WebSocket URL (defaults to config/remote/local)").option("--token <token>", "Gateway token (if required)").option("--password <password>", "Gateway password (password auth)").option("--timeout <ms>", "Timeout in ms", "10000").option("--no-probe", "Skip RPC probe").option("--deep", "Scan system-level services", false).option("--json", "Output JSON", false).action(async (opts) => {
		await runDaemonStatus({
			rpc: opts,
			probe: Boolean(opts.probe),
			deep: Boolean(opts.deep),
			json: Boolean(opts.json)
		});
	});
	daemon.command("install").description("Install the Gateway service (launchd/systemd/schtasks)").option("--port <port>", "Gateway port").option("--runtime <runtime>", "Daemon runtime (node|bun). Default: node").option("--token <token>", "Gateway token (token auth)").option("--force", "Reinstall/overwrite if already installed", false).option("--json", "Output JSON", false).action(async (opts) => {
		await runDaemonInstall(opts);
	});
	daemon.command("uninstall").description("Uninstall the Gateway service (launchd/systemd/schtasks)").option("--json", "Output JSON", false).action(async (opts) => {
		await runDaemonUninstall(opts);
	});
	daemon.command("start").description("Start the Gateway service (launchd/systemd/schtasks)").option("--json", "Output JSON", false).action(async (opts) => {
		await runDaemonStart(opts);
	});
	daemon.command("stop").description("Stop the Gateway service (launchd/systemd/schtasks)").option("--json", "Output JSON", false).action(async (opts) => {
		await runDaemonStop(opts);
	});
	daemon.command("restart").description("Restart the Gateway service (launchd/systemd/schtasks)").option("--json", "Output JSON", false).action(async (opts) => {
		await runDaemonRestart(opts);
	});
}

//#endregion
//#region src/cli/daemon-cli.ts
var daemon_cli_exports = /* @__PURE__ */ __exportAll({ registerDaemonCli: () => registerDaemonCli });

//#endregion
export { runDaemonStop as a, runDaemonStart as i, runDaemonStatus as n, runDaemonUninstall as o, runDaemonRestart as r, runDaemonInstall as s, daemon_cli_exports as t };