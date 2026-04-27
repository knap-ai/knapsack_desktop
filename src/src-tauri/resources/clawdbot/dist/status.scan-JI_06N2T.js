import { i as hasConfiguredChannelsForReadOnlyScope } from "./channel-plugin-ids-Dc_n_j0K.js";
import { n as withProgress } from "./progress-DAY5yFVV.js";
import { r as buildPluginCompatibilitySnapshotNotices } from "./status-Clo7fOEI.js";
import { t as collectStatusScanOverview } from "./status.scan-overview-BFaVn9cA.js";
import { i as executeStatusScanFromOverview, n as scanStatusJsonWithPolicy, r as resolveStatusMemoryStatusSnapshot } from "./status.scan.fast-json-CKAw6--s.js";
//#region src/commands/status.scan.ts
async function scanStatus(opts, _runtime) {
	if (opts.json) return await scanStatusJsonWithPolicy({
		timeoutMs: opts.timeoutMs,
		all: opts.all
	}, _runtime, {
		commandName: "status --json",
		resolveHasConfiguredChannels: (cfg, sourceConfig) => hasConfiguredChannelsForReadOnlyScope({
			config: cfg,
			activationSourceConfig: sourceConfig
		}),
		resolveMemory: async ({ cfg, agentStatus, memoryPlugin }) => await resolveStatusMemoryStatusSnapshot({
			cfg,
			agentStatus,
			memoryPlugin
		})
	});
	return await withProgress({
		label: "Scanning status…",
		total: 10,
		enabled: true
	}, async (progress) => {
		const overview = await collectStatusScanOverview({
			commandName: "status",
			opts,
			showSecrets: process.env.OPENCLAW_SHOW_SECRETS?.trim() !== "0",
			progress,
			labels: {
				loadingConfig: "Loading config…",
				checkingTailscale: "Checking Tailscale…",
				checkingForUpdates: "Checking for updates…",
				resolvingAgents: "Resolving agents…",
				probingGateway: "Probing gateway…",
				queryingChannelStatus: "Querying channel status…",
				summarizingChannels: "Summarizing channels…"
			}
		});
		progress.setLabel("Checking plugins…");
		const pluginCompatibility = buildPluginCompatibilitySnapshotNotices({ config: overview.cfg });
		progress.tick();
		progress.setLabel("Checking memory and sessions…");
		const result = await executeStatusScanFromOverview({
			overview,
			resolveMemory: async ({ cfg, agentStatus, memoryPlugin }) => await resolveStatusMemoryStatusSnapshot({
				cfg,
				agentStatus,
				memoryPlugin
			}),
			channelIssues: overview.channelIssues,
			channels: overview.channels,
			pluginCompatibility
		});
		progress.tick();
		progress.setLabel("Rendering…");
		progress.tick();
		return result;
	});
}
//#endregion
export { scanStatus };
