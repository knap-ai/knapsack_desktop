import { _ as resolveStateDir } from "./paths-Dvv9VRAc.js";
import { t as hasPotentialConfiguredChannels } from "./config-presence-B8rnssE9.js";
import { t as resolveMemorySearchConfig } from "./memory-search-ABYPOqC9.js";
import { t as ensureCliPluginRegistryLoaded } from "./plugin-registry-loader-CXOhJ7ih.js";
import { i as resolveSharedMemoryStatusSnapshot, n as resolveStatusSummaryFromOverview, r as resolveMemoryPluginStatus, t as collectStatusScanOverview } from "./status.scan-overview-DRg23O9X.js";
import path from "node:path";
import os from "node:os";
//#region src/commands/status.scan-result.ts
function buildStatusScanResult(params) {
	return {
		cfg: params.cfg,
		sourceConfig: params.sourceConfig,
		secretDiagnostics: params.secretDiagnostics,
		osSummary: params.osSummary,
		tailscaleMode: params.tailscaleMode,
		tailscaleDns: params.tailscaleDns,
		tailscaleHttpsUrl: params.tailscaleHttpsUrl,
		update: params.update,
		gatewayConnection: params.gatewaySnapshot.gatewayConnection,
		remoteUrlMissing: params.gatewaySnapshot.remoteUrlMissing,
		gatewayMode: params.gatewaySnapshot.gatewayMode,
		gatewayProbeAuth: params.gatewaySnapshot.gatewayProbeAuth,
		gatewayProbeAuthWarning: params.gatewaySnapshot.gatewayProbeAuthWarning,
		gatewayProbe: params.gatewaySnapshot.gatewayProbe,
		gatewayReachable: params.gatewaySnapshot.gatewayReachable,
		gatewaySelf: params.gatewaySnapshot.gatewaySelf,
		channelIssues: params.channelIssues,
		agentStatus: params.agentStatus,
		channels: params.channels,
		summary: params.summary,
		memory: params.memory,
		memoryPlugin: params.memoryPlugin,
		pluginCompatibility: params.pluginCompatibility
	};
}
//#endregion
//#region src/commands/status.scan-execute.ts
async function executeStatusScanFromOverview(params) {
	const memoryPlugin = resolveMemoryPluginStatus(params.overview.cfg);
	const [memory, summary] = await Promise.all([params.resolveMemory({
		cfg: params.overview.cfg,
		agentStatus: params.overview.agentStatus,
		memoryPlugin,
		...params.runtime ? { runtime: params.runtime } : {}
	}), resolveStatusSummaryFromOverview({ overview: params.overview })]);
	return buildStatusScanResult({
		cfg: params.overview.cfg,
		sourceConfig: params.overview.sourceConfig,
		secretDiagnostics: params.overview.secretDiagnostics,
		osSummary: params.overview.osSummary,
		tailscaleMode: params.overview.tailscaleMode,
		tailscaleDns: params.overview.tailscaleDns,
		tailscaleHttpsUrl: params.overview.tailscaleHttpsUrl,
		update: params.overview.update,
		gatewaySnapshot: params.overview.gatewaySnapshot,
		channelIssues: params.channelIssues,
		agentStatus: params.overview.agentStatus,
		channels: params.channels,
		summary,
		memory,
		memoryPlugin,
		pluginCompatibility: params.pluginCompatibility
	});
}
//#endregion
//#region src/commands/status.scan-memory.ts
let statusScanDepsRuntimeModulePromise;
function loadStatusScanDepsRuntimeModule() {
	statusScanDepsRuntimeModulePromise ??= import("./status.scan.deps.runtime-XslDktKK.js");
	return statusScanDepsRuntimeModulePromise;
}
function resolveDefaultMemoryStorePath(agentId) {
	return path.join(resolveStateDir(process.env, os.homedir), "memory", `${agentId}.sqlite`);
}
async function resolveStatusMemoryStatusSnapshot(params) {
	const { getMemorySearchManager } = await loadStatusScanDepsRuntimeModule();
	return await resolveSharedMemoryStatusSnapshot({
		cfg: params.cfg,
		agentStatus: params.agentStatus,
		memoryPlugin: params.memoryPlugin,
		resolveMemoryConfig: resolveMemorySearchConfig,
		getMemorySearchManager,
		requireDefaultStore: params.requireDefaultStore
	});
}
//#endregion
//#region src/commands/status.scan.fast-json.ts
async function scanStatusJsonWithPolicy(opts, runtime, policy) {
	const overview = await collectStatusScanOverview({
		commandName: policy.commandName,
		opts,
		showSecrets: false,
		runtime,
		allowMissingConfigFastPath: policy.allowMissingConfigFastPath,
		resolveHasConfiguredChannels: policy.resolveHasConfiguredChannels,
		includeChannelsData: false
	});
	if (overview.hasConfiguredChannels) await ensureCliPluginRegistryLoaded({
		scope: "configured-channels",
		routeLogsToStderr: true,
		config: overview.cfg,
		activationSourceConfig: overview.sourceConfig
	});
	return await executeStatusScanFromOverview({
		overview,
		runtime,
		resolveMemory: policy.resolveMemory,
		channelIssues: [],
		channels: {
			rows: [],
			details: []
		},
		pluginCompatibility: []
	});
}
async function scanStatusJsonFast(opts, runtime) {
	return await scanStatusJsonWithPolicy(opts, runtime, {
		commandName: "status --json",
		allowMissingConfigFastPath: true,
		resolveHasConfiguredChannels: (cfg) => hasPotentialConfiguredChannels(cfg, process.env, { includePersistedAuthState: false }),
		resolveMemory: async ({ cfg, agentStatus, memoryPlugin }) => opts.all ? await resolveStatusMemoryStatusSnapshot({
			cfg,
			agentStatus,
			memoryPlugin,
			requireDefaultStore: resolveDefaultMemoryStorePath
		}) : null
	});
}
//#endregion
export { executeStatusScanFromOverview as i, scanStatusJsonWithPolicy as n, resolveStatusMemoryStatusSnapshot as r, scanStatusJsonFast as t };
