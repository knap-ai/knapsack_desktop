import { o as getResolvedLoggerSettings } from "./logger-x0IvPL2B.js";
import { n as DEFAULT_MODEL, r as DEFAULT_PROVIDER } from "./defaults-DM8yIn8C.js";
import "./logging-DFHb42Bl.js";
import { f as resolveConfiguredModelRef } from "./model-selection-shared-grYiFZof.js";
import "./model-selection-hTT37jzm.js";
import { t as collectEnabledInsecureOrDangerousFlags } from "./dangerous-config-flags-Bm3QYlyr.js";
import chalk from "chalk";
//#region src/gateway/server-startup-log.ts
function logGatewayStartup(params) {
	const { provider: agentProvider, model: agentModel } = resolveConfiguredModelRef({
		cfg: params.cfg,
		defaultProvider: DEFAULT_PROVIDER,
		defaultModel: DEFAULT_MODEL
	});
	const modelRef = `${agentProvider}/${agentModel}`;
	params.log.info(`agent model: ${modelRef}`, { consoleMessage: `agent model: ${chalk.whiteBright(modelRef)}` });
	const startupDurationMs = typeof params.startupStartedAt === "number" ? Date.now() - params.startupStartedAt : null;
	const startupDurationLabel = startupDurationMs == null ? null : `${(startupDurationMs / 1e3).toFixed(1)}s`;
	params.log.info(`ready (${formatReadyDetails(params.loadedPluginIds, startupDurationLabel)})`);
	params.log.info(`log file: ${getResolvedLoggerSettings().file}`);
	if (params.isNixMode) params.log.info("gateway: running in Nix mode (config managed externally)");
	const enabledDangerousFlags = collectEnabledInsecureOrDangerousFlags(params.cfg);
	if (enabledDangerousFlags.length > 0) {
		const warning = `security warning: dangerous config flags enabled: ${enabledDangerousFlags.join(", ")}. Run \`openclaw security audit\`.`;
		params.log.warn(warning);
	}
}
function formatReadyDetails(loadedPluginIds, startupDurationLabel) {
	const pluginIds = [...new Set(loadedPluginIds.map((id) => id.trim()).filter(Boolean))].toSorted((a, b) => a.localeCompare(b));
	const pluginSummary = pluginIds.length === 0 ? "0 plugins" : `${pluginIds.length} ${pluginIds.length === 1 ? "plugin" : "plugins"}: ${pluginIds.join(", ")}`;
	if (!startupDurationLabel) return pluginSummary;
	return pluginIds.length === 0 ? `${pluginSummary}, ${startupDurationLabel}` : `${pluginSummary}; ${startupDurationLabel}`;
}
//#endregion
export { logGatewayStartup };
