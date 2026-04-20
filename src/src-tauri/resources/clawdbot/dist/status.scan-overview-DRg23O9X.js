import { o as normalizeOptionalLowercaseString, s as normalizeOptionalString } from "./string-coerce-BUSzWgUA.js";
import { o as resolveConfigPath } from "./paths-Dvv9VRAc.js";
import { i as runExec } from "./exec-BAdwyfxI.js";
import { r as normalizeControlUiBasePath } from "./control-ui-shared-DLBboEro.js";
import { t as hasPotentialConfiguredChannels } from "./config-presence-B8rnssE9.js";
import { t as buildGatewayConnectionDetailsWithResolvers } from "./connection-details-DVKcA1hM.js";
import { t as createEmptyTaskRegistrySummary } from "./task-registry.summary-Ccv1tBd5.js";
import { t as createEmptyTaskAuditSummary } from "./task-registry.audit.shared-ChnGhlNs.js";
import { t as pickGatewaySelfPresence } from "./gateway-presence-Cv_3NmBw.js";
import { t as resolveGatewayProbeTarget } from "./probe-target-CiA-jcVT.js";
import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import os from "node:os";
//#region src/infra/os-summary.ts
function macosVersion() {
	return (normalizeOptionalString(spawnSync("sw_vers", ["-productVersion"], { encoding: "utf-8" }).stdout) ?? "") || os.release();
}
function resolveOsSummary() {
	const platform = os.platform();
	const release = os.release();
	const arch = os.arch();
	return {
		platform,
		arch,
		release,
		label: (() => {
			if (platform === "darwin") return `macos ${macosVersion()} (${arch})`;
			if (platform === "win32") return `windows ${release} (${arch})`;
			return `${platform} ${release} (${arch})`;
		})()
	};
}
//#endregion
//#region src/commands/status.scan.shared.ts
let gatewayProbeModulePromise;
let probeGatewayModulePromise;
function loadGatewayProbeModule() {
	gatewayProbeModulePromise ??= import("./status.gateway-probe-B4zrmYF6.js");
	return gatewayProbeModulePromise;
}
function loadProbeGatewayModule() {
	probeGatewayModulePromise ??= import("./probe-DCsktpkl.js");
	return probeGatewayModulePromise;
}
function hasExplicitMemorySearchConfig(cfg, agentId) {
	if (cfg.agents?.defaults && Object.prototype.hasOwnProperty.call(cfg.agents.defaults, "memorySearch")) return true;
	return (Array.isArray(cfg.agents?.list) ? cfg.agents.list : []).some((agent) => agent?.id === agentId && Object.prototype.hasOwnProperty.call(agent, "memorySearch"));
}
function resolveMemoryPluginStatus(cfg) {
	if (!(cfg.plugins?.enabled !== false)) return {
		enabled: false,
		slot: null,
		reason: "plugins disabled"
	};
	const raw = normalizeOptionalString(cfg.plugins?.slots?.memory) ?? "";
	if (normalizeOptionalLowercaseString(raw) === "none") return {
		enabled: false,
		slot: null,
		reason: "plugins.slots.memory=\"none\""
	};
	return {
		enabled: true,
		slot: raw || "memory-core"
	};
}
async function resolveGatewayProbeSnapshot(params) {
	const gatewayConnection = buildGatewayConnectionDetailsWithResolvers({ config: params.cfg });
	const { gatewayMode, remoteUrlMissing } = resolveGatewayProbeTarget(params.cfg);
	const shouldResolveAuth = params.opts.skipProbe !== true && (!remoteUrlMissing || params.opts.resolveAuthWhenRemoteUrlMissing === true);
	const shouldProbe = params.opts.skipProbe !== true && (!remoteUrlMissing || params.opts.probeWhenRemoteUrlMissing === true);
	const gatewayProbeAuthResolution = shouldResolveAuth ? await loadGatewayProbeModule().then(({ resolveGatewayProbeAuthResolution }) => resolveGatewayProbeAuthResolution(params.cfg)) : {
		auth: {},
		warning: void 0
	};
	let gatewayProbeAuthWarning = gatewayProbeAuthResolution.warning;
	const gatewayProbe = shouldProbe ? await loadProbeGatewayModule().then(({ probeGateway }) => probeGateway({
		url: gatewayConnection.url,
		auth: gatewayProbeAuthResolution.auth,
		timeoutMs: Math.min(params.opts.all ? 5e3 : 2500, params.opts.timeoutMs ?? 1e4),
		detailLevel: params.opts.detailLevel ?? "presence"
	})).catch(() => null) : null;
	if ((params.opts.mergeAuthWarningIntoProbeError ?? true) && gatewayProbeAuthWarning && gatewayProbe?.ok === false) {
		gatewayProbe.error = gatewayProbe.error ? `${gatewayProbe.error}; ${gatewayProbeAuthWarning}` : gatewayProbeAuthWarning;
		gatewayProbeAuthWarning = void 0;
	}
	const gatewayReachable = gatewayProbe?.ok === true;
	const gatewaySelf = gatewayProbe?.presence ? pickGatewaySelfPresence(gatewayProbe.presence) : null;
	return {
		gatewayConnection,
		remoteUrlMissing,
		gatewayMode,
		gatewayProbeAuth: gatewayProbeAuthResolution.auth,
		gatewayProbeAuthWarning,
		gatewayProbe,
		gatewayReachable,
		gatewaySelf,
		...remoteUrlMissing ? { gatewayCallOverrides: {
			url: gatewayConnection.url,
			token: gatewayProbeAuthResolution.auth.token,
			password: gatewayProbeAuthResolution.auth.password
		} } : {}
	};
}
function buildTailscaleHttpsUrl(params) {
	return params.tailscaleMode !== "off" && params.tailscaleDns ? `https://${params.tailscaleDns}${normalizeControlUiBasePath(params.controlUiBasePath)}` : null;
}
async function resolveSharedMemoryStatusSnapshot(params) {
	const { cfg, agentStatus, memoryPlugin } = params;
	if (!memoryPlugin.enabled || !memoryPlugin.slot) return null;
	const agentId = agentStatus.defaultId ?? "main";
	const defaultStorePath = params.requireDefaultStore?.(agentId);
	if (defaultStorePath && !hasExplicitMemorySearchConfig(cfg, agentId) && !existsSync(defaultStorePath)) return null;
	const resolvedMemory = params.resolveMemoryConfig(cfg, agentId);
	if (!resolvedMemory) return null;
	if (!(hasExplicitMemorySearchConfig(cfg, agentId) || existsSync(resolvedMemory.store.path))) return null;
	const { manager } = await params.getMemorySearchManager({
		cfg,
		agentId,
		purpose: "status"
	});
	if (!manager) return null;
	try {
		await manager.probeVectorAvailability();
	} catch {}
	const status = manager.status();
	await manager.close?.().catch(() => {});
	return {
		agentId,
		...status
	};
}
//#endregion
//#region src/commands/status.scan.bootstrap-shared.ts
function buildColdStartUpdateResult() {
	return {
		root: null,
		installKind: "unknown",
		packageManager: "unknown"
	};
}
function buildColdStartAgentLocalStatuses() {
	return {
		defaultId: "main",
		agents: [],
		totalSessions: 0,
		bootstrapPendingCount: 0
	};
}
function buildColdStartStatusSummary() {
	return {
		runtimeVersion: null,
		heartbeat: {
			defaultAgentId: "main",
			agents: []
		},
		channelSummary: [],
		queuedSystemEvents: [],
		tasks: createEmptyTaskRegistrySummary(),
		taskAudit: createEmptyTaskAuditSummary(),
		sessions: {
			paths: [],
			count: 0,
			defaults: {
				model: null,
				contextTokens: null
			},
			recent: [],
			byAgent: []
		}
	};
}
function shouldSkipStatusScanNetworkChecks(params) {
	return params.coldStart && !params.hasConfiguredChannels && params.all !== true;
}
async function createStatusScanCoreBootstrap(params) {
	const tailscaleMode = params.cfg.gateway?.tailscale?.mode ?? "off";
	const skipColdStartNetworkChecks = shouldSkipStatusScanNetworkChecks({
		coldStart: params.coldStart,
		hasConfiguredChannels: params.hasConfiguredChannels,
		all: params.opts.all
	});
	const updateTimeoutMs = params.opts.all ? 6500 : 2500;
	const tailscaleDnsPromise = tailscaleMode === "off" ? Promise.resolve(null) : params.getTailnetHostname((cmd, args) => runExec(cmd, args, {
		timeoutMs: 1200,
		maxBuffer: 2e5
	})).catch(() => null);
	return {
		tailscaleMode,
		tailscaleDnsPromise,
		updatePromise: skipColdStartNetworkChecks ? Promise.resolve(buildColdStartUpdateResult()) : params.getUpdateCheckResult({
			timeoutMs: updateTimeoutMs,
			fetchGit: true,
			includeRegistry: true
		}),
		agentStatusPromise: skipColdStartNetworkChecks ? Promise.resolve(buildColdStartAgentLocalStatuses()) : params.getAgentLocalStatuses(params.cfg),
		gatewayProbePromise: resolveGatewayProbeSnapshot({
			cfg: params.cfg,
			opts: {
				...params.opts,
				...skipColdStartNetworkChecks ? { skipProbe: true } : {}
			}
		}),
		skipColdStartNetworkChecks,
		resolveTailscaleHttpsUrl: async () => buildTailscaleHttpsUrl({
			tailscaleMode,
			tailscaleDns: await tailscaleDnsPromise,
			controlUiBasePath: params.cfg.gateway?.controlUi?.basePath
		})
	};
}
//#endregion
//#region src/commands/status.scan.config-shared.ts
function shouldSkipStatusScanMissingConfigFastPath(env = process.env) {
	return env.VITEST === "true" || env.VITEST_POOL_ID !== void 0 || env.NODE_ENV === "test";
}
function resolveStatusScanColdStart(params) {
	const env = params?.env ?? process.env;
	return !(params?.allowMissingConfigFastPath === true && shouldSkipStatusScanMissingConfigFastPath(env)) && !existsSync(resolveConfigPath(env));
}
async function loadStatusScanCommandConfig(params) {
	const coldStart = resolveStatusScanColdStart({
		env: params.env ?? process.env,
		allowMissingConfigFastPath: params.allowMissingConfigFastPath
	});
	const sourceConfig = coldStart && params.allowMissingConfigFastPath === true ? {} : await params.readBestEffortConfig();
	const { resolvedConfig, diagnostics } = coldStart && params.allowMissingConfigFastPath === true ? {
		resolvedConfig: sourceConfig,
		diagnostics: []
	} : await params.resolveConfig(sourceConfig);
	return {
		coldStart,
		sourceConfig,
		resolvedConfig,
		secretDiagnostics: diagnostics
	};
}
//#endregion
//#region src/commands/status.scan-overview.ts
let statusScanDepsRuntimeModulePromise;
let statusAgentLocalModulePromise;
let statusUpdateModulePromise;
let statusScanRuntimeModulePromise;
let gatewayCallModulePromise;
let statusSummaryModulePromise;
let configModulePromise;
let commandConfigResolutionModulePromise;
let commandSecretTargetsModulePromise;
function loadStatusScanDepsRuntimeModule() {
	statusScanDepsRuntimeModulePromise ??= import("./status.scan.deps.runtime-XslDktKK.js");
	return statusScanDepsRuntimeModulePromise;
}
function loadStatusAgentLocalModule() {
	statusAgentLocalModulePromise ??= import("./status.agent-local-NPNjXYa3.js");
	return statusAgentLocalModulePromise;
}
function loadStatusUpdateModule() {
	statusUpdateModulePromise ??= import("./status.update-BlnrEkjl.js");
	return statusUpdateModulePromise;
}
function loadStatusScanRuntimeModule() {
	statusScanRuntimeModulePromise ??= import("./status.scan.runtime-CsY4AVSc.js");
	return statusScanRuntimeModulePromise;
}
function loadGatewayCallModule() {
	gatewayCallModulePromise ??= import("./call-BVShKaZ4.js");
	return gatewayCallModulePromise;
}
function loadStatusSummaryModule() {
	statusSummaryModulePromise ??= import("./status.summary-DW93nVcx.js");
	return statusSummaryModulePromise;
}
function loadConfigModule() {
	configModulePromise ??= import("./config-D5wLb3ev.js");
	return configModulePromise;
}
function loadCommandConfigResolutionModule() {
	commandConfigResolutionModulePromise ??= import("./command-config-resolution-BeOGPkrv.js");
	return commandConfigResolutionModulePromise;
}
function loadCommandSecretTargetsModule() {
	commandSecretTargetsModulePromise ??= import("./command-secret-targets-C_5TtIQ1.js");
	return commandSecretTargetsModulePromise;
}
async function resolveStatusChannelsStatus(params) {
	if (!params.gatewayReachable) return null;
	const { callGateway } = await loadGatewayCallModule();
	return await callGateway({
		config: params.cfg,
		method: "channels.status",
		params: {
			probe: false,
			timeoutMs: Math.min(8e3, params.opts.timeoutMs ?? 1e4)
		},
		timeoutMs: Math.min(params.opts.all ? 5e3 : 2500, params.opts.timeoutMs ?? 1e4),
		...params.useGatewayCallOverrides === true ? params.gatewayCallOverrides ?? {} : {}
	}).catch(() => null);
}
async function collectStatusScanOverview(params) {
	if (params.labels?.loadingConfig) params.progress?.setLabel(params.labels.loadingConfig);
	const { coldStart, sourceConfig, resolvedConfig: cfg, secretDiagnostics } = await loadStatusScanCommandConfig({
		commandName: params.commandName,
		allowMissingConfigFastPath: params.allowMissingConfigFastPath,
		readBestEffortConfig: async () => (await loadConfigModule()).readBestEffortConfig(),
		resolveConfig: async (loadedConfig) => await (await loadCommandConfigResolutionModule()).resolveCommandConfigWithSecrets({
			config: loadedConfig,
			commandName: params.commandName,
			targetIds: (await loadCommandSecretTargetsModule()).getStatusCommandSecretTargetIds(),
			mode: "read_only_status",
			...params.runtime ? { runtime: params.runtime } : {}
		})
	});
	params.progress?.tick();
	const hasConfiguredChannels = params.resolveHasConfiguredChannels ? params.resolveHasConfiguredChannels(cfg) : hasPotentialConfiguredChannels(cfg);
	const osSummary = resolveOsSummary();
	const bootstrap = await createStatusScanCoreBootstrap({
		coldStart,
		cfg,
		hasConfiguredChannels,
		opts: params.opts,
		getTailnetHostname: async (runner) => await loadStatusScanDepsRuntimeModule().then(({ getTailnetHostname }) => getTailnetHostname(runner)),
		getUpdateCheckResult: async (updateParams) => await loadStatusUpdateModule().then(({ getUpdateCheckResult }) => getUpdateCheckResult(updateParams)),
		getAgentLocalStatuses: async (bootstrapCfg) => await loadStatusAgentLocalModule().then(({ getAgentLocalStatuses }) => getAgentLocalStatuses(bootstrapCfg))
	});
	if (params.labels?.checkingTailscale) params.progress?.setLabel(params.labels.checkingTailscale);
	const tailscaleDns = await bootstrap.tailscaleDnsPromise;
	params.progress?.tick();
	if (params.labels?.checkingForUpdates) params.progress?.setLabel(params.labels.checkingForUpdates);
	const update = await bootstrap.updatePromise;
	params.progress?.tick();
	if (params.labels?.resolvingAgents) params.progress?.setLabel(params.labels.resolvingAgents);
	const agentStatus = await bootstrap.agentStatusPromise;
	params.progress?.tick();
	if (params.labels?.probingGateway) params.progress?.setLabel(params.labels.probingGateway);
	const gatewaySnapshot = await bootstrap.gatewayProbePromise;
	params.progress?.tick();
	const tailscaleHttpsUrl = await bootstrap.resolveTailscaleHttpsUrl();
	const { channelsStatus, channelIssues, channels } = params.includeChannelsData !== false ? await (async () => {
		if (params.labels?.queryingChannelStatus) params.progress?.setLabel(params.labels.queryingChannelStatus);
		const channelsStatus = await resolveStatusChannelsStatus({
			cfg,
			gatewayReachable: gatewaySnapshot.gatewayReachable,
			opts: params.opts,
			gatewayCallOverrides: gatewaySnapshot.gatewayCallOverrides,
			useGatewayCallOverrides: params.useGatewayCallOverridesForChannelsStatus
		});
		params.progress?.tick();
		const { collectChannelStatusIssues, buildChannelsTable } = await loadStatusScanRuntimeModule().then(({ statusScanRuntime }) => statusScanRuntime);
		const channelIssues = channelsStatus ? collectChannelStatusIssues(channelsStatus) : [];
		if (params.labels?.summarizingChannels) params.progress?.setLabel(params.labels.summarizingChannels);
		const channels = await buildChannelsTable(cfg, {
			showSecrets: params.showSecrets,
			sourceConfig
		});
		params.progress?.tick();
		return {
			channelsStatus,
			channelIssues,
			channels
		};
	})() : {
		channelsStatus: null,
		channelIssues: [],
		channels: {
			rows: [],
			details: []
		}
	};
	return {
		coldStart,
		hasConfiguredChannels,
		skipColdStartNetworkChecks: bootstrap.skipColdStartNetworkChecks,
		cfg,
		sourceConfig,
		secretDiagnostics,
		osSummary,
		tailscaleMode: bootstrap.tailscaleMode,
		tailscaleDns,
		tailscaleHttpsUrl,
		update,
		gatewaySnapshot,
		channelsStatus,
		channelIssues,
		channels,
		agentStatus
	};
}
async function resolveStatusSummaryFromOverview(params) {
	if (params.overview.skipColdStartNetworkChecks) return buildColdStartStatusSummary();
	return await loadStatusSummaryModule().then(({ getStatusSummary }) => getStatusSummary({
		config: params.overview.cfg,
		sourceConfig: params.overview.sourceConfig
	}));
}
//#endregion
export { resolveSharedMemoryStatusSnapshot as i, resolveStatusSummaryFromOverview as n, resolveMemoryPluginStatus as r, collectStatusScanOverview as t };
