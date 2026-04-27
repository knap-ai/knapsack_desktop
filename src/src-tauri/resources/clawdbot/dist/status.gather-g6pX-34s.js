import { n as resolvePreferredOpenClawTmpDir, t as POSIX_OPENCLAW_TMP_DIR } from "./tmp-openclaw-dir-CoGSA-7K.js";
import { _ as resolveStateDir, o as resolveConfigPath, u as resolveGatewayPort } from "./paths-BG0ad0P6.js";
import { a as trimToUndefined } from "./credential-planner-Cyojk0Yv.js";
import "./credentials-BwlOIAxm.js";
import { r as createConfigIO } from "./io-Dv_xNAZB.js";
import { i as parseStrictPositiveInteger } from "./parse-finite-number-De8ORAh1.js";
import { a as inspectPortUsage, s as formatPortDiagnostics } from "./ports-BNt4VvHz.js";
import { r as resolveGatewayService } from "./service-DKsVbGBH.js";
import { c as pickProbeHostForBind, o as normalizeListenerAddress, s as parsePortFromArgs } from "./shared-COjyF1Jo.js";
import "./config-yDDhhyz6.js";
import { t as readLastGatewayErrorLine } from "./diagnostics-DTwOCjVp.js";
import { r as resolveBestEffortGatewayBindHostForDisplay, t as inspectBestEffortPrimaryTailnetIPv4 } from "./network-discovery-display-CsxO_oTF.js";
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
	gatewayProbeAuthModulePromise ??= import("./probe-auth-1h0XKN8_.js");
	return gatewayProbeAuthModulePromise;
}
function loadDaemonInspectModule() {
	daemonInspectModulePromise ??= import("./inspect-SftDYtPa.js");
	return daemonInspectModulePromise;
}
function loadServiceAuditModule() {
	serviceAuditModulePromise ??= import("./service-audit-BqwbKIKV.js");
	return serviceAuditModulePromise;
}
function loadGatewayTlsModule() {
	gatewayTlsModulePromise ??= import("./gateway-DIVHTIfe.js");
	return gatewayTlsModulePromise;
}
function loadDaemonProbeModule() {
	daemonProbeModulePromise ??= import("./probe-B8VZZYzt.js");
	return daemonProbeModulePromise;
}
function loadRestartHealthModule() {
	restartHealthModulePromise ??= import("./restart-health-Cxm5BzVs.js");
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
		configPath: cliConfigPath,
		pluginValidation: "skip"
	});
	const sharesDaemonConfigContext = !serviceEnv && cliConfigPath === daemonConfigPath;
	const daemonIO = sharesDaemonConfigContext ? cliIO : createConfigIO({
		env: mergedDaemonEnv,
		configPath: daemonConfigPath,
		pluginValidation: "skip"
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
	const health = opts.probe && loaded && rpc?.ok !== true ? await loadRestartHealthModule().then(({ inspectGatewayRestart }) => inspectGatewayRestart({
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
export { renderPortDiagnosticsForCli as n, resolvePortListeningAddresses as r, gatherDaemonStatus as t };
