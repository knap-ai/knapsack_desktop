import { o as resolveConfigPath } from "./paths-CD8i0MSg.js";
import { i as runExec } from "./exec-nWahKiCu.js";
import { d as readBestEffortConfig } from "./io-DhtVmzAJ.js";
import "./config-CJQx-9zo.js";
import { n as hasPotentialConfiguredChannels } from "./config-presence-C3S8ml6i.js";
import { n as withProgress } from "./progress-DI2x2XU2.js";
import { a as createLazyRuntimeSurface } from "./lazy-runtime-B4PzSTA5.js";
import { t as resolveCommandSecretRefsViaGateway } from "./command-secret-gateway-D6E4pqJn.js";
import { s as getStatusCommandSecretTargetIds } from "./command-secret-targets-DenfdcDu.js";
import { t as createEmptyTaskRegistrySummary } from "./task-registry.summary-DqH4Nyhq.js";
import { t as resolveMemorySearchConfig } from "./memory-search-B4nMT_Ka.js";
import { n as buildPluginCompatibilityNotices } from "./status-DrwAkOFC.js";
import { t as pickGatewaySelfPresence } from "./gateway-presence-knOZNiV4.js";
import { t as createEmptyTaskAuditSummary } from "./task-registry.audit.shared-BKY02E9N.js";
import { t as resolveOsSummary } from "./os-summary-BocLsUSg.js";
import { a as resolveMemoryPluginStatus, i as resolveGatewayProbeSnapshot, n as scanStatusJsonCore, o as resolveSharedMemoryStatusSnapshot, r as buildTailscaleHttpsUrl, t as buildColdStartUpdateResult } from "./status.scan.json-core-aR3ma9Jv.js";
import { existsSync } from "node:fs";
//#region src/commands/status.scan.ts
let statusScanDepsRuntimeModulePromise;
let statusAgentLocalModulePromise;
let statusSummaryModulePromise;
let statusUpdateModulePromise;
let gatewayCallModulePromise;
const loadStatusScanRuntimeModule = createLazyRuntimeSurface(() => import("./status.scan.runtime-0jsdVqSr.js"), ({ statusScanRuntime }) => statusScanRuntime);
function loadStatusScanDepsRuntimeModule() {
	statusScanDepsRuntimeModulePromise ??= import("./status.scan.deps.runtime-DhzbCQv_.js");
	return statusScanDepsRuntimeModulePromise;
}
function loadStatusAgentLocalModule() {
	statusAgentLocalModulePromise ??= import("./status.agent-local-7CxXn14g.js");
	return statusAgentLocalModulePromise;
}
function loadStatusSummaryModule() {
	statusSummaryModulePromise ??= import("./status.summary-BwL0CIAe.js");
	return statusSummaryModulePromise;
}
function loadStatusUpdateModule() {
	statusUpdateModulePromise ??= import("./status.update-Bgx0Pe0p.js");
	return statusUpdateModulePromise;
}
function loadGatewayCallModule() {
	gatewayCallModulePromise ??= import("./call-BXql2fGC.js");
	return gatewayCallModulePromise;
}
function deferResult(promise) {
	return promise.then((value) => ({
		ok: true,
		value
	}), (error) => ({
		ok: false,
		error
	}));
}
function unwrapDeferredResult(result) {
	if (!result.ok) throw result.error;
	return result.value;
}
function isMissingConfigColdStart() {
	return !existsSync(resolveConfigPath(process.env));
}
async function resolveChannelsStatus(params) {
	if (!params.gatewayReachable) return null;
	const { callGateway } = await loadGatewayCallModule();
	return await callGateway({
		config: params.cfg,
		method: "channels.status",
		params: {
			probe: false,
			timeoutMs: Math.min(8e3, params.opts.timeoutMs ?? 1e4)
		},
		timeoutMs: Math.min(params.opts.all ? 5e3 : 2500, params.opts.timeoutMs ?? 1e4)
	}).catch(() => null);
}
async function resolveMemoryStatusSnapshot(params) {
	const { getMemorySearchManager } = await loadStatusScanDepsRuntimeModule();
	return await resolveSharedMemoryStatusSnapshot({
		cfg: params.cfg,
		agentStatus: params.agentStatus,
		memoryPlugin: params.memoryPlugin,
		resolveMemoryConfig: resolveMemorySearchConfig,
		getMemorySearchManager
	});
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
async function scanStatusJsonFast(opts) {
	const coldStart = isMissingConfigColdStart();
	const loadedRaw = await readBestEffortConfig();
	const { resolvedConfig: cfg, diagnostics: secretDiagnostics } = await resolveCommandSecretRefsViaGateway({
		config: loadedRaw,
		commandName: "status --json",
		targetIds: getStatusCommandSecretTargetIds(),
		mode: "read_only_status"
	});
	return await scanStatusJsonCore({
		coldStart,
		cfg,
		sourceConfig: loadedRaw,
		secretDiagnostics,
		hasConfiguredChannels: hasPotentialConfiguredChannels(cfg),
		opts,
		resolveOsSummary,
		resolveMemory: async ({ cfg, agentStatus, memoryPlugin }) => await resolveMemoryStatusSnapshot({
			cfg,
			agentStatus,
			memoryPlugin
		}),
		runtime: opts.runtime
	});
}
async function scanStatus(opts, _runtime) {
	if (opts.json) return await scanStatusJsonFast({
		timeoutMs: opts.timeoutMs,
		all: opts.all,
		runtime: _runtime
	});
	return await withProgress({
		label: "Scanning status…",
		total: 11,
		enabled: true
	}, async (progress) => {
		const coldStart = isMissingConfigColdStart();
		progress.setLabel("Loading config…");
		const loadedRaw = await readBestEffortConfig();
		const { resolvedConfig: cfg, diagnostics: secretDiagnostics } = await resolveCommandSecretRefsViaGateway({
			config: loadedRaw,
			commandName: "status",
			targetIds: getStatusCommandSecretTargetIds(),
			mode: "read_only_status"
		});
		const hasConfiguredChannels = hasPotentialConfiguredChannels(cfg);
		const skipColdStartNetworkChecks = coldStart && !hasConfiguredChannels && opts.all !== true;
		const osSummary = resolveOsSummary();
		const tailscaleMode = cfg.gateway?.tailscale?.mode ?? "off";
		const tailscaleDnsPromise = tailscaleMode === "off" ? Promise.resolve(null) : loadStatusScanDepsRuntimeModule().then(({ getTailnetHostname }) => getTailnetHostname((cmd, args) => runExec(cmd, args, {
			timeoutMs: 1200,
			maxBuffer: 2e5
		}))).catch(() => null);
		const updateTimeoutMs = opts.all ? 6500 : 2500;
		const updatePromise = deferResult(skipColdStartNetworkChecks ? Promise.resolve(buildColdStartUpdateResult()) : loadStatusUpdateModule().then(({ getUpdateCheckResult }) => getUpdateCheckResult({
			timeoutMs: updateTimeoutMs,
			fetchGit: true,
			includeRegistry: true
		})));
		const agentStatusPromise = deferResult(skipColdStartNetworkChecks ? Promise.resolve(buildColdStartAgentLocalStatuses()) : loadStatusAgentLocalModule().then(({ getAgentLocalStatuses }) => getAgentLocalStatuses(cfg)));
		const summaryPromise = deferResult(skipColdStartNetworkChecks ? Promise.resolve(buildColdStartStatusSummary()) : loadStatusSummaryModule().then(({ getStatusSummary }) => getStatusSummary({
			config: cfg,
			sourceConfig: loadedRaw
		})));
		progress.tick();
		progress.setLabel("Checking Tailscale…");
		const tailscaleDns = await tailscaleDnsPromise;
		const tailscaleHttpsUrl = buildTailscaleHttpsUrl({
			tailscaleMode,
			tailscaleDns,
			controlUiBasePath: cfg.gateway?.controlUi?.basePath
		});
		progress.tick();
		progress.setLabel("Checking for updates…");
		const update = unwrapDeferredResult(await updatePromise);
		progress.tick();
		progress.setLabel("Resolving agents…");
		const agentStatus = unwrapDeferredResult(await agentStatusPromise);
		progress.tick();
		progress.setLabel("Probing gateway…");
		const { gatewayConnection, remoteUrlMissing, gatewayMode, gatewayProbeAuth, gatewayProbeAuthWarning, gatewayProbe } = await resolveGatewayProbeSnapshot({
			cfg,
			opts: {
				...opts,
				...skipColdStartNetworkChecks ? { skipProbe: true } : {}
			}
		});
		const gatewayReachable = gatewayProbe?.ok === true;
		const gatewaySelf = gatewayProbe?.presence ? pickGatewaySelfPresence(gatewayProbe.presence) : null;
		progress.tick();
		progress.setLabel("Querying channel status…");
		const channelsStatus = await resolveChannelsStatus({
			cfg,
			gatewayReachable,
			opts
		});
		const { collectChannelStatusIssues, buildChannelsTable } = await loadStatusScanRuntimeModule();
		const channelIssues = channelsStatus ? collectChannelStatusIssues(channelsStatus) : [];
		progress.tick();
		progress.setLabel("Summarizing channels…");
		const channels = await buildChannelsTable(cfg, {
			showSecrets: process.env.OPENCLAW_SHOW_SECRETS?.trim() !== "0",
			sourceConfig: loadedRaw
		});
		progress.tick();
		progress.setLabel("Checking memory…");
		const memoryPlugin = resolveMemoryPluginStatus(cfg);
		const memory = await resolveMemoryStatusSnapshot({
			cfg,
			agentStatus,
			memoryPlugin
		});
		progress.tick();
		progress.setLabel("Checking plugins…");
		const pluginCompatibility = buildPluginCompatibilityNotices({ config: cfg });
		progress.tick();
		progress.setLabel("Reading sessions…");
		const summary = unwrapDeferredResult(await summaryPromise);
		progress.tick();
		progress.setLabel("Rendering…");
		progress.tick();
		return {
			cfg,
			sourceConfig: loadedRaw,
			secretDiagnostics,
			osSummary,
			tailscaleMode,
			tailscaleDns,
			tailscaleHttpsUrl,
			update,
			gatewayConnection,
			remoteUrlMissing,
			gatewayMode,
			gatewayProbeAuth,
			gatewayProbeAuthWarning,
			gatewayProbe,
			gatewayReachable,
			gatewaySelf,
			channelIssues,
			agentStatus,
			channels,
			summary,
			memory,
			memoryPlugin,
			pluginCompatibility
		};
	});
}
//#endregion
export { scanStatus };
