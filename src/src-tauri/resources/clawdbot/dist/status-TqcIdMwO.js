import { _ as shortenHomePath } from "./utils-D5DtWkEu.js";
import { n as defaultRuntime } from "./runtime-Dx7oeLYq.js";
import { n as resolvePreferredOpenClawTmpDir, t as POSIX_OPENCLAW_TMP_DIR } from "./tmp-openclaw-dir-eyAoWbVe.js";
import { n as isRich, r as theme, t as colorize } from "./theme-D5sxSdHD.js";
import { t as formatCliCommand } from "./command-format-Dd3uP9-6.js";
import { _ as resolveStateDir, o as resolveConfigPath, u as resolveGatewayPort } from "./paths-Dvv9VRAc.js";
import { d as resolveGatewayLaunchAgentLabel, p as resolveGatewaySystemdServiceName } from "./paths-icbGFVZa.js";
import { a as trimToUndefined } from "./credential-planner-CxtmVh4K.js";
import "./credentials-DH-nlrJW.js";
import { r as createConfigIO } from "./io-5pxHCi7V.js";
import { i as parseStrictPositiveInteger } from "./parse-finite-number-BfJR0a23.js";
import { c as resolveGatewayLogPaths } from "./launchd-Bk3hz4bn.js";
import { a as inspectPortUsage, s as formatPortDiagnostics } from "./ports-BQYvWPfn.js";
import { p as classifySystemdUnavailableDetail } from "./systemd-D3GGnU7N.js";
import { r as resolveGatewayService } from "./service-DkbTemHA.js";
import { a as filterDaemonEnv, c as pickProbeHostForBind, d as resolveRuntimeStatusColor, f as safeDaemonEnv, o as normalizeListenerAddress, s as parsePortFromArgs, t as createCliStatusTextStyles, u as renderRuntimeHints } from "./shared-B7diuUph.js";
import { i as resolveDaemonContainerContext, r as formatRuntimeStatus } from "./runtime-hints-DEgPTkWK.js";
import "./config-Q9XZc_2I.js";
import { t as formatConfigIssueLine } from "./issue-format-EKtDEAmx.js";
import { n as renderSystemdUnavailableHints, t as isSystemdUnavailableDetail } from "./systemd-hints-S_Oulqnm.js";
import { r as isWSLEnv } from "./wsl-DlWsqZ4r.js";
import { t as readLastGatewayErrorLine } from "./diagnostics-Demi8maG.js";
import { r as resolveBestEffortGatewayBindHostForDisplay, t as inspectBestEffortPrimaryTailnetIPv4 } from "./network-discovery-display-CXEbPtF0.js";
import { r as renderGatewayServiceCleanupHints } from "./inspect-BvKVcir1.js";
import { t as resolveControlUiLinks } from "./control-ui-links-m3iFy0hK.js";
import path from "node:path";
//#region src/logging/log-file-path.ts
const LOG_PREFIX = "openclaw";
const LOG_SUFFIX = ".log";
function canUseNodeFs() {
	const getBuiltinModule = process.getBuiltinModule;
	if (typeof getBuiltinModule !== "function") return false;
	try {
		return getBuiltinModule("fs") !== void 0;
	} catch {
		return false;
	}
}
function formatLocalDate(date) {
	return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
function resolveDefaultRollingLogFile(date = /* @__PURE__ */ new Date()) {
	const logDir = canUseNodeFs() ? resolvePreferredOpenClawTmpDir() : POSIX_OPENCLAW_TMP_DIR;
	return path.join(logDir, `${LOG_PREFIX}-${formatLocalDate(date)}${LOG_SUFFIX}`);
}
function resolveConfiguredLogFilePath(config) {
	return config?.logging?.file ?? resolveDefaultRollingLogFile();
}
//#endregion
//#region src/cli/daemon-cli/status.gather.ts
let gatewayProbeAuthModulePromise;
let daemonInspectModulePromise;
let serviceAuditModulePromise;
let gatewayTlsModulePromise;
let daemonProbeModulePromise;
let restartHealthModulePromise;
function loadGatewayProbeAuthModule() {
	gatewayProbeAuthModulePromise ??= import("./probe-auth-CsetYcgO.js");
	return gatewayProbeAuthModulePromise;
}
function loadDaemonInspectModule() {
	daemonInspectModulePromise ??= import("./inspect-BKUwp_x5.js");
	return daemonInspectModulePromise;
}
function loadServiceAuditModule() {
	serviceAuditModulePromise ??= import("./service-audit-CWANrg8B.js");
	return serviceAuditModulePromise;
}
function loadGatewayTlsModule() {
	gatewayTlsModulePromise ??= import("./gateway-CkoBK47E.js");
	return gatewayTlsModulePromise;
}
function loadDaemonProbeModule() {
	daemonProbeModulePromise ??= import("./probe-gXpqmSnH.js");
	return daemonProbeModulePromise;
}
function loadRestartHealthModule() {
	restartHealthModulePromise ??= import("./restart-health-zu9936Sx.js");
	return restartHealthModulePromise;
}
function resolveSnapshotRuntimeConfig(snapshot) {
	if (!snapshot?.valid || !snapshot.runtimeConfig) return null;
	return snapshot.runtimeConfig;
}
function appendProbeNote(existing, extra) {
	const values = [existing, extra].filter((value) => Boolean(value?.trim()));
	if (values.length === 0) return;
	return [...new Set(values)].join(" ");
}
function shouldReportPortUsage(status, rpcOk) {
	if (status !== "busy") return false;
	if (rpcOk === true) return false;
	return true;
}
async function loadDaemonConfigContext(serviceEnv) {
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
	const sharesDaemonConfigContext = !serviceEnv && cliConfigPath === daemonConfigPath;
	const daemonIO = sharesDaemonConfigContext ? cliIO : createConfigIO({
		env: mergedDaemonEnv,
		configPath: daemonConfigPath
	});
	const cliSnapshotPromise = cliIO.readConfigFileSnapshot().catch(() => null);
	const daemonSnapshotPromise = sharesDaemonConfigContext ? cliSnapshotPromise : daemonIO.readConfigFileSnapshot().catch(() => null);
	const [cliSnapshot, daemonSnapshot] = await Promise.all([cliSnapshotPromise, daemonSnapshotPromise]);
	const cliCfg = resolveSnapshotRuntimeConfig(cliSnapshot) ?? cliIO.loadConfig();
	const daemonCfg = sharesDaemonConfigContext && cliSnapshot === daemonSnapshot ? cliCfg : resolveSnapshotRuntimeConfig(daemonSnapshot) ?? daemonIO.loadConfig();
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
	return {
		mergedDaemonEnv,
		cliCfg,
		daemonCfg,
		cliConfigSummary,
		daemonConfigSummary,
		configMismatch: cliConfigSummary.path !== daemonConfigSummary.path
	};
}
async function resolveGatewayStatusSummary(params) {
	const portFromArgs = parsePortFromArgs(params.commandProgramArguments);
	const daemonPort = portFromArgs ?? resolveGatewayPort(params.daemonCfg, params.mergedDaemonEnv);
	const portSource = portFromArgs ? "service args" : "env/config";
	const bindMode = params.daemonCfg.gateway?.bind ?? "loopback";
	const customBindHost = params.daemonCfg.gateway?.customBindHost;
	const { bindHost, warning: bindHostWarning } = await resolveBestEffortGatewayBindHostForDisplay({
		bindMode,
		customBindHost,
		warningPrefix: "Status is using fallback network details because interface discovery failed"
	});
	const { tailnetIPv4, warning: tailnetWarning } = inspectBestEffortPrimaryTailnetIPv4({ warningPrefix: "Status could not inspect tailnet addresses" });
	const probeHost = pickProbeHostForBind(bindMode, tailnetIPv4, customBindHost);
	const probeUrlOverride = trimToUndefined(params.rpcUrlOverride) ?? null;
	const scheme = params.daemonCfg.gateway?.tls?.enabled === true ? "wss" : "ws";
	const probeUrl = probeUrlOverride ?? `${scheme}://${probeHost}:${daemonPort}`;
	let probeNote = !probeUrlOverride && bindMode === "lan" ? `bind=lan listens on 0.0.0.0 (all interfaces); probing via ${probeHost}.` : !probeUrlOverride && bindMode === "loopback" ? "Loopback-only gateway; only local clients can connect." : void 0;
	probeNote = appendProbeNote(probeNote, bindHostWarning);
	probeNote = appendProbeNote(probeNote, tailnetWarning);
	return {
		gateway: {
			bindMode,
			bindHost,
			customBindHost,
			port: daemonPort,
			portSource,
			probeUrl,
			...probeNote ? { probeNote } : {}
		},
		daemonPort,
		cliPort: resolveGatewayPort(params.cliCfg, process.env),
		probeUrlOverride
	};
}
function toPortStatusSummary(diagnostics) {
	if (!diagnostics) return;
	return {
		port: diagnostics.port,
		status: diagnostics.status,
		listeners: diagnostics.listeners,
		hints: diagnostics.hints
	};
}
async function inspectDaemonPortStatuses(params) {
	const [portDiagnostics, portCliDiagnostics] = await Promise.all([inspectPortUsage(params.daemonPort).catch(() => null), params.cliPort !== params.daemonPort ? inspectPortUsage(params.cliPort).catch(() => null) : null]);
	return {
		portStatus: toPortStatusSummary(portDiagnostics),
		portCliStatus: toPortStatusSummary(portCliDiagnostics)
	};
}
async function gatherDaemonStatus(opts) {
	const service = resolveGatewayService();
	const command = await service.readCommand(process.env).catch(() => null);
	const serviceEnv = command?.environment ? {
		...process.env,
		...command.environment
	} : process.env;
	const [loaded, runtime] = await Promise.all([service.isLoaded({ env: serviceEnv }).catch(() => false), service.readRuntime(serviceEnv).catch((err) => ({
		status: "unknown",
		detail: String(err)
	}))]);
	const configAudit = command ? await loadServiceAuditModule().then(({ auditGatewayServiceConfig }) => auditGatewayServiceConfig({
		env: process.env,
		command
	})) : {
		ok: true,
		issues: []
	};
	const { mergedDaemonEnv, cliCfg, daemonCfg, cliConfigSummary, daemonConfigSummary, configMismatch } = await loadDaemonConfigContext(command?.environment);
	const { gateway, daemonPort, cliPort, probeUrlOverride } = await resolveGatewayStatusSummary({
		cliCfg,
		daemonCfg,
		mergedDaemonEnv,
		commandProgramArguments: command?.programArguments,
		rpcUrlOverride: opts.rpc.url
	});
	const { portStatus, portCliStatus } = await inspectDaemonPortStatuses({
		daemonPort,
		cliPort
	});
	const extraServices = opts.deep ? await loadDaemonInspectModule().then(({ findExtraGatewayServices }) => findExtraGatewayServices(process.env, { deep: true })).catch(() => []) : [];
	const timeoutMs = parseStrictPositiveInteger(opts.rpc.timeout ?? "10000") ?? 1e4;
	const tlsEnabled = daemonCfg.gateway?.tls?.enabled === true;
	const shouldUseLocalTlsRuntime = opts.probe && !probeUrlOverride && tlsEnabled;
	const tlsRuntime = shouldUseLocalTlsRuntime ? await loadGatewayTlsModule().then(({ loadGatewayTlsRuntime }) => loadGatewayTlsRuntime(daemonCfg.gateway?.tls)) : void 0;
	let daemonProbeAuth;
	let rpcAuthWarning;
	if (opts.probe) {
		const probeMode = daemonCfg.gateway?.mode === "remote" ? "remote" : "local";
		const probeAuthResolution = await loadGatewayProbeAuthModule().then(({ resolveGatewayProbeAuthSafeWithSecretInputs }) => resolveGatewayProbeAuthSafeWithSecretInputs({
			cfg: daemonCfg,
			mode: probeMode,
			env: mergedDaemonEnv,
			explicitAuth: {
				token: opts.rpc.token,
				password: opts.rpc.password
			}
		}));
		daemonProbeAuth = probeAuthResolution.auth;
		rpcAuthWarning = probeAuthResolution.warning;
	}
	const rpc = opts.probe ? await loadDaemonProbeModule().then(({ probeGatewayStatus }) => probeGatewayStatus({
		url: gateway.probeUrl,
		token: daemonProbeAuth?.token,
		password: daemonProbeAuth?.password,
		tlsFingerprint: shouldUseLocalTlsRuntime && tlsRuntime?.enabled ? tlsRuntime.fingerprintSha256 : void 0,
		timeoutMs,
		json: opts.rpc.json,
		requireRpc: opts.requireRpc,
		configPath: daemonConfigSummary.path
	})) : void 0;
	if (rpc?.ok) rpcAuthWarning = void 0;
	const health = opts.probe && loaded ? await loadRestartHealthModule().then(({ inspectGatewayRestart }) => inspectGatewayRestart({
		service,
		port: daemonPort,
		env: serviceEnv
	})).catch(() => void 0) : void 0;
	let lastError;
	if (loaded && runtime?.status === "running" && portStatus && portStatus.status !== "busy") lastError = await readLastGatewayErrorLine(mergedDaemonEnv) ?? void 0;
	return {
		logFile: resolveConfiguredLogFilePath(cliCfg),
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
		gateway,
		port: portStatus,
		...portCliStatus ? { portCli: portCliStatus } : {},
		lastError,
		...rpc ? { rpc: {
			...rpc,
			url: gateway.probeUrl,
			...rpcAuthWarning ? { authWarning: rpcAuthWarning } : {}
		} } : {},
		...health ? { health: {
			healthy: health.healthy,
			staleGatewayPids: health.staleGatewayPids
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
		defaultRuntime.writeJson(sanitized);
		return;
	}
	const { rich, label, accent, infoText, okText, warnText, errorText } = createCliStatusTextStyles();
	const spacer = () => defaultRuntime.log("");
	const { service, rpc, extraServices } = status;
	const serviceStatus = service.loaded ? okText(service.loadedText) : warnText(service.notLoadedText);
	defaultRuntime.log(`${label("Service:")} ${accent(service.label)} (${serviceStatus})`);
	if (status.logFile) defaultRuntime.log(`${label("File logs:")} ${infoText(shortenHomePath(status.logFile))}`);
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
		if (!status.config.cli.valid && status.config.cli.issues?.length) for (const issue of status.config.cli.issues.slice(0, 5)) defaultRuntime.error(`${errorText("Config issue:")} ${formatConfigIssueLine(issue, "", { normalizeRoot: true })}`);
		if (status.config.daemon) {
			const daemonCfg = `${shortenHomePath(status.config.daemon.path)}${status.config.daemon.exists ? "" : " (missing)"}${status.config.daemon.valid ? "" : " (invalid)"}`;
			defaultRuntime.log(`${label("Config (service):")} ${infoText(daemonCfg)}`);
			if (!status.config.daemon.valid && status.config.daemon.issues?.length) for (const issue of status.config.daemon.issues.slice(0, 5)) defaultRuntime.error(`${errorText("Service config issue:")} ${formatConfigIssueLine(issue, "", { normalizeRoot: true })}`);
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
		const runtimeColor = resolveRuntimeStatusColor(service.runtime?.status);
		defaultRuntime.log(`${label("Runtime:")} ${colorize(rich, runtimeColor, runtimeLine)}`);
	}
	if (rpc && !rpc.ok && service.loaded && service.runtime?.status === "running") defaultRuntime.log(warnText("Warm-up: launch agents can take a few seconds. Try again shortly."));
	if (rpc) {
		if (rpc.ok) defaultRuntime.log(`${label("RPC probe:")} ${okText("ok")}`);
		else {
			defaultRuntime.error(`${label("RPC probe:")} ${errorText("failed")}`);
			if (rpc.authWarning) defaultRuntime.error(`${label("RPC auth:")} ${warnText(rpc.authWarning)}`);
			if (rpc.url) defaultRuntime.error(`${label("RPC target:")} ${rpc.url}`);
			const lines = (rpc.error ?? "unknown").split(/\r?\n/).filter(Boolean);
			for (const line of lines.slice(0, 12)) defaultRuntime.error(`  ${errorText(line)}`);
		}
		spacer();
	}
	if (status.health && status.health.staleGatewayPids.length > 0 && service.runtime?.status === "running" && typeof service.runtime.pid === "number") {
		defaultRuntime.error(errorText(`Gateway runtime PID does not own the listening port. Other gateway process(es) are listening: ${status.health.staleGatewayPids.join(", ")}`));
		defaultRuntime.error(errorText(`Fix: run ${formatCliCommand("openclaw gateway restart")} and re-check with ${formatCliCommand("openclaw gateway status --deep")}.`));
		spacer();
	}
	if (process.platform === "linux" && isSystemdUnavailableDetail(service.runtime?.detail)) {
		const container = Boolean(resolveDaemonContainerContext(service.command?.environment ?? process.env));
		defaultRuntime.error(errorText("systemd user services unavailable."));
		for (const hint of renderSystemdUnavailableHints({
			wsl: isWSLEnv(),
			kind: classifySystemdUnavailableDetail(service.runtime?.detail),
			container
		})) defaultRuntime.error(errorText(hint));
		spacer();
	}
	if (service.runtime?.missingUnit) {
		defaultRuntime.error(errorText("Service unit not found."));
		for (const hint of renderRuntimeHints(service.runtime, process.env, status.logFile)) defaultRuntime.error(errorText(hint));
	} else if (service.loaded && service.runtime?.status === "stopped") {
		defaultRuntime.error(errorText("Service is loaded but not running (likely exited immediately)."));
		for (const hint of renderRuntimeHints(service.runtime, service.command?.environment ?? process.env, status.logFile)) defaultRuntime.error(errorText(hint));
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
		if (opts.requireRpc && !opts.probe) {
			defaultRuntime.error("Gateway status failed: --require-rpc cannot be used with --no-probe.");
			defaultRuntime.exit(1);
			return;
		}
		const status = await gatherDaemonStatus({
			rpc: opts.rpc,
			probe: opts.probe,
			requireRpc: opts.requireRpc,
			deep: opts.deep === true
		});
		printDaemonStatus(status, { json: opts.json });
		if (opts.requireRpc && !status.rpc?.ok) defaultRuntime.exit(1);
	} catch (err) {
		const rich = isRich();
		defaultRuntime.error(colorize(rich, theme.error, `Gateway status failed: ${String(err)}`));
		defaultRuntime.exit(1);
	}
}
//#endregion
export { runDaemonStatus as t };
