import { i as formatErrorMessage } from "./errors-CDFVCV9D.js";
import { r as loadInstalledPluginIndexInstallRecords } from "./manifest-registry-CXpW6f0a.js";
import { b as refreshPluginRegistry } from "./plugin-registry-CZ8QXP5l.js";
import "./installed-plugin-index-records-Z8-yA-Tm.js";
//#region src/cli/plugins-registry-refresh.ts
async function refreshPluginRegistryAfterConfigMutation(params) {
	try {
		const installRecords = params.installRecords ?? await loadInstalledPluginIndexInstallRecords(params.env ? { env: params.env } : {});
		await refreshPluginRegistry({
			config: params.config,
			reason: params.reason,
			installRecords,
			...params.workspaceDir ? { workspaceDir: params.workspaceDir } : {},
			...params.env ? { env: params.env } : {}
		});
	} catch (error) {
		params.logger?.warn?.(`Plugin registry refresh failed: ${formatErrorMessage(error)}`);
	}
}
//#endregion
export { refreshPluginRegistryAfterConfigMutation as t };
